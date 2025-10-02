import React, { useState } from "react";
import { useMenteeRecentActivity } from "@/hooks/useMenteeRecentActivity";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

type ActivityFilter = "all" | "sessions" | "messages" | "reviews";

export function MenteeRecentActivity() {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const { activities, isLoading } = useMenteeRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "session_completed":
        return {
          icon: CheckCircle,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "session_booked":
        return { icon: Calendar, color: "text-primary", bg: "bg-primary/10" };
      case "message":
        return {
          icon: MessageSquare,
          color: "text-accent",
          bg: "bg-accent/10",
        };
      case "review":
        return { icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "document":
        return {
          icon: FileText,
          color: "text-primary",
          bg: "bg-primary/10",
        };
      default:
        return {
          icon: Activity,
          color: "text-muted-foreground",
          bg: "bg-muted/50",
        };
    }
  };

  const filters: { value: ActivityFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "sessions", label: "Sessions" },
    { value: "messages", label: "Messages" },
    { value: "reviews", label: "Reviews" },
  ];

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true;
    if (filter === "sessions") return activity.type.includes("session");
    if (filter === "messages") return activity.type === "message";
    if (filter === "reviews") return activity.type === "review";
    return true;
  });

  if (isLoading) {
    return (
      <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl p-6">
        <div className="h-8 bg-muted/50 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-muted/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f.value)}
              className={`h-7 px-3 text-xs font-medium rounded-full transition-all ${
                filter === f.value
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No activity to show</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => {
              const { icon: Icon, color, bg } = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
