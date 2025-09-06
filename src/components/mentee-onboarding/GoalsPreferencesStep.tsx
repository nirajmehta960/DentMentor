import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Target, X } from 'lucide-react';

interface GoalsPreferencesStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const helpOptions = [
  'SOP Review & Writing',
  'Mock Interviews',
  'CV/Resume Review',
  'Letter of Recommendation Guidance',
  'Program Selection Strategy',
  'INBDE Study Planning',
  'Application Timeline',
  'Transcript Evaluation'
];

const sessionTimes = [
  'Morning (6 AM - 12 PM)',
  'Afternoon (12 PM - 6 PM)',
  'Evening (6 PM - 10 PM)',
  'Weekends'
];

const referralSources = [
  'Google Search',
  'Social Media',
  'Friend/Family Referral',
  'University Career Center',
  'Online Forum/Community',
  'Advertisement',
  'Other'
];

const dentalSchools = [
  'Harvard School of Dental Medicine',
  'University of Pennsylvania School of Dental Medicine',
  'University of California San Francisco School of Dentistry',
  'University of Michigan School of Dentistry',
  'Columbia University College of Dental Medicine',
  'New York University College of Dentistry',
  'UCLA School of Dentistry',
  'University of North Carolina School of Dentistry',
  'University of Washington School of Dentistry',
  'Boston University Henry M. Goldman School of Dental Medicine',
  'University of Southern California Herman Ostrow School of Dentistry',
  'University of Illinois Chicago College of Dentistry',
  'Tufts University School of Dental Medicine',
  'Case Western Reserve University School of Dental Medicine',
  'University of Pittsburgh School of Dental Medicine'
];

export const GoalsPreferencesStep = ({ data, onNext, onPrevious }: GoalsPreferencesStepProps) => {
  const [formData, setFormData] = useState({
    help_needed: data?.help_needed || [],
    target_schools: data?.target_schools || [],
    preferred_session_times: data?.preferred_session_times || [],
    referral_source: data?.referral_source || ''
  });

  const [selectedHelp, setSelectedHelp] = useState<string[]>(data?.help_needed || []);
  const [selectedSchools, setSelectedSchools] = useState<string[]>(data?.target_schools || []);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(data?.preferred_session_times || []);

  const handleHelpChange = (help: string, checked: boolean) => {
    const updatedHelp = checked 
      ? [...selectedHelp, help]
      : selectedHelp.filter(h => h !== help);
    
    setSelectedHelp(updatedHelp);
    setFormData(prev => ({ ...prev, help_needed: updatedHelp }));
  };

  const handleSchoolAdd = (school: string) => {
    if (school && !selectedSchools.includes(school)) {
      const updatedSchools = [...selectedSchools, school];
      setSelectedSchools(updatedSchools);
      setFormData(prev => ({ ...prev, target_schools: updatedSchools }));
    }
  };

  const handleSchoolRemove = (school: string) => {
    const updatedSchools = selectedSchools.filter(s => s !== school);
    setSelectedSchools(updatedSchools);
    setFormData(prev => ({ ...prev, target_schools: updatedSchools }));
  };

  const handleTimeChange = (time: string, checked: boolean) => {
    const updatedTimes = checked 
      ? [...selectedTimes, time]
      : selectedTimes.filter(t => t !== time);
    
    setSelectedTimes(updatedTimes);
    setFormData(prev => ({ ...prev, preferred_session_times: updatedTimes }));
  };

  const isValid = selectedHelp.length > 0 && selectedSchools.length > 0 && 
                 selectedTimes.length > 0 && formData.referral_source;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Goals & Preferences</h3>
        <p className="text-muted-foreground">Help us match you with the right mentor</p>
      </div>

      {/* What do you need help with */}
      <div className="space-y-3">
        <Label className="text-base font-medium">What do you need help with? *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select all areas where you'd like mentorship support
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {helpOptions.map((help) => (
            <div key={help} className="flex items-center space-x-2">
              <Checkbox
                id={`help-${help}`}
                checked={selectedHelp.includes(help)}
                onCheckedChange={(checked) => handleHelpChange(help, !!checked)}
              />
              <Label htmlFor={`help-${help}`} className="font-normal cursor-pointer text-sm">
                {help}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Target Dental Schools */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Target Dental Schools *</Label>
        <Select onValueChange={handleSchoolAdd}>
          <SelectTrigger>
            <SelectValue placeholder="Add schools you're interested in" />
          </SelectTrigger>
          <SelectContent>
            {dentalSchools.filter(school => !selectedSchools.includes(school)).map((school) => (
              <SelectItem key={school} value={school}>{school}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedSchools.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSchools.map((school) => (
              <Badge key={school} variant="secondary" className="flex items-center gap-1 text-xs">
                {school}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleSchoolRemove(school)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Preferred Session Times */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Preferred Session Times *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          When are you most available for mentorship sessions?
        </p>
        <div className="space-y-3">
          {sessionTimes.map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${time}`}
                checked={selectedTimes.includes(time)}
                onCheckedChange={(checked) => handleTimeChange(time, !!checked)}
              />
              <Label htmlFor={`time-${time}`} className="font-normal cursor-pointer">
                {time}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* How did you hear about us */}
      <div className="space-y-2">
        <Label className="text-base font-medium">How did you hear about us? *</Label>
        <Select 
          value={formData.referral_source} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, referral_source: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select how you found DentMentor" />
          </SelectTrigger>
          <SelectContent>
            {referralSources.map((source) => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button 
          type="submit" 
          disabled={!isValid}
          className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-8"
        >
          Complete Setup
        </Button>
      </div>
    </form>
  );
};