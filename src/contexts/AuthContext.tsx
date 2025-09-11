import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AuthState, 
  AuthActions, 
  SignUpData, 
  AuthProfile, 
  MentorProfile, 
  MenteeProfile,
  UserType 
} from '@/types/auth';

interface AuthContextType extends AuthState, AuthActions {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    mentorProfile: null,
    menteeProfile: null,
    userType: null,
    onboardingComplete: false,
    currentOnboardingStep: 1,
    isLoading: true,
    isAuthLoading: true,
    isProfileLoading: false,
    error: null,
  });

  // Load user profiles based on user type
  const loadUserProfiles = async (userId: string, userType: UserType, user: User) => {
    if (!userType) return;

    setState(prev => ({ ...prev, isProfileLoading: true }));

    try {
      // Create basic profile from user metadata first
      const profile = {
        id: userId,
        first_name: user.user_metadata?.first_name || 'Mentor',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to load specific profile based on user type, but don't fail if it doesn't exist
      let mentorProfile = null;
      let menteeProfile = null;

      if (userType === 'mentor') {
        try {
          const { data: mentor, error: mentorError } = await supabase
            .from('mentor_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (!mentorError && mentor) {
            mentorProfile = mentor;
          }
        } catch (mentorError) {
          // Silently handle mentor profile fetch errors
        }
      } else if (userType === 'mentee') {
        try {
          const { data: mentee, error: menteeError } = await supabase
            .from('mentee_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (!menteeError && mentee) {
            menteeProfile = mentee;
          }
        } catch (menteeError) {
          // Silently handle mentee profile fetch errors
        }
      }

      // Determine onboarding status
      const onboardingComplete = userType === 'mentor' 
        ? !!mentorProfile?.dental_school && !!mentorProfile?.specializations
        : !!menteeProfile?.dental_school_interest;

      setState(prev => ({
        ...prev,
        profile,
        mentorProfile,
        menteeProfile,
        onboardingComplete,
        isProfileLoading: false,
        isLoading: false,
      }));

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProfileLoading: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile'
      }));
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      let authStateChangeTimeout: NodeJS.Timeout | null = null;
      let isProcessingAuthChange = false;
      
      try {
        // Set up auth state listener with enhanced safeguards
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted || isProcessingAuthChange) return;
            
            // Clear any pending state changes
            if (authStateChangeTimeout) {
              clearTimeout(authStateChangeTimeout);
            }
            
            // Debounce state changes to prevent rapid updates
            authStateChangeTimeout = setTimeout(() => {
              if (!mounted || isProcessingAuthChange) return;
              
              isProcessingAuthChange = true;
              
              try {
                if (event === 'SIGNED_IN' && session) {
                  const userType = (session.user.user_metadata?.user_type || 
                                   session.user.app_metadata?.user_type) as UserType;
                  
                  setState(prev => ({
                    ...prev,
                    user: session.user,
                    session,
                    userType,
                    isAuthLoading: false,
                  }));

                  // Only load profiles if we don't already have them for this user
                  if (userType) {
                    setState(prev => {
                      const needsProfileLoad = userType === 'mentor' 
                        ? !prev.mentorProfile || prev.mentorProfile.user_id !== session.user.id
                        : !prev.menteeProfile || prev.menteeProfile.user_id !== session.user.id;
                      
                      if (needsProfileLoad) {
                        setTimeout(() => {
                          loadUserProfiles(session.user.id, userType, session.user);
                        }, 0);
                      }
                      return prev;
                    });
                  }
                } else if (event === 'SIGNED_OUT') {
                  // Only clear state, no redirects - let components handle redirects
                  setState({
                    user: null,
                    session: null,
                    profile: null,
                    mentorProfile: null,
                    menteeProfile: null,
                    userType: null,
                    onboardingComplete: false,
                    currentOnboardingStep: 1,
                    isLoading: false,
                    isAuthLoading: false,
                    isProfileLoading: false,
                    error: null,
                  });
                } else if (event === 'TOKEN_REFRESHED') {
                  // no setState here
                } else {
                  setState(prev => ({
                    ...prev,
                    isAuthLoading: false,
                  }));
                }
              } finally {
                // Reset processing flag after a delay
                setTimeout(() => {
                  isProcessingAuthChange = false;
                }, 500);
              }
            }, 100); // 100ms debounce
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session) {
          const userType = (session.user.user_metadata?.user_type || 
                           session.user.app_metadata?.user_type) as UserType;
          
          setState(prev => ({
            ...prev,
            user: session.user,
            session,
            userType,
            isAuthLoading: false,
          }));

          // Load profiles after setting auth state
          if (userType) {
            setTimeout(() => {
              loadUserProfiles(session.user.id, userType, session.user);
            }, 0);
          }
        } else {
          setState(prev => ({
            ...prev,
            isAuthLoading: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            isAuthLoading: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
          }));
        }
      }

      return () => {
        mounted = false;
        if (authStateChangeTimeout) {
          clearTimeout(authStateChangeTimeout);
        }
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Sign up function
  const signUp = useCallback(async (signUpData: SignUpData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
            user_type: signUpData.userType,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.session) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Sign in with Google function
  const signInWithGoogle = useCallback(async (userType: 'mentor' | 'mentee') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?tab=signin`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Google sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Sign out function
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      setState({
        user: null,
        session: null,
        profile: null,
        mentorProfile: null,
        menteeProfile: null,
        userType: null,
        onboardingComplete: false,
        currentOnboardingStep: 1,
        isLoading: false,
        isAuthLoading: false,
        isProfileLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Sign out failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Update profile function
  const updateProfile = useCallback(async (profileData: Partial<AuthProfile>) => {
    if (!state.user) {
      return { success: false, error: 'No user logged in' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase.auth.updateUser({
        data: profileData,
      });

      if (error) {
        throw error;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Profile update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [state.user, toast]);

  // Update mentor profile function
  const updateMentorProfile = useCallback(async (profileData: Partial<MentorProfile>) => {
    if (!state.user || !state.mentorProfile) {
      return { success: false, error: 'No mentor profile found' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('mentor_profiles')
        .update(profileData)
        .eq('user_id', state.user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setState(prev => ({
        ...prev,
        mentorProfile: prev.mentorProfile ? { ...prev.mentorProfile, ...profileData } : null,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mentor profile update failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Profile update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [state.user, state.mentorProfile, toast]);

  // Update mentee profile function
  const updateMenteeProfile = useCallback(async (profileData: Partial<MenteeProfile>) => {
    if (!state.user || !state.menteeProfile) {
      return { success: false, error: 'No mentee profile found' };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await supabase
        .from('mentee_profiles')
        .update(profileData)
        .eq('user_id', state.user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setState(prev => ({
        ...prev,
        menteeProfile: prev.menteeProfile ? { ...prev.menteeProfile, ...profileData } : null,
        isLoading: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mentee profile update failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      toast({
        title: "Profile update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  }, [state.user, state.menteeProfile, toast]);

  // Refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!state.user || !state.userType) return;
    
    await loadUserProfiles(state.user.id, state.userType, state.user);
  }, [state.user, state.userType]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateMentorProfile,
    updateMenteeProfile,
    refreshProfile,
    clearError,
  }), [
    state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateMentorProfile,
    updateMenteeProfile,
    refreshProfile,
    clearError,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
