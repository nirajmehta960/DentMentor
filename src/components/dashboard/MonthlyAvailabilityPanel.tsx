import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAvailability } from "@/hooks/useAvailability";
import { useBookedSessions } from "@/hooks/useBookedSessions";
import { formatTime, cn } from "@/lib/utils";

interface MonthlyAvailabilityPanelProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthlyAvailabilityPanel({
  currentMonth,
  onMonthChange,
}: MonthlyAvailabilityPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "available" | "booked">(
    "all"
  );
  const { availability, isLoading, refetch } = useAvailability();
  const { bookedSessions, isLoading: isLoadingSessions } =
    useBookedSessions(currentMonth);

  const handleRefresh = async () => {
    await refetch();
  };

  const to12 = (t: string): string => {
    if (!t || typeof t !== "string" || !t.includes(":")) return t || "";
    const parts = t.split(":");
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return t;
    const period = hour >= 12 ? "PM" : "AM";
    const hh = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hh}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const formatTimeRange = (time: string, duration: number) => {
    if (!time || typeof time !== "string") return "";
    const [start, end] = time.includes("-") ? time.split("-") : [time, time];
    return `${to12(start)} to ${to12(end)}`;
  };

  const parseSlots = (timeSlots: any): { time: string; duration: number }[] => {
    if (!Array.isArray(timeSlots)) return [];
    return timeSlots.map((s: any) => {
      if (s && typeof s === "object" && "time" in s) {
        const time = typeof s.time === "string" ? s.time : "";
        const duration = typeof s.duration === "number" ? s.duration : 60;
        return { time, duration };
      }
      if (typeof s === "string") {
        const parts = s.split(":");
        if (parts.length >= 3) {
          const duration = parseInt(parts[parts.length - 1]);
          const time = parts.slice(0, parts.length - 1).join(":");
          return { time, duration: Number.isNaN(duration) ? 60 : duration };
        }
        return { time: s, duration: 60 };
      }
      return { time: "", duration: 60 };
    });
  };

  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthEnd = endOfMonth(currentMonth);

  // Filter availability for current month
  const monthlyAvailability =
    availability?.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= currentMonthStart && itemDate <= currentMonthEnd;
    }) || [];

  const formatTimeSlots = (
    timeSlots: any
  ): { startTime: string; endTime: string; duration: number }[] => {
    if (!Array.isArray(timeSlots)) return [];

    return timeSlots.map((slot) => {
      // Handle JSONB format from database: { start_time, end_time, duration_minutes }
      if (
        slot &&
        typeof slot === "object" &&
        "start_time" in slot &&
        "end_time" in slot
      ) {
        return {
          startTime: slot.start_time || "",
          endTime: slot.end_time || "",
          duration: slot.duration_minutes || 60,
        };
      }

      // Handle string format: "14:30-15:00:30" or "14:30-15:00"
      if (typeof slot === "string") {
        if (slot.includes("-")) {
          const parts = slot.split("-");
          const startTime = parts[0];
          const endTimeAndDuration = parts[1];

          if (endTimeAndDuration.includes(":")) {
            const endParts = endTimeAndDuration.split(":");
            const endTime = `${endParts[0]}:${endParts[1]}`;
            const duration = parseInt(endParts[2] || "60");
            return { startTime, endTime, duration };
          }
          return { startTime, endTime: endTimeAndDuration, duration: 60 };
        }
        return { startTime: slot, endTime: slot, duration: 60 };
      }

      return { startTime: "", endTime: "", duration: 60 };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-red-100 text-red-800 border-red-200";
      case "partial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Group booked sessions by date
  const bookedSessionsByDate = bookedSessions.reduce((acc, session) => {
    const dateKey = format(new Date(session.session_date), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, typeof bookedSessions>);

  const filteredAvailability = monthlyAvailability.filter((item) => {
    if (filterType === "all") return true;
    if (filterType === "available") return item.is_available;
    return false; // For "booked", we'll show booked sessions separately
  });

  // Get all dates that have either availability or booked sessions
  const allDates = new Set<string>();
  monthlyAvailability.forEach((item) => {
    allDates.add(item.date);
  });
  bookedSessions.forEach((session) => {
    const dateKey = format(new Date(session.session_date), "yyyy-MM-dd");
    allDates.add(dateKey);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
            Scheduled
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
            Confirmed
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  if (isLoading || isLoadingSessions) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Inner Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">
            Your Availability
          </h3>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <span className="text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
          className="rounded-md sm:rounded-lg text-xs sm:text-sm flex-1 sm:flex-initial"
        >
          All
        </Button>
        <Button
          variant={filterType === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("available")}
          className="rounded-md sm:rounded-lg text-xs sm:text-sm flex-1 sm:flex-initial"
        >
          Available
        </Button>
        <Button
          variant={filterType === "booked" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("booked")}
          className="rounded-md sm:rounded-lg text-xs sm:text-sm flex-1 sm:flex-initial"
        >
          Booked
        </Button>
      </div>

      {/* Content */}
      <div>
        {(() => {
          // Show booked sessions when filter is "booked"
          if (filterType === "booked") {
            if (bookedSessions.length === 0) {
              return (
                <div className="text-center text-muted-foreground py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">
                    No booked sessions for this month
                  </p>
                  <p className="text-xs sm:text-sm">
                    Your booked sessions will appear here
                  </p>
                </div>
              );
            }
            return (
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(bookedSessionsByDate)
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([dateKey, sessions]) => {
                    const itemDate = new Date(dateKey);
                    return (
                      <div
                        key={dateKey}
                        className="border rounded-md sm:rounded-lg p-2.5 sm:p-3 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className="font-medium text-xs sm:text-sm"
                            >
                              {format(itemDate, "MMM d")}
                            </Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {format(itemDate, "EEEE")}
                            </span>
                          </div>
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs sm:text-sm">
                            Booked
                          </Badge>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2 p-2 bg-muted/30 rounded-md sm:rounded-lg"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs sm:text-sm font-medium text-foreground">
                                    {formatTime(session.session_date)}
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                                    ({session.duration_minutes} min)
                                  </span>
                                </div>
                                {session.mentee_name && (
                                  <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                                    <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {session.mentee_name}
                                    </span>
                                  </div>
                                )}
                                {session.session_type && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {session.session_type}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {getStatusBadge(session.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          }

          // Show availability slots for "all" or "available"
          if (filteredAvailability.length === 0) {
            return (
              <div className="text-center text-muted-foreground py-6 sm:py-8">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  No availability set for this month
                </p>
                <p className="text-xs sm:text-sm">
                  Click on calendar dates to add availability
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
              {filteredAvailability.map((item) => {
                const timeSlots = formatTimeSlots(item.time_slots);
                const itemDate = new Date(item.date);

                return (
                  <div
                    key={item.id}
                    className="border rounded-md sm:rounded-lg p-2.5 sm:p-3 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className="font-medium text-xs sm:text-sm"
                        >
                          {format(itemDate, "MMM d")}
                        </Badge>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {format(itemDate, "EEEE")}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          getStatusColor(
                            item.is_available ? "available" : "booked"
                          ),
                          "text-xs sm:text-sm"
                        )}
                      >
                        {item.is_available ? "Available" : "Booked"}
                      </Badge>
                    </div>

                    <div className="text-xs sm:text-sm text-foreground">
                      {timeSlots.length > 0 ? (
                        <div className="break-words">
                          {timeSlots.map((slot, index) => {
                            const startTime12 = to12(slot.startTime);
                            const endTime12 = to12(slot.endTime);
                            return (
                              <span key={index} className="text-xs sm:text-sm">
                                {startTime12} to {endTime12}
                                {index < timeSlots.length - 1 && ", "}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px] sm:text-xs">
                          No time slots
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
