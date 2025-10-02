import React from "react";
import { useMenteeUpcomingSessions } from "@/hooks/useMenteeUpcomingSessions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  ExternalLink,
  Star,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

export function UpcomingSessions() {
  const { upcomingSessions, isLoading } = useMenteeUpcomingSessions();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEE, MMM d");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  if (isLoading) {
    return (
      <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl p-6">
        <div className="h-8 bg-muted/50 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-muted/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 sm:p-6 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Your scheduled mentorship sessions
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No upcoming sessions</p>
            <Button
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              Book a Session
            </Button>
          </div>
        ) : (
          upcomingSessions.map((session) => (
            <div
              key={session.id}
              className="group relative p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Mentor info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={session.mentor?.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                      {session.mentor?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {session.service?.title ||
                          session.session_type ||
                          "Mentorship Session"}
                      </h4>
                      {session.mentor?.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">
                            {session.mentor.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      {session.duration_minutes} minutes session
                    </p>
                    {session.service?.title && session.mentor?.name && (
                      <p className="text-xs text-muted-foreground">
                        with {session.mentor.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Session details */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(session.session_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(session.session_date)}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 border-0"
                  >
                    {session.duration_minutes} min
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border/50 hover:border-primary/30"
                  >
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                  >
                    <Video className="h-4 w-4 mr-1.5" />
                    Join
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
