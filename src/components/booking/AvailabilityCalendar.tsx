import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  fetchMentorAvailability,
  type NewAvailabilityResponse,
  type DateAvailability,
  type TimeSlotData,
} from "@/lib/api/booking";
import { type Service } from "@/lib/supabase/booking";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LABEL } from "@/components/mentors/mentor-display";
import { TimezoneSelector } from "./TimezoneSelector";
import { StepHeading } from "./booking-ui";

interface AvailabilityCalendarProps {
  mentorId: string;
  selectedService: Service;
  onDateTimeSelect: (date: string, time: string) => void;
  selectedDate: string | null;
  selectedTime: string | null;
  mentorName: string;
  mentorTimezone?: string;
  bookedSlots?: Set<string>; // Set of "date-time" strings to mark as booked
  onMenteeTimezoneChange?: (timezone: string) => void;
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  availability: DateAvailability | null;
  availableSlots: number;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TimeSlotButton: React.FC<{
  slot: TimeSlotData;
  isSelected: boolean;
  onSelect: () => void;
  mentorTimezone: string;
  userTimezone: string;
  date: string;
  isPast: boolean;
}> = ({ slot, isSelected, onSelect, mentorTimezone, userTimezone, date, isPast }) => {
  const formatTime = (time: string, timezone: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
    } catch {
      return time;
    }
  };

  const mentorTime = formatTime(slot.start_time, mentorTimezone);
  const userTime =
    mentorTimezone !== userTimezone
      ? formatTime(slot.start_time, userTimezone)
      : null;

  // Check if this specific slot time is in the past
  const isSlotPast = isPast || (() => {
    try {
      const [hours, minutes] = slot.start_time.split(":");
      const slotDateTime = new Date(`${date}T${hours}:${minutes}:00`);
      const now = new Date();
      return slotDateTime <= now;
    } catch {
      return false;
    }
  })();

