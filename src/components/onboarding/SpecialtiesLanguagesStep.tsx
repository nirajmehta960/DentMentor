import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages, ArrowRight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AddChip,
  FieldHint,
  FormSection,
  RemovableTag,
  RequiredMark,
  StepActions,
  StepHeader,
  TagList,
} from "./onboarding-ui";

interface SpecialtiesLanguagesStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const specialtyOptions = [
  "SOP Review",
  "Mock Interview",
  "CV Review",
  "Application Strategy",
  "LOR Guidance",
  "Personal Statement",
];

const dentalSpecialtyOptions = [
  "General Dentistry",
  "Orthodontics",
  "Oral Surgery",
  "Periodontics",
  "Endodontics",
  "Pediatric Dentistry",
  "Prosthodontics",
  "Oral Pathology",
];

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Nepali",
  "Urdu",
  "Bengali",
  "Tamil",
  "Telugu",
  "Punjabi",
  "Gujarati",
  "Marathi",
  "Turkish",
  "Persian (Farsi)",
  "Hebrew",
  "Thai",
  "Vietnamese",
  "Tagalog",
  "Indonesian",
  "Malay",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Romanian",
  "Bulgarian",
  "Croatian",
  "Serbian",
  "Greek",
  "Ukrainian",
  "Swahili",
  "Amharic",
  "Yoruba",
  "Igbo",
  "Hausa",
];

const availabilityOptions = [
  { value: "Weekdays", label: "Weekdays", description: "Monday to Friday" },
  { value: "Weekends", label: "Weekends", description: "Saturday & Sunday" },
  { value: "Evenings", label: "Evenings", description: "After 5 PM" },
  { value: "Flexible", label: "Flexible", description: "Any time" },
];

