import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Activity,
  MessageSquare,
  Settings,
  HelpCircle
} from 'lucide-react';

interface MenteeDashboardMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'mentors', label: 'Mentors', icon: Users },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },

  { id: 'activity', label: 'Activity', icon: Activity },
];

export function MenteeDashboardMobileNav({ activeTab, onTabChange }: MenteeDashboardMobileNavProps) {
  return (
    <div className="lg:hidden sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
