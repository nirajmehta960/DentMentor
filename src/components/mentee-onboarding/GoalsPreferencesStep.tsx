import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Target } from 'lucide-react';
import {
  ChoiceCard,
  FormSection,
  RemovableTag,
  RequiredMark,
  StepActions,
  StepHeader,
  TagList,
} from '@/components/onboarding/onboarding-ui';

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
    <div>
      <StepHeader
        icon={Target}
        title="Goals & preferences"
        description="Mentors you book can see where you want help and which schools you're aiming for, so they can prepare."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* What do you need help with */}
        <FormSection
          title="What do you need help with?"
          titleId="help-needed-title"
          required
          description="Select all areas where you'd like mentorship support."
        >
          <div
            role="group"
            aria-labelledby="help-needed-title"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {helpOptions.map((help) => (
              <ChoiceCard
                key={help}
                htmlFor={`help-${help}`}
                selected={selectedHelp.includes(help)}
                control={
                  <Checkbox
                    id={`help-${help}`}
                    checked={selectedHelp.includes(help)}
                    onCheckedChange={(checked) => handleHelpChange(help, !!checked)}
                  />
                }
                title={help}
              />
            ))}
          </div>
        </FormSection>

        {/* Target Dental Schools */}
        <FormSection title="Target dental schools" required>
          <Select onValueChange={handleSchoolAdd}>
            <SelectTrigger aria-label="Add a target dental school">
              <SelectValue placeholder="Add schools you're interested in" />
            </SelectTrigger>
            <SelectContent>
              {dentalSchools.filter(school => !selectedSchools.includes(school)).map((school) => (
                <SelectItem key={school} value={school}>{school}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSchools.length > 0 && (
            <TagList label="Selected schools">
              {selectedSchools.map((school) => (
                <RemovableTag
                  key={school}
                  onRemove={() => handleSchoolRemove(school)}
                  removeLabel={`Remove ${school}`}
                >
                  {school}
                </RemovableTag>
              ))}
            </TagList>
          )}
        </FormSection>

        {/* Preferred Session Times */}
        <FormSection
          title="Preferred session times"
          titleId="session-times-title"
          required
          description="When are you most available for mentorship sessions?"
        >
          <div
            role="group"
            aria-labelledby="session-times-title"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {sessionTimes.map((time) => (
              <ChoiceCard
                key={time}
                htmlFor={`time-${time}`}
                selected={selectedTimes.includes(time)}
                control={
                  <Checkbox
                    id={`time-${time}`}
                    checked={selectedTimes.includes(time)}
                    onCheckedChange={(checked) => handleTimeChange(time, !!checked)}
                  />
                }
                title={time}
              />
            ))}
          </div>
        </FormSection>

        {/* How did you hear about us */}
        <FormSection title="One last thing">
          <div className="flex flex-col gap-2">
            <Label htmlFor="referral-source">
              How did you hear about us?
              <RequiredMark />
            </Label>
            <Select
              value={formData.referral_source}
              onValueChange={(value) => setFormData(prev => ({ ...prev, referral_source: value }))}
            >
              <SelectTrigger id="referral-source">
                <SelectValue placeholder="Select how you found DentMentor" />
              </SelectTrigger>
              <SelectContent>
                {referralSources.map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormSection>

        {/* Navigation */}
        <StepActions onBack={onPrevious}>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            disabled={!isValid}
          >
            Complete setup
          </Button>
        </StepActions>
      </form>
    </div>
  );
};
