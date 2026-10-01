import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { Calendar, CalendarCheck, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAvailability } from "@/hooks/useAvailability";
import { useBookedSessions } from "@/hooks/useBookedSessions";
import { useAuth } from "@/hooks/useAuth";
import { formatTime, cn } from "@/lib/utils";
import { DateLeaf, EmptyState, Segmented, StatusPill, hairline } from "./dashboard-ui";

interface MonthlyAvailabilityPanelProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

/** The rows `useAvailability` returns (its query result is typed `unknown`). */
type AvailabilityRow = { id: string; date: string; time_slots: any; is_available: boolean };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
] as const;

/** One date's group: a leaf, the weekday, a status, then its rows. */
function DayGroup({
  date,
  status,
  children,
}: {
  date: Date;
  status: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <DateLeaf date={date} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.9375rem] font-medium text-band-fg">
            {format(date, "EEEE")}
            {/* The date itself is only drawn in the aria-hidden DateLeaf. */}
            <span className="sr-only">, {format(date, "MMMM d")}</span>
          </p>
          {status}
        </div>
        {children}
      </div>
    </li>
  );
}

export function MonthlyAvailabilityPanel({
  currentMonth,
  onMonthChange,
}: MonthlyAvailabilityPanelProps) {
  const [filterType, setFilterType] = useState<"all" | "available" | "booked">(
    "all"
  );
  const { availability: availabilityData, isLoading, refetch } = useAvailability();
  const availability = availabilityData as AvailabilityRow[] | undefined;
  const { bookedSessions, isLoading: isLoadingSessions } =
    useBookedSessions(currentMonth);
  const { mentorProfile } = useAuth();

  // Get mentor timezone (default to user's browser timezone or UTC)
  const mentorTimezone = mentorProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

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

  // Helper function to parse date string correctly (avoid timezone shift)
  // Parse "YYYY-MM-DD" as local date components (not UTC)
  const parseDateString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Create date in local timezone (not UTC) to avoid day shifts
    return new Date(year, month - 1, day);
  };

  // Filter availability for current month
  const monthlyAvailability =
    availability?.filter((item) => {
      const itemDate = parseDateString(item.date);
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

  // Group booked sessions by date
  // Parse session_date (UTC timestamptz) and convert to mentor's timezone date
  const bookedSessionsByDate = bookedSessions.reduce((acc, session) => {
    // Parse UTC timestamp and convert to mentor's timezone for date grouping
    const sessionDate = new Date(session.session_date);
    // Format date in mentor's timezone
    const dateKey = sessionDate.toLocaleDateString('en-CA', {
      timeZone: mentorTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
    const sessionDate = new Date(session.session_date);
    // Convert to mentor's timezone for date grouping
    const dateKey = sessionDate.toLocaleDateString('en-CA', {
      timeZone: mentorTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    allDates.add(dateKey);
  });

  if (isLoading || isLoadingSessions) {
    return (
      <div aria-hidden="true" className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-band-fg/[0.04] motion-safe:animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Month navigation and filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented<"all" | "available" | "booked">
          label="Show"
          options={FILTERS}
          value={filterType}
          onChange={setFilterType}
        />
        <div className="flex items-center justify-between gap-1 sm:justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            aria-label="Previous month"
            className="size-11"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="min-w-[8.5rem] text-center text-[0.875rem] font-medium text-band-fg" aria-live="polite">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            aria-label="Next month"
            className="size-11"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div>
        {(() => {
          // Show booked sessions when filter is "booked"
          if (filterType === "booked") {
            if (bookedSessions.length === 0) {
              return (
                <EmptyState icon={CalendarCheck} className="py-10">
                  No booked sessions this month. Bookings appear here once mentees pick a slot.
                </EmptyState>
              );
            }
            return (
              <ul className="divide-y divide-[#E3ECEA]">
                {Object.entries(bookedSessionsByDate)
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([dateKey, sessions]) => {
                    const itemDate = parseDateString(dateKey);
                    return (
                      <DayGroup
                        key={dateKey}
                        date={itemDate}
                        status={<StatusPill tone="ink">Booked</StatusPill>}
                      >
                        <ul className="flex flex-col gap-2">
                          {sessions.map((session) => {
                            // Format session time in mentor's timezone
                            const sessionDate = new Date(session.session_date);
                            const sessionTimeStr = sessionDate.toLocaleTimeString('en-US', {
                              timeZone: mentorTimezone,
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            });

                            return (
                            <li
                              key={session.id}
                              className="flex flex-col gap-2 rounded-tile border px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between"
                              style={hairline}
                            >
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="flex flex-wrap items-center gap-1.5 text-[0.875rem] font-medium text-band-fg tabular-nums">
                                  <Clock className="size-3.5 shrink-0 text-band-faint" aria-hidden="true" />
                                  {sessionTimeStr}
                                  <span className="text-[0.8125rem] font-normal text-band-muted">
                                    · {session.duration_minutes} min
                                  </span>
                                </p>
                                {session.mentee_name && (
                                  <p className="flex items-center gap-1.5 text-[0.8125rem] text-band-muted">
                                    <User className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span className="truncate">
                                      {session.mentee_name}
                                    </span>
                                  </p>
                                )}
                                {session.session_type && (
                                  <p className="text-[0.8125rem] text-band-muted">
                                    {session.session_type}
                                  </p>
                                )}
                              </div>
                              <StatusPill status={session.status} />
                            </li>
                            );
                          })}
                        </ul>
                      </DayGroup>
                    );
                  })}
              </ul>
            );
          }

          // Show availability slots for "all" or "available"
          if (filteredAvailability.length === 0) {
            return (
              <EmptyState icon={Calendar} className="py-10">
                No availability set for this month. Pick a date on the calendar to add slots.
              </EmptyState>
            );
          }

          return (
            <ul className="divide-y divide-[#E3ECEA]">
              {filteredAvailability.map((item) => {
                const timeSlots = formatTimeSlots(item.time_slots);
                const itemDate = parseDateString(item.date);

                return (
                  <DayGroup
                    key={item.id}
                    date={itemDate}
                    status={
                      <StatusPill tone={item.is_available ? "teal" : "ink"}>
                        {item.is_available ? "Available" : "Booked"}
                      </StatusPill>
                    }
                  >
                    {timeSlots.length > 0 ? (
                      <ul className="flex flex-wrap gap-1.5" aria-label="Time slots">
                        {timeSlots.map((slot, index) => {
                          const startTime12 = to12(slot.startTime);
                          const endTime12 = to12(slot.endTime);
                          return (
                            <li
                              key={index}
                              className={cn(
                                "inline-flex h-7 items-center rounded-pill border bg-white px-2.5 text-[0.8125rem] text-band-fg tabular-nums"
                              )}
                              style={hairline}
                            >
                              {startTime12} – {endTime12}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-[0.8125rem] text-band-muted">
                        No time slots
                      </p>
                    )}
                  </DayGroup>
                );
              })}
            </ul>
          );
        })()}
      </div>
    </div>
  );
}
