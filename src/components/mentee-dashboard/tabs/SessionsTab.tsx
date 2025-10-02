import React from 'react';
import { UpcomingSessions } from '@/components/mentee-dashboard/UpcomingSessions';

export function SessionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Your Sessions</h1>
        <p className="text-muted-foreground">
          View and manage your scheduled mentorship sessions
        </p>
      </div>
      <div className="h-[calc(100vh-20rem)]">
        <UpcomingSessions />
      </div>
    </div>
  );
}
