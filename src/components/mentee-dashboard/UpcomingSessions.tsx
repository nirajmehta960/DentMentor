import React from "react";
import { useMenteeUpcomingSessions } from "@/hooks/useMenteeUpcomingSessions";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DashboardPanel,
  EmptyState,
  LIST_ROW,
  ListSkeleton,
  PanelHeader,
  PersonAvatar,
  ROW_RULE,
  StatusPill,
  TAP,
  plainName,
} from "./parts";

/** `sessions.status` and `payment_status`, as the soft pills read them. */
function statusLabel(status?: string) {
  if (status === "confirmed") return "Confirmed";
  if (status === "scheduled") return "Scheduled";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : null;
}

function paymentLabel(paymentStatus?: string) {
  if (!paymentStatus || paymentStatus === "paid") return null;
  if (paymentStatus === "pending" || paymentStatus === "unpaid") return "Awaiting payment";
  return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
}

export function UpcomingSessions() {
  const { upcomingSessions, isLoading } = useMenteeUpcomingSessions();
  const navigate = useNavigate();


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEE, MMM d");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  return (
    <DashboardPanel aria-labelledby="sessions-upcoming">
      <PanelHeader
        id="sessions-upcoming"
        title="Upcoming sessions"
        description="Your meeting link is shared 24 hours before each session."
      />

      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : upcomingSessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          message="You have no upcoming sessions."
          action={
            <Button asChild size="sm" className={TAP}>
              <Link to="/mentors">Find a mentor</Link>
            </Button>
          }
        />
      ) : (
        <ul>
          {upcomingSessions.map((session) => {
            const mentorName = plainName(session.mentor?.name);
            const status = statusLabel(session.status);
            const payment = paymentLabel(session.payment_status);

            return (
              <li
                key={session.id}
                className={cn(LIST_ROW, "flex flex-col gap-4 md:flex-row md:items-center")}
                style={ROW_RULE}
              >
                {/* Mentor and service */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <PersonAvatar name={mentorName || "Mentor"} src={session.mentor?.avatar} className="size-11" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[0.9375rem] font-semibold text-band-fg">
                      {session.service?.title ||
                        session.session_type ||
                        "Mentorship Session"}
                    </h3>
                    {session.service?.title && session.mentor?.name && (
                      <p className="truncate text-[0.8125rem] text-band-muted">with {mentorName}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {status ? <StatusPill>{status}</StatusPill> : null}
                      {payment ? <StatusPill tone="neutral">{payment}</StatusPill> : null}
                    </div>
                  </div>
                </div>

                {/* When */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-band-muted tabular-nums md:w-56 md:flex-col md:items-start">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="size-4 shrink-0 text-band-faint" strokeWidth={1.75} aria-hidden="true" />
                    <span className="text-band-fg">{formatDate(session.session_date)}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="size-4 shrink-0 text-band-faint" strokeWidth={1.75} aria-hidden="true" />
                    <span>
                      {formatTime(session.session_date)} · {session.duration_minutes} min
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("flex-1 md:flex-none", TAP)}
                    onClick={() => navigate('?tab=messages')}
                    disabled={session.payment_status !== 'paid'}
                  >
                    <MessageSquare className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Message
                  </Button>
                  <Button size="sm" className={cn("flex-1 md:flex-none", TAP)}>
                    <Video className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Join
                    <ExternalLink className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardPanel>
  );
}
