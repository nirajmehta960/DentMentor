import React from 'react';
import { SessionManagement } from '@/components/dashboard/SessionManagement';
import { AppPageHeader } from '@/components/site';

export function SessionsTab() {
  return (
    <div className="flex flex-col gap-6">
      <AppPageHeader
        eyebrow="Sessions"
        title="Your sessions"
        description="Upcoming bookings and new requests from mentees."
      />
      <SessionManagement />
    </div>
  );
}
