import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Upload, User } from 'lucide-react';
import {
  FormSection,
  RemovableTag,
  RequiredMark,
  StepActions,
  StepHeader,
  TagList,
} from '@/components/onboarding/onboarding-ui';

interface PersonalInformationStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const countries = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'OTHER', name: 'Other', flag: '🌍' }
];

const degrees = [
  'Bachelor of Dental Surgery (BDS)',
  'Doctor of Dental Medicine (DMD)',
  'Doctor of Dental Surgery (DDS)',
  'Master in Dentistry',
  'Other'
];

const languages = [
  // Major World Languages
  'English', 'Spanish', 'Mandarin Chinese', 'Arabic', 'Portuguese', 'Russian', 'French', 'German', 'Italian', 'Japanese', 'Korean',
  
  // Major Indian Languages
  'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Gujarati', 'Punjabi', 'Marathi', 'Kannada', 'Malayalam', 'Odia', 'Assamese', 'Kashmiri',
  
  // South Asian Languages
  'Urdu', 'Nepali', 'Sinhala', 'Persian', 'Pashto', 'Dari', 'Sindhi',
  
  // Southeast Asian Languages
  'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Tagalog', 'Filipino', 'Burmese', 'Khmer', 'Lao',
  
  // European Languages
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Greek', 'Ukrainian', 'Belarusian', 'Lithuanian', 'Latvian', 'Estonian', 'Slovak', 'Slovenian', 'Croatian', 'Serbian', 'Bosnian', 'Macedonian', 'Albanian', 'Maltese', 'Icelandic', 'Irish', 'Welsh', 'Scottish Gaelic', 'Catalan', 'Basque', 'Galician',
  
  // African Languages
  'Swahili', 'Amharic', 'Yoruba', 'Igbo', 'Hausa',
  
  // Other Regional Languages
  'Turkish', 'Hebrew', 'Armenian', 'Georgian', 'Azerbaijani', 'Kazakh', 'Kyrgyz', 'Tajik', 'Turkmen', 'Uzbek', 'Mongolian', 'Tibetan', 'Uyghur', 'Kurdish', 'Farsi',
  
  // Indian Regional Languages
  'Bhojpuri', 'Maithili', 'Magahi', 'Awadhi', 'Chhattisgarhi', 'Rajasthani', 'Haryanvi', 'Garhwali', 'Kumaoni', 'Dogri', 'Kangri', 'Pahari', 'Himachali', 'Ladakhi', 'Balti', 'Shina', 'Burushaski', 'Khowar', 'Wakhi', 'Kalasha', 'Konkani', 'Tulu', 'Saraiki',
  
  'Other'
];

export const PersonalInformationStep = ({ data, onNext }: PersonalInformationStepProps) => {
  const [formData, setFormData] = useState({
    profile_photo_url: data?.profile_photo_url || '',
    citizenship_country: data?.citizenship_country || '',
    current_location: data?.current_location || '',
    highest_degree: data?.highest_degree || '',
    university_name: data?.university_name || '',
    graduation_year: data?.graduation_year || new Date().getFullYear(),
    languages_spoken: data?.languages_spoken || []
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(data?.languages_spoken || []);
  const [languageInput, setLanguageInput] = useState('');

  const handleLanguageAdd = (language: string) => {
    if (language && !selectedLanguages.includes(language)) {
      const updatedLanguages = [...selectedLanguages, language];
      setSelectedLanguages(updatedLanguages);
      setFormData(prev => ({ ...prev, languages_spoken: updatedLanguages }));
      setLanguageInput('');
    }
  };

  const handleLanguageRemove = (language: string) => {
    const updatedLanguages = selectedLanguages.filter(l => l !== language);
    setSelectedLanguages(updatedLanguages);
    setFormData(prev => ({ ...prev, languages_spoken: updatedLanguages }));
  };

  const isFormValid = () => {
    return formData.citizenship_country && 
           formData.current_location && 
           formData.highest_degree && 
           formData.graduation_year && 
           formData.university_name && 
           selectedLanguages.length > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onNext(formData);
    }
  };

  return (
    <div>
      <StepHeader
        icon={User}
        title="Personal information"
        description="Let's start with some basic information about you. Mentors you book can see these details, so they can prepare for your session."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Profile Photo */}
        <FormSection>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="grid size-20 place-items-center rounded-full bg-[rgb(15_112_93/0.08)]">
                <User className="size-9 text-band-signal" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Profile photo"
                className="absolute -bottom-1 -right-1 size-10 rounded-full"
              >
                <Upload aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[0.9375rem] font-medium text-band-fg">Profile photo</p>
              <p className="label text-band-faint">Optional</p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Where you're from">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Citizenship Country */}
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="citizenship">
                Citizenship country
                <RequiredMark />
              </Label>
              <Select
                value={formData.citizenship_country}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, citizenship_country: value }));
                }}
              >
                <SelectTrigger id="citizenship">
                  <SelectValue placeholder="Select your citizenship country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Location */}
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="location">
                Current location
                <RequiredMark />
              </Label>
              <Input
                id="location"
                placeholder="City, Country or State"
                value={formData.current_location}
                onChange={(e) => setFormData(prev => ({ ...prev, current_location: e.target.value }))}
                required
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Education">
          {/* Highest Degree */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="degree">
              Highest degree completed
              <RequiredMark />
            </Label>
            <Select
              value={formData.highest_degree}
              onValueChange={(value) => setFormData(prev => ({ ...prev, highest_degree: value }))}
            >
              <SelectTrigger id="degree">
                <SelectValue placeholder="Select degree" />
              </SelectTrigger>
              <SelectContent>
                {degrees.map((degree) => (
                  <SelectItem key={degree} value={degree}>
                    {degree}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
            {/* University Name */}
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="university">
                University / institution name
                <RequiredMark />
              </Label>
              <Input
                id="university"
                placeholder="Enter your university name"
                value={formData.university_name}
                onChange={(e) => setFormData(prev => ({ ...prev, university_name: e.target.value }))}
                required
              />
            </div>

            {/* Graduation Year */}
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="graduation">
                Graduation year
                <RequiredMark />
              </Label>
              <Input
                id="graduation"
                type="number"
                inputMode="numeric"
                placeholder="2025"
                value={formData.graduation_year}
                onChange={(e) => setFormData(prev => ({ ...prev, graduation_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                min="1950"
                max={new Date().getFullYear() + 10}
                required
                className="tabular-nums"
              />
            </div>
          </div>
        </FormSection>

        {/* Languages */}
        <FormSection title="Languages spoken" required>
          <Select
            value={languageInput}
            onValueChange={(value) => {
              if (value === 'Other') {
                setLanguageInput('');
              } else {
                handleLanguageAdd(value);
              }
            }}
          >
            <SelectTrigger aria-label="Add a language">
              <SelectValue placeholder="Select languages you speak" />
            </SelectTrigger>
            <SelectContent>
              {languages.filter(lang => !selectedLanguages.includes(lang)).map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedLanguages.length > 0 && (
            <TagList label="Selected languages">
              {selectedLanguages.map((language) => (
                <RemovableTag
                  key={language}
                  onRemove={() => handleLanguageRemove(language)}
                  removeLabel={`Remove ${language}`}
                >
                  {language}
                </RemovableTag>
              ))}
            </TagList>
          )}
        </FormSection>

        {/* Submit Button */}
        <StepActions>
          <Button
            type="submit"
            size="lg"
            disabled={!isFormValid()}
          >
            Continue
            <ArrowRight aria-hidden="true" />
          </Button>
        </StepActions>
      </form>
    </div>
  );
};
