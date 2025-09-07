import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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
  const loadUserProfiles = async (userId: string, userType: UserType) => {
    if (!userType) return;

    setState(prev => ({ ...prev, isProfileLoading: true }));

    try {
      // Load general profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Load specific profile based on user type
      if (userType === 'mentor') {
        const { data: mentorProfile, error: mentorError } = await supabase
          .from('mentor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (mentorError && mentorError.code !== 'PGRST116') {
          console.error('Error loading mentor profile:', mentorError);
        }

        setState(prev => ({
          ...prev,
          profile: profile ? { ...profile, user_type: profile.user_type as UserType } : null,
          mentorProfile,
          onboardingComplete: mentorProfile?.onboarding_completed || false,
          currentOnboardingStep: mentorProfile?.onboarding_step || 1,
        }));
      } else if (userType === 'mentee') {
        const { data: menteeProfile, error: menteeError } = await supabase
          .from('mentee_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (menteeError && menteeError.code !== 'PGRST116') {
          console.error('Error loading mentee profile:', menteeError);
        }

        setState(prev => ({
          ...prev,
          profile: profile ? { ...profile, user_type: profile.user_type as UserType } : null,
          menteeProfile,
          onboardingComplete: menteeProfile?.onboarding_completed || false,
          currentOnboardingStep: menteeProfile?.onboarding_step || 1,
        }));
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setState(prev => ({ ...prev, isProfileLoading: false }));
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
            
            console.log('Auth state change:', event, session ? 'session exists' : 'no session');

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

                  // Load profiles after setting auth state
                  if (userType) {
                    setTimeout(() => {
                      loadUserProfiles(session.user.id, userType);
                    }, 0);
                  }
                } else if (event === 'SIGNED_OUT') {
                  console.log('SIGNED_OUT event detected - clearing state only');
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
                  console.log('TOKEN_REFRESHED event - updating session only');
                  // Only update session, don't trigger other state changes
                  if (session) {
                    setState(prev => ({
                      ...prev,
                      session,
                      isAuthLoading: false,
                    }));
                  }
                } else {
                  console.log('Other auth event:', event);
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

          if (userType) {
            await loadUserProfiles(session.user.id, userType);
          }
        }

        setState(prev => ({ ...prev, isLoading: false }));

        return () => {
          if (authStateChangeTimeout) {
            clearTimeout(authStateChangeTimeout);
          }
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthLoading: false,
          error: 'Failed to initialize authentication',
        }));
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    setState(prev => ({ ...prev, error: null, isAuthLoading: true }));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      return {};
    } catch (error: any) {
      const errorMessage = error.message;
      setState(prev => ({ ...prev, error: errorMessage, isAuthLoading: false }));
      return { error: errorMessage };
    }
  };

  const signUp = async (data: SignUpData): Promise<{ error?: string }> => {
    setState(prev => ({ ...prev, error: null, isAuthLoading: true }));

    try {
      const redirectUrl = data.userType === 'mentee' 
        ? `${window.location.origin}/mentee-onboarding`
        : `${window.location.origin}/onboarding`;

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_type: data.userType
          }
        }
      });

      if (error) throw error;

      // Clear persisted form data
      sessionStorage.removeItem('dentmentor-signup-data');

      // Clear state directly
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

      toast({
        title: "Account created successfully!",
        description: data.userType === 'mentee'
          ? "Please check your email to verify your account before browsing mentors."
          : "Please check your email to verify your account before continuing with onboarding.",
      });

      return {};
    } catch (error: any) {
      const errorMessage = error.message;
      setState(prev => ({ ...prev, error: errorMessage, isAuthLoading: false }));
      return { error: errorMessage };
    }
  };

  const signInWithGoogle = async (userType: 'mentor' | 'mentee'): Promise<{ error?: string }> => {
    setState(prev => ({ ...prev, error: null, isAuthLoading: true }));

    try {
      const redirectUrl = userType === 'mentee'
        ? `${window.location.origin}/mentee-onboarding`
        : `${window.location.origin}/onboarding`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            user_type: userType
          }
        }
      });

      if (error) throw error;

      return {};
    } catch (error: any) {
      const errorMessage = error.message;
      setState(prev => ({ ...prev, error: errorMessage, isAuthLoading: false }));
      return { error: errorMessage };
    }
  };

  const signOut = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear session storage
      sessionStorage.removeItem('dentmentor-signup-data');

      // Clear state directly
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

      toast({
        title: "Signed out successfully",
        description: "You have been signed out.",
      });

      return {};
    } catch (error: any) {
      const errorMessage = error.message;
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<AuthProfile>): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: state.user.id,
          ...updates
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMentorProfile = async (updates: Partial<MentorProfile>): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const { error } = await supabase
        .from('mentor_profiles')
        .upsert({
          user_id: state.user.id,
          ...updates
        }, {
          ignoreDuplicates: false,
          onConflict: 'user_id'
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        mentorProfile: prev.mentorProfile ? { ...prev.mentorProfile, ...updates } : null,
        onboardingComplete: updates.onboarding_completed ?? prev.onboardingComplete,
        currentOnboardingStep: updates.onboarding_step ?? prev.currentOnboardingStep,
      }));

      return true;
    } catch (error) {
      console.error('Error updating mentor profile:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateMenteeProfile = async (updates: Partial<MenteeProfile>): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const { error } = await supabase
        .from('mentee_profiles')
        .upsert({
          user_id: state.user.id,
          ...updates
        }, {
          ignoreDuplicates: false,
          onConflict: 'user_id'
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        menteeProfile: prev.menteeProfile ? { ...prev.menteeProfile, ...updates } : null,
        onboardingComplete: updates.onboarding_completed ?? prev.onboardingComplete,
        currentOnboardingStep: updates.onboarding_step ?? prev.currentOnboardingStep,
      }));

      return true;
    } catch (error) {
      console.error('Error updating mentee profile:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!state.user || !state.userType) return;
    await loadUserProfiles(state.user.id, state.userType);
  };

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateMentorProfile,
    updateMenteeProfile,
    refreshProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
