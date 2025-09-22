import React from 'react';
import { SessionManagement } from '@/components/dashboard/SessionManagement';

export function SessionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Session Management</h2>
        <p className="text-muted-foreground mt-1">View and manage all your mentoring sessions</p>
      </div>
      <SessionManagement />
    </div>
  );
}