export const SpecialtiesLanguagesStep = ({
  data,
  onNext,
  onPrevious,
}: SpecialtiesLanguagesStepProps) => {
  const [formData, setFormData] = useState({
    areas_of_expertise: data?.areas_of_expertise || [],
    speciality: data?.speciality || "",
    languages_spoken: data?.languages_spoken || [],
    hourly_rate: data?.hourly_rate || "",
    availability_preference: data?.availability_preference || "",
  });

  const [customSpecialty, setCustomSpecialty] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const { toast } = useToast();

  // Update form data when data prop changes (for edit mode)
  useEffect(() => {
    setFormData({
      areas_of_expertise: data?.areas_of_expertise || [],
      speciality: data?.speciality || "",
      languages_spoken: data?.languages_spoken || [],
      hourly_rate: data?.hourly_rate || "",
      availability_preference: data?.availability_preference || "",
    });
  }, [data]);

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.areas_of_expertise.includes(specialty)) {
      setFormData((prev) => ({
        ...prev,
        areas_of_expertise: [...prev.areas_of_expertise, specialty],
      }));
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.filter(
        (s) => s !== specialty
      ),
    }));
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      addSpecialty(customSpecialty.trim());
      setCustomSpecialty("");
    }
  };

  const addLanguage = (language: string) => {
    if (language && !formData.languages_spoken.includes(language)) {
      setFormData((prev) => ({
        ...prev,
        languages_spoken: [...prev.languages_spoken, language],
      }));
    }
  };

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages_spoken: prev.languages_spoken.filter((l) => l !== language),
    }));
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim()) {
      addLanguage(customLanguage.trim());
      setCustomLanguage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - preserve backend logic
    if (!formData.speciality) {
      toast({
        title: "Specialty required",
        description: "Please select your primary dental specialty.",
        variant: "destructive",
      });
      return;
    }

    if (formData.areas_of_expertise.length === 0) {
      toast({
        title: "Specialties required",
        description: "Please select at least one area of expertise.",
        variant: "destructive",
      });
      return;
    }

    if (formData.languages_spoken.length === 0) {
      toast({
        title: "Languages required",
        description: "Please select at least one language you speak.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hourly_rate) {
      toast({
        title: "Hourly rate required",
        description: "Please set your hourly rate.",
        variant: "destructive",
      });
      return;
    }

    const rate = parseFloat(formData.hourly_rate);
    if (rate < 25 || rate > 100) {
      toast({
        title: "Invalid hourly rate",
        description: "Hourly rate must be between $25 and $100.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.availability_preference) {
      toast({
        title: "Availability preference required",
        description: "Please select your availability preference.",
        variant: "destructive",
      });
      return;
    }

    onNext(formData);
  };

  return (
    <div>
      <StepHeader
        icon={Languages}
        title="Specialties & languages"
        description="Define your areas of expertise and the languages you can mentor in."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Primary Dental Specialty */}
        <FormSection title="Specialty">
          <div className="flex flex-col gap-2">
            <Label htmlFor="specialty">
              Primary dental specialty
              <RequiredMark />
            </Label>
            <Select
              value={formData.speciality}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, speciality: value }))
              }
            >
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Select your primary dental specialty" />
              </SelectTrigger>
              <SelectContent>
                {dentalSpecialtyOptions.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        {/* Areas of Expertise */}
        <FormSection
          title="Areas of expertise"
          required
          description="Choose the kinds of help you offer, or add your own."
        >
          {formData.areas_of_expertise.length > 0 && (
            <TagList label="Selected areas of expertise">
              {formData.areas_of_expertise.map((specialty: string) => (
                <RemovableTag
                  key={specialty}
                  onRemove={() => removeSpecialty(specialty)}
                  removeLabel={`Remove ${specialty}`}
                >
                  {specialty}
                </RemovableTag>
              ))}
            </TagList>
          )}

          {specialtyOptions.some(
            (option) => !formData.areas_of_expertise.includes(option)
          ) && (
            <div className="flex flex-wrap gap-2">
              {specialtyOptions
                .filter(
                  (option) => !formData.areas_of_expertise.includes(option)
                )
                .map((specialty) => (
                  <AddChip
                    key={specialty}
                    onClick={() => addSpecialty(specialty)}
                  >
                    {specialty}
                  </AddChip>
                ))}
            </div>
          )}

          {/* Custom Specialty */}
          <div className="flex gap-2">
            <Input
              aria-label="Custom area of expertise"
              placeholder="Add custom specialty..."
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomSpecialty())
              }
            />
            <Button
              type="button"
              onClick={addCustomSpecialty}
              variant="outline"
              size="icon"
              aria-label="Add custom specialty"
              className="size-11 shrink-0"
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
        </FormSection>

        {/* Languages Section */}
        <FormSection
          title="Languages spoken"
          required
          description="The languages you can hold a session in."
        >
          {formData.languages_spoken.length > 0 && (
            <TagList label="Selected languages">
              {formData.languages_spoken.map((language: string) => (
                <RemovableTag
                  key={language}
                  onRemove={() => removeLanguage(language)}
                  removeLabel={`Remove ${language}`}
                >
                  {language}
                </RemovableTag>
              ))}
            </TagList>
          )}

          {/* Language Selection Dropdown */}
          <Select onValueChange={addLanguage}>
            <SelectTrigger aria-label="Add a language">
              <SelectValue placeholder="Select languages you speak..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {languageOptions
                .filter((option) => !formData.languages_spoken.includes(option))
                .map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Custom Language */}
          <div className="flex gap-2">
            <Input
              aria-label="Custom language"
              placeholder="Add custom language..."
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomLanguage())
              }
            />
            <Button
              type="button"
              onClick={addCustomLanguage}
              variant="outline"
              size="icon"
              aria-label="Add custom language"
              className="size-11 shrink-0"
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
        </FormSection>

        {/* Rate & Availability */}
        <FormSection title="Rate & availability">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="hourly-rate">
                Hourly rate (USD)
                <RequiredMark />
              </Label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.9375rem] font-medium text-band-muted"
                >
                  $
                </span>
                <Input
                  id="hourly-rate"
                  type="number"
                  inputMode="decimal"
                  placeholder="50"
                  min="25"
                  max="100"
                  step="5"
                  value={formData.hourly_rate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hourly_rate: e.target.value,
                    }))
                  }
                  aria-describedby="hourly-rate-hint"
                  className="pl-8 font-medium tabular-nums"
                />
              </div>
              <FieldHint id="hourly-rate-hint">
                Between <span data-numeric="">$25</span> and{" "}
                <span data-numeric="">$100</span> per hour.
              </FieldHint>
            </div>

            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="availability">
                Availability preference
                <RequiredMark />
              </Label>
              <Select
                value={formData.availability_preference}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability_preference: value,
                  }))
                }
              >
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Select your preferred availability" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          ({option.description})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormSection>

        <StepActions onBack={onPrevious}>
          <Button type="submit" size="lg">
            Continue
            <ArrowRight aria-hidden="true" />
          </Button>
        </StepActions>
      </form>
    </div>
  );
};
