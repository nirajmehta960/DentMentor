import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMenteeUpcomingSessions } from "@/hooks/useMenteeUpcomingSessions";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApplicationProgress() {
  const { menteeProfile } = useAuth();
  const { upcomingSessions } = useMenteeUpcomingSessions();

  // Calculate milestones based on actual data
  const milestones = [
    {
      id: "1",
      title: "Profile Complete",
      description: "Complete your student profile",
      status: menteeProfile?.onboarding_completed ? "completed" : "upcoming",
      date: menteeProfile?.onboarding_completed ? "Completed" : "Pending",
    },
    {
      id: "2",
      title: "First Session",
      description: "Book your first mentorship session",
      status:
        upcomingSessions.length > 0 ||
        (menteeProfile?.onboarding_completed && false)
          ? "completed"
          : "upcoming",
      date: upcomingSessions.length > 0 ? "Completed" : "Pending",
    },
    {
      id: "3",
      title: "SOP Draft Review",
      description: "Get your SOP reviewed by a mentor",
      status: "upcoming",
      date: "Pending",
    },
    {
      id: "4",
      title: "Mock Interview",
      description: "Complete a mock interview session",
      status: "upcoming",
      date: "Pending",
    },
    {
      id: "5",
      title: "Application Ready",
      description: "Submit your polished application",
      status: "upcoming",
      date: "Target: TBD",
    },
  ];

  const completedCount = milestones.filter(
    (m) => m.status === "completed"
  ).length;
  const progressPercentage = Math.round(
    (completedCount / milestones.length) * 100
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground/40" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">
            Done
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-primary/10 text-primary border-0 text-xs">
            Active
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header with progress */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/20">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Application Progress</h3>
            <p className="text-sm text-muted-foreground">
              Track your journey to dental school
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {completedCount} of {milestones.length} milestones
              </span>
              <span className="text-lg font-bold text-primary">
                {progressPercentage}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div
              key={milestone.id}
              className={`relative flex items-start gap-4 p-3 rounded-lg transition-colors ${
                milestone.status === "in_progress"
                  ? "bg-primary/5 border border-primary/20"
                  : "hover:bg-muted/30"
              }`}
            >
              {/* Timeline connector */}
              {index < milestones.length - 1 && (
                <div className="absolute left-[26px] top-12 w-0.5 h-8 bg-border/50" />
              )}

              {/* Status icon */}
              <div className="shrink-0 mt-0.5">
                {getStatusIcon(milestone.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`font-medium ${
                      milestone.status === "completed"
                        ? "text-foreground"
                        : milestone.status === "in_progress"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {milestone.title}
                  </h4>
                  {getStatusBadge(milestone.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {milestone.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {milestone.date}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10 text-xs sm:text-sm"
        >
          View Full Journey
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
