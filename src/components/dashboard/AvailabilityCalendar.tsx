import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAvailability } from '@/hooks/useAvailability';
import { SlotsSummaryCard } from './SlotsSummaryCard';
import { TimeSlotModal } from './TimeSlotModal';
import { addMonths, subMonths, format, isSameDay, isPast, isAfter, startOfMonth, endOfMonth, getDaysInMonth, getDay } from 'date-fns';

interface SelectedSlot {
  id: string;
  date: Date;
  time: string;
  duration: number;
}

const daysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [pendingDates, setPendingDates] = useState<Date[]>([]);
  const [pendingSaved, setPendingSaved] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
  const { availability, isLoading, updateAvailability } = useAvailability();
  
  const availableDates = availability?.map(a => new Date(a.date)) || [];
  const fromMonth = startOfMonth(new Date());
  const toMonth = endOfMonth(addMonths(new Date(), 1));

  const markedDates = [...availableDates, ...pendingDates];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isPast(date) || isAfter(date, toMonth)) return;
    setSelectedDate(date);
    setPendingSaved(false);
    setPendingDates(prev => {
      const exists = prev.some(d => isSameDay(d, date));
      return exists ? prev : [...prev, date];
    });
    setShowTimeSlotModal(true);
  };

  const handleSaveTimeSlots = async (slots: { time: string; duration: number }[]) => {
    if (!selectedDate) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const formattedSlots = slots.map(slot => `${slot.time}:${slot.duration}`);
      await updateAvailability(dateStr, formattedSlots);
      setPendingSaved(true);
      setPendingDates(prev => prev.filter(d => !isSameDay(d, selectedDate)));
      const newSlots = slots.map((slot, index) => ({
        id: `${dateStr}-${slot.time}-${slot.duration}-${index}`,
        date: selectedDate,
        time: slot.time,
        duration: slot.duration,
      }));
      setSelectedSlots(prev => [...prev, ...newSlots]);
    } catch (error) {
      console.error('Error saving time slots:', error);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowTimeSlotModal(open);
    if (!open && selectedDate && !pendingSaved) {
      setPendingDates(prev => prev.filter(d => !isSameDay(d, selectedDate)));
    }
  };

  const changeMonth = (delta: number) => {
    const next = delta > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
    if (next < fromMonth || next > toMonth) return;
    setCurrentMonth(next);
  };

  const renderGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const totalDays = getDaysInMonth(currentMonth);
    const startIndex = getDay(monthStart); // 0=Sun ... 6=Sat

    const cells: (Date | null)[] = [];
    // leading empty cells
    for (let i = 0; i < startIndex; i++) cells.push(null);
    // days
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
    }
    // trailing to complete rows to 7*n
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) cells.push(null);
    }

    return (
      <div className="space-y-4">
        {/* Header with month and arrows */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => changeMonth(-1)}
            className="h-9 w-9 rounded-xl border bg-white text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            disabled={startOfMonth(currentMonth) <= fromMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-xl font-semibold">{format(currentMonth, 'MMMM yyyy')}</div>
          <button
            onClick={() => changeMonth(1)}
            className="h-9 w-9 rounded-xl border bg-white text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            disabled={endOfMonth(currentMonth) >= toMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-foreground/70 px-2">
          {daysShort.map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-y-2">
          {cells.map((date, idx) => {
            if (!date) return <div key={`e-${idx}`} className="h-10" />;

            const isDisabled = isPast(date) || isAfter(date, toMonth);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isMarked = markedDates.some(d => isSameDay(d, date));
            const isOutsideMonth = date.getMonth() !== currentMonth.getMonth();

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                disabled={isDisabled}
                className={
                  `relative mx-auto h-10 w-10 flex items-center justify-center rounded-full transition-colors ` +
                  `${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'} ` +
                  `${isOutsideMonth ? 'text-muted-foreground opacity-50' : ''} ` +
                  `${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`
                }
                aria-label={format(date, 'PPP')}
              >
                {date.getDate()}
                {isMarked && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const editSlot = (id: string) => {
    const slot = selectedSlots.find(s => s.id === id);
    if (slot) {
      setSelectedDate(slot.date);
      setShowTimeSlotModal(true);
    }
  };

  const deleteSlot = (id: string) => {
    setSelectedSlots(prev => prev.filter(slot => slot.id !== id));
  };

  const saveAllSlots = async () => {
    try {
      const slotsByDate = selectedSlots.reduce((acc, slot) => {
        const dateStr = format(slot.date, 'yyyy-MM-dd');
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(`${slot.time}:${slot.duration}`);
        return acc;
      }, {} as Record<string, string[]>);

      for (const [dateStr, slots] of Object.entries(slotsByDate)) {
        await updateAvailability(dateStr, slots);
      }
      setSelectedSlots([]);
    } catch (error) {
      console.error('Error saving slots:', error);
    }
  };

  const clearAllSlots = () => {
    setSelectedSlots([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border p-6 bg-white max-w-md mx-auto">
            {renderGrid()}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Modal */}
      <TimeSlotModal
        open={showTimeSlotModal}
        onOpenChange={handleModalOpenChange}
        selectedDate={selectedDate || null}
        onSaveSlots={handleSaveTimeSlots}
      />
      
      {/* Selected Slots Summary */}
      <SlotsSummaryCard
        selectedSlots={selectedSlots}
        onEditSlot={editSlot}
        onDeleteSlot={deleteSlot}
        onSaveAll={saveAllSlots}
        onClearAll={clearAllSlots}
      />
    </div>
  );
}