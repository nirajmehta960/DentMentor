import React from 'react';
import { UpcomingSessions } from '@/components/mentee-dashboard/UpcomingSessions';
import { AppPageHeader } from '@/components/site';

export function SessionsTab() {
  return (
    <div className="flex flex-col gap-8">
      <AppPageHeader
        eyebrow="Sessions"
        title="Your sessions"
        description="View and manage your scheduled mentorship sessions. Times are shown in your time zone."
      />
      <UpcomingSessions />
    </div>
  );
}
