import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  allowedUserTypes?: ("mentor" | "mentee")[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireOnboarding = false,
  allowedUserTypes = ["mentor", "mentee"],
  redirectTo,
}) => {
  const {
    user,
    userType,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading,
    mentorProfile,
    menteeProfile,
  } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditMode =
    searchParams.get("edit") === "1" || searchParams.get("edit") === "true";

  // Show loading while authentication is loading
  // For Google OAuth users (email already confirmed), don't wait for profile loading - redirect immediately
  const isEmailConfirmed = !!user?.email_confirmed_at; // Always true for Google OAuth
  const shouldWaitForProfile = user && isProfileLoading && !isEmailConfirmed;

  if (isLoading || isAuthLoading || shouldWaitForProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if authentication is required but user is not signed in
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to auth if user is signed in but we're on auth page
  if (!requireAuth && user) {
    // Determine where to redirect based on user state
    if (!userType) {
      return <Navigate to="/auth" replace />;
    }

    // Google OAuth users always have confirmed emails
    // Redirect to onboarding if not complete
    if (!onboardingComplete) {
      const onboardingPath =
        userType === "mentee" ? "/mentee-onboarding" : "/onboarding";
      return <Navigate to={onboardingPath} replace />;
    }

    // Redirect completed users away from auth page
    const dashboardPath = userType === "mentee" ? "/mentors" : "/dashboard";
    return <Navigate to={redirectTo || dashboardPath} replace />;
  }

  // Check user type restrictions
  if (user && userType && !allowedUserTypes.includes(userType)) {
    const fallbackPath = userType === "mentee" ? "/mentors" : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  // Handle onboarding requirements
  if (
    user &&
    userType &&
    requireOnboarding &&
    onboardingComplete &&
    !isEditMode
  ) {
    // User has completed onboarding but is trying to access onboarding page without edit mode
    const dashboardPath = userType === "mentee" ? "/mentors" : "/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  // CRITICAL: If user has userType but onboarding is not complete, redirect to onboarding
  // This prevents users from accessing protected routes without completing onboarding
  // BUT: Don't redirect if user is already on an onboarding page or auth page
  // IMPORTANT: Ensure userType is valid before redirecting
  const isOnOnboardingPage =
    location.pathname === "/onboarding" ||
    location.pathname === "/mentee-onboarding";
  const isOnAuthPage = location.pathname === "/auth";

  if (
    user &&
    userType &&
    (userType === "mentor" || userType === "mentee") &&
    !onboardingComplete &&
    !isOnOnboardingPage &&
    !isOnAuthPage
  ) {
    // Determine correct onboarding path based on userType
    // Double-check userType to ensure correct redirect
    const onboardingPath =
      userType === "mentee" ? "/mentee-onboarding" : "/onboarding";

    // User hasn't completed onboarding but is trying to access app
    // Use window.location for immediate redirect (bypasses React Router delay)
    // This ensures instant redirect without waiting for React Router
    if (window.location.pathname !== onboardingPath) {
      // Use replace to avoid adding to history
      window.location.replace(onboardingPath);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      );
    }

    return <Navigate to={onboardingPath} replace />;
  }

  // Additional check: If user has userType but no profile exists yet, they must complete onboarding
  // This is a safety check in case onboardingComplete is somehow true when it shouldn't be
  // BUT: Don't redirect if user is already on an onboarding page or auth page
  if (
    user &&
    userType &&
    requireOnboarding === false &&
    !isOnOnboardingPage &&
    !isOnAuthPage
  ) {
    // For routes that don't require onboarding (like dashboard), we still need to check
    // if the user has actually completed onboarding
    const hasProfile =
      userType === "mentor" ? !!mentorProfile : !!menteeProfile;

    if (!hasProfile) {
      const onboardingPath =
        userType === "mentee" ? "/mentee-onboarding" : "/onboarding";
      return <Navigate to={onboardingPath} replace />;
    }
  }

  return <>{children}</>;
};

// Specialized protected route components for common use cases

export const AuthOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute requireAuth={true} requireOnboarding={false}>
    {children}
  </ProtectedRoute>
);

export const OnboardingRoute: React.FC<{
  children: React.ReactNode;
  userType?: "mentor" | "mentee";
}> = ({ children, userType }) => (
  <ProtectedRoute
    requireAuth={true}
    requireOnboarding={true}
    allowedUserTypes={userType ? [userType] : ["mentor", "mentee"]}
  >
    {children}
  </ProtectedRoute>
);

export const CompletedOnboardingRoute: React.FC<{
  children: React.ReactNode;
  allowedUserTypes?: ("mentor" | "mentee")[];
}> = ({ children, allowedUserTypes }) => (
  <ProtectedRoute
    requireAuth={true}
    requireOnboarding={false}
    allowedUserTypes={allowedUserTypes}
  >
    {children}
  </ProtectedRoute>
);

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;

export const MentorOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute
    requireAuth={true}
    requireOnboarding={false}
    allowedUserTypes={["mentor"]}
  >
    {children}
  </ProtectedRoute>
);

export const MenteeOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute
    requireAuth={true}
    requireOnboarding={false}
    allowedUserTypes={["mentee"]}
  >
    {children}
  </ProtectedRoute>
);
