import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserCheck,
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  CircleAlert,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSignUpFormPersistence } from "@/hooks/useFormPersistence";
import { Link } from "react-router-dom";
import { Enter } from "@/components/site";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleMark } from "@/components/auth/GoogleMark";
import { cn } from "@/lib/utils";

/* Inside the kit scope a border colour needs `!` to beat the band rule. The
   theme's --destructive is 3.8:1 on white, so field errors use red-700 (6.5:1). */
const INVALID_FIELD = "!border-red-600 focus-visible:ring-red-600";
const FIELD_ERROR = "text-[0.8125rem] leading-relaxed text-red-700";
const LINK = "font-medium text-band-signal underline-offset-4 hover:underline";

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

  const passwordStrength = getPasswordStrength(signUpData.password);
  const emailInvalid = !!signUpData.email && !validateEmail(signUpData.email);
  const passwordInvalid =
    !!signUpData.password && !validatePassword(signUpData.password);
  const confirmInvalid =
    !!signUpData.confirmPassword &&
    signUpData.password !== signUpData.confirmPassword;
  const notice = error || searchParams.get("message");

  return (
    <AuthLayout>
      <Enter>
        <div className="mb-8 flex flex-col gap-2.5">
          <p className="label text-band-signal">
            {activeTab === "signup" ? "Create your account" : "Sign in"}
          </p>
          <h1 className="text-balance font-display text-[clamp(1.875rem,1.5rem+1.2vw,2.375rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-band-fg">
            {activeTab === "signup" ? "Join DentMentor" : "Welcome back"}
          </h1>
          <p className="text-[0.9375rem] leading-relaxed text-band-muted">
            {activeTab === "signup"
              ? "A free account to book 1:1 sessions with a mentor — or to offer them."
              : "Sign in to manage your sessions, messages and profile."}
          </p>
        </div>
      </Enter>

      <Enter delay={0.07}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-[3.25rem] w-full grid-cols-2">
            <TabsTrigger value="signin" className="h-11">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="signup" className="h-11">
              Sign up
            </TabsTrigger>
          </TabsList>

          {notice && (
            <Alert
              variant={error ? "destructive" : "default"}
              className={cn(
                "mt-5 rounded-[10px] px-4 py-3.5 text-[0.875rem] [&>svg]:left-4 [&>svg]:top-[1.0625rem] [&>svg~*]:pl-7",
                error
                  ? "bg-red-50 text-red-800 [&>svg]:text-red-700"
                  : "bg-[rgb(15_112_93/0.05)] text-band-fg [&>svg]:text-band-signal"
              )}
              style={{
                borderColor: error
                  ? "rgb(185 28 28 / 0.25)"
                  : "rgb(15 112 93 / 0.25)",
              }}
            >
              {error ? (
                <CircleAlert className="size-4" aria-hidden="true" />
              ) : (
                <Info className="size-4" aria-hidden="true" />
              )}
              <AlertDescription>
                {error ||
                  decodeURIComponent(searchParams.get("message") || "")}
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="signup" className="mt-6 flex flex-col gap-6">
            {/* Role selection */}
            <div className="flex flex-col gap-2.5">
              <p id="role-label" className="text-sm font-medium text-band-fg">
                I want to
              </p>
              <ToggleGroup
                type="single"
                aria-labelledby="role-label"
                value={selectedRole}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedRole(value as "student" | "mentor");
                  }
                }}
                className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
              >
                <ToggleGroupItem
                  value="student"
                  className="h-11 gap-2 rounded-full px-3 text-[0.8125rem] text-muted-foreground hover:bg-transparent sm:text-sm hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-soft"
                >
                  <UserCheck className="hidden size-4 sm:block" aria-hidden="true" />
                  Find a mentor
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="mentor"
                  className="h-11 gap-2 rounded-full px-3 text-[0.8125rem] text-muted-foreground hover:bg-transparent sm:text-sm hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-soft"
                >
                  <GraduationCap className="hidden size-4 sm:block" aria-hidden="true" />
                  Become a mentor
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-[0.8125rem] leading-relaxed text-band-muted">
                {selectedRole === "student"
                  ? "For international dentists preparing for U.S. dental programs."
                  : "For current students and graduates of U.S. dental schools."}
              </p>
            </div>

            {/* Google Sign Up */}
            <Button
              type="button"
              variant="outline"
              size="xl"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={isAuthLoading}
            >
              <GoogleMark />
              Continue with Google
            </Button>

            <OrDivider />

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    value={signUpData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    value={signUpData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@university.edu"
                  value={signUpData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  aria-invalid={emailInvalid || undefined}
                  aria-describedby={emailInvalid ? "email-error" : undefined}
                  className={cn(emailInvalid && INVALID_FIELD)}
                  required
                />
                {emailInvalid && (
                  <p id="email-error" className={FIELD_ERROR}>
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 123-4567"
                  value={signUpData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={signUpData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    aria-invalid={passwordInvalid || undefined}
                    aria-describedby="password-help"
                    className={cn("pr-12", passwordInvalid && INVALID_FIELD)}
                    required
                    minLength={6}
                  />
                  <PasswordToggle
                    shown={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
                {signUpData.password ? (
                  <div id="password-help" className="flex flex-col gap-1.5">
                    <div className="flex gap-1" aria-hidden="true">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors duration-200",
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? "bg-red-600"
                                : passwordStrength <= 3
                                ? "bg-amber-500"
                                : "bg-band-signal"
                              : "bg-[rgb(9_67_56/0.1)]"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[0.8125rem] text-band-muted">
                      Password strength:{" "}
                      <span className="font-medium text-band-fg">
                        {passwordStrength <= 2
                          ? "Weak"
                          : passwordStrength <= 3
                          ? "Medium"
                          : "Strong"}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p id="password-help" className="text-[0.8125rem] text-band-muted">
                    Use at least 6 characters.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    aria-invalid={confirmInvalid || undefined}
                    aria-describedby={
                      confirmInvalid ? "confirm-password-error" : undefined
                    }
                    className={cn("pr-12", confirmInvalid && INVALID_FIELD)}
                    required
                  />
                  <PasswordToggle
                    shown={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />
                </div>
                {confirmInvalid && (
                  <p id="confirm-password-error" className={FIELD_ERROR}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="mt-1 flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={signUpData.agreedToTerms}
                  onCheckedChange={(checked) =>
                    updateField("agreedToTerms", !!checked)
                  }
                  className="mt-0.5 size-5 rounded-[5px]"
                />
                <label
                  htmlFor="terms"
                  className="text-[0.8125rem] leading-relaxed text-band-muted"
                >
                  I agree to the{" "}
                  <Link to="/terms" className={LINK}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className={LINK}>
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="mt-2 w-full"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Creating Account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signin" className="mt-6 flex flex-col gap-6">
            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              size="xl"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isAuthLoading}
            >
              <GoogleMark />
              Continue with Google
            </Button>

            <OrDivider />

            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="signInEmail">Email</Label>
                <Input
                  id="signInEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="john@university.edu"
                  value={signInData.email}
                  onChange={(e) =>
                    setSignInData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="signInPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="signInPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) =>
                      setSignInData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pr-12"
                    required
                  />
                  <PasswordToggle
                    shown={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="xl"
                className="mt-2 w-full"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Signing In...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Enter>
    </AuthLayout>
  );
};

/** Show/hide for a password field: a 44px target on the input's right edge. */
function PasswordToggle({
  shown,
  onToggle,
}: {
  shown: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? "Hide password" : "Show password"}
      className="absolute right-0 top-0 grid size-11 place-items-center rounded-r-[10px] text-muted-foreground transition-colors hover:text-foreground"
    >
      {shown ? (
        <EyeOff className="size-4" aria-hidden="true" />
      ) : (
        <Eye className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="h-px flex-1 bg-[rgb(9_67_56/0.12)]" />
      <span className="label text-band-faint">or</span>
      <span aria-hidden="true" className="h-px flex-1 bg-[rgb(9_67_56/0.12)]" />
    </div>
  );
}

export default Auth;
