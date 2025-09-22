import React from 'react';
import { ProfileManagement } from '@/components/dashboard/ProfileManagement';

export function ProfileTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your mentor profile and preferences</p>
      </div>
      <ProfileManagement />
    </div>
  );
}
