import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { useAvailability } from '@/hooks/useAvailability';

interface MonthlyAvailabilityPanelProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export function MonthlyAvailabilityPanel({ currentMonth, onMonthChange }: MonthlyAvailabilityPanelProps) {
  const [filterType, setFilterType] = useState<'all' | 'available' | 'booked'>('all');
  const { availability, isLoading } = useAvailability();

  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthEnd = endOfMonth(currentMonth);

  // Filter availability for current month
  const monthlyAvailability = availability?.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= currentMonthStart && itemDate <= currentMonthEnd;
  }) || [];

  const formatTimeSlots = (timeSlots: any) => {
    if (!Array.isArray(timeSlots)) return [];
    return timeSlots.map(slot => {
      if (typeof slot === 'string' && slot.includes(':')) {
        const [time, duration] = slot.split(':');
        return { time, duration: parseInt(duration) };
      }
      return { time: slot, duration: 60 };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAvailability = monthlyAvailability.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'available') return item.is_available;
    if (filterType === 'booked') return !item.is_available;
    return true;
  });

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Availability
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

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Availability
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('available')}
          >
            Available
          </Button>
          <Button
            variant={filterType === 'booked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('booked')}
          >
            Booked
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredAvailability.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No availability set for this month</p>
            <p className="text-sm">Click on calendar dates to add availability</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAvailability.map((item) => {
              const timeSlots = formatTimeSlots(item.time_slots);
              const itemDate = new Date(item.date);
              
              return (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {format(itemDate, 'MMM d')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(itemDate, 'EEEE')}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(item.is_available ? 'available' : 'booked')}
                    >
                      {item.is_available ? 'Available' : 'Booked'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {timeSlots.map((slot, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {slot.time} ({slot.duration}min)
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}