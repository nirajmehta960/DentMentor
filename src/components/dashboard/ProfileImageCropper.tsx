import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';
import heic2any from 'heic2any';
import { IconTile, MetaLabel } from './dashboard-ui';

interface ProfileImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSaved: (croppedImage: string) => void;
}

const supportedTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif'
];

export function ProfileImageCropper({ open, onOpenChange, onImageSaved }: ProfileImageCropperProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Simple position state
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  const convertHeicToJpeg = async (file: File): Promise<string> => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      }) as Blob;
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(convertedBlob);
      });
    } catch (error) {
      throw new Error('Failed to convert HEIC image. Please try a different format.');
    }
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!supportedTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|bmp|tiff|heic|heif)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, WebP, GIF, BMP, TIFF, HEIC, HEIF)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      let imageDataUrl: string;

      // Handle HEIC/HEIF files
      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().match(/\.(heic|heif)$/)) {
        imageDataUrl = await convertHeicToJpeg(file);
      } else {
        // Regular image processing
        const reader = new FileReader();
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setSelectedImage(imageDataUrl);
      setImageLoaded(false);
      setImageOffset({ x: 0, y: 0 });
      
      // Simple load and set loaded state
      setTimeout(() => {
        setImageLoaded(true);
        setIsProcessing(false);
      }, 100);

    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Failed to process the selected image. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  const handleImageMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({
      x: e.clientX - imageOffset.x,
      y: e.clientY - imageOffset.y
    });
  }, [imageOffset]);

  const handleImageMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingImage) return;
    
    e.preventDefault();
    setImageOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDraggingImage, dragStart]);

  const handleImageMouseUp = useCallback(() => {
    setIsDraggingImage(false);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setImageLoaded(false);
    setImageOffset({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  // Update preview in real-time
  useEffect(() => {
    if (!selectedImage || !imageLoaded || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, 100, 100);
      
      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.clip();
      
      // Calculate scale to fill the preview circle
      const previewSize = 100;
      const scaleX = previewSize / img.width;
      const scaleY = previewSize / img.height;
      const scale = Math.max(scaleX, scaleY) * 1.5; // Fill the circle
      
      const centerX = previewSize / 2;
      const centerY = previewSize / 2;
      const offsetX = (imageOffset.x / 300) * previewSize;
      const offsetY = (imageOffset.y / 300) * previewSize;
      
      // Draw image
      ctx.drawImage(
        img,
        centerX - (img.width * scale) / 2 - offsetX,
        centerY - (img.height * scale) / 2 - offsetY,
        img.width * scale,
        img.height * scale
      );
      
      ctx.restore();
    };
    img.src = selectedImage;
  }, [selectedImage, imageLoaded, imageOffset]);

  const handleCrop = useCallback(async () => {
    if (!selectedImage || !canvasRef.current) {
      return;
    }

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Set canvas size for high-quality circular crop
      const size = 400; // High resolution output
      canvas.width = size;
      canvas.height = size;
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Create circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      
      // Calculate scale to fill the circle
      const scaleX = size / img.width;
      const scaleY = size / img.height;
      const scale = Math.max(scaleX, scaleY) * 1.5; // Fill the circle
      
      const centerX = size / 2;
      const centerY = size / 2;
      const offsetX = (imageOffset.x / 300) * size;
      const offsetY = (imageOffset.y / 300) * size;
      
      // Draw image
      ctx.drawImage(
        img,
        centerX - (img.width * scale) / 2 - offsetX,
        centerY - (img.height * scale) / 2 - offsetY,
        img.width * scale,
        img.height * scale
      );
      
      ctx.restore();
      
      // Convert to base64
      const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
      onImageSaved(croppedImage);
      setIsProcessing(false);
    };
    
    img.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load image for cropping. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    };
    
    img.src = selectedImage;
  }, [selectedImage, imageOffset, onImageSaved, toast]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Portals to <body> and is shared with onboarding and the mentee bar:
          app theme tokens only, no site band tokens. */}
      <DialogContent className="w-[calc(100vw-1.5rem)] rounded-2xl p-5 sm:max-w-lg sm:p-7">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-display text-[1.375rem] font-semibold tracking-[-0.02em]">
            Update profile picture
          </DialogTitle>
          <DialogDescription>
            Upload a photo, then drag it to position it in the circle.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {!selectedImage ? (
            <div
              className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 sm:py-12 ${
                isDragging 
                  ? 'border-primary bg-[rgb(15_112_93/0.04)]' 
                  : 'border-border hover:border-[rgb(15_112_93/0.4)]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <IconTile icon={Upload} size="lg" />
                <div className="space-y-1.5">
                  <p className="text-[1rem] font-semibold text-foreground">
                    {isDragging ? 'Drop your image here' : 'Upload your photo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop an image, or browse. JPG, PNG, WebP or HEIC, up to 10MB.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Camera className="size-4" aria-hidden="true" />
                  {isProcessing ? 'Processing...' : 'Select image'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Crop Interface */}
              <div className="flex flex-col items-center gap-6">
                {/* Crop Area. The crop maths works in a 300px frame, so narrow
                    screens scale the frame visually rather than resizing it. */}
                <div className="relative">
                  <div className="max-[364px]:size-[246px]">
                  <div className="relative h-[300px] w-[300px] origin-top-left overflow-hidden rounded-full bg-muted shadow-large ring-1 ring-border max-[364px]:scale-[0.82]">
                    {imageLoaded && (
                      <div
                        className={`absolute inset-0 cursor-move select-none ${isDraggingImage ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={handleImageMouseDown}
                        onMouseMove={handleImageMouseMove}
                        onMouseUp={handleImageMouseUp}
                        onMouseLeave={handleImageMouseUp}
                        style={{
                          transform: `translate(${imageOffset.x}px, ${imageOffset.y}px)`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <img
                          src={selectedImage}
                          alt="Crop preview"
                          className="w-full h-full object-cover"
                          draggable={false}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scale(1.5)', // Force scale to fill circle
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Grid Overlay */}
                    {imageLoaded && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 300 300">
                          <defs>
                            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <circle cx="150" cy="150" r="150" fill="url(#grid)" />
                        </svg>
                      </div>
                    )}
                  </div>
                  </div>
                  
                  {/* Instructions */}
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    Drag to reposition your photo
                  </p>
                </div>

                {/* Real-time Preview */}
                <div className="flex flex-col items-center gap-2.5">
                  <MetaLabel>Preview</MetaLabel>
                  <canvas
                    ref={previewCanvasRef}
                    width={100}
                    height={100}
                    className="size-20 rounded-full shadow-soft ring-1 ring-border"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex w-full max-w-xs gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <X className="size-4" aria-hidden="true" />
                    New photo
                  </Button>
                  <Button
                    onClick={handleCrop}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Camera className="size-4" aria-hidden="true" />
                    {isProcessing ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
