import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShieldCheck,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  SkipForward,
  Award,
  Star,
  Eye,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  uploadProgress,
}: FileUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${field}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("mentor-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("mentor-documents").getPublicUrl(fileName);

      const uploadedFile: UploadedFile = {
        name: file.name,
        url: publicUrl,
        type: file.type,
      };

      onUpload(field, uploadedFile);

      toast({
        title: "File uploaded successfully!",
        description: `${title} has been uploaded.`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        uploadedFile
          ? "border-emerald-500/50 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10"
          : "border-border/50 hover:border-primary/50"
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {uploadedFile ? (
            <div className="p-1.5 rounded-full bg-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-muted">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {uploadedFile && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {uploadedFile.name}
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant={uploadedFile ? "outline" : "default"}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full ${
              !uploadedFile
                ? "bg-primary hover:bg-primary/90"
                : "border-border/50"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploadedFile ? "Replace File" : "Upload File"}
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
                  variant: "destructive",
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

export const VerificationStep = ({
  data,
  onNext,
  onPrevious,
  onSkip,
}: VerificationStepProps) => {
  const [uploads, setUploads] = useState({
    degree_certificate_url: data?.degree_certificate_url || null,
    admission_letter_url: data?.admission_letter_url || null,
    student_id_url: data?.student_id_url || null,
  });

  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  // Update uploads when data prop changes (for edit mode)
  useEffect(() => {
    setUploads({
      degree_certificate_url: data?.degree_certificate_url || null,
      admission_letter_url: data?.admission_letter_url || null,
      student_id_url: data?.student_id_url || null,
    });
  }, [data]);

  const handleFileUpload = (field: string, file: UploadedFile) => {
    setUploads((prev) => ({ ...prev, [field]: file.url }));
    setUploadingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(field);
      return newSet;
    });
    setUploadProgress((prev) => ({ ...prev, [field]: 100 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(uploads);
  };

  const completedUploads = Object.values(uploads).filter(Boolean).length;
  const totalUploads = 3;
  const completionPercentage = (completedUploads / totalUploads) * 100;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Document Verification
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Upload your credentials to build trust with students (optional for
          now)
        </p>
      </div>

      {/* Skip Notice */}
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-sm">
          <strong>This step is optional.</strong> You can complete verification
          later from your dashboard. However, verified mentors typically receive
          more bookings and can charge higher rates.
        </AlertDescription>
      </Alert>

      {/* Progress Overview */}
      <Card className="border-border/50 bg-gradient-to-br from-muted/30 to-muted/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Verification Progress
              </h3>
            </div>
            <span className="text-sm font-medium text-primary">
              {completedUploads} of {totalUploads} documents
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">
            Complete all uploads to get a verified badge on your profile
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* File Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FileUploadCard
            title="Degree Certificate"
            description="Upload your bachelor's degree certificate or transcript"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            field="degree_certificate_url"
            uploadedFile={
              uploads.degree_certificate_url
                ? {
                    name: "Degree Certificate",
                    url: uploads.degree_certificate_url,
                    type: "application/pdf",
                  }
                : null
            }
            onUpload={handleFileUpload}
            isUploading={uploadingFiles.has("degree_certificate_url")}
            uploadProgress={uploadProgress.degree_certificate_url || 0}
          />

          <FileUploadCard
            title="Dental School Admission Letter"
            description="Upload your US dental school admission/acceptance letter"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            field="admission_letter_url"
            uploadedFile={
              uploads.admission_letter_url
                ? {
                    name: "Admission Letter",
                    url: uploads.admission_letter_url,
                    type: "application/pdf",
                  }
                : null
            }
            onUpload={handleFileUpload}
            isUploading={uploadingFiles.has("admission_letter_url")}
            uploadProgress={uploadProgress.admission_letter_url || 0}
          />

          <FileUploadCard
            title="Student ID or Diploma"
            description="Upload your current student ID or graduation diploma"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            field="student_id_url"
            uploadedFile={
              uploads.student_id_url
                ? {
                    name: "Student ID",
                    url: uploads.student_id_url,
                    type: "application/pdf",
                  }
                : null
            }
            onUpload={handleFileUpload}
            isUploading={uploadingFiles.has("student_id_url")}
            uploadProgress={uploadProgress.student_id_url || 0}
          />
        </div>

        {/* Benefits of Verification */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Star className="w-5 h-5" />
              Benefits of Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/20 shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">
                  Verified badge on your profile builds trust
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/20 shrink-0">
                  <Eye className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">
                  Higher visibility in search results
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/20 shrink-0">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">
                  Ability to charge premium rates
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/20 shrink-0">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-foreground">
                  Access to exclusive mentor features
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            size="lg"
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              size="lg"
              className="px-6"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip For Now
            </Button>

            <Button
              type="submit"
              size="lg"
              className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              {completedUploads === totalUploads
                ? "Complete Verification"
                : "Save Progress"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
