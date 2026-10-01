import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Activity,
  MessageSquare,
} from 'lucide-react';

interface DashboardMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'availability', label: 'Availability', icon: Clock },

  { id: 'profile', label: 'Profile', icon: User },
  { id: 'activity', label: 'Activity', icon: Activity },
];

/**
 * Below lg the rail becomes a sticky strip of pills under the top bar. It
 * scrolls sideways inside itself; the page never does.
 */
export function DashboardMobileNav({ activeTab, onTabChange }: DashboardMobileNavProps) {
  return (
    <nav
      aria-label="Dashboard sections"
      data-band="paper"
      className="sticky top-16 z-30 border-b bg-white/[0.86] backdrop-blur-md lg:hidden"
      style={{ borderColor: 'rgb(9 67 56 / 0.06)' }}
    >
      <div className="flex gap-1 overflow-x-auto px-3 py-2 scrollbar-hide sm:px-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-pill px-4 text-[0.875rem] transition-colors",
                isActive
                  ? "bg-[rgb(15_112_93/0.08)] font-medium text-band-signal"
                  : "text-band-muted hover:bg-band-fg/[0.04] hover:text-band-fg"
              )}
            >
              <Icon className="size-[18px]" strokeWidth={isActive ? 2 : 1.75} aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
