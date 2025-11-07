import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { TimezoneSelector } from "./TimezoneSelector";

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
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        "w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-center",
        isSelected
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "bg-background border border-border hover:border-primary hover:bg-primary/5 text-foreground",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
      title={isSlotPast ? "This time slot is in the past" : !slot.is_available ? "Slot not available" : undefined}
    >
      <div className="font-medium">{mentorTime}</div>
      {userTime && (
        <div className="text-xs opacity-75 mt-0.5">{userTime} (your time)</div>
      )}
    </button>
  );
};

const CalendarSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Loading availability...
            </span>
          </div>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-xl font-semibold text-foreground">Select a Date & Time</h3>
      </div>

      {/* Calendly-style layout: Calendar + Time slots side by side */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Calendar Section */}
        <div className="flex-1 bg-card rounded-xl border border-border/50 p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const slotCount = day.availableSlots;
              const isPast = isDateInPast(day.date);
              const isSelected = selectedDate === day.date;
              const hasAvailability = slotCount > 0;
              const isCurrentDay = day.isToday;

              if (!day.isCurrentMonth) {
                return <div key={day.date} className="aspect-square" />;
              }

              return (
                <button
                  key={day.date}
                  onClick={() => handleDateSelect(day)}
                  disabled={isPast || !hasAvailability}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                    isPast && "opacity-40 cursor-not-allowed",
                    !isPast && !hasAvailability && "opacity-40 cursor-not-allowed",
                    !isPast && hasAvailability && "cursor-pointer hover:bg-primary/10",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    isCurrentDay && !isSelected && "ring-2 ring-primary/50",
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {day.day}
                  </span>
                  {hasAvailability && !isPast && (
                    <div className={cn(
                      "absolute bottom-1 flex gap-0.5",
                      slotCount > 3 && "gap-0"
                    )}>
                      {Array.from({ length: Math.min(slotCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 h-1 rounded-full",
                            isSelected ? "bg-primary-foreground/70" : "bg-primary"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Timezone Selector */}
          <div className="mt-4 pt-4 border-t border-border/50">
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
        <div className="lg:w-64 xl:w-72 bg-card rounded-xl border border-border/50 p-4">
          {selectedDate && selectedDayAvailability ? (
            <div className="space-y-4 h-full">
              <div className="text-center pb-3 border-b border-border/50">
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const [y, m, d] = selectedDate.split('-').map(Number);
                    const localDate = new Date(y, m - 1, d);
                    return format(localDate, 'EEEE');
                  })()}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {(() => {
                    const [y, m, d] = selectedDate.split('-').map(Number);
                    const localDate = new Date(y, m - 1, d);
                    return format(localDate, 'MMMM d, yyyy');
                  })()}
                </p>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedDayAvailability.slots &&
                  selectedDayAvailability.slots.length > 0 ? (
                  (() => {
                    const { morning, afternoon, evening } = groupTimeSlotsByPeriod(
                      selectedDayAvailability.slots
                    );

                    return (
                      <>
                        {morning.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Morning
                            </p>
                            <div className="space-y-2">
                              {morning
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
                                      date={selectedDate}
                                      isPast={isPast}
                                    />
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {afternoon.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Afternoon
                            </p>
                            <div className="space-y-2">
                              {afternoon
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
                                      date={selectedDate}
                                      isPast={isPast}
                                    />
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {evening.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                              Evening
                            </p>
                            <div className="space-y-2">
                              {evening
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
                                      date={selectedDate}
                                      isPast={isPast}
                                    />
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No slots available</p>
                    <p className="text-xs mt-1">Please select another date</p>
                  </div>
                )}
              </div>
            </div>
          ) : selectedDate && !selectedDayAvailability ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">No available times</p>
              <p className="text-xs mt-1">Select another date</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
              <Clock className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-sm">Select a date</p>
              <p className="text-xs mt-1">to view available times</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
