import { ReactNode } from "react";
import { User, GraduationCap, Target } from "lucide-react";
import {
  OnboardingShell,
  type OnboardingStepMeta,
} from "@/components/onboarding/onboarding-ui";

interface MenteeOnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const steps: readonly OnboardingStepMeta[] = [
  { id: 1, title: "Personal info", icon: User },
  { id: 2, title: "Exams & timeline", icon: GraduationCap },
  { id: 3, title: "Goals & preferences", icon: Target },
];

export const MenteeOnboardingLayout = ({
  children,
  currentStep,
}: MenteeOnboardingLayoutProps) => {
  return (
    <OnboardingShell
      flowLabel="Your profile"
      steps={steps}
      currentStep={currentStep}
    >
      {children}
    </OnboardingShell>
  );
};
