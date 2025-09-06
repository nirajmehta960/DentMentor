import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  title: string;
  description: string;
  accept: string;
  maxSize: number; // in MB
  required?: boolean;
  onFilesChange: (files: File[]) => void;
}

export const FileUpload = ({ 
  title, 
  description, 
  accept, 
  maxSize, 
  required = false, 
  onFilesChange 
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (newFiles: File[]) => {
    setErrorMessage('');
    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`);
        setUploadStatus('error');
        return;
      }

      // Check file type
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;
      
      const isValidType = acceptedTypes.some(type => 
        type === mimeType || type === fileExtension
      );

      if (!isValidType) {
        setErrorMessage(`File "${file.name}" is not an accepted file type.`);
        setUploadStatus('error');
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setUploadStatus('uploading');
      
      // Simulate upload delay
      setTimeout(() => {
        setFiles(prev => [...prev, ...validFiles]);
        setUploadStatus('success');
        onFilesChange([...files, ...validFiles]);
        
        // Reset status after success animation
        setTimeout(() => {
          setUploadStatus('idle');
        }, 2000);
      }, 1000);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">
            {title} {required && <span className="text-destructive">*</span>}
          </h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {files.length > 0 && (
          <div className="text-sm text-green-600 font-medium">
            {files.length} file{files.length > 1 ? 's' : ''} uploaded
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-destructive bg-destructive/5'
            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            handleFiles(selectedFiles);
          }}
        />

        {/* Upload Icon */}
        <div className="mb-4">
          {uploadStatus === 'uploading' ? (
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          ) : (
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragOver ? 'bg-primary text-white scale-110' : 'bg-muted text-muted-foreground'
            }`}>
              <Upload className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Upload Text */}
        <div className="space-y-2">
          {uploadStatus === 'uploading' ? (
            <div>
              <div className="text-lg font-medium text-primary">Uploading...</div>
              <div className="text-sm text-muted-foreground">Please wait while we process your files</div>
            </div>
          ) : uploadStatus === 'success' ? (
            <div>
              <div className="text-lg font-medium text-green-600">Upload Successful!</div>
              <div className="text-sm text-green-600">Your files have been uploaded successfully</div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div>
              <div className="text-lg font-medium text-destructive">Upload Failed</div>
              <div className="text-sm text-destructive">{errorMessage}</div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-foreground">
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </div>
              <div className="text-sm text-muted-foreground">
                or click to browse • Max {maxSize}MB each
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Accepted formats: {accept.replace(/\./g, '').toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 rounded-2xl border-2 border-primary animate-pulse" />
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-foreground">Uploaded Files:</h5>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-xl animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground truncate max-w-[200px]">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};