import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

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

    // Validate file type - support all image types including HEIC
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
      
      // Reset crop area to center
      setTimeout(() => {
        const img = new Image();
        img.onload = () => {
          const size = Math.min(img.width, img.height, 400);
          setCropArea({
            x: (400 - size) / 2,
            y: (400 - size) / 2,
            width: size,
            height: size
          });
          setImageLoaded(true);
        };
        img.src = imageDataUrl;
      }, 100);

    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error processing image",
        description: "Failed to process the selected image. Please try again.",
        variant: "destructive"
      });
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

  const handleCropAreaMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingCrop(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  }, [cropArea]);

  const handleCropAreaMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingCrop) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    const maxX = 400 - cropArea.width;
    const maxY = 400 - cropArea.height;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }));
  }, [isDraggingCrop, dragStart, cropArea.width, cropArea.height]);

  const handleCropAreaMouseUp = useCallback(() => {
    setIsDraggingCrop(false);
  }, []);

  const handleCrop = useCallback(async () => {
    if (!selectedImage || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Calculate the scale factor
      const scaleX = img.width / 400;
      const scaleY = img.height / 400;
      
      // Set canvas size to crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      
      // Draw the cropped portion
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        cropArea.width,
        cropArea.height
      );
      
      // Convert to base64
      const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
      onImageSaved(croppedImage);
    };
    
    img.onerror = (e) => {
      console.error('Error loading image for cropping:', e);
      toast({
        title: "Error",
        description: "Failed to load image for cropping. Please try again.",
        variant: "destructive"
      });
    };
    
    img.src = selectedImage;
  }, [selectedImage, cropArea, onImageSaved, toast]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setImageLoaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      handleReset();
    }
  }, [open, handleReset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload and crop your profile picture. Supports all image formats including iPhone photos (HEIC/HEIF) up to 10MB.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedImage ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WebP, GIF, BMP, TIFF, HEIC, HEIF (max 10MB)
              </p>
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
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Select Image
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onLoad={() => setImageLoaded(true)}
                  onError={(e) => console.error('Preview image failed to load:', e)}
                />
                {imageLoaded && (
                  <div
                    className="absolute border-2 border-white shadow-lg cursor-move"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                    onMouseDown={handleCropAreaMouseDown}
                    onMouseMove={handleCropAreaMouseMove}
                    onMouseUp={handleCropAreaMouseUp}
                    onMouseLeave={handleCropAreaMouseUp}
                  />
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={handleCrop}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Crop & Save
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
