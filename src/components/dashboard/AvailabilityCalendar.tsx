import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Plus } from 'lucide-react';
import { useAvailability } from '@/hooks/useAvailability';
import { SlotsSummaryCard } from './SlotsSummaryCard';
import { MonthlyAvailabilityPanel } from './MonthlyAvailabilityPanel';
import { TimeSlotModal } from './TimeSlotModal';
import { addDays, addMonths, format, isSameDay, isPast, isAfter, startOfMonth, endOfMonth } from 'date-fns';

interface SelectedSlot {
  id: string;
  date: Date;
  time: string;
  duration: number;
}

export function AvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { availability, isLoading, updateAvailability } = useAvailability();
  
  const availableDates = availability?.map(a => new Date(a.date)) || [];
  const twoMonthsFromNow = addMonths(new Date(), 2);
  
  const selectedDateAvailability = selectedDate 
    ? availability?.find(a => isSameDay(new Date(a.date), selectedDate))
    : null;

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || isPast(date) || isAfter(date, twoMonthsFromNow)) return;
    setSelectedDate(date);
    setShowTimeSlotModal(true);
  };

  const handleSaveTimeSlots = async (slots: { time: string; duration: number }[]) => {
    if (!selectedDate) return;
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const formattedSlots = slots.map(slot => `${slot.time}:${slot.duration}`);
      
      await updateAvailability(dateStr, formattedSlots);
      
      // Update selected slots for display
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
      // Group slots by date
      const slotsByDate = selectedSlots.reduce((acc, slot) => {
        const dateStr = format(slot.date, 'yyyy-MM-dd');
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(`${slot.time}:${slot.duration}`);
        return acc;
      }, {} as Record<string, string[]>);

      // Save each date's availability
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
        </div>
        <div>
          <div className="animate-pulse">
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Availability Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border w-full"
              disabled={(date) => isPast(date) || isAfter(date, twoMonthsFromNow)}
              modifiers={{
                available: availableDates,
                partiallyBooked: [], // Add logic for partially booked dates
                selected: selectedSlots.map(slot => slot.date)
              }}
              modifiersStyles={{
                available: { 
                  backgroundColor: 'hsl(var(--primary) / 0.1)', 
                  color: 'hsl(var(--primary))',
                  fontWeight: '600'
                },
                partiallyBooked: { 
                  backgroundColor: 'hsl(32 95% 44% / 0.1)', 
                  color: 'hsl(32 95% 44%)',
                  fontWeight: '600'
                },
                selected: { 
                  backgroundColor: 'hsl(217 91% 60% / 0.2)', 
                  color: 'hsl(217 91% 60%)',
                  fontWeight: '600'
                }
              }}
            />
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <span className="inline-block w-3 h-3 bg-primary/20 rounded mr-2"></span>Available slots</p>
              <p>• <span className="inline-block w-3 h-3 bg-orange-200 rounded mr-2"></span>Partially booked</p>
              <p>• <span className="inline-block w-3 h-3 bg-blue-200 rounded mr-2"></span>Selected for editing</p>
              <p>• Click on any date to add or edit availability</p>
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Modal */}
        <TimeSlotModal
          open={showTimeSlotModal}
          onOpenChange={setShowTimeSlotModal}
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

      {/* Monthly Availability Panel */}
      <div>
        <MonthlyAvailabilityPanel
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />
      </div>
    </div>
  );
}