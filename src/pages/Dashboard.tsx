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
import { MonthlyAvailabilityPanel } from '@/components/dashboard/MonthlyAvailabilityPanel';

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

        {/* Row 1: Session Management (60%) | Availability Calendar (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <SessionManagement />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <AvailabilityCalendar />
          </div>
        </div>

        {/* Row 2: Profile Management (60%) | Your Availability (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <ProfileManagement />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <MonthlyAvailabilityPanel currentMonth={new Date()} onMonthChange={() => {}} />
          </div>
        </div>

        {/* Row 3: Recent Activity (Full width) */}
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
