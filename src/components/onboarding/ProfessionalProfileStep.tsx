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
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  ArrowRight,
  Camera,
  Globe,
  Briefcase,
  Linkedin,
  Mail,
  Sparkles,
} from "lucide-react";
import { ProfileImageCropper } from "@/components/dashboard/ProfileImageCropper";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Professional Profile
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Tell students about your professional background and expertise
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo - Premium Card */}
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-50" />
              <Avatar className="w-32 h-32 ring-4 ring-background shadow-2xl relative">
                <AvatarImage src={photoPreview} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl">
                  <User className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => setShowImageCropper(true)}
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageCropper(true)}
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <Camera className="w-4 h-4 mr-2" />
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </Button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG up to 5MB. Click to upload and crop your photo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Display */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address
          </Label>
          <Input
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={isEditModeFromUrl}
            className="bg-muted/50 border-border/50 focus:border-primary h-12"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Professional Headline */}
        <div className="space-y-2">
          <Label
            htmlFor="headline"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Professional Headline *
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
            className="h-12 border-border/50 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            {formData.professional_headline.length}/100 characters
          </p>
        </div>

        {/* Professional Bio */}
        <div className="space-y-2">
          <Label
            htmlFor="bio"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <User className="w-4 h-4 text-primary" />
            Professional Bio *
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
            className="resize-none border-border/50 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            {formData.professional_bio.length}/500 characters
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country of Origin */}
          <div className="space-y-2">
            <Label
              htmlFor="country"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Globe className="w-4 h-4 text-primary" />
              Country of Origin *
            </Label>
            <Select
              value={formData.country_of_origin}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, country_of_origin: value }))
              }
            >
              <SelectTrigger className="h-12 border-border/50">
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
          <div className="space-y-2">
            <Label
              htmlFor="experience"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Briefcase className="w-4 h-4 text-primary" />
              Years of Mentoring Experience
            </Label>
            <Input
              id="experience"
              type="number"
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
              className="h-12 border-border/50 focus:border-primary"
            />
          </div>
        </div>

        {/* LinkedIn URL */}
        <div className="space-y-2">
          <Label
            htmlFor="linkedin"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Linkedin className="w-4 h-4 text-primary" />
            LinkedIn Profile URL (Optional)
          </Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://www.linkedin.com/in/yourprofile"
            value={formData.linkedin_url}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
            }
            className="h-12 border-border/50 focus:border-primary"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-end pt-6 border-t border-border/50">
          <Button
            type="submit"
            size="lg"
            className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
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
