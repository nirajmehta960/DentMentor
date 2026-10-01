import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, GraduationCap } from "lucide-react";
import {
  ChoiceCard,
  FieldHint,
  FormSection,
  CONTROL_EDGE,
  RequiredMark,
  StepActions,
  StepHeader,
} from "@/components/onboarding/onboarding-ui";

interface ExamsTimelineStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrevious: () => void;
}

const inbdeStatuses = [
  "Not Started",
  "Part 1 Completed",
  "Part 2 Completed",
  "Both Completed",
  "Planning to Take",
];

const englishExams = ["TOEFL", "IELTS", "Not Taken"];

const programTypes = [
  "Advanced Standing DDS",
  "Advanced Standing DMD",
  "International Dentist Program",
];

export const ExamsTimelineStep = ({
  data,
  onNext,
  onPrevious,
}: ExamsTimelineStepProps) => {
  const [formData, setFormData] = useState({
    inbde_status: data?.inbde_status || "",
    english_exam: data?.english_exam || "",
    english_score: data?.english_score || "",
    target_programs: data?.target_programs || [],
  });

  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(
    data?.target_programs || []
  );

  const handleProgramChange = (program: string, checked: boolean) => {
    const updatedPrograms = checked
      ? [...selectedPrograms, program]
      : selectedPrograms.filter((p) => p !== program);

    setSelectedPrograms(updatedPrograms);
    setFormData((prev) => ({ ...prev, target_programs: updatedPrograms }));
  };

  const isValid =
    formData.inbde_status &&
    formData.english_exam &&
    selectedPrograms.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      // Clean up the data before sending
      const cleanedData: any = {
        inbde_status: formData.inbde_status || null,
        english_exam: formData.english_exam || null,
        // If exam is "Not Taken" or empty, set score to null
        // Otherwise, convert to number or null
        english_score:
          formData.english_exam === "Not Taken" ||
          formData.english_exam === "" ||
          formData.english_score === "" ||
          formData.english_score === null ||
          formData.english_score === undefined
            ? null
            : Number(formData.english_score),
        // Ensure target_programs is an array (not empty)
        target_programs: selectedPrograms.length > 0 ? selectedPrograms : null,
      };
      onNext(cleanedData);
    }
  };

  return (
    <div>
      <StepHeader
        icon={GraduationCap}
        title="Exams & timeline"
        description="Tell us about your exam progress and the programs you're aiming for."
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* INBDE Status */}
        <FormSection title="INBDE status" titleId="inbde-status-title" required>
          <RadioGroup
            value={formData.inbde_status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, inbde_status: value }))
            }
            aria-labelledby="inbde-status-title"
            className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {inbdeStatuses.map((status) => (
              <ChoiceCard
                key={status}
                htmlFor={`inbde-${status}`}
                selected={formData.inbde_status === status}
                control={<RadioGroupItem value={status} id={`inbde-${status}`} className={CONTROL_EDGE} />}
                title={status}
              />
            ))}
          </RadioGroup>
        </FormSection>

        {/* English Proficiency */}
        <FormSection title="English proficiency">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <Label htmlFor="english-exam">
                English proficiency exam
                <RequiredMark />
              </Label>
              <Select
                value={formData.english_exam}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, english_exam: value }))
                }
              >
                <SelectTrigger id="english-exam">
                  <SelectValue placeholder="Select English exam" />
                </SelectTrigger>
                <SelectContent>
                  {englishExams.map((exam) => (
                    <SelectItem key={exam} value={exam}>
                      {exam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Score Input */}
            {formData.english_exam && formData.english_exam !== "Not Taken" && (
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="english-score">
                  {formData.english_exam} score
                </Label>
                <Input
                  id="english-score"
                  type="number"
                  inputMode="decimal"
                  value={formData.english_score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      english_score: parseInt(e.target.value) || "",
                    }))
                  }
                  placeholder={`Enter your ${formData.english_exam} score`}
                  min="0"
                  max={formData.english_exam === "TOEFL" ? "120" : "9"}
                  aria-describedby="english-score-hint"
                  className="tabular-nums"
                />
                <FieldHint id="english-score-hint">
                  <span data-numeric="">
                    {formData.english_exam === "TOEFL"
                      ? "Score range: 0-120"
                      : "Score range: 0-9"}
                  </span>
                </FieldHint>
              </div>
            )}
          </div>
        </FormSection>

        {/* Target Program Types */}
        <FormSection
          title="Target program types"
          titleId="target-programs-title"
          required
          description="Select all programs you're interested in applying to."
        >
          <div
            role="group"
            aria-labelledby="target-programs-title"
            className="grid grid-cols-1 gap-2.5"
          >
            {programTypes.map((program) => (
              <ChoiceCard
                key={program}
                htmlFor={`program-${program}`}
                selected={selectedPrograms.includes(program)}
                control={
                  <Checkbox
                    id={`program-${program}`}
                    className={CONTROL_EDGE}
                    checked={selectedPrograms.includes(program)}
                    onCheckedChange={(checked) =>
                      handleProgramChange(program, !!checked)
                    }
                  />
                }
                title={program}
              />
            ))}
          </div>
        </FormSection>

        {/* Navigation */}
        <StepActions onBack={onPrevious}>
          <Button type="submit" size="lg" disabled={!isValid}>
            Continue
            <ArrowRight aria-hidden="true" />
          </Button>
        </StepActions>
      </form>
    </div>
  );
};
