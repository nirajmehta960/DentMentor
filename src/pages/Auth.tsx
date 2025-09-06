import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Loader2, UserPlus, LogIn, Mail, Lock, User, Phone, Eye, EyeOff, UserCheck, GraduationCap, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSignUpFormPersistence } from '@/hooks/useFormPersistence';

const Auth = () => {
  const { signIn, signUp, signInWithGoogle, error, isAuthLoading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Determine initial tab from URL parameter
  const initialTab = searchParams.get('tab') === 'signin' ? 'signin' : 'signup';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Role selection state
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor'>('student');

  // Sign up form with persistence
  const { data: signUpData, updateField, clearData } = useSignUpFormPersistence({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    agreedToTerms: false
  });

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Update active tab when URL parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signin' || tab === 'signup') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
    if (!validateEmail(signUpData.email)) return 'Please enter a valid email address';
    if (signUpData.password.length < 8) return 'Password must be at least 8 characters long';
    if (signUpData.password !== signUpData.confirmPassword) return 'Passwords do not match';
    if (!signUpData.agreedToTerms) return 'Please agree to the Terms of Service and Privacy Policy';
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const validationError = validateForm();
    if (validationError) {
      return;
    }

    const userType = selectedRole === 'student' ? 'mentee' : 'mentor';
    await signUp({
      email: signUpData.email,
      password: signUpData.password,
      firstName: signUpData.firstName,
      lastName: signUpData.lastName,
      phone: signUpData.phone,
      userType
    });
  };

  const handleGoogleSignUp = async () => {
    clearError();
    const userType = selectedRole === 'student' ? 'mentee' : 'mentor';
    await signInWithGoogle(userType);
  };

  const handleGoogleSignIn = async () => {
    clearError();
    // For sign in, we don't know the user type, so we'll let the backend handle it
    await signInWithGoogle('mentee'); // Default to mentee, backend will determine actual type
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await signIn(signInData.email, signInData.password);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <Card className="w-full max-w-md relative z-10 shadow-large border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          
          {/* Title and Description */}
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">Join DentMentor</CardTitle>
            <CardDescription className="text-muted-foreground">
              Connect with dental professionals and accelerate your career
            </CardDescription>
          </div>

          {/* Role Selection - Only show for sign up */}
          {activeTab === 'signup' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">I want to:</Label>
              <ToggleGroup 
                type="single" 
                value={selectedRole} 
                onValueChange={(value) => {
                  if (value) {
                    setSelectedRole(value as 'student' | 'mentor');
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
                    <div className="text-xs opacity-80">I'm a dental student</div>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="mentor" 
                  className="flex items-center gap-3 p-4 h-auto data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground border-2 data-[state=on]:border-secondary/50 transition-all duration-200"
                >
                  <GraduationCap className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Become a Mentor</div>
                    <div className="text-xs opacity-80">I'm a dental professional</div>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Trust Signal - Only show for sign up */}
          {activeTab === 'signup' && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Join 500+ international dental graduates
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signup" className="space-y-6">
              {/* Google Sign Up */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-200"
                onClick={handleGoogleSignUp}
                disabled={isAuthLoading}
              >
                <Chrome className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground font-medium">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        className="pl-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground font-medium">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        className="pl-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@university.edu"
                      value={signUpData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="pl-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={signUpData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="pl-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={signUpData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className="pl-10 pr-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                ? level <= 2 ? 'bg-destructive' : level <= 3 ? 'bg-orange-500' : 'bg-green-500'
                                : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password strength: {
                          getPasswordStrength(signUpData.password) <= 2 ? 'Weak' :
                          getPasswordStrength(signUpData.password) <= 3 ? 'Medium' : 'Strong'
                        }
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className={`pl-10 pr-10 h-12 transition-all duration-200 focus:shadow-glow/20 ${
                        signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword ? 'border-destructive' : ''
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signUpData.confirmPassword && signUpData.password !== signUpData.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={signUpData.agreedToTerms}
                    onCheckedChange={(checked) => updateField('agreedToTerms', !!checked)}
                    className="mt-1"
                  />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-medium transition-all duration-200 hover:shadow-glow/20"
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

            <TabsContent value="signin" className="space-y-6">
              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-200"
                onClick={handleGoogleSignIn}
                disabled={isAuthLoading}
              >
                <Chrome className="w-5 h-5 mr-3" />
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signInEmail" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signInEmail"
                      type="email"
                      placeholder="john@university.edu"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signInPassword" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signInPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 h-12 transition-all duration-200 focus:shadow-glow/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-medium transition-all duration-200 hover:shadow-glow/20"
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
