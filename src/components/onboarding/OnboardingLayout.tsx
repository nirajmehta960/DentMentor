import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  GraduationCap,
  Languages,
  DollarSign,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  isEditMode?: boolean;
}

const steps = [
  { id: 1, title: "Professional Profile", icon: User },
  { id: 2, title: "Education Background", icon: GraduationCap },
  { id: 3, title: "Specialties & Languages", icon: Languages },
  { id: 4, title: "Services Offered", icon: DollarSign },
  { id: 5, title: "Verification", icon: ShieldCheck },
];

export const OnboardingLayout = ({
  children,
  currentStep,
  isEditMode = false,
}: OnboardingLayoutProps) => {
  const progress = (currentStep / 5) * 100;
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Premium background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Sign Out Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm border-border/50 shadow-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isEditMode ? "Edit Mode" : "Mentor Onboarding"}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isEditMode
              ? "Update Your Profile"
              : "Complete Your Mentor Profile"}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {isEditMode
              ? "Review and update your mentor profile information"
              : "Help students find you by completing your professional profile"}
          </p>
        </div>

        {/* Premium Progress Stepper */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative">
            {/* Progress line background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-muted/50 rounded-full mx-16" />
            {/* Active progress line */}
            <div
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full mx-16 transition-all duration-500"
              style={{
                width: `calc(${((currentStep - 1) / 4) * 100}% - 128px + ${
                  currentStep > 1 ? "128px" : "0px"
                })`,
              }}
            />

            <div className="relative flex items-start justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isUpcoming = step.id > currentStep;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 shadow-lg
                        ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-primary/30"
                            : isCurrent
                            ? "bg-primary text-primary-foreground shadow-primary/40 ring-4 ring-primary/20"
                            : "bg-muted/80 text-muted-foreground shadow-none border-2 border-border/50"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`
                      text-xs font-medium text-center max-w-[80px] leading-tight transition-colors
                      ${
                        isCurrent
                          ? "text-primary"
                          : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    `}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress info */}
          <div className="flex justify-between items-center mt-6 px-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of 5
            </span>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% complete
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
            <CardContent className="p-8 lg:p-10">{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
