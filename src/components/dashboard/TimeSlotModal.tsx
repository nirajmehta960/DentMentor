import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MetaLabel } from './dashboard-ui';

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

/* Portals to <body>, outside the AppShell: app theme tokens only. */
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
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl p-5 sm:p-7">
        <DialogHeader className="pr-8 text-left">
          <MetaLabel className="text-primary">Add time slots</MetaLabel>
          <DialogTitle className="font-display text-[1.375rem] font-semibold tracking-[-0.02em]">
            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
          <DialogDescription>
            Pick the start times you're free. Each one becomes a slot of the length you choose.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Duration Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="slot-duration" className="text-sm font-medium text-foreground">Slot length</label>
            <Select
              value={defaultDuration.toString()}
              onValueChange={(value) => setDefaultDuration(parseInt(value))}
            >
              <SelectTrigger id="slot-duration" className="w-36">
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
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <MetaLabel>
                  Selected <span className="tabular-nums">({selectedSlots.length})</span>
                </MetaLabel>
                <Button variant="ghost" size="sm" className="relative after:absolute after:-inset-1 after:content-['']" onClick={handleClear}>
                  Clear all
                </Button>
              </div>
              <ul className="flex flex-wrap gap-2">
                {selectedSlots.map((slot) => {
                  const [startTime, endTime] = slot.time.split('-');
                  const label = `${formatTime12Hour(startTime)} – ${formatTime12Hour(endTime)}`;
                  return (
                    <li
                      key={slot.time}
                      className="inline-flex h-9 items-center gap-1 rounded-full bg-[rgb(15_112_93/0.08)] pl-3 pr-1 text-[0.8125rem] font-medium text-primary tabular-nums ring-1 ring-inset ring-[rgb(15_112_93/0.18)]"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.time)}
                        aria-label={`Remove ${label}`}
                        className="relative grid size-7 place-items-center rounded-full transition-colors after:absolute after:-inset-2 after:content-[''] hover:bg-[rgb(15_112_93/0.12)]"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Time Slot Grid */}
          <div className="flex flex-col gap-2.5">
            <MetaLabel>Start times</MetaLabel>
            <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto p-0.5 sm:grid-cols-4">
              {timeSlots.map((time) => {
                const selected = isSlotSelected(time);
                return (
                  <button
                    key={time}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTimeSlot(time)}
                    className={cn(
                      "h-11 rounded-[10px] border text-[0.875rem] font-medium tabular-nums transition-colors",
                      selected
                        ? "border-transparent bg-primary text-white"
                        : "bg-white text-foreground hover:bg-muted"
                    )}
                  >
                    {formatTime12Hour(time)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={selectedSlots.length === 0}>
              Save <span className="tabular-nums">{selectedSlots.length}</span> {selectedSlots.length === 1 ? 'slot' : 'slots'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
