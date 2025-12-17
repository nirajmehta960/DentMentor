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
import { Badge } from "@/components/ui/badge";
import {
  Languages,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  DollarSign,
  Clock,
  Sparkles,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
          <Languages className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Specialties & Languages
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Define your areas of expertise and the languages you can mentor in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Primary Dental Specialty */}
        <div className="space-y-2">
          <Label
            htmlFor="specialty"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Primary Dental Specialty *
          </Label>
          <Select
            value={formData.speciality}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, speciality: value }))
            }
          >
            <SelectTrigger className="h-12 border-border/50">
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

        {/* Specialties Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">
              Areas of Expertise *
            </Label>
          </div>

          {/* Selected Specialties */}
          {formData.areas_of_expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
              {formData.areas_of_expertise.map((specialty: string) => (
                <Badge
                  key={specialty}
                  className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-default"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-2 hover:text-primary-foreground/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Specialty Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {specialtyOptions
              .filter((option) => !formData.areas_of_expertise.includes(option))
              .map((specialty) => (
                <Button
                  key={specialty}
                  type="button"
                  variant="outline"
                  onClick={() => addSpecialty(specialty)}
                  className="justify-start h-auto py-3 border-border/50 hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="w-4 h-4 mr-2 text-primary" />
                  {specialty}
                </Button>
              ))}
          </div>

          {/* Custom Specialty */}
          <div className="flex gap-2">
            <Input
              placeholder="Add custom specialty..."
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomSpecialty())
              }
              className="h-12 border-border/50 focus:border-primary"
            />
            <Button
              type="button"
              onClick={addCustomSpecialty}
              size="lg"
              variant="outline"
              className="px-4 border-primary text-primary hover:bg-primary/10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Languages Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">
              Languages Spoken *
            </Label>
          </div>

          {/* Selected Languages */}
          {formData.languages_spoken.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
              {formData.languages_spoken.map((language: string) => (
                <Badge
                  key={language}
                  className="px-3 py-1.5 bg-blue-500 text-white hover:bg-blue-500/90 cursor-default"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="ml-2 hover:text-white/80"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Language Selection Dropdown */}
          <Select onValueChange={addLanguage}>
            <SelectTrigger className="h-12 border-border/50">
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
              placeholder="Add custom language..."
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addCustomLanguage())
              }
              className="h-12 border-border/50 focus:border-primary"
            />
            <Button
              type="button"
              onClick={addCustomLanguage}
              size="lg"
              variant="outline"
              className="px-4 border-blue-500 text-blue-500 hover:bg-blue-500/10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">
              Hourly Rate (USD) *
            </Label>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-muted-foreground">
              $
            </span>
            <Input
              type="number"
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
              className="h-14 pl-10 text-lg font-semibold border-border/50 focus:border-primary"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Range: $25 - $100 per hour. Most mentors charge between $40-$60.
          </p>
        </div>

        {/* Availability Preference */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">
              Availability Preference *
            </Label>
          </div>
          <Select
            value={formData.availability_preference}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                availability_preference: value,
              }))
            }
          >
            <SelectTrigger className="h-12 border-border/50">
              <SelectValue placeholder="Select your preferred availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-xs">
                      ({option.description})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-border/50">
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
    </div>
  );
};
