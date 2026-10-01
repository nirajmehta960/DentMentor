import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Upload,
  FileCheck2,
  CheckCircle2,
  Loader2,
  Info,
  BadgeCheck,
  ListFilter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HAIRLINE } from "@/components/site";
import { cn } from "@/lib/utils";
import {
  DASHED_EDGE,
  FormSection,
  IconTile,
  SELECTED_EDGE,
  StepActions,
  StepHeader,
} from "./onboarding-ui";

/** ".pdf,.jpg,.png" -> "PDF, JPG, PNG", for the zone's helper line. */
const formatAcceptedTypes = (acceptedTypes: string) =>
  acceptedTypes
    .split(",")
    .map((type) => type.trim().replace(/^\./, "").toUpperCase())
    .join(", ");

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
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border-[1.5px] bg-white p-5 transition-colors duration-200 ease-dm sm:flex-row sm:items-center sm:gap-5",
        uploadedFile ? "border-solid bg-[rgb(15_112_93/0.03)]" : "border-dashed"
      )}
      style={{ borderColor: uploadedFile ? SELECTED_EDGE : DASHED_EDGE }}
    >
      <IconTile icon={uploadedFile ? FileCheck2 : Upload} />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-[0.9375rem] font-semibold leading-snug text-band-fg">
          {title}
        </h3>
        <p className="text-[0.8125rem] leading-relaxed text-band-muted">
          {description}
        </p>

        {uploadedFile ? (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[0.8125rem] font-medium text-band-signal">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{uploadedFile.name}</span>
            <span className="shrink-0">uploaded</span>
          </p>
        ) : (
          <p className="stat mt-1 text-band-faint">
            {formatAcceptedTypes(acceptedTypes)} · Max 10MB
          </p>
        )}

        {isUploading && (
          <div className="mt-2 flex flex-col gap-1.5">
            <Progress value={uploadProgress} className="h-1.5 bg-muted" />
            <p className="text-[0.75rem] text-band-muted" data-numeric="">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="h-11 shrink-0 self-start sm:self-center"
      >
        {isUploading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <Upload aria-hidden="true" />
        )}
        {uploadedFile ? "Replace file" : "Upload file"}
        <span className="sr-only">: {title}</span>
      </Button>

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
    </div>
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
    <div>
      <StepHeader
        icon={ShieldCheck}
        title="Verification"
        description="Upload your credentials to build trust with students. Verified documents earn a Verified badge on your profile."
      />

      {/* Skip Notice */}
      <div
        className="mb-8 flex items-start gap-3 rounded-xl border bg-[rgb(15_112_93/0.04)] p-4 text-[0.875rem] leading-relaxed text-band-fg"
        style={{ borderColor: HAIRLINE }}
      >
        <Info className="mt-0.5 size-4 shrink-0 text-band-signal" aria-hidden="true" />
        <p>
          <strong className="font-semibold">This step is optional.</strong> You
          can complete verification later from your dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormSection title="Documents">
          {/* Progress Overview */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label text-band-muted">Verification progress</p>
              <p className="text-[0.8125rem] font-medium text-band-fg" data-numeric="">
                {completedUploads} of {totalUploads} documents
              </p>
            </div>
            <Progress
              value={completionPercentage}
              className="h-1.5 bg-muted"
              aria-label="Verification documents uploaded"
            />
          </div>

          {/* File Upload Zones */}
          <ul className="flex flex-col gap-3">
            <li>
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
            </li>
            <li>
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
            </li>
            <li>
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
            </li>
          </ul>
        </FormSection>

        {/* What verification adds */}
        <FormSection title="What verification adds">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <IconTile icon={BadgeCheck} className="size-10" />
              <span className="pt-2 text-[0.875rem] leading-relaxed text-band-fg">
                A Verified badge on your profile and mentor card
              </span>
            </li>
            <li className="flex items-start gap-3">
              <IconTile icon={ListFilter} className="size-10" />
              <span className="pt-2 text-[0.875rem] leading-relaxed text-band-fg">
                You're included when students filter for verified mentors
              </span>
            </li>
          </ul>
        </FormSection>

        <StepActions onBack={onPrevious}>
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            size="lg"
            className="px-4"
          >
            Skip for now
          </Button>
          <Button type="submit" variant="hero" size="lg">
            {completedUploads === totalUploads
              ? "Complete verification"
              : "Save progress"}
          </Button>
        </StepActions>
      </form>
    </div>
  );
};
