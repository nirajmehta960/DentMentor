import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  LogIn,
  UserCheck,
  GraduationCap,
  Chrome,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSignUpFormPersistence } from "@/hooks/useFormPersistence";
import { Link } from "react-router-dom";

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, error, isAuthLoading, clearError } =
    useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine initial tab from URL parameter, default to signin
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<"student" | "mentor">(
    "student"
  );

  // Sign up form with persistence
  const {
    data: signUpData,
    updateField,
    clearData,
  } = useSignUpFormPersistence({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    agreedToTerms: false,
  });

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signin" || tab === "signup") {
      setActiveTab(tab);
    } else if (!tab) {
      // Default to signin if no tab parameter
      setActiveTab("signin");
    }

    // Clear any errors only when tab changes
    clearError();
  }, [searchParams]);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

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

  // Email/password handlers
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Form validation
    if (!validateEmail(signUpData.email)) {
      return;
    }

    if (!validatePassword(signUpData.password)) {
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      return;
    }

    if (!signUpData.agreedToTerms) {
      return;
    }

    const { error } = await signUp({
      ...signUpData,
      userType: selectedRole === "student" ? "mentee" : "mentor",
    });

    if (!error) {
      clearData();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await signIn(signInData.email, signInData.password);
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
              {/* Google Sign Up */}
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

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-foreground font-medium text-xs sm:text-sm"
                    >
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) =>
                          updateField("firstName", e.target.value)
                        }
                        className="pl-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-foreground font-medium text-xs sm:text-sm"
                    >
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) =>
                          updateField("lastName", e.target.value)
                        }
                        className="pl-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground font-medium text-xs sm:text-sm"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                      value={signUpData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={`pl-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20 ${
                        signUpData.email && !validateEmail(signUpData.email)
                          ? "border-destructive"
                          : ""
                      }`}
                      required
                    />
                  </div>
                  {signUpData.email && !validateEmail(signUpData.email) && (
                    <p className="text-xs text-destructive">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-foreground font-medium text-xs sm:text-sm"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={signUpData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="pl-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-foreground font-medium text-xs sm:text-sm"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={signUpData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className={`pl-10 pr-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20 ${
                        signUpData.password &&
                        !validatePassword(signUpData.password)
                          ? "border-destructive"
                          : ""
                      }`}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signUpData.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              getPasswordStrength(signUpData.password) >= level
                                ? level <= 2
                                  ? "bg-destructive"
                                  : level <= 3
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                                : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password strength:{" "}
                        {getPasswordStrength(signUpData.password) <= 2
                          ? "Weak"
                          : getPasswordStrength(signUpData.password) <= 3
                          ? "Medium"
                          : "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground font-medium text-xs sm:text-sm"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      className={`pl-10 pr-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20 ${
                        signUpData.confirmPassword &&
                        signUpData.password !== signUpData.confirmPassword
                          ? "border-destructive"
                          : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signUpData.confirmPassword &&
                    signUpData.password !== signUpData.confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={signUpData.agreedToTerms}
                    onCheckedChange={(checked) =>
                      updateField("agreedToTerms", !!checked)
                    }
                    className="mt-1"
                  />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 font-medium text-xs sm:text-sm transition-all duration-200 hover:shadow-glow/20"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signin" className="space-y-4 sm:space-y-6">
              {/* Google Sign In */}
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

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="signInEmail"
                    className="text-foreground font-medium text-xs sm:text-sm"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signInEmail"
                      type="email"
                      placeholder="john@university.edu"
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="pl-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signInPassword"
                    className="text-foreground font-medium text-xs sm:text-sm"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signInPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) =>
                        setSignInData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="pl-10 pr-10 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 font-medium text-xs sm:text-sm transition-all duration-200 hover:shadow-glow/20"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
