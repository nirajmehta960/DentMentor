import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, X } from 'lucide-react';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  duration: number;
  selected: boolean;
}

interface TimeSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSaveSlots: (slots: { time: string; duration: number }[]) => void;
  existingSlots?: { time: string; duration: number }[];
}

export function TimeSlotModal({ 
  open, 
  onOpenChange, 
  selectedDate, 
  onSaveSlots,
  existingSlots = []
}: TimeSlotModalProps) {
  const [defaultDuration, setDefaultDuration] = useState<number>(30);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  // Generate time slots from 08:00 to 22:00 in 30-minute intervals
  const generateTimeSlots = (): string[] => {
    const slots = [] as string[];
    for (let hour = 8; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const formatTime12Hour = (time24: string): string => {
    const [hourStr, minuteStr] = time24.split(':');
    const hour = Number(hourStr);
    const minute = Number(minuteStr);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const toggleTimeSlot = (time: string) => {
    const endTime = calculateEndTime(time, defaultDuration);
    const timeRange = `${time}-${endTime}`;
    
    setSelectedSlots(prev => {
      const existing = prev.find(slot => slot.time === timeRange);
      if (existing) {
        return prev.filter(slot => slot.time !== timeRange);
      } else {
        return [...prev, { time: timeRange, duration: defaultDuration, selected: true }];
      }
    });
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hour, minute] = startTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + duration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    // cap at 22:00
    const cappedHour = Math.min(endHour, 22);
    const cappedMinute = cappedHour === 22 ? 0 : endMinute;
    return `${cappedHour.toString().padStart(2, '0')}:${cappedMinute.toString().padStart(2, '0')}`;
  };

  const isSlotSelected = (time: string): boolean => {
    const endTime = calculateEndTime(time, defaultDuration);
    const timeRange = `${time}-${endTime}`;
    return selectedSlots.some(slot => slot.time === timeRange);
  };

  const handleSave = () => {
    onSaveSlots(selectedSlots);
    setSelectedSlots([]);
    onOpenChange(false);
  };

  const handleClear = () => {
    setSelectedSlots([]);
  };

  const removeSlot = (timeToRemove: string) => {
    setSelectedSlots(prev => prev.filter(slot => slot.time !== timeToRemove));
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Select Time Slots for {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Duration Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Default Duration:</label>
            <Select 
              value={defaultDuration.toString()} 
              onValueChange={(value) => setDefaultDuration(parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Slots Summary */}
          {selectedSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Selected Slots ({selectedSlots.length})</h3>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSlots.map((slot) => {
                  const [startTime, endTime] = slot.time.split('-');
                  return (
                    <Badge key={slot.time} variant="default" className="flex items-center gap-1">
                      {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)}
                      <button
                        onClick={() => removeSlot(slot.time)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time Slot Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Available Time Slots</h3>
            <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={isSlotSelected(time) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTimeSlot(time)}
                  className="text-xs transition-colors"
                >
                  {formatTime12Hour(time)}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={selectedSlots.length === 0}>
              Save Slots ({selectedSlots.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}