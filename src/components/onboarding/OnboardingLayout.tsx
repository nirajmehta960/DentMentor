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
  // Cap the progress at 100% to prevent showing more than 100%
  const progress = Math.min((currentStep / 5) * 100, 100);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error,
          variant: "destructive",
        });
      }
      // Redirect to landing page after successful sign out
      if (!error) {
        window.location.replace("/");
      }
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Sign Out Button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-muted-foreground hover:text-foreground bg-background/80 backdrop-blur-sm text-xs sm:text-sm"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isEditMode
              ? "Update Your Profile"
              : "Complete Your Mentor Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Review and update your mentor profile information"
              : "Help students find you by completing your professional profile"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-8 px-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-1 sm:gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center flex-1 min-w-0 ${
                    step.id <= currentStep
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1.5 sm:mb-2 transition-all duration-300 ${
                      step.id < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step.id === currentStep
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center max-w-[60px] sm:max-w-20 line-clamp-2">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
            <span>Step {Math.min(currentStep, 5)} of 5</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-0">
          <Card className="shadow-lg border-0 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 md:p-8">{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
