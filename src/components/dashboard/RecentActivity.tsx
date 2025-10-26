import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity,
  MessageCircle,
  Calendar,
  Star,
  DollarSign,
  Reply,
  Eye,
  Filter,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  const { activities, isLoading } = useRecentActivity();
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();

  const handleActivityClick = (activity: any) => {
    if (activity.type === "new_message" && activity.metadata?.session_id) {
      navigate(`/messages/session/${activity.metadata.session_id}`);
    } else if (activity.type === "session_completed" || activity.type === "session_booked") {
      navigate("/dashboard?tab=sessions");
    }
  };

  const getActivityConfig = (type: string) => {
    switch (type) {
      case "session_booked":
        return {
          icon: Calendar,
          color: "text-accent",
          bg: "bg-accent/10",
          label: "Session",
        };
      case "session_completed":
        return {
          icon: Calendar,
          color: "text-emerald-600",
          bg: "bg-emerald-500/10",
          label: "Session",
        };
      case "new_message":
        return {
          icon: MessageCircle,
          color: "text-accent",
          bg: "bg-accent/10",
          label: "Message",
        };
      case "new_feedback":
        return {
          icon: Star,
          color: "text-amber-600",
          bg: "bg-amber-500/10",
          label: "Feedback",
        };
      case "payment_received":
        return {
          icon: DollarSign,
          color: "text-emerald-600",
          bg: "bg-emerald-500/10",
          label: "Payment",
        };
      default:
        return {
          icon: Activity,
          color: "text-muted-foreground",
          bg: "bg-muted/50",
          label: "Activity",
        };
    }
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "session_completed", label: "Sessions" },
    { key: "new_message", label: "Messages" },
    { key: "new_feedback", label: "Feedback" },
    { key: "payment_received", label: "Payments" },
  ];

  if (isLoading) {
    return (
      <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 animate-pulse"></div>
            <div className="h-5 sm:h-6 w-28 sm:w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 sm:p-5 md:p-6">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg sm:rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-2.5 sm:h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredActivities = activities?.filter(
    (activity) => {
      if (filter === "all") return true;
      if (filter === "session_completed") {
        // When filtering by "Sessions", show both booked and completed
        return activity.type === "session_completed" || activity.type === "session_booked";
      }
      return activity.type === filter;
    }
  );

  const getQuickAction = (activity: any) => {
    switch (activity.type) {
      case "new_message":
        return { label: "Reply", icon: Reply };
      case "session_completed":
      case "session_booked":
        return { label: "View Details", icon: Eye };
      case "new_feedback":
        return { label: "Respond", icon: Reply };
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm flex flex-col max-h-[700px] min-h-[500px]">
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                Recent Activity
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your latest updates
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex-1 overflow-y-auto">
        <div className="space-y-3 sm:space-y-4">
          {filteredActivities?.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-muted/30 rounded-lg sm:rounded-xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">
                No activities yet
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your recent activities will appear here
              </p>
            </div>
          ) : (
            filteredActivities?.map((activity, index) => {
              const config = getActivityConfig(activity.type);
              const Icon = config.icon;
              const quickAction = getQuickAction(activity);

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "group relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl",
                    "border border-transparent hover:border-border/50 hover:bg-muted/30",
                    "transition-all duration-200",
                    "cursor-pointer"
                  )}
                  onClick={() => handleActivityClick(activity)}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
                      config.bg
                    )}
                  >
                    <Icon
                      className={cn("w-4 h-4 sm:w-5 sm:h-5", config.color)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                          {activity.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {!(activity as any).is_read && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>

                    {/* User info & Quick Action */}
                    <div className="flex items-center justify-between mt-2 sm:mt-3 gap-2">
                      {activity.metadata?.mentee_name && (
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <Avatar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                            <AvatarImage
                              src={activity.metadata.mentee_avatar}
                            />
                            <AvatarFallback className="text-[10px] sm:text-xs bg-primary/10 text-primary">
                              {activity.metadata.mentee_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                            {activity.metadata.mentee_name}
                          </span>
                        </div>
                      )}

                      {quickAction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0"
                        >
                          <quickAction.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                          <span className="hidden sm:inline">
                            {quickAction.label}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View All Link */}
        {(filteredActivities?.length || 0) > 0 && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-primary hover:text-primary hover:bg-primary/5 text-xs sm:text-sm"
            >
              View All Activity
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
