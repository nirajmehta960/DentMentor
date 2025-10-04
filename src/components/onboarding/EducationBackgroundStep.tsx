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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  School,
  Calendar,
  BookOpen,
  Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EducationBackgroundStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
  isEditModeFromUrl?: boolean;
}

const mdsSpecializations = [
  "Endodontics",
  "Oral and Maxillofacial Surgery",
  "Oral Pathology",
  "Orthodontics",
  "Pedodontics",
  "Periodontics",
  "Prosthodontics",
  "Public Health Dentistry",
  "Conservative Dentistry",
  "Oral Medicine and Radiology",
];

const usDentalSchools = [
  "A.T. Still University - Arizona School of Dentistry & Oral Health",
  "Arizona School of Dentistry & Oral Health",
  "Boston University Henry M. Goldman School of Dental Medicine",
  "Case Western Reserve University School of Dental Medicine",
  "Columbia University College of Dental Medicine",
  "Creighton University School of Dentistry",
  "East Carolina University School of Dental Medicine",
  "Harvard School of Dental Medicine",
  "Howard University College of Dentistry",
  "Indiana University School of Dentistry",
  "Louisiana State University School of Dentistry",
  "Marquette University School of Dentistry",
  "Medical University of South Carolina James B. Edwards College of Dental Medicine",
  "New York University College of Dentistry",
  "Northwestern University Feinberg School of Medicine",
  "Nova Southeastern University College of Dental Medicine",
  "Ohio State University College of Dentistry",
  "Oregon Health & Science University School of Dentistry",
  "Southern Illinois University School of Dental Medicine",
  "State University of New York at Buffalo School of Dental Medicine",
  "Temple University Kornberg School of Dentistry",
  "Texas A&M University College of Dentistry",
  "Tufts University School of Dental Medicine",
  "University of Alabama at Birmingham School of Dentistry",
  "University of California Los Angeles School of Dentistry",
  "University of California San Francisco School of Dentistry",
  "University of Colorado School of Dental Medicine",
  "University of Connecticut School of Dental Medicine",
  "University of Detroit Mercy School of Dentistry",
  "University of Florida College of Dentistry",
  "University of Illinois at Chicago College of Dentistry",
  "University of Iowa College of Dentistry",
  "University of Kentucky College of Dentistry",
  "University of Louisville School of Dentistry",
  "University of Maryland School of Dentistry",
  "University of Michigan School of Dentistry",
  "University of Minnesota School of Dentistry",
  "University of Mississippi Medical Center School of Dentistry",
  "University of Missouri-Kansas City School of Dentistry",
  "University of Nebraska Medical Center College of Dentistry",
  "University of Nevada Las Vegas School of Dental Medicine",
  "University of New England College of Dental Medicine",
  "University of North Carolina at Chapel Hill Adams School of Dentistry",
  "University of Oklahoma College of Dentistry",
  "University of Pennsylvania School of Dental Medicine",
  "University of Pittsburgh School of Dental Medicine",
  "University of Puerto Rico School of Dental Medicine",
  "University of Southern California Herman Ostrow School of Dentistry",
  "University of Tennessee Health Science Center College of Dentistry",
  "University of Texas Health Science Center at Houston School of Dentistry",
  "University of Texas Health Science Center at San Antonio School of Dentistry",
  "University of the Pacific Arthur A. Dugoni School of Dentistry",
  "University of Utah School of Dentistry",
  "University of Washington School of Dentistry",
  "Virginia Commonwealth University School of Dentistry",
  "West Virginia University School of Dentistry",
];

