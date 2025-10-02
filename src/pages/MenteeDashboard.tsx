import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { MenteeDashboardNavigation } from "@/components/mentee-dashboard/MenteeDashboardNavigation";
import { MenteeDashboardSidebar } from "@/components/mentee-dashboard/MenteeDashboardSidebar";
import { MenteeDashboardMobileNav } from "@/components/mentee-dashboard/MenteeDashboardMobileNav";
import { OverviewTab } from "@/components/mentee-dashboard/tabs/OverviewTab";
import { SessionsTab } from "@/components/mentee-dashboard/tabs/SessionsTab";
import { MentorsTab } from "@/components/mentee-dashboard/tabs/MentorsTab";
import { ProfileTab } from "@/components/mentee-dashboard/tabs/ProfileTab";
import { ActivityTab } from "@/components/mentee-dashboard/tabs/ActivityTab";

export default function MenteeDashboard() {
  const {
    user,
    userType,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading,
  } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Show loading while authentication or profiles are loading
  if (isLoading || isAuthLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
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
      default:
        return <OverviewTab onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <MenteeDashboardNavigation />
      
      {/* Mobile Navigation */}
      <MenteeDashboardMobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="relative z-10 flex">
        {/* Sidebar - Desktop only */}
        <MenteeDashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content - Fixed height with overflow */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