  const isDisabled = !slot.is_available || isSlotPast;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      className={cn(
        "flex min-h-11 w-full flex-col items-center justify-center rounded-full border px-4 py-2 text-center text-sm font-medium tabular-nums transition-[background-color,border-color,color] duration-200 ease-dm",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-foreground hover:border-primary hover:text-primary",
        isDisabled && "cursor-not-allowed opacity-40 hover:border-border hover:text-foreground"
      )}
      title={isSlotPast ? "This time slot is in the past" : !slot.is_available ? "Slot not available" : undefined}
    >
      <span className="leading-tight">{mentorTime}</span>
      {userTime && (
        <span className={cn("mt-0.5 text-xs leading-tight", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {userTime} (your time)
        </span>
      )}
    </button>
  );
};

const CalendarSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 lg:flex-row" aria-hidden="true">
    <div className="flex-1 rounded-xl border border-border p-3 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-1">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-full" />
        ))}
      </div>
    </div>
    <div className="rounded-xl border border-border p-4 lg:w-72">
      <Skeleton className="mx-auto mb-4 h-5 w-32" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  mentorId,
  selectedService,
  onDateTimeSelect,
  selectedDate,
  selectedTime,
  mentorName,
  mentorTimezone = "UTC",
  bookedSlots = new Set(),
  onMenteeTimezoneChange,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<{
    [date: string]: DateAvailability;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Notify parent of initial timezone
    if (onMenteeTimezoneChange) {
      setTimeout(() => onMenteeTimezoneChange(tz), 0);
    }
    return tz;
  });
  const { toast } = useToast();

  // Load availability when month changes
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const monthString = `${year}-${month}`;

        const response: NewAvailabilityResponse = await fetchMentorAvailability(
          mentorId,
          monthString
        );

        if (response.success) {
          setAvailability(response.availability);
          setUserTimezone(response.user_timezone);
        } else {
          setError(response.error || "Failed to load availability");
          toast({
            title: "Error loading availability",
            description: response.error || "Please try again later.",
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load availability";
        setError(errorMessage);
        toast({
          title: "Error loading availability",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (mentorId) {
      loadAvailability();
    }
  }, [mentorId, currentDate, toast]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateString = format(date, "yyyy-MM-dd");
      const dayAvailability = availability[dateString] || null;
      const availableSlots =
        dayAvailability?.slots?.filter((slot) => slot.is_available).length || 0;

      days.push({
        date: dateString,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate === dateString,
        availability: dayAvailability,
        availableSlots,
      });
    }

    return days;
  }, [currentDate, availability, selectedDate]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  }, [currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getSlotCount = (dateString: string) => {
    const dayAvailability = availability[dateString];
    if (!dayAvailability) return 0;
    return dayAvailability.slots?.filter((slot) => slot.is_available).length || 0;
  };

  const isDateInPast = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (!day.isCurrentMonth || !day.availability || day.availableSlots === 0)
      return;

    // If selecting a new date, clear selected time
    if (selectedDate !== day.date) {
      onDateTimeSelect(day.date, "");
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate && time) {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        return;
      }
      onDateTimeSelect(selectedDate, time);
    }
  };

  const selectedDayAvailability = selectedDate
    ? availability[selectedDate]
    : null;

  const groupTimeSlotsByPeriod = (timeSlots: TimeSlotData[]) => {
    const morning: TimeSlotData[] = [];
    const afternoon: TimeSlotData[] = [];
    const evening: TimeSlotData[] = [];

    timeSlots.forEach((slot) => {
      if (!slot.start_time) return; // Skip slots without start_time

      const timeParts = slot.start_time.split(":");
      if (timeParts.length < 2) return; // Skip invalid time format

      const hour = parseInt(timeParts[0]);
      if (isNaN(hour)) return; // Skip if hour is not a valid number

      if (hour < 12) morning.push(slot);
      else if (hour < 18) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  };

  const formatDay = (dateString: string, pattern: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    return format(new Date(y, m - 1, d), pattern);
  };

  const renderPeriod = (label: string, slots: TimeSlotData[]) => {
    if (slots.length === 0) return null;
    return (
      <div>
        <p className={cn(LABEL, "mb-2 text-muted-foreground")}>{label}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {slots
            .filter(slot => slot.is_available) // Only show available slots
            .map((slot, index) => {
              const isPast = (() => {
                try {
                  const [hours, minutes] = slot.start_time.split(":");
                  const slotDateTime = new Date(`${selectedDate}T${hours}:${minutes}:00`);
                  return slotDateTime <= new Date();
                } catch {
                  return false;
                }
              })();
              return (
                <TimeSlotButton
                  key={index}
                  slot={slot}
                  isSelected={selectedTime === slot.start_time}
                  onSelect={() => handleTimeSelect(slot.start_time)}
                  mentorTimezone={mentorTimezone}
                  userTimezone={userTimezone}
                  date={selectedDate as string}
                  isPast={isPast}
                />
              );
            })}
        </div>
      </div>
    );
  };

  const emptySlots = (title: string, hint: string) => (
    <div className="flex h-full flex-col items-center justify-center gap-1 py-8 text-center">
      <CalendarDays className="mb-2 size-8 text-muted-foreground/60" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );

  const heading = (
    <StepHeading
      step="Step 2 of 3"
      title="Pick a date & time"
      description={`Choose a day with open times, then a start time with ${mentorName}.`}
    />
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {heading}
        <p className="sr-only" role="status">Loading availability…</p>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {heading}

      {/* Calendar + time slots side by side */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Calendar Section */}
        <div className="min-w-0 flex-1 rounded-xl border border-border bg-white p-2 sm:p-5">
          {/* Month Navigation */}
          <div className="mb-2 flex items-center justify-between gap-2 pl-2 sm:pl-1">
            <h4 className="text-base font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                aria-label="Previous month"
                className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigateMonth("next")}
                aria-label="Next month"
                className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="mb-1 grid grid-cols-7 gap-0.5 sm:gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className={cn(LABEL, "py-2 text-center text-muted-foreground")}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calendarDays.map((day) => {
              const slotCount = day.availableSlots;
              const isPast = isDateInPast(day.date);
              const isSelected = selectedDate === day.date;
              const hasAvailability = slotCount > 0;
              const isCurrentDay = day.isToday;
              const isOpen = hasAvailability && !isPast;

              if (!day.isCurrentMonth) {
                return <div key={day.date} className="aspect-square" />;
              }

              return (
                <button
                  type="button"
                  key={day.date}
                  onClick={() => handleDateSelect(day)}
                  disabled={isPast || !hasAvailability}
                  aria-pressed={isSelected}
                  aria-label={`${formatDay(day.date, 'EEEE, MMMM d')}${isOpen ? `, ${slotCount} open times` : ', no open times'}`}
                  className={cn(
                    "relative flex aspect-square items-center justify-center rounded-full text-sm tabular-nums transition-colors duration-200",
                    !isOpen && "cursor-not-allowed text-muted-foreground/50",
                    isOpen && !isSelected && "font-semibold text-foreground hover:bg-[rgb(15_112_93/0.08)]",
                    isSelected && "bg-primary font-semibold text-primary-foreground",
                    isCurrentDay && !isSelected && "ring-1 ring-inset ring-primary/40",
                  )}
                >
                  <span>{day.day}</span>
                  {isOpen && (
                    <span aria-hidden="true" className="absolute bottom-[16%] flex gap-0.5">
                      {Array.from({ length: Math.min(slotCount, 3) }).map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "size-1 rounded-full",
                            isSelected ? "bg-primary-foreground/70" : "bg-primary"
                          )}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timezone Selector */}
          <div className="mt-4 border-t border-border px-1 pt-4 sm:px-0">
            <TimezoneSelector
              selectedTimezone={userTimezone}
              onTimezoneChange={(tz) => {
                setUserTimezone(tz);
                onMenteeTimezoneChange?.(tz);
              }}
            />
          </div>
        </div>

        {/* Time Slots Section - Side panel */}
        <div className="rounded-xl border border-border bg-white p-4 lg:w-72 lg:shrink-0">
          {selectedDate && selectedDayAvailability ? (
            <div className="flex h-full flex-col gap-4">
              <div className="border-b border-border pb-3 text-center">
                <p className={cn(LABEL, "text-muted-foreground")}>{formatDay(selectedDate, 'EEEE')}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {formatDay(selectedDate, 'MMMM d, yyyy')}
                </p>
              </div>

              <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
                {selectedDayAvailability.slots &&
                  selectedDayAvailability.slots.length > 0 ? (
                  (() => {
                    const { morning, afternoon, evening } = groupTimeSlotsByPeriod(
                      selectedDayAvailability.slots
                    );

                    return (
                      <>
                        {renderPeriod("Morning", morning)}
                        {renderPeriod("Afternoon", afternoon)}
                        {renderPeriod("Evening", evening)}
                      </>
                    );
                  })()
                ) : (
                  emptySlots("No slots available", "Please select another date")
                )}
              </div>
            </div>
          ) : selectedDate && !selectedDayAvailability ? (
            emptySlots("No available times", "Select another date")
          ) : (
            emptySlots("Select a date", "to view available times")
          )}
        </div>
      </div>
    </div>
  );
};
