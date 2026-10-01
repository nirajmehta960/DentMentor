import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { AppPageHeader, AppShell } from '@/components/site';
import { DashboardNavigation } from '@/components/dashboard/DashboardNavigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardMobileNav } from '@/components/dashboard/DashboardMobileNav';
import { OverviewTab } from '@/components/dashboard/tabs/OverviewTab';
import { SessionsTab } from '@/components/dashboard/tabs/SessionsTab';
import { AvailabilityTab } from '@/components/dashboard/tabs/AvailabilityTab';
import { ProfileTab } from '@/components/dashboard/tabs/ProfileTab';
import { ActivityTab } from '@/components/dashboard/tabs/ActivityTab';
import { MessagesTab } from '@/components/dashboard/tabs/MessagesTab';

export default function Dashboard() {
  const {
    user,
    userType,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading,
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTabState] = useState(tabParam || 'overview');

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);


  // Show loading while authentication or profiles are loading
  if (isLoading || isAuthLoading || (user && isProfileLoading)) {
    return (
      <AppShell nav={false}>
        <div className="flex min-h-screen items-center justify-center px-6" role="status">
          <div className="flex flex-col items-center gap-4">
            <span
              aria-hidden="true"
              className="size-9 rounded-full border-2 border-band-fg/10 border-t-band-signal motion-safe:animate-spin"
            />
            <p className="text-[0.875rem] text-band-muted">Loading your dashboard…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userType) {
    return <Navigate to="/auth" replace />;
  }

  if (userType !== 'mentor') {
    return <Navigate to="/" replace />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onNavigate={setActiveTab} />;
      case 'sessions':
        return <SessionsTab />;
      case 'availability':
        return <AvailabilityTab />;
      case 'profile':
        return <ProfileTab />;
      case 'activity':
        return <ActivityTab />;
      case 'messages':
        // MessagesTab is shared with the mentee dashboard and carries no page
        // header of its own, so the mentor page adds one above it.
        return (
          <div className="flex flex-col gap-6">
            <AppPageHeader
              eyebrow="Messages"
              title="Inbox"
              description="Each booked session has its own thread with your mentee."
            />
            <MessagesTab />
          </div>
        );
      default:

        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppShell nav={false}>
      <DashboardNavigation />

      {/* Mobile Navigation */}
      <DashboardMobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[76rem] px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
