import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
  useRef,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeEmail } from "@/services/emailService";
import {
  AuthState,
  AuthActions,
  SignUpData,
  AuthProfile,
  MentorProfile,
  MenteeProfile,
  UserType,
} from "@/types/auth";

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

  // Track users we've already sent welcome emails to (prevents duplicates)
  // Use a combination of ref (for current session) and localStorage (persistent)
  const welcomeEmailSentRef = useRef<Set<string>>(new Set());
  const emailSendingInProgressRef = useRef<Set<string>>(new Set());

  // Flag to prevent re-authentication immediately after sign out
  const isSigningOutRef = useRef<boolean>(false);

  // Helper function to check if welcome email was already sent
  const hasWelcomeEmailBeenSent = (userId: string): boolean => {
    // Check ref first (fast, for current session)
    if (welcomeEmailSentRef.current.has(userId)) {
      return true;
    }

    // Check localStorage (persistent across sessions)
    try {
      const sentEmails = JSON.parse(
        localStorage.getItem("dentmentor_welcomeEmailsSent") || "[]"
      );
      if (sentEmails.includes(userId)) {
        // Also add to ref for faster access
        welcomeEmailSentRef.current.add(userId);
        return true;
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    return false;
  };

  // Helper function to mark welcome email as sent
  const markWelcomeEmailAsSent = (userId: string): void => {
    // Mark in ref immediately
    welcomeEmailSentRef.current.add(userId);

    // Mark in localStorage for persistence
    try {
      const sentEmails = JSON.parse(
        localStorage.getItem("dentmentor_welcomeEmailsSent") || "[]"
      );
      if (!sentEmails.includes(userId)) {
        sentEmails.push(userId);
        localStorage.setItem(
          "dentmentor_welcomeEmailsSent",
          JSON.stringify(sentEmails)
        );
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  };

  // Helper function to extract first_name and last_name from Google Auth metadata
  const extractNameFromGoogleAuth = (user: User) => {
    // Check if first_name and last_name already exist
    if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
      return {
        first_name: user.user_metadata.first_name,
        last_name: user.user_metadata.last_name,
      };
    }

    // Try to extract from full_name or name (Google OAuth provides these)
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name ||
      "";

    if (fullName) {
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        // If we have at least 2 parts, use first part as first_name and rest as last_name
        return {
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(" "),
        };
      } else if (nameParts.length === 1) {
        // If only one part, use it as first_name
        return {
          first_name: nameParts[0],
          last_name: "",
        };
      }
    }

    // Fallback: try to extract from email
    if (user.email) {
      const emailName = user.email.split("@")[0];
      return {
        first_name: emailName.charAt(0).toUpperCase() + emailName.slice(1),
        last_name: "",
      };
    }

    // Final fallback
    return {
      first_name: "Mentor",
      last_name: "",
    };
  };

  // Load user profiles based on user type
  const loadUserProfiles = async (
    userId: string,
    userType: UserType,
    user: User
  ) => {
    if (!userType) {
      setState((prev) => ({
        ...prev,
        isProfileLoading: false,
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isProfileLoading: true }));

    try {
      // Extract first_name and last_name from Google Auth metadata
      const { first_name, last_name } = extractNameFromGoogleAuth(user);

      // Create basic profile from user metadata first
      const profile = {
        id: userId,
        first_name,
        last_name,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to load specific profile based on user type, but don't fail if it doesn't exist
      let mentorProfile = null;
      let menteeProfile = null;

      if (userType === "mentor") {
        try {
          const { data: mentor, error: mentorError } = await supabase
            .from("mentor_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (!mentorError && mentor) {
            mentorProfile = mentor;
            
            // Auto-detect and save timezone if missing
            if (!mentor.timezone) {
              const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
              
              // Update mentor profile with detected timezone (non-blocking)
              supabase
                .from("mentor_profiles")
                .update({ timezone: detectedTimezone, updated_at: new Date().toISOString() })
                .eq("user_id", userId)
                .then(({ data: updatedMentor }) => {
                  if (updatedMentor) {
                    // Update local state with timezone
                    setState((prev) => ({
                      ...prev,
                      mentorProfile: updatedMentor[0] || { ...prev.mentorProfile, timezone: detectedTimezone },
                    }));
                  }
                })
                .catch((error) => {
                  // Silently handle timezone update errors
                  console.warn("Failed to update mentor timezone:", error);
                });
              
              // Update mentorProfile object immediately for this session
              mentorProfile = { ...mentorProfile, timezone: detectedTimezone };
            }
          }
        } catch (mentorError) {
          // Silently handle mentor profile fetch errors - new users won't have profiles yet
        }
      } else if (userType === "mentee") {
        try {
          const { data: mentee, error: menteeError } = await supabase
            .from("mentee_profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

          if (!menteeError && mentee) {
            menteeProfile = mentee;
          }
        } catch (menteeError) {
          // Silently handle mentee profile fetch errors - new users won't have profiles yet
        }
      }

      // Load or create the profiles table entry with first_name and last_name
      let profileData = profile;
      try {
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is "not found" which is fine for new users
        }

        if (existingProfile) {
          // Use existing profile data
          profileData = existingProfile;
        } else {
          // Create new profile entry with extracted name
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              user_id: userId,
              first_name,
              last_name,
              user_type: userType,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (!createError && newProfile) {
            profileData = newProfile;
          }
        }
      } catch (profileError) {
        // Continue with the extracted profile data even if database operation fails
      }

      // Determine onboarding status - use the onboarding_completed field from database
      // If no profile exists, onboarding is not complete (new user)
      const onboardingComplete =
        userType === "mentor"
          ? !!mentorProfile?.onboarding_completed
          : !!menteeProfile?.onboarding_completed;

      // Get current onboarding step from profile
      const currentOnboardingStep =
        userType === "mentor"
          ? mentorProfile?.onboarding_step || 1
          : menteeProfile?.onboarding_step || 1;

      setState((prev) => ({
        ...prev,
        profile: profileData,
        mentorProfile,
        menteeProfile,
        onboardingComplete,
        currentOnboardingStep,
        isProfileLoading: false,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isProfileLoading: false,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load profile",
      }));
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Track processed sessions to prevent duplicates
      const processedSessions = new Set<string>();

      try {
        // SIMPLIFIED: Simple auth state listener without complex debouncing
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;

          // If we're in the process of signing out, ignore auth state changes
          if (isSigningOutRef.current && event !== "SIGNED_OUT") {
            return;
          }

          // Prevent duplicate processing of the same session
          const sessionId = session?.user?.id;
          if (
            event === "SIGNED_IN" &&
            sessionId &&
            processedSessions.has(sessionId)
          ) {
            return;
          }

          // Mark session as processed
          if (event === "SIGNED_IN" && sessionId) {
            processedSessions.add(sessionId);
            // Clean up old sessions after 5 minutes
            setTimeout(
              () => processedSessions.delete(sessionId),
              5 * 60 * 1000
            );
          }

          // Handle SIGNED_IN event
          if (event === "SIGNED_IN" && session) {
            // Handle OAuth callback redirect - if redirected to wrong URL, fix it
            if (
              window.location.hash &&
              window.location.hash.includes("#access_token")
            ) {
              // If we're on localhost but should be on production, redirect to production
              if (
                window.location.origin.includes("localhost") &&
                import.meta.env.VITE_APP_URL &&
                !import.meta.env.VITE_APP_URL.includes("localhost")
              ) {
                // Preserve the hash token and redirect to production
                window.location.href = `${import.meta.env.VITE_APP_URL}${
                  window.location.pathname
                }${window.location.search}${window.location.hash}`;
                return;
              }

              // Clean up hash - don't force navigation, let ProtectedRoute handle routing
              // based on user's onboarding status
              window.history.replaceState(null, "", window.location.pathname);
            }

            // Note: Email confirmation redirect is handled by ProtectedRoute
            // When user confirms email and lands on /auth?confirmed=true,
            // PublicOnlyRoute will redirect them to onboarding if onboarding is not complete

            // Try to get userType from metadata first
            let userType = (session.user.user_metadata?.user_type ||
              session.user.app_metadata?.user_type) as UserType;

            // If userType is not in metadata, check sessionStorage (for OAuth sign-up)
            // This handles the case where Supabase hasn't set the metadata yet
            if (!userType) {
              const storedUserType = sessionStorage.getItem(
                "dentmentor_oauth_userType"
              );
              const storedTimestamp = sessionStorage.getItem(
                "dentmentor_oauth_timestamp"
              );

              // Only use stored userType if it was stored recently (within last 10 minutes)
              if (storedUserType && storedTimestamp) {
                const timestamp = parseInt(storedTimestamp, 10);
                const now = Date.now();
                const timeDiff = (now - timestamp) / 1000 / 60; // minutes

                if (
                  timeDiff < 10 &&
                  (storedUserType === "mentor" || storedUserType === "mentee")
                ) {
                  userType = storedUserType as UserType;

                  // Extract name from Google Auth and update user metadata
                  const { first_name, last_name } = extractNameFromGoogleAuth(
                    session.user
                  );

                  // Update user metadata with the userType and name
                  supabase.auth.updateUser({
                    data: {
                      user_type: userType,
                      first_name,
                      last_name,
                    },
                  });

                  // Clear sessionStorage after using it
                  sessionStorage.removeItem("dentmentor_oauth_userType");
                  sessionStorage.removeItem("dentmentor_oauth_timestamp");
                }
              }
            }

            // For OAuth signups, immediately set onboardingComplete to false
            // This allows ProtectedRoute to redirect immediately without waiting for profile load
            const isEmailConfirmed = !!session.user.email_confirmed_at;
            const userCreatedAt = new Date(session.user.created_at);
            const now = new Date();
            const timeSinceCreation =
              (now.getTime() - userCreatedAt.getTime()) / 1000; // seconds
            const isNewUser = timeSinceCreation < 300; // 5 minutes

            // For new OAuth users (email confirmed, new account), set onboarding to false immediately
            // This enables instant redirect to onboarding
            const shouldSetOnboardingFalse =
              isNewUser && isEmailConfirmed && userType;

            // Store isEmailConfirmed for use in email sending below
            const emailConfirmedForEmail = isEmailConfirmed;

            // For OAuth signups, set state immediately to enable instant redirect
            setState((prev) => ({
              ...prev,
              user: session.user,
              session,
              userType,
              isAuthLoading: false,
              // Immediately set onboardingComplete to false for new OAuth users
              // This allows ProtectedRoute to redirect without waiting for profile load
              onboardingComplete: shouldSetOnboardingFalse
                ? false
                : prev.onboardingComplete,
              // Set isProfileLoading to false for OAuth users to prevent loading screen
              // Profile will load in background
              isProfileLoading: shouldSetOnboardingFalse
                ? false
                : prev.isProfileLoading,
            }));

            // Check if this is a new user (first time sign-in, including OAuth)
            if (mounted && session?.user) {
              const user = session.user;
              const userId = user.id;

              // Check if we've already sent welcome email OR if sending is in progress
              const alreadySentEmail = hasWelcomeEmailBeenSent(userId);
              const isSendingInProgress =
                emailSendingInProgressRef.current.has(userId);

              if (!alreadySentEmail && !isSendingInProgress) {
                // Check if this is a new user (created within last 5 minutes)
                const userCreatedAt = new Date(user.created_at);
                const now = new Date();
                const timeSinceCreation =
                  (now.getTime() - userCreatedAt.getTime()) / 1000; // seconds
                const isNewUser = timeSinceCreation < 300; // 5 minutes

                if (isNewUser && user.email) {
                  const userName =
                    user.user_metadata?.first_name ||
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split("@")[0] ||
                    "there";

                  // Mark as sending in progress IMMEDIATELY to prevent duplicates
                  emailSendingInProgressRef.current.add(userId);
                  markWelcomeEmailAsSent(userId);

                  // Get dashboard URL from environment or use current origin
                  const dashboardUrl = import.meta.env.VITE_APP_URL
                    ? `${import.meta.env.VITE_APP_URL}/dashboard`
                    : `${window.location.origin}/dashboard`;

                  // Send welcome email asynchronously (don't block the UI)
                  // Always welcome email for Google OAuth users
                  sendWelcomeEmail({
                    email: user.email,
                    userName: userName,
                    dashboardUrl: dashboardUrl,
                    userType: userType,
                  })
                    .then((result) => {
                      if (result.error) {
                        // On error, remove from sent list so we can retry later
                        welcomeEmailSentRef.current.delete(userId);
                        try {
                          const sentEmails = JSON.parse(
                            localStorage.getItem(
                              "dentmentor_welcomeEmailsSent"
                            ) || "[]"
                          );
                          const filtered = sentEmails.filter(
                            (id: string) => id !== userId
                          );
                          localStorage.setItem(
                            "dentmentor_welcomeEmailsSent",
                            JSON.stringify(filtered)
                          );
                        } catch (e) {
                          // Ignore errors
                        }
                      }
                      // Remove from in-progress set
                      emailSendingInProgressRef.current.delete(userId);
                    })
                    .catch((error) => {
                      // On error, remove from sent list so we can retry later
                      welcomeEmailSentRef.current.delete(userId);
                      try {
                        const sentEmails = JSON.parse(
                          localStorage.getItem(
                            "dentmentor_welcomeEmailsSent"
                          ) || "[]"
                        );
                        const filtered = sentEmails.filter(
                          (id: string) => id !== userId
                        );
                        localStorage.setItem(
                          "dentmentor_welcomeEmailsSent",
                          JSON.stringify(filtered)
                        );
                      } catch (e) {
                        // Ignore errors
                      }
                      // Remove from in-progress set
                      emailSendingInProgressRef.current.delete(userId);
                    });
                }
              }

              // For new OAuth users: Skip profile loading entirely to enable instant redirect
              // Profile will be loaded after redirect completes (when onboarding page mounts)
              // For existing users or email/password signups: Load profiles normally
              if (userType) {
                if (isNewUser && isEmailConfirmed) {
                  // NEW OAuth user: Skip profile loading, redirect immediately
                  // Profile will load after user lands on onboarding page
                  // Don't load profiles - let ProtectedRoute redirect immediately
                  // Profile will be loaded when onboarding page mounts
                } else {
                  // Existing user or email/password signup: Load profiles normally
                  const loadProfiles = () => {
                    loadUserProfiles(
                      session.user.id,
                      userType,
                      session.user
                    ).then(() => {
                      // After loading profiles, update onboarding status if needed
                      if (mounted) {
                        setState((currentState) => {
                          const onboardingComplete =
                            userType === "mentor"
                              ? !!currentState.mentorProfile
                                  ?.onboarding_completed
                              : !!currentState.menteeProfile
                                  ?.onboarding_completed;

                          return {
                            ...currentState,
                            onboardingComplete,
                          };
                        });
                      }
                    });
                  };

                  setState((prev) => {
                    const needsProfileLoad =
                      userType === "mentor"
                        ? !prev.mentorProfile ||
                          prev.mentorProfile.user_id !== session.user.id
                        : !prev.menteeProfile ||
                          prev.menteeProfile.user_id !== session.user.id;

                    if (needsProfileLoad) {
                      // Small delay for email/password signups
                      setTimeout(loadProfiles, 50);
                    }
                    return prev;
                  });
                }
              } else {
                // User signed in but has no userType
                // This can happen if they signed in with Google but didn't go through sign-up
                const userCreatedAt = new Date(session.user.created_at);
                const now = new Date();
                const timeSinceCreation =
                  (now.getTime() - userCreatedAt.getTime()) / 1000; // seconds
                const isNewUser = timeSinceCreation < 300; // 5 minutes

                // Check one more time for stored userType (in case it wasn't set yet)
                const storedUserType = sessionStorage.getItem(
                  "dentmentor_oauth_userType"
                );
                if (
                  storedUserType &&
                  (storedUserType === "mentor" || storedUserType === "mentee")
                ) {
                  const finalUserType = storedUserType as UserType;

                  // Update state with userType
                  setState((prev) => ({
                    ...prev,
                    userType: finalUserType,
                  }));

                  // Update user metadata
                  supabase.auth
                    .updateUser({
                      data: { user_type: finalUserType },
                    })
                    .then(() => {
                      // Load profiles after updating metadata
                      loadUserProfiles(
                        session.user.id,
                        finalUserType,
                        session.user
                      );
                    });

                  // Clear sessionStorage
                  sessionStorage.removeItem("dentmentor_oauth_userType");
                  sessionStorage.removeItem("dentmentor_oauth_timestamp");
                } else if (!isNewUser) {
                  // Existing user without userType - they need to sign up properly
                  toast({
                    title: "Account setup required",
                    description:
                      "Please sign up to create your account and select your role (mentor or mentee).",
                    variant: "destructive",
                  });
                  setTimeout(() => {
                    // Use local scope to avoid 403 errors
                    supabase.auth.signOut({ scope: "local" }).catch(() => {
                      // Ignore errors - local state will be cleared anyway
                    });
                  }, 3000);
                } else {
                  // New user without userType - they should have signed up, but let's allow them to proceed
                  // The ProtectedRoute will handle redirecting them appropriately
                }
              }
            }
          } else if (event === "SIGNED_OUT") {
            // Clear the signing out flag
            isSigningOutRef.current = false;

            // Clear state on sign out
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
          } else if (event === "TOKEN_REFRESHED" && session) {
            // Update session on token refresh
            setState((prev) => ({
              ...prev,
              session,
              user: session.user,
            }));
          } else if (event === "USER_UPDATED" && session) {
            // Handle user metadata updates (OAuth users)
            const userType = (session.user.user_metadata?.user_type ||
              session.user.app_metadata?.user_type) as UserType;

            setState((prev) => ({
              ...prev,
              session,
              user: session.user,
              userType: userType || prev.userType,
            }));

            // Load profiles if userType exists
            if (userType) {
              loadUserProfiles(session.user.id, userType, session.user);
            }
          }
        });

        // Load previously sent welcome emails from localStorage
        try {
          const sentEmails = JSON.parse(
            localStorage.getItem("dentmentor_welcomeEmailsSent") || "[]"
          );
          sentEmails.forEach((id: string) => {
            welcomeEmailSentRef.current.add(id);
          });
        } catch (e) {
          // Ignore localStorage errors
        }

        // Check for existing session
        // First check if we just signed out (prevent re-authentication)
        const justSignedOut = sessionStorage.getItem(
          "dentmentor_just_signed_out"
        );
        if (justSignedOut) {
          // Clear the flag and skip session check
          sessionStorage.removeItem("dentmentor_just_signed_out");
          setState((prev) => ({
            ...prev,
            isAuthLoading: false,
            isLoading: false,
          }));
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (mounted && session) {
            const userType = (session.user.user_metadata?.user_type ||
              session.user.app_metadata?.user_type) as UserType;

            setState((prev) => ({
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
            setState((prev) => ({
              ...prev,
              isAuthLoading: false,
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isAuthLoading: false,
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Authentication failed",
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
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Sign up function with email/password
  const signUp = useCallback(
    async (signUpData: SignUpData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: signUpData.email,
          password: signUpData.password,
          options: {
            data: {
              first_name: signUpData.firstName,
              last_name: signUpData.lastName,
              phone: signUpData.phone,
              user_type: signUpData.userType,
            },
            emailRedirectTo: `${window.location.origin}/auth?tab=signin`,
          },
        });

        if (error) throw error;

        if (!data.user) {
          throw new Error("Failed to create user account");
        }

        // Create profile entry
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          first_name: signUpData.firstName,
          last_name: signUpData.lastName,
          phone: signUpData.phone,
          user_type: signUpData.userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn("Profile creation error:", profileError);
          // Don't fail signup if profile creation fails - it will be created on first login
        }

        // Create user type specific profile
        if (signUpData.userType === "mentor") {
          // Auto-detect timezone for mentor
          const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          
          const { error: mentorError } = await supabase
            .from("mentor_profiles")
            .insert({
              user_id: data.user.id,
              onboarding_step: 1,
              onboarding_completed: false,
              verification_status: "pending",
              is_verified: false,
              is_active: false,
              timezone: detectedTimezone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (mentorError) {
            console.warn("Mentor profile creation error:", mentorError);
          }
        } else if (signUpData.userType === "mentee") {
          const { error: menteeError } = await supabase
            .from("mentee_profiles")
            .insert({
              user_id: data.user.id,
              onboarding_step: 1,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (menteeError) {
            console.warn("Mentee profile creation error:", menteeError);
          }
        }

        // Show success message
        toast({
          title: "Account created successfully",
          description:
            "Please check your email to confirm your account before signing in.",
        });

        setState((prev) => ({ ...prev, isLoading: false }));

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create account. Please try again.";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        toast({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, error: errorMessage };
      }
    },
    [toast]
  );

  // Sign in function with email/password
  const signIn = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (!data.user) {
          throw new Error("Failed to sign in");
        }

        // Get user type from metadata or profile
        let userType = (data.user.user_metadata?.user_type ||
          data.user.app_metadata?.user_type) as UserType;

        // If no userType in metadata, try to get it from profile
        if (!userType) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("user_id", data.user.id)
            .single();

          if (profile?.user_type) {
            userType = profile.user_type as UserType;
            // Update user metadata with userType for future logins
            await supabase.auth.updateUser({
              data: { user_type: userType },
            });
          }
        }

        // Load user profiles - this will also check for userType in profiles if not found
        await loadUserProfiles(data.user.id, userType || "mentee", data.user);

        // Get final userType from state after profile load (in case it was updated)
        const finalUserType =
          userType ||
          ((data.user.user_metadata?.user_type ||
            data.user.app_metadata?.user_type) as UserType);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          user: data.user,
          session: data.session,
          userType: finalUserType || null,
        }));

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to sign in. Please check your credentials.";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });

        return { success: false, error: errorMessage };
      }
    },
    [toast]
  );

  // Sign in with Google function
  const signInWithGoogle = useCallback(
    async (userType: "mentor" | "mentee") => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Store userType in sessionStorage before OAuth so we can retrieve it after callback
        // This ensures we have the userType even if Supabase doesn't set it in metadata immediately
        sessionStorage.setItem("dentmentor_oauth_userType", userType);
        sessionStorage.setItem(
          "dentmentor_oauth_timestamp",
          Date.now().toString()
        );

        // Use VITE_APP_URL in production, fallback to window.location.origin for local dev
        const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
        // For new sign-ups, redirect to onboarding. For sign-ins, redirect to dashboard (ProtectedRoute will handle redirect if needed)
        // We'll use a query parameter to indicate this is a sign-up
        const redirectUrl = `${baseUrl}/auth?tab=signin&oauth=true`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
            data: {
              user_type: userType,
            },
          },
        });

        if (error) {
          throw error;
        }

        return { success: true };
      } catch (error) {
        // Clear sessionStorage on error
        sessionStorage.removeItem("dentmentor_oauth_userType");
        sessionStorage.removeItem("dentmentor_oauth_timestamp");

        const errorMessage =
          error instanceof Error ? error.message : "Google sign in failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        toast({
          title: "Google sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [toast]
  );

  // Sign out function
  const signOut = useCallback(async () => {
    // Set flag to prevent re-authentication during sign out
    isSigningOutRef.current = true;

    try {
      // Clear local state first
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

      // Clear session storage
      sessionStorage.removeItem("dentmentor_oauth_userType");
      sessionStorage.removeItem("dentmentor_oauth_timestamp");
      sessionStorage.removeItem("dentmentor-signup-data");

      // Set flag to prevent re-authentication on page reload
      sessionStorage.setItem("dentmentor_just_signed_out", "true");

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      // Even if there's an error, clear Supabase storage manually
      // Clear all Supabase-related localStorage items
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          // Get the project ref from the URL
          const projectRef = supabaseUrl.split("//")[1]?.split(".")[0];
          if (projectRef) {
            // Clear the main auth token
            const authTokenKey = `sb-${projectRef}-auth-token`;
            localStorage.removeItem(authTokenKey);
          }
        }

        // Clear all keys that might contain Supabase data
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key);
          }
        });
      } catch (clearError) {
        // Ignore localStorage errors
        console.warn("Error clearing localStorage:", clearError);
      }

      if (error) {
        console.warn("Supabase signOut error:", error);
        // Continue anyway - we've cleared local state
      }

      // Verify session is cleared (non-blocking, happens in background)
      // Don't await this - let redirect happen immediately
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Session still exists, force clear it in background
          console.warn("Session still exists after signOut, forcing clear");
          supabase.auth.signOut().catch(() => {
            // Ignore errors
          });
          // Clear localStorage again
          Object.keys(localStorage).forEach((key) => {
            if (key.includes("supabase") || key.includes("sb-")) {
              localStorage.removeItem(key);
            }
          });
        }
      });

      // Return immediately - redirect will happen from navigation component
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to sign out";

      // Even on error, clear local state and storage
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

      // Clear session storage
      sessionStorage.removeItem("dentmentor_oauth_userType");
      sessionStorage.removeItem("dentmentor_oauth_timestamp");
      sessionStorage.removeItem("dentmentor-signup-data");

      // Set flag to prevent re-authentication on page reload
      sessionStorage.setItem("dentmentor_just_signed_out", "true");

      // Clear Supabase localStorage
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key);
          }
        });
      } catch (clearError) {
        // Ignore
      }

      return { success: false, error: errorMessage };
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(
    async (profileData: Partial<AuthProfile>) => {
      if (!state.user) {
        return { success: false, error: "No user logged in" };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const { error } = await supabase.auth.updateUser({
          data: profileData,
        });

        if (error) {
          throw error;
        }

        setState((prev) => ({ ...prev, isLoading: false }));
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Profile update failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        toast({
          title: "Profile update failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [state.user, toast]
  );

  // Update mentor profile function
  const updateMentorProfile = useCallback(
    async (
      profileData: Partial<MentorProfile>,
      updateContext: boolean = true
    ) => {
      if (!state.user) {
        return { success: false, error: "No user logged in" };
      }

      // Only update loading state if we're updating context
      if (updateContext) {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        // Extract first_name and last_name from user metadata if not provided in profileData
        // This ensures Google Auth names are saved to the profiles table
        const { first_name, last_name } = extractNameFromGoogleAuth(state.user);

        // Use upsert to create profile if it doesn't exist, or update if it does
        const profileToUpsert = {
          user_id: state.user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        };

        // If profile doesn't exist in state, set defaults for new profile
        if (!state.mentorProfile) {
          profileToUpsert.onboarding_step = profileData.onboarding_step || 1;
          profileToUpsert.onboarding_completed =
            profileData.onboarding_completed || false;
          profileToUpsert.verification_status =
            profileData.verification_status || "pending";
          profileToUpsert.is_verified = profileData.is_verified || false;
          profileToUpsert.is_active = profileData.is_active || true;
          
          // Auto-detect timezone if not provided
          if (!profileToUpsert.timezone) {
            profileToUpsert.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
          }
        } else if (!profileData.timezone && !profileToUpsert.timezone) {
          // Auto-detect timezone if existing profile doesn't have one
          profileToUpsert.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        }

        const { data, error } = await supabase
          .from("mentor_profiles")
          .upsert(profileToUpsert, {
            onConflict: "user_id",
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Also update the profiles table with first_name and last_name
        // This ensures the name is available for display in the dashboard
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            user_id: state.user.id,
            first_name: state.profile?.first_name || first_name,
            last_name: state.profile?.last_name || last_name,
            user_type: state.userType || "mentor",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

        if (profileError) {
          // Don't throw - this is not critical, mentor_profiles update succeeded
        }

        // Update local state only if updateContext is true
        if (updateContext) {
          setState((prev) => {
            const updatedMentorProfile =
              data ||
              (prev.mentorProfile
                ? { ...prev.mentorProfile, ...profileData }
                : null);
            // Only update currentOnboardingStep if onboarding_step was actually updated
            const currentOnboardingStep = profileData.hasOwnProperty(
              "onboarding_step"
            )
              ? updatedMentorProfile?.onboarding_step || 1
              : prev.currentOnboardingStep;

            return {
              ...prev,
              mentorProfile: updatedMentorProfile,
              currentOnboardingStep,
              isLoading: false,
            };
          });
        } else {
          // Just set loading to false without updating context
          setState((prev) => ({ ...prev, isLoading: false }));
        }

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Mentor profile update failed";
        // Only update context state if updateContext is true
        if (updateContext) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
          }));
        }
        toast({
          title: "Profile update failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [state.user, state.mentorProfile, toast]
  );

  // Update mentee profile function
  const updateMenteeProfile = useCallback(
    async (profileData: Partial<MenteeProfile>) => {
      if (!state.user) {
        return { success: false, error: "No user logged in" };
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Clean up profileData: convert empty strings to null/undefined for optional fields
        const cleanedProfileData: any = { ...profileData };

        // Convert empty string to null for optional numeric fields
        if (
          cleanedProfileData.english_score === "" ||
          cleanedProfileData.english_score === null ||
          cleanedProfileData.english_score === undefined ||
          cleanedProfileData.english_exam === "Not Taken" ||
          cleanedProfileData.english_exam === ""
        ) {
          cleanedProfileData.english_score = null;
        } else if (
          cleanedProfileData.english_score !== undefined &&
          cleanedProfileData.english_score !== null
        ) {
          // Ensure it's a number
          const numScore = Number(cleanedProfileData.english_score);
          cleanedProfileData.english_score = isNaN(numScore) ? null : numScore;
        }

        // Convert empty string to null for optional string fields
        if (cleanedProfileData.english_exam === "") {
          cleanedProfileData.english_exam = null;
        }
        if (cleanedProfileData.inbde_status === "") {
          cleanedProfileData.inbde_status = null;
        }

        // Ensure arrays are properly formatted - don't send empty arrays, use null instead
        if (cleanedProfileData.target_programs) {
          if (
            Array.isArray(cleanedProfileData.target_programs) &&
            cleanedProfileData.target_programs.length === 0
          ) {
            cleanedProfileData.target_programs = null;
          }
        }

        // Use upsert to create profile if it doesn't exist, or update if it does
        const profileToUpsert = {
          user_id: state.user.id,
          ...cleanedProfileData,
          updated_at: new Date().toISOString(),
        };

        // If profile doesn't exist in state, set defaults for new profile
        if (!state.menteeProfile) {
          profileToUpsert.onboarding_step =
            cleanedProfileData.onboarding_step || 1;
          profileToUpsert.onboarding_completed =
            cleanedProfileData.onboarding_completed || false;
        }

        const { data, error } = await supabase
          .from("mentee_profiles")
          .upsert(profileToUpsert, {
            onConflict: "user_id",
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Update local state
        setState((prev) => {
          const updatedMenteeProfile =
            data ||
            (prev.menteeProfile
              ? { ...prev.menteeProfile, ...profileData }
              : null);
          const currentOnboardingStep =
            updatedMenteeProfile?.onboarding_step || 1;

          return {
            ...prev,
            menteeProfile: updatedMenteeProfile,
            currentOnboardingStep,
            isLoading: false,
          };
        });

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Mentee profile update failed";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        toast({
          title: "Profile update failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [state.user, state.menteeProfile, toast]
  );

  // Refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!state.user || !state.userType) return;

    await loadUserProfiles(state.user.id, state.userType, state.user);
  }, [state.user, state.userType]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
