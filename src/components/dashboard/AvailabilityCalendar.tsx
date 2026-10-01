import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isPast,
  isAfter,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeSlotModal } from "./TimeSlotModal";
import { MonthlyAvailabilityPanel } from "./MonthlyAvailabilityPanel";
import { useAvailability } from "@/hooks/useAvailability";
import { useAuth } from "@/hooks/useAuth";
import { TimezoneSelector } from "@/components/booking/TimezoneSelector";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { PanelHeader, WorkPanel, hairline } from "./dashboard-ui";

interface SelectedSlot {
  id: string;
  date: Date;
  time: string;
  duration: number;
}

const daysShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [pendingDates, setPendingDates] = useState<Date[]>([]);
  const [pendingSaved, setPendingSaved] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  // Local state for timezone to avoid full dashboard re-render
  const [localTimezone, setLocalTimezone] = useState<string | null>(null);
  const { availability, isLoading, updateAvailability, isUpdating, refetch } =
    useAvailability();
  const { mentorProfile, updateMentorProfile } = useAuth();
  const { toast } = useToast();

  // Get mentor timezone - use local state if set, otherwise from profile, then browser, then UTC
  const mentorTimezone = localTimezone || mentorProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Update local timezone when mentorProfile changes (on mount or after refresh)
  useEffect(() => {
    if (mentorProfile?.timezone && !localTimezone) {
      setLocalTimezone(mentorProfile.timezone);
    }
  }, [mentorProfile?.timezone, localTimezone]);

  // Handle timezone change
  const handleTimezoneChange = async (newTimezone: string) => {
    if (!mentorProfile) return;

    // Update local state immediately for UI responsiveness (no page refresh needed)
    setLocalTimezone(newTimezone);

    // Update database without updating context (prevents dashboard re-render)
    const result = await updateMentorProfile({ timezone: newTimezone }, false);

    if (result.success) {
      toast({
        title: "Timezone updated",
        description: `Your timezone has been updated to ${newTimezone}.`,
      });
      // Refetch availability to update displayed dates if needed
      await refetch();
    } else {
      // Revert local state if update failed
      setLocalTimezone(mentorProfile.timezone || null);
      toast({
        title: "Failed to update timezone",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const availableDates =
    (availability as { date: string }[] | undefined)?.map((a) => {
      const dateStr = a.date;
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date;
    }) || [];

  const fromMonth = startOfMonth(new Date());
  const twoMonthsFromNow = addMonths(new Date(), 2);
  const toMonth = endOfMonth(addMonths(new Date(), 1));

  const markedDates = [...availableDates, ...pendingDates];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isPast(date) || isAfter(date, twoMonthsFromNow)) return;

    setSelectedDate(date);
    setShowTimeSlotModal(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowTimeSlotModal(open);
    if (!open) {
      setSelectedDate(undefined);
    }
  };

  const handleSaveTimeSlots = async (
    slots: { time: string; duration: number }[]
  ) => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Convert slots to the format expected by updateAvailability
    // Format: "14:30-15:00:30" (start-end:duration)
    const timeSlotStrings = slots.map((slot) => {
      const [startTime, endTime] = slot.time.split("-");
      return `${startTime}-${endTime}:${slot.duration}`;
    });

    // Immediately save to database
    try {
      await updateAvailability(dateStr, timeSlotStrings);

      // Update local state for UI feedback
      const newSlots: SelectedSlot[] = slots.map((slot) => ({
        id: `${selectedDate.toISOString()}-${slot.time}-${slot.duration}`,
        date: selectedDate,
        time: slot.time,
        duration: slot.duration,
      }));

      setSelectedSlots((prev) => [...prev, ...newSlots]);
      setPendingDates((prev) => {
        if (!prev.some((d) => isSameDay(d, selectedDate))) {
          return [...prev, selectedDate];
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to save availability:", error);
    }

    setShowTimeSlotModal(false);
    setSelectedDate(undefined);
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newMonth = addMonths(prev, direction);
      return newMonth;
    });
  };

  const renderGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const cells = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(-1)}
            disabled={currentMonth <= fromMonth}
            aria-label="Previous month"
            className="size-11"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <h3 className="flex-1 text-center font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-band-fg" aria-live="polite">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(1)}
            disabled={currentMonth >= toMonth}
            aria-label="Next month"
            className="size-11"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {daysShort.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-band-faint"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((date, idx) => {
            if (!date) return <div key={`e-${idx}`} className="aspect-square" />;

            const isDisabled = isPast(date) || isAfter(date, twoMonthsFromNow);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isMarked = markedDates.some((d) => isSameDay(d, date));
            const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => handleDateSelect(date)}
                disabled={isDisabled}
                aria-pressed={isSelected || undefined}
                className={cn(
                  "relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-[0.875rem] font-medium tabular-nums transition-colors",
                  isSelected && "bg-band-signal text-white",
                  isMarked && !isSelected && "bg-[rgb(15_112_93/0.08)] font-semibold text-band-signal ring-1 ring-inset ring-[rgb(15_112_93/0.24)]",
                  !isSelected && !isMarked && "text-band-fg",
                  isOutsideMonth && !isSelected && "opacity-50",
                  isDisabled
                    ? "cursor-not-allowed text-band-faint opacity-40"
                    : !isSelected && "cursor-pointer hover:bg-band-fg/[0.05]"
                )}
                aria-label={`${format(date, "PPP")}${isMarked ? ", has availability" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const editSlot = (id: string) => {
    const slot = selectedSlots.find((s) => s.id === id);
    if (slot) {
      setSelectedDate(slot.date);
      setShowTimeSlotModal(true);
    }
  };

  const deleteSlot = (id: string) => {
    setSelectedSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const saveAllSlots = async () => {
    try {
      const slotsByDate = selectedSlots.reduce((acc, slot) => {
        const dateStr = format(slot.date, "yyyy-MM-dd");
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(`${slot.time}:${slot.duration}`);
        return acc;
      }, {} as Record<string, string[]>);

      for (const [date, timeSlots] of Object.entries(slotsByDate)) {
        await updateAvailability(date, timeSlots);
      }

      setSelectedSlots([]);
      setPendingDates([]);
    } catch (error) {
      // Silently handle error
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <WorkPanel key={i} aria-hidden="true">
            <div className="flex items-center gap-3 border-b px-5 py-4 sm:px-6" style={hairline}>
              <span className="size-10 rounded-tile bg-band-fg/[0.05] motion-safe:animate-pulse" />
              <span className="h-4 w-40 rounded bg-band-fg/[0.06] motion-safe:animate-pulse" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="h-72 rounded-xl bg-band-fg/[0.04] motion-safe:animate-pulse" />
            </div>
          </WorkPanel>
        ))}
        <span className="sr-only" role="status">Loading availability</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {/* Main Calendar Panel */}
      <WorkPanel className="flex flex-col">
        <PanelHeader
          icon={CalendarIcon}
          title="Calendar"
          description="Choose a date in the next two months to add slots"
        >
          <div className="w-full sm:max-w-[320px]">
            <p className="label mb-1.5 text-band-muted">Your timezone</p>
            <TimezoneSelector
              selectedTimezone={mentorTimezone}
              onTimezoneChange={handleTimezoneChange}
              showLabel={false}
            />
          </div>
        </PanelHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
          {/* Calendar */}
          <div className="mx-auto w-full max-w-[26rem]">
            {renderGrid()}
          </div>

          {/* Legend */}
          <div
            className="mt-auto flex flex-wrap items-center justify-center gap-5 border-t pt-4 text-[0.8125rem] text-band-muted"
            style={hairline}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="size-3.5 rounded-full bg-[rgb(15_112_93/0.08)] ring-1 ring-inset ring-[rgb(15_112_93/0.24)]" />
              <span>Has availability</span>
            </div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="size-3.5 rounded-full bg-band-signal" />
              <span>Selected</span>
            </div>
          </div>
        </div>
      </WorkPanel>

      {/* Your Availability Panel */}
      <WorkPanel className="flex flex-col">
        <PanelHeader
          icon={Clock}
          title="Your availability"
          description="Open slots and booked sessions by month"
          actions={
            <Button
              variant="ghost"
              size="sm"
              className="h-10"
              onClick={async () => {
                await refetch();
              }}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sr-only sm:hidden">Refresh availability</span>
            </Button>
          }
        />

        <div className="flex-1 px-4 py-5 sm:px-6 lg:max-h-[40rem] lg:overflow-y-auto">
          <MonthlyAvailabilityPanel
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
      </WorkPanel>

      <TimeSlotModal
        open={showTimeSlotModal}
        onOpenChange={handleModalOpenChange}
        selectedDate={selectedDate || null}
        onSaveSlots={handleSaveTimeSlots}
      />
    </div>
  );
}
