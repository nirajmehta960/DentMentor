import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMenteeRecentActivity } from "@/hooks/useMenteeRecentActivity";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  MessageSquare,
  Star,
  CheckCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DashboardPanel,
  EmptyState,
  IconTile,
  LIST_ROW,
  ListSkeleton,
  PanelHeader,
  ROW_RULE,
  TAP,
  plainSentence,
} from "./parts";

type ActivityFilter = "all" | "sessions" | "messages" | "reviews";

export function MenteeRecentActivity() {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const { activities, isLoading } = useMenteeRecentActivity();

  // One brand teal for every kind; the icon tells them apart.
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "session_completed":
        return CheckCircle;
      case "session_booked":
        return Calendar;
      case "message":
        return MessageSquare;
      case "review":
        return Star;
      case "document":
        return FileText;
      default:
        return Activity;
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

  return (
    <DashboardPanel aria-labelledby="activity-recent">
      <PanelHeader id="activity-recent" title="Recent activity">
        {/* Filter: a pill segmented control. */}
        <div
          role="group"
          aria-label="Filter activity"
          className="scrollbar-hide -mx-1 flex max-w-full gap-1 overflow-x-auto px-1"
        >
          <div className="flex shrink-0 gap-1 rounded-pill bg-band-fg/[0.04] p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={cn(
                  "h-9 rounded-pill px-4 text-[0.8125rem] font-medium transition-colors duration-200",
                  TAP,
                  filter === f.value
                    ? "bg-white text-band-fg shadow-[var(--card-shadow)]"
                    : "text-band-muted hover:text-band-fg",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </PanelHeader>

      {isLoading ? (
        <ListSkeleton rows={5} />
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          icon={Activity}
          message="No activity to show."
          action={
            filter === "all" ? (
              <Button asChild size="sm" className={TAP}>
                <Link to="/mentors">Find a mentor</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className={TAP} onClick={() => setFilter("all")}>
                Show all activity
              </Button>
            )
          }
        />
      ) : (
        <ul>
          {filteredActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <li key={activity.id} className={cn(LIST_ROW, "flex items-start gap-4")} style={ROW_RULE}>
                <IconTile
                  icon={Icon}
                  tone={activity.type === "session_completed" ? "tint" : "hairline"}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-medium text-band-fg">{activity.title}</p>
                  <p className="truncate text-[0.8125rem] text-band-muted">{plainSentence(activity.description)}</p>
                  <p className="mt-0.5 text-[0.75rem] text-band-faint tabular-nums sm:hidden">{activity.time}</p>
                </div>
                <p className="hidden shrink-0 text-[0.8125rem] text-band-faint tabular-nums sm:block">
                  {activity.time}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
