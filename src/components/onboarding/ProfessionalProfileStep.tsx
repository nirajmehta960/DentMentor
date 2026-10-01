import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, ArrowRight, Camera } from "lucide-react";
import { ProfileImageCropper } from "@/components/dashboard/ProfileImageCropper";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  DASHED_EDGE,
  FieldHint,
  FormSection,
  RequiredMark,
  StepActions,
  StepHeader,
} from "./onboarding-ui";

interface ProfessionalProfileStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  isEditModeFromUrl?: boolean;
}

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Colombia",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Mexico",
  "Nepal",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Russia",
  "Saudi Arabia",
  "South Korea",
  "Spain",
  "Sweden",
  "Turkey",
  "United Kingdom",
  "United States",
  "Venezuela",
  "Vietnam",
];

export const ProfessionalProfileStep = ({
  data,
  onNext,
  onPrevious,
  isEditModeFromUrl = false,
}: ProfessionalProfileStepProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    profile_photo_url: data?.profile_photo_url || "",
    professional_headline: data?.professional_headline || "",
    professional_bio: data?.professional_bio || "",
    country_of_origin: data?.country_of_origin || "",
    years_experience: data?.years_experience || "",
    linkedin_url: data?.linkedin_url || "",
    email: data?.email || user?.email || "",
  });

  const [photoPreview, setPhotoPreview] = useState(
    data?.profile_photo_url || ""
  );
  const [showImageCropper, setShowImageCropper] = useState(false);
  const { toast } = useToast();

  // Update form data when data prop changes (for edit mode)
  useEffect(() => {
    setFormData({
      profile_photo_url: data?.profile_photo_url || "",
      professional_headline: data?.professional_headline || "",
      professional_bio: data?.professional_bio || "",
      country_of_origin: data?.country_of_origin || "",
      years_experience: data?.years_experience || "",
      linkedin_url: data?.linkedin_url || "",
      email: data?.email || user?.email || "",
    });
    setPhotoPreview(data?.profile_photo_url || "");
  }, [data, user?.email]);

  const handleImageSaved = async (croppedImage: string) => {
    try {
      // Just update the form data with the cropped image URL
      // The actual database update will happen when the form is submitted
      setFormData((prev) => ({ ...prev, profile_photo_url: croppedImage }));
      setPhotoPreview(croppedImage);

      toast({
        title: "Photo updated successfully!",
        description: "Your profile photo has been updated.",
      });

      setShowImageCropper(false);
    } catch (error: any) {
      toast({
        title: "Error updating photo",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - preserve backend logic
    if (!formData.professional_headline.trim()) {
      toast({
        title: "Professional headline required",
        description: "Please add your professional headline.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.professional_bio.trim()) {
      toast({
        title: "Professional bio required",
        description: "Please add your professional bio.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.country_of_origin) {
      toast({
        title: "Country of origin required",
        description: "Please select your country of origin.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    onNext(formData);
  };

  return (
    <div>
      <StepHeader
        icon={User}
        title="Professional profile"
        description="Tell students about your professional background and expertise."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormSection>
          {/* Profile photo: the avatar and the button both open the cropper. */}
          <div
            className="flex flex-col items-center gap-5 rounded-xl border-[1.5px] border-dashed bg-white p-6 text-center sm:flex-row sm:p-7 sm:text-left"
            style={{ borderColor: DASHED_EDGE }}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setShowImageCropper(true)}
              className="relative shrink-0 rounded-full"
            >
              <Avatar className="size-24 ring-1 ring-[rgb(9_67_56/0.08)]">
                <AvatarImage src={photoPreview} className="object-cover" />
                <AvatarFallback className="bg-[rgb(15_112_93/0.08)] text-band-signal">
                  <User className="size-10" strokeWidth={1.5} />
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute -bottom-0.5 -right-0.5 grid size-8 place-items-center rounded-full border-2 bg-band-signal text-white"
                style={{ borderColor: "#fff" }}
              >
                <Camera className="size-4" strokeWidth={2} />
              </span>
            </button>

            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="flex flex-col gap-1">
                <p className="text-[0.9375rem] font-medium text-band-fg">
                  Profile photo
                </p>
                <FieldHint>
                  JPG, PNG up to 5MB. Click to upload and crop your photo.
                </FieldHint>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageCropper(true)}
                className="h-11"
              >
                <Camera aria-hidden="true" />
                {photoPreview ? "Change photo" : "Upload photo"}
              </Button>
            </div>
          </div>
        </FormSection>

        <FormSection title="About you">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              Email address
              <RequiredMark />
            </Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              disabled={isEditModeFromUrl}
              placeholder="your.email@example.com"
            />
          </div>

          {/* Professional Headline */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="headline">
              Professional headline
              <RequiredMark />
            </Label>
            <Input
              id="headline"
              placeholder="e.g., DMD @ BU | International Student Success Mentor"
              value={formData.professional_headline}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  professional_headline: e.target.value,
                }))
              }
              maxLength={100}
            />
            <FieldHint className="text-right">
              <span data-numeric="">
                {formData.professional_headline.length}/100
              </span>{" "}
              characters
            </FieldHint>
          </div>

          {/* Professional Bio */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">
              Professional bio
              <RequiredMark />
            </Label>
            <Textarea
              id="bio"
              placeholder="Share your dental journey, achievements, and what motivates you to mentor students..."
              value={formData.professional_bio}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  professional_bio: e.target.value,
                }))
              }
              rows={5}
              maxLength={500}
              className="resize-none"
            />
            <FieldHint className="text-right">
              <span data-numeric="">{formData.professional_bio.length}/500</span>{" "}
              characters
            </FieldHint>
          </div>
        </FormSection>

        <FormSection title="Background">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Country of Origin */}
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="country">
                Country of origin
                <RequiredMark />
              </Label>
              <Select
                value={formData.country_of_origin}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, country_of_origin: value }))
                }
              >
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select your country of origin" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Years of Experience */}
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="experience">Years of mentoring experience</Label>
              <Input
                id="experience"
                type="number"
                inputMode="numeric"
                placeholder="0"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    years_experience: e.target.value,
                  }))
                }
                className="tabular-nums"
              />
            </div>
          </div>

          {/* LinkedIn URL */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="linkedin" className="flex items-baseline gap-2">
              LinkedIn profile URL
              <span className="label text-band-faint">Optional</span>
            </Label>
            <Input
              id="linkedin"
              type="url"
              inputMode="url"
              placeholder="https://www.linkedin.com/in/yourprofile"
              value={formData.linkedin_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
              }
            />
          </div>
        </FormSection>

        <StepActions>
          <Button type="submit" size="lg">
            Continue
            <ArrowRight aria-hidden="true" />
          </Button>
        </StepActions>
      </form>

      {/* Profile Image Cropper */}
      <ProfileImageCropper
        open={showImageCropper}
        onOpenChange={setShowImageCropper}
        onImageSaved={handleImageSaved}
      />
    </div>
  );
};
