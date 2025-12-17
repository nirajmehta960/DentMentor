import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  UserPlus,
  LogIn,
  UserCheck,
  GraduationCap,
  Chrome,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { signInWithGoogle, error, isAuthLoading, clearError } = useAuth();
  const [searchParams] = useSearchParams();

  // Determine initial tab from URL parameter
  const initialTab = searchParams.get("tab") === "signin" ? "signin" : "signup";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<"student" | "mentor">(
    "student"
  );

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signin" || tab === "signup") {
      setActiveTab(tab);
    }

    // Clear any errors
    clearError();
  }, [searchParams, clearError]);

  // Google OAuth handlers
  const handleGoogleSignUp = async () => {
    clearError();
    const userType = selectedRole === "student" ? "mentee" : "mentor";
    await signInWithGoogle(userType);
  };

  const handleGoogleSignIn = async () => {
    clearError();
    // For sign in, we need to check if user has a profile
    // We'll use a temporary userType, but the AuthContext will check if profile exists
    // If no profile exists, user will be signed out with an error message
    const result = await signInWithGoogle("mentee"); // Temporary - will be checked after OAuth
    if (result.error) {
      // Error will be shown by the AuthContext after profile check
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      <Card className="w-full max-w-md relative z-10 shadow-large border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Logo */}
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-medium">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              Join DentMentor
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Connect with dental professionals and accelerate your career
            </CardDescription>
          </div>

          {/* Role Selection - Only show for sign up */}
          {activeTab === "signup" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                I want to:
              </Label>
              <ToggleGroup
                type="single"
                value={selectedRole}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedRole(value as "student" | "mentor");
                  }
                }}
                className="grid grid-cols-1 gap-2 w-full"
              >
                <ToggleGroupItem
                  value="student"
                  className="flex items-center gap-3 p-4 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-2 data-[state=on]:border-primary/50 transition-all duration-200"
                >
                  <UserCheck className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Find a Mentor</div>
                    <div className="text-xs opacity-80">
                      I'm a dental student
                    </div>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="mentor"
                  className="flex items-center gap-3 p-4 h-auto data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground border-2 data-[state=on]:border-secondary/50 transition-all duration-200"
                >
                  <GraduationCap className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Become a Mentor</div>
                    <div className="text-xs opacity-80">
                      I'm a dental professional
                    </div>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Trust Signal - Only show for sign up */}
          {activeTab === "signup" && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Join 500+ international dental graduates
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-muted/50">
              <TabsTrigger
                value="signup"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger
                value="signin"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Sign In
              </TabsTrigger>
            </TabsList>

            {(error || searchParams.get("message")) && (
              <Alert
                variant={error ? "destructive" : "default"}
                className="mb-4 text-xs sm:text-sm"
              >
                <AlertDescription>
                  {error ||
                    decodeURIComponent(searchParams.get("message") || "")}
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="signup" className="space-y-4 sm:space-y-6">
              {/* Google Sign Up - Only authentication method */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-12 border-2 hover:bg-muted/50 transition-all duration-200 text-sm sm:text-base"
                onClick={handleGoogleSignUp}
                disabled={isAuthLoading}
              >
                <Chrome className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Continue with Google
              </Button>

              <p className="text-xs sm:text-sm text-center text-muted-foreground">
                Sign up with your Google account to get started
              </p>
            </TabsContent>

            <TabsContent value="signin" className="space-y-4 sm:space-y-6">
              {/* Google Sign In - Only authentication method */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 sm:h-12 border-2 hover:bg-muted/50 transition-all duration-200 text-sm sm:text-base"
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
              >
                <Chrome className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Continue with Google
              </Button>

              <p className="text-xs sm:text-sm text-center text-muted-foreground">
                Sign in with your Google account
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
