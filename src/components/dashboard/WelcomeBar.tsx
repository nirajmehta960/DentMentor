import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function WelcomeBar() {
  const { profile, mentorProfile } = useAuth();

  const profileCompletion = React.useMemo(() => {
    if (!mentorProfile) return 0;

    const fields = [
      mentorProfile.professional_bio,
      mentorProfile.specializations?.length,
      mentorProfile.hourly_rate,
      mentorProfile.bds_university,
      mentorProfile.us_dental_school,
      mentorProfile.profile_photo_url,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [mentorProfile]);

  const firstName = profile?.first_name || "Mentor";
  const isVerified = mentorProfile?.is_verified || false;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-4 sm:p-6 md:p-8 shadow-xl">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-10">
        <Sparkles className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 text-white" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">
              {getGreeting()}, {firstName}!
            </h1>
            {isVerified && (
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Verified Mentor</span>
                <span className="sm:hidden">Verified</span>
              </Badge>
            )}
          </div>

          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg">
            {profileCompletion < 100
              ? "Complete your profile to attract more students and unlock all features."
              : "Your profile is complete! Keep providing great mentorship."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Progress Ring */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2.5 sm:py-3">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
              {/* Mobile SVG - only visible on mobile */}
              <svg
                className="w-12 h-12 transform -rotate-90 sm:hidden"
                viewBox="0 0 48 48"
              >
                {/* Background circle for mobile */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                {/* Progress circle for mobile */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(profileCompletion / 100) * 125.6} 125.6`}
                  className="transition-all duration-500"
                />
              </svg>
              {/* Desktop SVG - only visible on desktop */}
              <svg
                className="hidden sm:block w-14 h-14 transform -rotate-90"
                viewBox="0 0 56 56"
              >
                {/* Background circle for desktop */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                />
                {/* Progress circle for desktop */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(profileCompletion / 100) * 150.8} 150.8`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                {profileCompletion}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-primary-foreground/70 uppercase tracking-wider">
                Profile
              </p>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {profileCompletion === 100 ? "Complete" : "In Progress"}
              </p>
            </div>
          </div>

          {profileCompletion < 100 && (
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="bg-white text-primary hover:bg-white/90 shadow-lg w-full sm:w-auto"
            >
              <Link
                to="/onboarding"
                className="flex items-center justify-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Complete Profile</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
