import React from 'react';
import { AvailabilityCalendar } from '@/components/dashboard/AvailabilityCalendar';
import { AppPageHeader } from '@/components/site';

export function AvailabilityTab() {
  return (
    <div className="flex flex-col gap-6">
      <AppPageHeader
        eyebrow="Availability"
        title="When mentees can book you"
        description="Pick a date to open time slots. Mentees see each slot in their own timezone when they book."
      />
      <AvailabilityCalendar />
    </div>
  );
}
