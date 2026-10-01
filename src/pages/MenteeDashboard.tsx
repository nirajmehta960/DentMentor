import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/site";
import { MenteeDashboardLayout } from "@/components/mentee-dashboard/MenteeDashboardLayout";
import { OverviewTab } from "@/components/mentee-dashboard/tabs/OverviewTab";
import { SessionsTab } from "@/components/mentee-dashboard/tabs/SessionsTab";
import { MentorsTab } from "@/components/mentee-dashboard/tabs/MentorsTab";
import { ProfileTab } from "@/components/mentee-dashboard/tabs/ProfileTab";
import { ActivityTab } from "@/components/mentee-dashboard/tabs/ActivityTab";
import { MessagesTab } from "@/components/dashboard/tabs/MessagesTab";


export default function MenteeDashboard() {
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
      <AppShell nav={false} mainClassName="grid place-items-center">
        <div role="status" className="flex flex-col items-center gap-4">
          <span
            aria-hidden="true"
            className="size-10 rounded-full border-[3px] border-band-signal/15 border-t-band-signal motion-safe:animate-spin"
          />
          <p className="text-[0.9375rem] text-band-muted">Loading your dashboard...</p>
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

  if (userType !== "mentee") {
    return <Navigate to="/" replace />;
  }

  if (!onboardingComplete) {
    return <Navigate to="/mentee-onboarding" replace />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onNavigate={setActiveTab} />;
      case 'sessions':
        return <SessionsTab />;
      case 'mentors':
        return <MentorsTab />;
      case 'profile':
        return <ProfileTab />;
      case 'activity':
        return <ActivityTab />;
      case 'messages':
        return <MessagesTab />;
      default:

        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppShell nav={false}>
      <MenteeDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderActiveTab()}
      </MenteeDashboardLayout>
    </AppShell>
  );
}
