import React, { useState } from "react";
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
  const { availability, isLoading, updateAvailability, isUpdating, refetch } =
    useAvailability();

  const availableDates =
    availability?.map((a) => {
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
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(-1)}
            disabled={currentMonth <= fromMonth}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <h3 className="text-base sm:text-lg font-semibold text-center flex-1">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(1)}
            disabled={currentMonth >= toMonth}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
          {daysShort.map((day) => (
            <div
              key={day}
              className="text-center text-xs sm:text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
          {cells.map((date, idx) => {
            if (!date) return <div key={`e-${idx}`} className="h-8 sm:h-10" />;

            const isDisabled = isPast(date) || isAfter(date, twoMonthsFromNow);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isMarked = markedDates.some((d) => isSameDay(d, date));
            const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                disabled={isDisabled}
                className={
                  `relative mx-auto h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full transition-colors text-xs sm:text-sm ` +
                  `${isSelected ? "bg-primary text-primary-foreground" : ""} ` +
                  `${
                    isMarked && !isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : ""
                  } ` +
                  `${
                    isOutsideMonth ? "text-muted-foreground opacity-50" : ""
                  } ` +
                  `${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:bg-primary/10"
                  }`
                }
                aria-label={format(date, "PPP")}
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
      <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 animate-pulse"></div>
            <div className="h-5 sm:h-6 w-32 sm:w-40 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="p-4 sm:p-5 md:p-6">
          <div className="animate-pulse h-64 sm:h-72 bg-muted rounded-lg sm:rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Calendar Card */}
      <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Availability Calendar
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Set your available time slots
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Calendar */}
          <div className="flex justify-center mb-4 sm:mb-6 overflow-x-auto">
            <div className="rounded-lg sm:rounded-xl border border-border/50 p-2 sm:p-3 md:p-4 pointer-events-auto min-w-0">
              {renderGrid()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 py-3 sm:py-4 border-t border-border/50">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary/10 border border-primary/20"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-amber-500/20 border border-amber-500/30"></div>
              <span className="hidden sm:inline">Partially booked</span>
              <span className="sm:hidden">Partial</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-primary"></div>
              <span>Selected</span>
            </div>
          </div>

          {/* Quick tip */}
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/30 border border-border/50">
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Click on
              any date to add or edit your available time slots. You can set
              availability up to 2 months in advance.
            </p>
          </div>
        </div>
      </div>

      {/* Your Availability Panel */}
      <div className="rounded-xl sm:rounded-2xl bg-card border border-border/50 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 md:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  Your Availability
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upcoming time slots
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={async () => {
                await refetch();
              }}
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6">
          <MonthlyAvailabilityPanel
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
      </div>

      <TimeSlotModal
        open={showTimeSlotModal}
        onOpenChange={handleModalOpenChange}
        selectedDate={selectedDate || null}
        onSaveSlots={handleSaveTimeSlots}
      />
    </div>
  );
}
