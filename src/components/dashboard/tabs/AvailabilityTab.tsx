import React from 'react';
import { AvailabilityCalendar } from '@/components/dashboard/AvailabilityCalendar';

export function AvailabilityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Availability Management</h2>
        <p className="text-muted-foreground mt-1">Set your available time slots for mentoring sessions</p>
      </div>
      <AvailabilityCalendar />
    </div>
  );
}
