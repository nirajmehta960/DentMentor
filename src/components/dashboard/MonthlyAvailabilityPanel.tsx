import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useAvailability } from '@/hooks/useAvailability';

interface MonthlyAvailabilityPanelProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthlyAvailabilityPanel({ currentMonth }: MonthlyAvailabilityPanelProps) {
  const { availability, isLoading } = useAvailability();

  const to12 = (t: string): string => {
    if (!t || typeof t !== 'string' || !t.includes(':')) return t || '';
    const parts = t.split(':');
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return t;
    const period = hour >= 12 ? 'PM' : 'AM';
    const hh = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hh}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatTimeRange = (time: string, duration: number) => {
    if (!time || typeof time !== 'string') return '';
    const [start, end] = time.includes('-') ? time.split('-') : [time, time];
    return `${to12(start)} to ${to12(end)}`;
  };

  const parseSlots = (timeSlots: any): { time: string; duration: number }[] => {
    if (!Array.isArray(timeSlots)) return [];
    return timeSlots.map((s: any) => {
      // Support already-parsed objects
      if (s && typeof s === 'object' && 'time' in s) {
        const time = typeof s.time === 'string' ? s.time : '';
        const duration = typeof s.duration === 'number' ? s.duration : 60;
        return { time, duration };
      }
      // Expect "HH:mm-HH:mm:duration" or "HH:mm:duration" legacy
      if (typeof s === 'string') {
        const parts = s.split(':');
        if (parts.length >= 3) {
          // time segment may contain a dash
          const duration = parseInt(parts[parts.length - 1]);
          const time = parts.slice(0, parts.length - 1).join(':');
          return { time, duration: Number.isNaN(duration) ? 60 : duration };
        }
        // Fallback: no duration provided
        return { time: s, duration: 60 };
      }
      return { time: '', duration: 60 };
    });
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by date ascending
  const sorted = [...(availability || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No availability set</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sorted.map(item => {
              const slots = parseSlots(item.time_slots);
              const dateObj = new Date(item.date);
              return (
                <div key={item.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-medium">
                      {format(dateObj, 'MMM d')}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{format(dateObj, 'EEEE')}</span>
                  </div>
                  {slots.length > 0 ? (
                    <div className="text-sm text-foreground">
                      {slots.map((s, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {formatTimeRange(s.time, s.duration)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No time slots</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}