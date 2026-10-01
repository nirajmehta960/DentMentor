import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MessageCircle,
  Check,
  X,
  Inbox,
} from "lucide-react";
import { useUpcomingSessions } from "@/hooks/useUpcomingSessions";
import { useSessionRequests } from "@/hooks/useSessionRequests";
import { formatDate, formatTime } from "@/lib/utils";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import type { Session } from "@/hooks/useUpcomingSessions";
import {
  DIVIDED,
  DateLeaf,
  EmptyState,
  SkeletonRows,
  StatusPill,
  WorkPanel,
  hairline,
} from "./dashboard-ui";

/** A count inside a tab trigger. */
function Count({ value, attention = false }: { value: number; attention?: boolean }) {
  return (
    <span
      className={
        "ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-[0.6875rem] font-semibold tabular-nums " +
        (attention ? "bg-[rgb(245_158_11/0.14)] text-[rgb(146_64_14)]" : "bg-[rgb(15_112_93/0.1)] text-primary")
      }
    >
      {value}
    </span>
  );
}

export function SessionManagement() {
  const { upcomingSessions, isLoading: sessionsLoading } =
    useUpcomingSessions();
  const {
    sessionRequests,
    acceptRequest,
    declineRequest,
    isLoading: requestsLoading,
  } = useSessionRequests();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  if (sessionsLoading || requestsLoading) {
    return (
      <WorkPanel>
        <div className="border-b px-5 py-4 sm:px-6" style={hairline}>
          <span aria-hidden="true" className="block h-11 w-64 max-w-full rounded-pill bg-band-fg/[0.05] motion-safe:animate-pulse" />
        </div>
        <SkeletonRows rows={3} />
        <span className="sr-only" role="status">Loading sessions</span>
      </WorkPanel>
    );
  }

  return (
    <WorkPanel>
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="border-b px-5 py-4 sm:px-6" style={hairline}>
          <TabsList className="grid h-[3.25rem] w-full grid-cols-2 sm:inline-grid sm:w-auto">
            <TabsTrigger value="upcoming" className="h-11 px-2 text-[0.8125rem] sm:px-4 sm:text-sm">
              <Calendar className="mr-2 hidden size-4 sm:inline" aria-hidden="true" />
              Upcoming
              {(upcomingSessions?.length || 0) > 0 && <Count value={upcomingSessions.length} />}
            </TabsTrigger>
            <TabsTrigger value="requests" className="h-11 px-2 text-[0.8125rem] sm:px-4 sm:text-sm">
              <MessageCircle className="mr-2 hidden size-4 sm:inline" aria-hidden="true" />
              Requests
              {(sessionRequests?.length || 0) > 0 && <Count value={sessionRequests.length} attention />}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-0">
          {upcomingSessions?.length === 0 ? (
            <EmptyState icon={Calendar}>
              No upcoming sessions. Booked sessions appear here with their time and mentee.
            </EmptyState>
          ) : (
            <ul className={DIVIDED}>
              {upcomingSessions?.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <DateLeaf date={new Date(session.session_date)} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[0.9375rem] font-semibold text-band-fg">
                          {session.service?.title || session.mentee?.name || session.session_type}
                        </p>
                        <StatusPill status={session.status} />
                      </div>
                      <p className="flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-band-muted tabular-nums">
                        <span>{formatDate(session.session_date)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {formatTime(session.session_date)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{session.duration_minutes} min</span>
                      </p>
                      {session.service?.title && session.mentee?.name && (
                        <p className="text-[0.8125rem] text-band-muted">
                          with {session.mentee.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:shrink-0">
                    <Button variant="outline" size="sm" className="h-11 flex-1 sm:flex-initial">
                      <MessageCircle className="size-4" aria-hidden="true" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      className="h-11 flex-1 sm:flex-initial"
                      onClick={() => {
                        setSelectedSession(session);
                        setIsDetailsDialogOpen(true);
                      }}
                    >
                      View details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-0">
          {sessionRequests?.length === 0 ? (
            <EmptyState icon={Inbox}>
              No pending requests. New requests from mentees will wait here for your answer.
            </EmptyState>
          ) : (
            <ul className={DIVIDED}>
              {sessionRequests?.map((request) => (
                <li key={request.id} className="flex flex-col gap-4 px-5 py-5 sm:px-6">
                  <div className="flex items-start gap-4">
                    <DateLeaf date={new Date(request.requested_date)} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.9375rem] font-semibold text-band-fg">
                          {request.session_type}
                        </p>
                        <StatusPill tone="amber">Pending</StatusPill>
                      </div>
                      <p className="flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-band-muted tabular-nums">
                        <span>{formatDate(request.requested_date)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {formatTime(request.requested_date)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{request.duration_minutes} min</span>
                      </p>
                    </div>
                  </div>

                  {request.message && (
                    <blockquote
                      className="rounded-tile border bg-band-fg/[0.02] px-4 py-3 text-[0.875rem] leading-relaxed text-band-muted sm:ml-16"
                      style={hairline}
                    >
                      {request.message}
                    </blockquote>
                  )}

                  <div className="flex gap-2 sm:ml-16">
                    <Button
                      size="sm"
                      onClick={() => acceptRequest(request.id)}
                      className="h-11 flex-1 sm:flex-initial"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      Accept request
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => declineRequest(request.id)}
                      className="h-11 flex-1 hover:border-red-200 hover:bg-red-50 hover:text-red-700 sm:flex-initial"
                    >
                      <X className="size-4" aria-hidden="true" />
                      Decline
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        session={selectedSession}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedSession(null);
        }}
      />
    </WorkPanel>
  );
}
