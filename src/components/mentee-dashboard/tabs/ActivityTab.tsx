import React from 'react';
import { MenteeRecentActivity } from '@/components/mentee-dashboard/MenteeRecentActivity';
import { AppPageHeader } from '@/components/site';

export function ActivityTab() {
  return (
    <div className="flex flex-col gap-8">
      <AppPageHeader
        eyebrow="Activity"
        title="Recent activity"
        description="Your bookings and completed sessions from the last 30 days."
      />
      <MenteeRecentActivity />
    </div>
  );
}
