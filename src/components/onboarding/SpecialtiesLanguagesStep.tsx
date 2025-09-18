import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Languages, ArrowRight, ArrowLeft, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpecialtiesLanguagesStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const areas_of_expertiseOptions = [
  'SOP Review',
  'Mock Interview',
  'CV Review',
  'LOR Guidance',
  'Personal Statement',
  'Application Strategy'
];

const specialtyOptions = [
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Periodontics',
  'Endodontics',
  'Pediatric Dentistry',
  'Prosthodontics',
  'Oral Pathology'
];

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese (Mandarin)',
  'Chinese (Cantonese)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Nepali',
  'Urdu',
  'Bengali',
  'Tamil',
  'Telugu',
  'Punjabi',
  'Gujarati',
  'Marathi',
  'Turkish',
  'Persian (Farsi)',
  'Hebrew',
  'Thai',
  'Vietnamese',
  'Tagalog',
  'Indonesian',
  'Malay',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Czech',
  'Hungarian',
  'Romanian',
  'Bulgarian',
  'Croatian',
  'Serbian',
  'Greek',
  'Ukrainian',
  'Swahili',
  'Amharic',
  'Yoruba',
  'Igbo',
  'Hausa'
];

const availabilityOptions = [
  'Weekdays',
  'Weekends',
  'Evenings',
  'Flexible'
];

export const SpecialtiesLanguagesStep = ({ data, onNext, onPrevious }: SpecialtiesLanguagesStepProps) => {
  const [formData, setFormData] = useState({
    areas_of_expertise: data?.areas_of_expertise || [],
    speciality: data?.speciality || '',
    languages_spoken: data?.languages_spoken || [],
    hourly_rate: data?.hourly_rate || '',
    availability_preference: data?.availability_preference || ''
  });

  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const { toast } = useToast();

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.areas_of_expertise.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        areas_of_expertise: [...prev.areas_of_expertise, specialty]
      }));
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.filter(s => s !== specialty)
    }));
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      addSpecialty(customSpecialty.trim());
      setCustomSpecialty('');
    }
  };

  const addLanguage = (language: string) => {
    if (language && !formData.languages_spoken.includes(language)) {
      setFormData(prev => ({
        ...prev,
        languages_spoken: [...prev.languages_spoken, language]
      }));
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages_spoken: prev.languages_spoken.filter(l => l !== language)
    }));
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim()) {
      addLanguage(customLanguage.trim());
      setCustomLanguage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.speciality) {
      toast({
        title: "Specialty required",
        description: "Please select your primary dental specialty.",
        variant: "destructive"
      });
      return;
    }

    if (formData.areas_of_expertise.length === 0) {
      toast({
        title: "Specialties required",
        description: "Please select at least one area of expertise.",
        variant: "destructive"
      });
      return;
    }

    if (formData.languages_spoken.length === 0) {
      toast({
        title: "Languages required",
        description: "Please select at least one language you speak.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.hourly_rate) {
      toast({
        title: "Hourly rate required",
        description: "Please set your hourly rate.",
        variant: "destructive"
      });
      return;
    }

    const rate = parseFloat(formData.hourly_rate);
    if (rate < 25 || rate > 100) {
      toast({
        title: "Invalid hourly rate",
        description: "Hourly rate must be between $25 and $100.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.availability_preference) {
      toast({
        title: "Availability preference required",
        description: "Please select your availability preference.",
        variant: "destructive"
      });
      return;
    }

    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Languages className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Specialties & Languages</h2>
        <p className="text-muted-foreground">
          Define your areas of expertise and the languages you can mentor in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Specialty */}
        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty *</Label>
          <Select
            value={formData.speciality}
            onValueChange={(value) => setFormData(prev => ({ ...prev, speciality: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your primary dental specialty" />
            </SelectTrigger>
            <SelectContent>
              {specialtyOptions.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Specialties */}
        <div className="space-y-4">
          <Label>Areas of Expertise *</Label>
          
          {/* Selected Specialties */}
          {formData.areas_of_expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
              {formData.areas_of_expertise.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="px-3 py-1">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Specialty Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {areas_of_expertiseOptions
              .filter(option => !formData.areas_of_expertise.includes(option))
              .map((specialty) => (
                <Button
                  key={specialty}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSpecialty(specialty)}
                  className="justify-start text-left"
                >
                  <Plus className="w-3 h-3 mr-2" />
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSpecialty())}
            />
            <Button type="button" onClick={addCustomSpecialty} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-4">
          <Label>Languages Spoken *</Label>
          
          {/* Selected Languages */}
          {formData.languages_spoken.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
              {formData.languages_spoken.map((language) => (
                <Badge key={language} variant="secondary" className="px-3 py-1">
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Language Selection Dropdown */}
          <Select onValueChange={addLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select languages you speak..." />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {languageOptions
                .filter(option => !formData.languages_spoken.includes(option))
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLanguage())}
            />
            <Button type="button" onClick={addCustomLanguage} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="hourly-rate">Hourly Rate (USD) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="hourly-rate"
              type="number"
              placeholder="50"
              min="25"
              max="100"
              step="5"
              value={formData.hourly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
              className="pl-8"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Range: $25 - $100 per hour. Most mentors charge between $40-$60.
          </p>
        </div>

        {/* Availability Preference */}
        <div className="space-y-2">
          <Label htmlFor="availability">Availability Preference *</Label>
          <Select
            value={formData.availability_preference}
            onValueChange={(value) => setFormData(prev => ({ ...prev, availability_preference: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your preferred availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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