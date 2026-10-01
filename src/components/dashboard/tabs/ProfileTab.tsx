import React from 'react';
import { ProfileManagement } from '@/components/dashboard/ProfileManagement';

/* ProfileManagement renders the page header itself, because its actions (edit,
   manage services) open state that lives in that component. */
export function ProfileTab() {
  return <ProfileManagement />;
}
