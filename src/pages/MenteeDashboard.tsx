import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { MenteeDashboardNavigation } from "@/components/mentee-dashboard/MenteeDashboardNavigation";
import { MenteeWelcomeBar } from "@/components/mentee-dashboard/MenteeWelcomeBar";
import { MenteeQuickStats } from "@/components/mentee-dashboard/MenteeQuickStats";
import { UpcomingSessions } from "@/components/mentee-dashboard/UpcomingSessions";
import { MenteeProfileManagement } from "@/components/mentee-dashboard/MenteeProfileManagement";
import { RecommendedMentors } from "@/components/mentee-dashboard/RecommendedMentors";
import { MenteeRecentActivity } from "@/components/mentee-dashboard/MenteeRecentActivity";
import { ApplicationProgress } from "@/components/mentee-dashboard/ApplicationProgress";

export default function MenteeDashboard() {
  const {
    user,
    userType,
    onboardingComplete,
    isLoading,
    isAuthLoading,
    isProfileLoading,
  } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <MenteeDashboardNavigation />

      <main className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <section className="mb-4 sm:mb-6 md:mb-8">
          <MenteeWelcomeBar />
        </section>

        {/* Stats Section */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <MenteeQuickStats />
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column */}
          <div className="xl:col-span-7 space-y-4 sm:space-y-6 md:space-y-8">
            <UpcomingSessions />
            <RecommendedMentors />
          </div>

          {/* Right Column */}
          <div className="xl:col-span-5 space-y-4 sm:space-y-6 md:space-y-8">
            <ApplicationProgress />
            <MenteeProfileManagement />
            <MenteeRecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
