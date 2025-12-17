import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight, Target, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function MenteeWelcomeBar() {
  const { profile } = useAuth();

  // Calculate profile completion
  const completionItems = [
    !!profile?.first_name,
    !!profile?.last_name,
    !!profile?.avatar_url,
    !!profile?.phone,
  ];
  const completedCount = completionItems.filter(Boolean).length;
  const completionPercentage = Math.round(
    (completedCount / completionItems.length) * 100
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-xl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          {/* Left side - Greeting */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Student Dashboard
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {getGreeting()}, {profile?.first_name || "Student"}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
              Track your mentorship journey, manage sessions, and achieve your
              dental school goals.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/mentors">
                <Button className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 text-xs sm:text-sm">
                  <Target className="mr-2 h-4 w-4" />
                  Find a Mentor
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Profile completion */}
          <div className="lg:w-72">
            <div className="p-4 sm:p-5 bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Profile Completion
                </span>
                <span className="text-2xl font-bold text-primary">
                  {completionPercentage}%
                </span>
              </div>

              {/* Circular progress indicator */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 transform -rotate-90"
                    viewBox="0 0 64 64"
                  >
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-muted/20"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${completionPercentage * 1.76} 176`}
                      strokeLinecap="round"
                      className="text-primary transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {completedCount} of {completionItems.length} items completed
                  </p>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
              </div>

              {completionPercentage < 100 && (
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Complete Your Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
