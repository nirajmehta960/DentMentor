import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  GraduationCap,
  Languages,
  BriefcaseBusiness,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { OnboardingShell, type OnboardingStepMeta } from "./onboarding-ui";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  isEditMode?: boolean;
}

const steps: readonly OnboardingStepMeta[] = [
  { id: 1, title: "Professional profile", icon: User },
  { id: 2, title: "Education", icon: GraduationCap },
  { id: 3, title: "Specialties & languages", icon: Languages },
  { id: 4, title: "Services", icon: BriefcaseBusiness },
  { id: 5, title: "Verification", icon: ShieldCheck },
];

export const OnboardingLayout = ({
  children,
  currentStep,
  isEditMode = false,
}: OnboardingLayoutProps) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) {
        toast({
          title: "Error signing out",
          description: result.error,
          variant: "destructive",
        });
      }
      // Redirect immediately to sign in page
      window.location.replace("/auth?tab=signin");
    } catch (error: any) {
      // Even on error, redirect to sign in page
      window.location.replace("/auth?tab=signin");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <OnboardingShell
      flowLabel={isEditMode ? "Edit your profile" : "Mentor profile"}
      steps={steps}
      currentStep={currentStep}
      exitAction={
        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="h-11 px-3 text-muted-foreground hover:text-foreground sm:px-4"
        >
          <LogOut aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">
            {isSigningOut ? "Signing out..." : "Sign out"}
          </span>
        </Button>
      }
    >
      {children}
    </OnboardingShell>
  );
};
