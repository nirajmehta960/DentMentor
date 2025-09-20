import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Loader2, Calendar as CalendarIcon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { fetchMentorAvailability, type NewAvailabilityResponse, type DateAvailability, type TimeSlotData } from '@/lib/api/booking';
import { type Service } from '@/lib/supabase/booking';
import { getUserTimezone, formatTimeForDisplay } from '@/lib/utils/booking';

interface AvailabilityCalendarProps {
  mentorId: string;
  selectedService: Service;
  onDateTimeSelect: (date: string, time: string) => void;
  selectedDate: string | null;
  selectedTime: string | null;
  mentorName: string;
  mentorTimezone?: string;
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

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TimeSlotButton: React.FC<{
  slot: TimeSlotData;
  isSelected: boolean;
  onSelect: () => void;
  mentorTimezone: string;
  userTimezone: string;
}> = ({ slot, isSelected, onSelect, mentorTimezone, userTimezone }) => {
  const formatTime = (time: string, timezone: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone
      });
    } catch {
      return time;
    }
  };

  const mentorTime = formatTime(slot.start_time, mentorTimezone);
  const userTime = mentorTimezone !== userTimezone ? formatTime(slot.start_time, userTimezone) : null;

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className={`flex-col h-auto p-3 transition-all duration-200 ${isSelected
        ? 'bg-primary text-white shadow-md'
        : 'hover:bg-primary/5 hover:border-primary/50'
        } ${!slot.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onSelect}
      disabled={!slot.is_available}
    >
      <div className="font-medium">{mentorTime}</div>
      {userTime && (
        <div className="text-xs opacity-75">
          {userTime} (your time)
        </div>
      )}
    </Button>
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
  mentorTimezone = 'UTC'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<{ [date: string]: DateAvailability }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState('UTC');
  const { toast } = useToast();

  // Detect user timezone
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(detected);
    } catch {
      setUserTimezone('UTC');
    }
  }, []);

  // Load availability when month changes
  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const monthString = `${year}-${month}`;


        const response: NewAvailabilityResponse = await fetchMentorAvailability(mentorId, monthString);

        if (response.success) {
          setAvailability(response.availability);
          setUserTimezone(response.user_timezone);
        } else {
          setError(response.error || 'Failed to load availability');
          toast({
            title: "Error loading availability",
            description: response.error || 'Please try again later.',
            variant: "destructive"
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load availability';
        setError(errorMessage);
        toast({
          title: "Error loading availability",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (mentorId) {
      loadAvailability();
    }
  }, [mentorId, currentDate, toast]);

  const generateCalendarDays = (): CalendarDay[] => {
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

      const dateString = date.toISOString().split('T')[0];
      const dayAvailability = availability[dateString] || null;
      const availableSlots = dayAvailability?.slots?.filter(slot => slot.is_available).length || 0;

      days.push({
        date: dateString,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate === dateString,
        availability: dayAvailability,
        availableSlots
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (!day.isCurrentMonth || !day.availability || day.availableSlots === 0) return;

    // If selecting a new date, clear selected time
    if (selectedDate !== day.date) {
      onDateTimeSelect(day.date, '');
    }
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate && time) {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        console.error('Invalid time format:', time);
        return;
      }
      onDateTimeSelect(selectedDate, time);
    }
  };

  const getDateAvailabilityColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'text-gray-400';
    if (day.isSelected) return 'text-white font-semibold';
    if (day.isToday && day.availableSlots > 0) return 'text-emerald-800 font-bold';
    if (day.isToday) return 'text-gray-700 font-semibold';

    // Color based on availability level
    const totalPossibleSlots = 6;
    const availabilityRatio = day.availableSlots / totalPossibleSlots;

    if (availabilityRatio >= 0.8) return 'text-emerald-700 font-semibold hover:text-emerald-800';
    if (availabilityRatio >= 0.4) return 'text-teal-700 font-medium hover:text-teal-800';
    if (availabilityRatio > 0) return 'text-teal-600 hover:text-teal-700';

    return 'text-gray-400';
  };

  const getDateBackgroundColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'bg-gray-50';
    if (day.isSelected) return 'bg-teal-600 hover:bg-teal-700'; // Selected (dark teal)
    if (day.availableSlots === 0) return 'bg-gray-200 cursor-not-allowed'; // Unavailable (gray)

    // Available dates with different teal shades based on availability
    const totalPossibleSlots = 6; // Assuming max 6 slots per day
    const availabilityRatio = day.availableSlots / totalPossibleSlots;

    if (availabilityRatio >= 0.8) {
      return 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300'; // Fully available (light green)
    } else if (availabilityRatio >= 0.4) {
      return 'bg-teal-100 hover:bg-teal-200 border-teal-300'; // Partially booked (teal)
    } else if (availabilityRatio > 0) {
      return 'bg-teal-50 hover:bg-teal-100 border-teal-200'; // Few slots left (light teal)
    }

    return 'bg-gray-200'; // No availability
  };

  const getDateBorderColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'border-gray-200';
    if (day.isSelected) return 'border-teal-600';
    if (day.availableSlots === 0) return 'border-gray-300';

    const totalPossibleSlots = 6;
    const availabilityRatio = day.availableSlots / totalPossibleSlots;

    if (availabilityRatio >= 0.8) return 'border-emerald-300';
    if (availabilityRatio >= 0.4) return 'border-teal-300';
    if (availabilityRatio > 0) return 'border-teal-200';

    return 'border-gray-200';
  };

  const calendarDays = generateCalendarDays();
  const selectedDayAvailability = selectedDate ?
    availability[selectedDate] : null;

  const groupTimeSlotsByPeriod = (timeSlots: TimeSlotData[]) => {
    const morning: TimeSlotData[] = [];
    const afternoon: TimeSlotData[] = [];
    const evening: TimeSlotData[] = [];

    timeSlots.forEach(slot => {
      if (!slot.start_time) return; // Skip slots without start_time
      
      const timeParts = slot.start_time.split(':');
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
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading availability...</span>
          </div>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Select Date & Time</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{mentorName}'s timezone: {mentorTimezone}</span>
          </div>
          {userTimezone !== mentorTimezone && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Your timezone: {userTimezone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              className={`relative p-3 text-sm rounded-lg border-2 transition-all duration-200 ${getDateBackgroundColor(day)
                } ${getDateBorderColor(day)
                } ${day.isCurrentMonth && day.availableSlots > 0
                  ? 'cursor-pointer hover:shadow-md transform hover:scale-105'
                  : day.availableSlots === 0 ? 'cursor-not-allowed' : 'cursor-default'
                }`}
              onClick={() => handleDateSelect(day)}
              disabled={!day.isCurrentMonth || day.availableSlots === 0}
            >
              <div className={getDateAvailabilityColor(day)}>
                {day.day}
              </div>

              {/* Availability indicators */}
              {day.isCurrentMonth && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {day.availableSlots > 0 ? (
                    // Show dots indicating availability level
                    Array.from({ length: Math.min(3, Math.ceil(day.availableSlots / 2)) }).map((_, i) => {
                      const totalPossibleSlots = 6;
                      const availabilityRatio = day.availableSlots / totalPossibleSlots;
                      const dotColor = availabilityRatio >= 0.8 ? 'bg-emerald-500' :
                        availabilityRatio >= 0.4 ? 'bg-teal-500' : 'bg-teal-400';
                      return <div key={i} className={`w-1 h-1 ${dotColor} rounded-full`}></div>;
                    })
                  ) : (
                    // Show X for unavailable dates
                    <div className="w-2 h-2 text-gray-400 text-xs flex items-center justify-center">×</div>
                  )}
                </div>
              )}

              {/* Availability count badge for low availability dates */}
              {day.isCurrentMonth && day.availableSlots > 0 && day.availableSlots <= 2 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {day.availableSlots}
                </div>
              )}

              {/* Selection indicator */}
              {day.isSelected && (
                <div className="absolute -top-1 -right-1 bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Legend */}
        <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-emerald-100 border-2 border-emerald-300 rounded"></div>
            <span className="text-emerald-700 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-teal-100 border-2 border-teal-300 rounded"></div>
            <span className="text-teal-600">Partially booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-teal-600 border-2 border-teal-600 rounded relative">
              <div className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</div>
            </div>
            <span className="text-teal-700 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 border-2 border-gray-300 rounded relative">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">×</div>
            </div>
            <span className="text-gray-500">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && selectedDayAvailability && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Times</h3>

          {selectedDayAvailability.slots && selectedDayAvailability.slots.length > 0 ? (
            (() => {
              const { morning, afternoon, evening } = groupTimeSlotsByPeriod(
                selectedDayAvailability.slots
              );

              return (
                <div className="space-y-4">
                  {morning.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Morning (6AM - 12PM)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {morning.map((slot, index) => (
                          <TimeSlotButton
                            key={index}
                            slot={slot}
                            isSelected={selectedTime === slot.start_time}
                            onSelect={() => handleTimeSelect(slot.start_time)}
                            mentorTimezone={mentorTimezone}
                            userTimezone={userTimezone}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {afternoon.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Afternoon (12PM - 6PM)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {afternoon.map((slot, index) => (
                          <TimeSlotButton
                            key={index}
                            slot={slot}
                            isSelected={selectedTime === slot.start_time}
                            onSelect={() => handleTimeSelect(slot.start_time)}
                            mentorTimezone={mentorTimezone}
                            userTimezone={userTimezone}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {evening.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Evening (6PM - 10PM)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {evening.map((slot, index) => (
                          <TimeSlotButton
                            key={index}
                            slot={slot}
                            isSelected={selectedTime === slot.start_time}
                            onSelect={() => handleTimeSelect(slot.start_time)}
                            mentorTimezone={mentorTimezone}
                            userTimezone={userTimezone}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No available time slots for this date
            </div>
          )}
        </div>
      )}

      {selectedDate && !selectedDayAvailability && (
        <div className="text-center py-4 text-muted-foreground">
          No availability for the selected date
        </div>
      )}
    </div>
  );
};