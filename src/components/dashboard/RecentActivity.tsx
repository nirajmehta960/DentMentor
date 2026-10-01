import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity,
  MessageCircle,
  Calendar,
  CalendarCheck,
  Star,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { DIVIDED, EmptyState, IconTile, PanelHeader, Segmented, SkeletonRows, WorkPanel } from "./dashboard-ui";

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

  /** Whether a row leads anywhere — mirrors the branches of handleActivityClick. */
  const hasDestination = (activity: any) =>
    (activity.type === "new_message" && !!activity.metadata?.session_id) ||
    activity.type === "session_completed" ||
    activity.type === "session_booked";

  const getActivityConfig = (type: string) => {
    switch (type) {
      case "session_booked":
        return { icon: Calendar, label: "Session" };
      case "session_completed":
        return { icon: CalendarCheck, label: "Session" };
      case "new_message":
        return { icon: MessageCircle, label: "Message" };
      case "new_feedback":
        return { icon: Star, label: "Feedback" };
      case "payment_received":
        return { icon: DollarSign, label: "Payment" };
      default:
        return { icon: Activity, label: "Activity" };
    }
  };

  const filters = [
    { value: "all", label: "All" },
    { value: "session_completed", label: "Sessions" },
    { value: "new_message", label: "Messages" },
    { value: "new_feedback", label: "Feedback" },
    { value: "payment_received", label: "Payments" },
  ] as const;

  if (isLoading) {
    return (
      <WorkPanel>
        <PanelHeader icon={Activity} title="Recent activity" description="Your latest updates" />
        <SkeletonRows rows={4} />
        <span className="sr-only" role="status">Loading activity</span>
      </WorkPanel>
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
        return "Reply";
      case "session_completed":
      case "session_booked":
        return "View details";
      default:
        return null;
    }
  };

  return (
    <WorkPanel className="flex flex-col">
      {/* Header */}
      <PanelHeader icon={Activity} title="Recent activity" description="Your latest updates">
        <Segmented<string>
          label="Filter activity"
          options={filters}
          value={filter}
          onChange={setFilter}
          className="self-start"
        />
      </PanelHeader>

      <div className="max-h-[42rem] overflow-y-auto">
        {filteredActivities?.length === 0 ? (
          <EmptyState icon={Activity}>
            Nothing here yet. Bookings, messages, feedback and payments will show up as they happen.
          </EmptyState>
        ) : (
          <ul className={DIVIDED}>
            {filteredActivities?.map((activity) => {
              const config = getActivityConfig(activity.type);
              const quickAction = hasDestination(activity) ? getQuickAction(activity) : null;
              const unread = !(activity as any).is_read;

              const body = (
                <>
                  <IconTile icon={config.icon} />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-[0.9375rem] font-medium text-band-fg">
                          {activity.title}
                        </p>
                        <p className="line-clamp-2 text-[0.8125rem] leading-relaxed text-band-muted sm:line-clamp-1">
                          {activity.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="whitespace-nowrap text-[0.75rem] text-band-faint">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {unread && (
                          <span className="size-2 rounded-full bg-band-signal">
                            <span className="sr-only">Unread</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* User info & where the row goes */}
                    {(activity.metadata?.mentee_name || quickAction) && (
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        {activity.metadata?.mentee_name ? (
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Avatar className="size-6 shrink-0">
                              <AvatarImage
                                src={activity.metadata.mentee_avatar}
                              />
                              <AvatarFallback className="bg-[rgb(15_112_93/0.1)] text-[0.625rem] font-semibold text-band-signal">
                                {activity.metadata.mentee_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-[0.8125rem] text-band-muted">
                              {activity.metadata.mentee_name}
                            </span>
                          </div>
                        ) : (
                          <span />
                        )}

                        {quickAction && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[0.8125rem] font-medium text-band-signal">
                            {quickAction}
                            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/row:translate-x-0.5" aria-hidden="true" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );

              const rowClass = "group/row flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6";

              return (
                <li key={activity.id}>
                  {hasDestination(activity) ? (
                    <button
                      type="button"
                      onClick={() => handleActivityClick(activity)}
                      className={cn(rowClass, "transition-colors hover:bg-band-fg/[0.025]")}
                    >
                      {body}
                    </button>
                  ) : (
                    <div className={rowClass}>{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </WorkPanel>
  );
}
