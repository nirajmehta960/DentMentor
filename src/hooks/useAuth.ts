import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Main useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export individual auth state selectors for optimization
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthSession = () => {
  const { session } = useAuth();
  return session;
};

export const useAuthProfile = () => {
  const { profile } = useAuth();
  return profile;
};

export const useUserType = () => {
  const { userType } = useAuth();
  return userType;
};

export const useOnboardingStatus = () => {
  const { onboardingComplete, currentOnboardingStep } = useAuth();
  return { onboardingComplete, currentOnboardingStep };
};

export const useAuthLoading = () => {
  const { isLoading, isAuthLoading, isProfileLoading } = useAuth();
  return { isLoading, isAuthLoading, isProfileLoading };
};