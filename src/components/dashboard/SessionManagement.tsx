import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MessageCircle,
  Check,
  X,
  Video,
  User,
  CalendarClock,
} from "lucide-react";
import { useUpcomingSessions } from "@/hooks/useUpcomingSessions";
import { useSessionRequests } from "@/hooks/useSessionRequests";
import { formatDate, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import type { Session } from "@/hooks/useUpcomingSessions";

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
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarClock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Session Management
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Session Management
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your upcoming sessions and requests
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg sm:rounded-xl">
            <TabsTrigger
              value="upcoming"
              className="rounded-md sm:rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Upcoming</span>
              <span className="sm:hidden">Upcoming</span>
              {(upcomingSessions?.length || 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-primary/10 text-primary"
                >
                  {upcomingSessions?.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-md sm:rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs sm:text-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Requests
              {(sessionRequests?.length || 0) > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-amber-500/10 text-amber-600"
                >
                  {sessionRequests?.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="upcoming"
            className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
          >
            {upcomingSessions?.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No upcoming sessions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your scheduled sessions will appear here
                </p>
              </div>
            ) : (
              upcomingSessions?.map((session, index) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative p-4 sm:p-5 rounded-lg sm:rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/20",
                    "transition-all duration-200 hover:shadow-lg hover:border-primary/20"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <Badge className="bg-primary/10 text-primary border-0 font-medium text-xs sm:text-sm">
                            {formatDate(session.session_date)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="font-medium text-xs sm:text-sm"
                          >
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                            {formatTime(session.session_date)}
                          </Badge>
                        </div>
                        <p className="font-semibold text-sm sm:text-base text-foreground">
                          {session.service?.title || session.mentee?.name || session.session_type}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          {session.duration_minutes} minutes session
                        </p>
                        {session.service?.title && session.mentee?.name && (
                          <p className="text-xs text-muted-foreground">
                            with {session.mentee.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:ml-14">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-xs sm:text-sm flex-1 sm:flex-initial"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        className="shadow-sm text-xs sm:text-sm flex-1 sm:flex-initial"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent
            value="requests"
            className="mt-4 sm:mt-6 space-y-3 sm:space-y-4"
          >
            {sessionRequests?.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-foreground mb-1">
                  No pending requests
                </h3>
                <p className="text-sm text-muted-foreground">
                  New session requests will appear here
                </p>
              </div>
            ) : (
              sessionRequests?.map((request) => (
                <div
                  key={request.id}
                  className="p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/20 dark:to-background"
                >
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs sm:text-sm">
                              {formatDate(request.requested_date)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                              {formatTime(request.requested_date)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs sm:text-sm flex-shrink-0">
                        Pending
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold text-sm sm:text-base text-foreground">
                        {request.session_type}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Duration: {request.duration_minutes} minutes
                      </p>
                      {request.message && (
                        <div className="p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border/50">
                          <p className="text-xs sm:text-sm text-muted-foreground italic">
                            "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(request.id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-xs sm:text-sm"
                      >
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Accept Request
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => declineRequest(request.id)}
                        className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs sm:text-sm"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        session={selectedSession}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedSession(null);
        }}
      />
    </div>
  );
}