export const EducationBackgroundStep = ({
  data,
  onNext,
  onPrevious,
  isEditModeFromUrl = false,
}: EducationBackgroundStepProps) => {
  const [formData, setFormData] = useState({
    bds_university: data?.bds_university || "",
    bds_graduation_year: data?.bds_graduation_year || "",
    mds_university: data?.mds_university || "",
    mds_graduation_year: data?.mds_graduation_year || "",
    mds_specialization: data?.mds_specialization || "",
    us_dental_school: data?.us_dental_school || "",
    us_dental_school_graduation_year:
      data?.us_dental_school_graduation_year || "",
    current_status: data?.current_status || "",
  });

  const { toast } = useToast();

  // Update form data when data prop changes (for edit mode)
  useEffect(() => {
    setFormData({
      bds_university: data?.bds_university || "",
      bds_graduation_year: data?.bds_graduation_year || "",
      mds_university: data?.mds_university || "",
      mds_graduation_year: data?.mds_graduation_year || "",
      mds_specialization: data?.mds_specialization || "",
      us_dental_school: data?.us_dental_school || "",
      us_dental_school_graduation_year:
        data?.us_dental_school_graduation_year || "",
      current_status: data?.current_status || "",
    });
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation - preserve backend logic
    if (!formData.bds_university.trim()) {
      toast({
        title: "BDS university required",
        description: "Please enter your BDS university.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.bds_graduation_year) {
      toast({
        title: "BDS graduation year required",
        description: "Please enter your BDS graduation year.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.us_dental_school) {
      toast({
        title: "US dental school required",
        description: "Please select your US dental school.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.us_dental_school_graduation_year) {
      toast({
        title: "Dental school graduation year required",
        description: "Please enter your dental school graduation year.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.current_status) {
      toast({
        title: "Current status required",
        description: "Please select your current status.",
        variant: "destructive",
      });
      return;
    }

    // Clean up the data before sending - convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      mds_university: formData.mds_university.trim() || null,
      mds_graduation_year: formData.mds_graduation_year || null,
      mds_specialization: formData.mds_specialization.trim() || null,
    };

    onNext(cleanedData);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear + 10 - i);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Education Background
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Help students understand your educational journey and qualifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BDS Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <School className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              BDS / Bachelor's Degree
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bds-university">BDS University *</Label>
              <Input
                id="bds-university"
                placeholder="e.g., BPKIHS, Dharan, Nepal"
                value={formData.bds_university}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bds_university: e.target.value,
                  }))
                }
                disabled={isEditModeFromUrl}
                className="h-12 border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bds-year">BDS Graduation Year *</Label>
              <Select
                value={formData.bds_graduation_year.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    bds_graduation_year: parseInt(value),
                  }))
                }
                disabled={isEditModeFromUrl}
              >
                <SelectTrigger className="h-12 border-border/50">
                  <SelectValue placeholder="Select graduation year" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* MDS Section (Optional) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              MDS / Master's Degree (Optional)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mds-university">MDS University</Label>
              <Input
                id="mds-university"
                placeholder="e.g., Nobel Medical College"
                value={formData.mds_university}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mds_university: e.target.value,
                  }))
                }
                disabled={isEditModeFromUrl}
                className="h-12 border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mds-year">MDS Graduation Year</Label>
              <Select
                value={formData.mds_graduation_year?.toString() || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    mds_graduation_year: parseInt(value),
                  }))
                }
                disabled={isEditModeFromUrl}
              >
                <SelectTrigger className="h-12 border-border/50">
                  <SelectValue placeholder="Select graduation year" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mds-specialization">MDS Specialization</Label>
            <Select
              value={formData.mds_specialization}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  mds_specialization: value,
                }))
              }
              disabled={isEditModeFromUrl}
            >
              <SelectTrigger className="h-12 border-border/50">
                <SelectValue placeholder="Select your specialization" />
              </SelectTrigger>
              <SelectContent>
                {mdsSpecializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* US Dental School Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">US Dental School</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dental-school">US Dental School *</Label>
              <Select
                value={formData.us_dental_school}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    us_dental_school: value,
                  }))
                }
                disabled={isEditModeFromUrl}
              >
                <SelectTrigger className="h-12 border-border/50">
                  <SelectValue placeholder="Select your US dental school" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {usDentalSchools.map((school) => (
                    <SelectItem key={school} value={school}>
                      {school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dental-year">
                US Dental School Graduation Year / Expected *
              </Label>
              <Select
                value={formData.us_dental_school_graduation_year.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    us_dental_school_graduation_year: parseInt(value),
                  }))
                }
                disabled={isEditModeFromUrl}
              >
                <SelectTrigger className="h-12 border-border/50">
                  <SelectValue placeholder="Select graduation year" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Current Status *</Label>
          <RadioGroup
            value={formData.current_status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, current_status: value }))
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.current_status === "Current Student"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/50 hover:border-primary/30"
              }`}
            >
              <label
                htmlFor="current-student"
                className="flex items-start gap-4 p-5 cursor-pointer"
              >
                <RadioGroupItem
                  value="Current Student"
                  id="current-student"
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    Current Student
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    I am currently enrolled in a US dental school
                  </div>
                </div>
              </label>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                formData.current_status === "Graduate"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border/50 hover:border-primary/30"
              }`}
            >
              <label
                htmlFor="graduate"
                className="flex items-start gap-4 p-5 cursor-pointer"
              >
                <RadioGroupItem
                  value="Graduate"
                  id="graduate"
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-foreground">Graduate</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    I have graduated from a US dental school
                  </div>
                </div>
              </label>
            </Card>
          </RadioGroup>
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
