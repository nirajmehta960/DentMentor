import { ReactNode } from "react";
import { ProgressBar } from "@/components/apply/ProgressBar";
import { User, GraduationCap, Target } from "lucide-react";

interface MenteeOnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Exams & Timeline", icon: GraduationCap },
  { id: 3, title: "Goals & Preferences", icon: Target },
];

export const MenteeOnboardingLayout = ({
  children,
  currentStep,
}: MenteeOnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#008B8B] to-[#20B2AA]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#008B8B] font-bold text-lg">
                DentMentor
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">DentMentor</h1>
          </div>
          <h2 className="text-xl text-white/90 mb-2">Let's Get You Started!</h2>
          <p className="text-white/80 max-w-md mx-auto">
            Tell us about yourself so we can match you with the perfect mentor
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <ProgressBar currentStep={currentStep} totalSteps={3} steps={steps} />
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
