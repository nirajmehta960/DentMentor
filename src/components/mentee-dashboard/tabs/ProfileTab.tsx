import React from 'react';
import { MenteeProfileManagement } from '@/components/mentee-dashboard/MenteeProfileManagement';
import { ApplicationProgress } from '@/components/mentee-dashboard/ApplicationProgress';

export function ProfileTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Profile & Progress</h1>
        <p className="text-muted-foreground">
          Manage your profile and track your application progress
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[calc(100vh-20rem)]">
          <MenteeProfileManagement />
        </div>
        <div className="h-[calc(100vh-20rem)]">
          <ApplicationProgress />
        </div>
      </div>
    </div>
  );
}
