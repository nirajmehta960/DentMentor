import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap } from 'lucide-react';

interface ExamsTimelineStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const inbdeStatuses = [
  'Not Started',
  'Part 1 Completed',
  'Part 2 Completed', 
  'Both Completed',
  'Planning to Take'
];

const englishExams = [
  'TOEFL',
  'IELTS',
  'Not Taken'
];

const programTypes = [
  'Advanced Standing DDS',
  'Advanced Standing DMD',
  'International Dentist Program'
];

export const ExamsTimelineStep = ({ data, onNext, onPrevious }: ExamsTimelineStepProps) => {
  const [formData, setFormData] = useState({
    inbde_status: data?.inbde_status || '',
    english_exam: data?.english_exam || '',
    english_score: data?.english_score || '',
    target_programs: data?.target_programs || []
  });

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(data?.target_programs || []);

  const handleProgramChange = (program: string, checked: boolean) => {
    const updatedPrograms = checked 
      ? [...selectedPrograms, program]
      : selectedPrograms.filter(p => p !== program);
    
    setSelectedPrograms(updatedPrograms);
    setFormData(prev => ({ ...prev, target_programs: updatedPrograms }));
  };

  const isValid = formData.inbde_status && formData.english_exam && selectedPrograms.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="w-12 h-12 text-primary mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Exams & Timeline</h3>
        <p className="text-muted-foreground">Tell us about your exam progress and goals</p>
      </div>

      {/* INBDE Status */}
      <div className="space-y-3">
        <Label className="text-base font-medium">INBDE Status *</Label>
        <RadioGroup
          value={formData.inbde_status}
          onValueChange={(value) => setFormData(prev => ({ ...prev, inbde_status: value }))}
          className="space-y-2"
        >
          {inbdeStatuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <RadioGroupItem value={status} id={`inbde-${status}`} />
              <Label htmlFor={`inbde-${status}`} className="font-normal cursor-pointer">
                {status}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* English Proficiency */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-base font-medium">English Proficiency Exam *</Label>
          <Select 
            value={formData.english_exam} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, english_exam: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select English exam" />
            </SelectTrigger>
            <SelectContent>
              {englishExams.map((exam) => (
                <SelectItem key={exam} value={exam}>{exam}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Score Input */}
        {formData.english_exam && formData.english_exam !== 'Not Taken' && (
          <div className="space-y-2">
            <Label htmlFor="english-score">
              {formData.english_exam} Score
            </Label>
            <Input
              id="english-score"
              type="number"
              value={formData.english_score}
              onChange={(e) => setFormData(prev => ({ ...prev, english_score: parseInt(e.target.value) || '' }))}
              placeholder={`Enter your ${formData.english_exam} score`}
              min="0"
              max={formData.english_exam === 'TOEFL' ? '120' : '9'}
            />
            <p className="text-sm text-muted-foreground">
              {formData.english_exam === 'TOEFL' ? 'Score range: 0-120' : 'Score range: 0-9'}
            </p>
          </div>
        )}
      </div>

      {/* Target Program Types */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Target Program Types *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select all programs you're interested in applying to
        </p>
        <div className="space-y-3">
          {programTypes.map((program) => (
            <div key={program} className="flex items-center space-x-2">
              <Checkbox
                id={`program-${program}`}
                checked={selectedPrograms.includes(program)}
                onCheckedChange={(checked) => handleProgramChange(program, !!checked)}
              />
              <Label htmlFor={`program-${program}`} className="font-normal cursor-pointer">
                {program}
              </Label>
            </div>
          ))}
        </div>
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
          Continue
        </Button>
      </div>
    </form>
  );
};