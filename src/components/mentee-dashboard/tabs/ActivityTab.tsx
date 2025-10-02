import React from 'react';
import { MenteeRecentActivity } from '@/components/mentee-dashboard/MenteeRecentActivity';

export function ActivityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Recent Activity</h1>
        <p className="text-muted-foreground">
          Track your mentorship journey and recent interactions
        </p>
      </div>
      <div className="h-[calc(100vh-20rem)]">
        <MenteeRecentActivity />
      </div>
    </div>
  );
}
