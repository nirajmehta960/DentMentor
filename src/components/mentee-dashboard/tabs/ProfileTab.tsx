import React from 'react';
import { MenteeProfileManagement } from '@/components/mentee-dashboard/MenteeProfileManagement';
import { ApplicationProgress } from '@/components/mentee-dashboard/ApplicationProgress';
import { AppPageHeader } from '@/components/site';

export function ProfileTab() {
  return (
    <div className="flex flex-col gap-8">
      <AppPageHeader
        eyebrow="Profile"
        title="Profile & progress"
        description="Manage your profile and see where you are with DentMentor."
      />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <MenteeProfileManagement />
        <ApplicationProgress />
      </div>
    </div>
  );
}
