import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ArrowLeft, Upload, FileText, CheckCircle, Loader2, AlertCircle, SkipForward } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

interface VerificationStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  onSkip: () => void;
}

interface FileUploadCardProps {
  title: string;
  description: string;
  acceptedTypes: string;
  field: string;
  uploadedFile: UploadedFile | null;
  onUpload: (field: string, file: UploadedFile) => void;
  isUploading: boolean;
  uploadProgress: number;
}

const FileUploadCard = ({ 
  title, 
  description, 
  acceptedTypes, 
  field, 
  uploadedFile, 
  onUpload, 
  isUploading, 
  uploadProgress 
}: FileUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${field}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('mentor-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mentor-documents')
        .getPublicUrl(fileName);

      const uploadedFile: UploadedFile = {
        name: file.name,
        url: publicUrl,
        type: file.type
      };

      onUpload(field, uploadedFile);

      toast({
        title: "File uploaded successfully!",
        description: `${title} has been uploaded.`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      uploadedFile ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-muted-foreground/20 hover:border-primary/50'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {uploadedFile ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <FileText className="w-5 h-5 text-muted-foreground" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {uploadedFile && (
          <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">{uploadedFile.name}</span>
            <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={uploadedFile ? "outline" : "default"}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploadedFile ? 'Replace File' : 'Upload File'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            {acceptedTypes} • Max 10MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 10 * 1024 * 1024) {
                toast({
                  title: "File too large",
                  description: "Please select a file smaller than 10MB.",
                  variant: "destructive"
                });
                return;
              }
              handleFileUpload(file);
            }
          }}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export const VerificationStep = ({ data, onNext, onPrevious, onSkip }: VerificationStepProps) => {
  const [uploads, setUploads] = useState({
    degree_certificate_url: data?.degree_certificate_url || null,
    admission_letter_url: data?.admission_letter_url || null,
    student_id_url: data?.student_id_url || null
  });

  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileUpload = (field: string, file: UploadedFile) => {
    setUploads(prev => ({ ...prev, [field]: file.url }));
    setUploadingFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    setUploadProgress(prev => ({ ...prev, [field]: 100 }));
  };

  const startUpload = (field: string) => {
    setUploadingFiles(prev => new Set(prev).add(field));
    setUploadProgress(prev => ({ ...prev, [field]: 0 }));
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[field] || 0;
        if (current >= 90) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [field]: current + 10 };
      });
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(uploads);
  };

  const completedUploads = Object.values(uploads).filter(Boolean).length;
  const totalUploads = 3;
  const completionPercentage = (completedUploads / totalUploads) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Document Verification</h2>
        <p className="text-muted-foreground">
          Upload your credentials to build trust with students (optional for now)
        </p>
      </div>

      {/* Skip Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>This step is optional.</strong> You can complete verification later from your dashboard. 
          However, verified mentors typically receive more bookings and can charge higher rates.
        </AlertDescription>
      </Alert>

      {/* Progress Overview */}
      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Verification Progress</h3>
            <span className="text-sm text-muted-foreground">
              {completedUploads} of {totalUploads} documents
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Complete all uploads to get a verified badge on your profile
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FileUploadCard
            title="Degree Certificate"
            description="Upload your bachelor's degree certificate or transcript"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            field="degree_certificate_url"
            uploadedFile={uploads.degree_certificate_url ? { name: 'Degree Certificate', url: uploads.degree_certificate_url, type: 'application/pdf' } : null}
            onUpload={handleFileUpload}
            isUploading={uploadingFiles.has('degree_certificate_url')}
            uploadProgress={uploadProgress.degree_certificate_url || 0}
          />

          <FileUploadCard
            title="Dental School Admission Letter"
            description="Upload your US dental school admission/acceptance letter"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            field="admission_letter_url"
            uploadedFile={uploads.admission_letter_url ? { name: 'Admission Letter', url: uploads.admission_letter_url, type: 'application/pdf' } : null}
            onUpload={handleFileUpload}
            isUploading={uploadingFiles.has('admission_letter_url')}
            uploadProgress={uploadProgress.admission_letter_url || 0}
          />

          <FileUploadCard
            title="Student ID or Diploma"
            description="Upload your current student ID or graduation diploma"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            field="student_id_url"
            uploadedFile={uploads.student_id_url ? { name: 'Student ID', url: uploads.student_id_url, type: 'application/pdf' } : null}
            onUpload={handleFileUpload}
            isUploading={uploadingFiles.has('student_id_url')}
            uploadProgress={uploadProgress.student_id_url || 0}
          />
        </div>

        {/* Benefits of Verification */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Benefits of Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Verified badge on your profile builds trust
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Higher visibility in search results
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Ability to charge premium rates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Access to exclusive mentor features
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSkip}
              className="px-6"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip For Now
            </Button>
            
            <Button type="submit" className="px-6">
              {completedUploads === totalUploads ? 'Complete Verification' : 'Save Progress'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};