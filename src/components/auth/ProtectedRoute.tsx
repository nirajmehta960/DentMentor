import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  allowedUserTypes?: ('mentor' | 'mentee')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireOnboarding = false,
  allowedUserTypes = ['mentor', 'mentee'],
  redirectTo,
}) => {
  const {
    user,
    userType,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading
  } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditMode = searchParams.get('edit') === '1' || searchParams.get('edit') === 'true';

  // Show loading while authentication or profiles are loading
  if (isLoading || isAuthLoading || (user && isProfileLoading)) {
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

    if (!onboardingComplete) {
      const onboardingPath = userType === 'mentee' ? '/mentee-onboarding' : '/onboarding';
      return <Navigate to={onboardingPath} replace />;
    }

    // Redirect completed users away from auth page
    const dashboardPath = userType === 'mentee' ? '/mentors' : '/dashboard';
    return <Navigate to={redirectTo || dashboardPath} replace />;
  }

  // Check user type restrictions
  if (user && userType && !allowedUserTypes.includes(userType)) {
    const fallbackPath = userType === 'mentee' ? '/mentors' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  // Handle onboarding requirements
  if (user && userType && requireOnboarding && onboardingComplete && !isEditMode) {
    // User has completed onboarding but is trying to access onboarding page without edit mode
    const dashboardPath = userType === 'mentee' ? '/mentors' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  if (user && userType && !onboardingComplete) {
    // User hasn't completed onboarding but is trying to access app
    const onboardingPath = userType === 'mentee' ? '/mentee-onboarding' : '/onboarding';
    return <Navigate to={onboardingPath} replace />;
  }

  return <>{children}</>;
};

// Specialized protected route components for common use cases

export const AuthOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true} requireOnboarding={false}>
    {children}
  </ProtectedRoute>
);

export const OnboardingRoute: React.FC<{ 
  children: React.ReactNode; 
  userType?: 'mentor' | 'mentee' 
}> = ({ children, userType }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireOnboarding={true}
    allowedUserTypes={userType ? [userType] : ['mentor', 'mentee']}
  >
    {children}
  </ProtectedRoute>
);

export const CompletedOnboardingRoute: React.FC<{ 
  children: React.ReactNode;
  allowedUserTypes?: ('mentor' | 'mentee')[];
}> = ({ children, allowedUserTypes }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireOnboarding={false}
    allowedUserTypes={allowedUserTypes}
  >
    {children}
  </ProtectedRoute>
);

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

export const MentorOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true}
    requireOnboarding={false} 
    allowedUserTypes={['mentor']}
  >
    {children}
  </ProtectedRoute>
);

export const MenteeOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true}
    requireOnboarding={false}
    allowedUserTypes={['mentee']}
  >
    {children}
  </ProtectedRoute>
);