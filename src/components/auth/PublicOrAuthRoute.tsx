import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface PublicOrAuthRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('mentor' | 'mentee')[];
}

export const PublicOrAuthRoute: React.FC<PublicOrAuthRouteProps> = ({
  children,
  allowedUserTypes = ['mentor', 'mentee'],
}) => {
  const {
    user,
    userType,
    isLoading,
    isAuthLoading,
    isProfileLoading
  } = useAuth();

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

  // If user is authenticated, check user type restrictions
  if (user && userType && !allowedUserTypes.includes(userType)) {
    const fallbackPath = userType === 'mentee' ? '/mentors' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  // Allow both authenticated and unauthenticated users
  return <>{children}</>;
};
