import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { WelcomeBar } from '@/components/dashboard/WelcomeBar';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { SessionManagement } from '@/components/dashboard/SessionManagement';
import { ProfileManagement } from '@/components/dashboard/ProfileManagement';
import { AvailabilityCalendar } from '@/components/dashboard/AvailabilityCalendar';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function Dashboard() {
  const { user, userType, onboardingComplete, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userType !== 'mentor') {
    return <Navigate to="/" replace />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavigation />
      <div className="container mx-auto px-4 py-6 space-y-8">
        <WelcomeBar />
        
        <QuickStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <SessionManagement />
            <ProfileManagement />
          </div>
          
          <div className="space-y-8">
            <AvailabilityCalendar />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}