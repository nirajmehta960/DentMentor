import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isPast, isAfter, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeSlotModal } from './TimeSlotModal';
import { useAvailability } from '@/hooks/useAvailability';

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
  const { availability, isLoading, updateAvailability, isUpdating } = useAvailability();
  
  const availableDates = availability?.map(a => {
    const dateStr = a.date;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date;
  }) || [];
  
  const fromMonth = startOfMonth(new Date());
  const toMonth = endOfMonth(addMonths(new Date(), 1));

  const markedDates = [...availableDates, ...pendingDates];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    if (isPast(date) || isAfter(date, toMonth)) return;
    
    setSelectedDate(date);
    setShowTimeSlotModal(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setShowTimeSlotModal(open);
    if (!open) {
      setSelectedDate(undefined);
    }
  };

  const handleSaveTimeSlots = (slots: { time: string; duration: number }[]) => {
    if (!selectedDate) return;
    
    const newSlots: SelectedSlot[] = slots.map(slot => ({
      id: `${selectedDate.toISOString()}-${slot.time}-${slot.duration}`,
      date: selectedDate,
      time: slot.time,
      duration: slot.duration
    }));
    
    setSelectedSlots(prev => [...prev, ...newSlots]);
    setPendingDates(prev => [...prev, selectedDate]);
    setShowTimeSlotModal(false);
    setSelectedDate(undefined);
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(prev => {
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(-1)}
            disabled={currentMonth <= fromMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(1)}
            disabled={currentMonth >= toMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-y-2">
          {daysShort.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

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
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Availability Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderGrid()}
        
        {selectedSlots.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">Selected Time Slots:</h4>
            {selectedSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">
                  {format(slot.date, 'MMM dd')} at {slot.time} ({slot.duration}min)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => editSlot(slot.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteSlot(slot.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            <Button 
              onClick={saveAllSlots} 
              className="w-full"
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save All Slots'}
            </Button>
          </div>
        )}
      </CardContent>

      <TimeSlotModal
        open={showTimeSlotModal}
        onOpenChange={handleModalOpenChange}
        selectedDate={selectedDate || null}
        onSaveSlots={handleSaveTimeSlots}
      />
    </Card>
  );
}
