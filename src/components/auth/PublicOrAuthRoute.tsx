import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageLoader } from './FullPageLoader';

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
    return <FullPageLoader label="Loading..." />;
  }

  // If user is authenticated, check user type restrictions
  if (user && userType && !allowedUserTypes.includes(userType)) {
    const fallbackPath = userType === 'mentee' ? '/mentors' : '/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  // Allow both authenticated and unauthenticated users
  return <>{children}</>;
};
