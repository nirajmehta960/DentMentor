import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X } from 'lucide-react';
import heic2any from 'heic2any';

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
      console.error('HEIC conversion error:', error);
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
      console.error('Error processing image:', error);
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
      console.error('Error loading image for cropping');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Update Profile Picture
          </DialogTitle>
          <DialogDescription>
            Upload and position your profile picture. Drag to adjust the position.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {!selectedImage ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {isDragging ? 'Drop your image here' : 'Upload your photo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop an image, or click to browse
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
                  <Camera className="mr-2 h-4 w-4" />
                  {isProcessing ? 'Processing...' : 'Select Image'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Crop Interface */}
              <div className="flex flex-col items-center gap-6">
                {/* Crop Area */}
                <div className="relative">
                  <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-2xl">
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
                  
                  {/* Instructions */}
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Drag to reposition your photo
                  </p>
                </div>

                {/* Real-time Preview */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-center">Preview</h3>
                  <div className="flex justify-center">
                    <div className="relative">
                      <canvas
                        ref={previewCanvasRef}
                        width={100}
                        height={100}
                        className="w-20 h-20 rounded-full border-2 border-gray-200 shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full max-w-xs">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    New Photo
                  </Button>
                  <Button
                    onClick={handleCrop}
                    disabled={isProcessing}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
