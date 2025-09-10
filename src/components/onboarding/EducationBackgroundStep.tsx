import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EducationBackgroundStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const usDentalSchools = [
  'A.T. Still University - Arizona School of Dentistry & Oral Health',
  'Arizona School of Dentistry & Oral Health',
  'Boston University Henry M. Goldman School of Dental Medicine',
  'Case Western Reserve University School of Dental Medicine',
  'Columbia University College of Dental Medicine',
  'Creighton University School of Dentistry',
  'East Carolina University School of Dental Medicine',
  'Harvard School of Dental Medicine',
  'Howard University College of Dentistry',
  'Indiana University School of Dentistry',
  'Louisiana State University School of Dentistry',
  'Marquette University School of Dentistry',
  'Medical University of South Carolina James B. Edwards College of Dental Medicine',
  'New York University College of Dentistry',
  'Northwestern University Feinberg School of Medicine',
  'Nova Southeastern University College of Dental Medicine',
  'Ohio State University College of Dentistry',
  'Oregon Health & Science University School of Dentistry',
  'Southern Illinois University School of Dental Medicine',
  'State University of New York at Buffalo School of Dental Medicine',
  'Temple University Kornberg School of Dentistry',
  'Texas A&M University College of Dentistry',
  'Tufts University School of Dental Medicine',
  'University of Alabama at Birmingham School of Dentistry',
  'University of California Los Angeles School of Dentistry',
  'University of California San Francisco School of Dentistry',
  'University of Colorado School of Dental Medicine',
  'University of Connecticut School of Dental Medicine',
  'University of Detroit Mercy School of Dentistry',
  'University of Florida College of Dentistry',
  'University of Illinois at Chicago College of Dentistry',
  'University of Iowa College of Dentistry',
  'University of Kentucky College of Dentistry',
  'University of Louisville School of Dentistry',
  'University of Maryland School of Dentistry',
  'University of Michigan School of Dentistry',
  'University of Minnesota School of Dentistry',
  'University of Mississippi Medical Center School of Dentistry',
  'University of Missouri-Kansas City School of Dentistry',
  'University of Nebraska Medical Center College of Dentistry',
  'University of Nevada Las Vegas School of Dental Medicine',
  'University of New England College of Dental Medicine',
  'University of North Carolina at Chapel Hill Adams School of Dentistry',
  'University of Oklahoma College of Dentistry',
  'University of Pennsylvania School of Dental Medicine',
  'University of Pittsburgh School of Dental Medicine',
  'University of Puerto Rico School of Dental Medicine',
  'University of Southern California Herman Ostrow School of Dentistry',
  'University of Tennessee Health Science Center College of Dentistry',
  'University of Texas Health Science Center at Houston School of Dentistry',
  'University of Texas Health Science Center at San Antonio School of Dentistry',
  'University of the Pacific Arthur A. Dugoni School of Dentistry',
  'University of Utah School of Dentistry',
  'University of Washington School of Dentistry',
  'Virginia Commonwealth University School of Dentistry',
  'West Virginia University School of Dentistry'
];

export const EducationBackgroundStep = ({ data, onNext, onPrevious }: EducationBackgroundStepProps) => {
  const [formData, setFormData] = useState({
    bachelor_university: data?.bachelor_university || '',
    bachelor_graduation_year: data?.bachelor_graduation_year || '',
    masters_university: data?.masters_university || '',
    master_graduation_year: data?.master_graduation_year || '',
    dental_school: data?.dental_school || '',
    dental_school_graduation_year: data?.dental_school_graduation_year || '',
    current_status: data?.current_status || ''
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.bachelor_university.trim()) {
      toast({
        title: "Bachelor's university required",
        description: "Please enter your bachelor's university.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.bachelor_graduation_year) {
      toast({
        title: "Bachelor's graduation year required",
        description: "Please enter your bachelor's graduation year.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.dental_school) {
      toast({
        title: "US dental school required",
        description: "Please select your US dental school.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.dental_school_graduation_year) {
      toast({
        title: "Dental school graduation year required",
        description: "Please enter your dental school graduation year.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.current_status) {
      toast({
        title: "Current status required",
        description: "Please select your current status.",
        variant: "destructive"
      });
      return;
    }

    // Clean up the data before sending - convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      masters_university: formData.masters_university.trim() || null,
      master_graduation_year: formData.master_graduation_year || null
    };

    onNext(cleanedData);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear + 10 - i);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Education Background</h2>
        <p className="text-muted-foreground">
          Help students understand your educational journey and qualifications
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bachelor's University */}
        <div className="space-y-2">
          <Label htmlFor="bachelor-university">Bachelor's University *</Label>
          <Input
            id="bachelor-university"
            placeholder="e.g., University of Mumbai, University of Cairo"
            value={formData.bachelor_university}
            onChange={(e) => setFormData(prev => ({ ...prev, bachelor_university: e.target.value }))}
          />
        </div>

        {/* Bachelor's Graduation Year */}
        <div className="space-y-2">
          <Label htmlFor="bachelor-year">Bachelor's Graduation Year *</Label>
          <Select
            value={formData.bachelor_graduation_year.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, bachelor_graduation_year: parseInt(value) }))}
          >
            <SelectTrigger>
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

        {/* Master's University */}
        <div className="space-y-2">
          <Label htmlFor="masters-university">Master's University</Label>
          <Input
            id="masters-university"
            placeholder="e.g., University of Mumbai, University of Cairo"
            value={formData.masters_university}
            onChange={(e) => setFormData(prev => ({ ...prev, masters_university: e.target.value }))}
          />
        </div>

        {/* Master's Graduation Year */}
        <div className="space-y-2">
          <Label htmlFor="master-year">Master's Graduation Year</Label>
          <Select
            value={formData.master_graduation_year.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, master_graduation_year: parseInt(value) }))}
          >
            <SelectTrigger>
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

        {/* US Dental School */}
        <div className="space-y-2">
          <Label htmlFor="dental-school">US Dental School *</Label>
          <Select
            value={formData.dental_school}
            onValueChange={(value) => setFormData(prev => ({ ...prev, dental_school: value }))}
          >
            <SelectTrigger>
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

        {/* US Dental School Graduation Year */}
        <div className="space-y-2">
          <Label htmlFor="dental-year">US Dental School Graduation Year / Expected *</Label>
          <Select
            value={formData.dental_school_graduation_year.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, dental_school_graduation_year: parseInt(value) }))}
          >
            <SelectTrigger>
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

        {/* Current Status */}
        <div className="space-y-4">
          <Label>Current Status *</Label>
          <RadioGroup
            value={formData.current_status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, current_status: value }))}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="Current Student" id="current-student" />
              <Label htmlFor="current-student" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Current Student</div>
                  <div className="text-sm text-muted-foreground">
                    I am currently enrolled in a US dental school
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="Graduate" id="graduate" />
              <Label htmlFor="graduate" className="flex-1 cursor-pointer">
                <div>
                  <div className="font-medium">Graduate</div>
                  <div className="text-sm text-muted-foreground">
                    I have graduated from a US dental school
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrevious}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button type="submit">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
};
