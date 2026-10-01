import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Activity,
  MessageSquare,
  Settings,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { useNotifications } from "@/hooks/useNotifications";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

type NavItem = { id: string; label: string; icon: LucideIcon };

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'sessions', label: 'Sessions', icon: Calendar },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'availability', label: 'Availability', icon: Clock },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'activity', label: 'Activity', icon: Activity },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

/** One rail entry. Active = brand-teal text on a tint pill; everything else stays quiet. */
function RailButton({
  item,
  active,
  onClick,
  trailing,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  trailing?: React.ReactNode;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-pill px-3.5 text-[0.875rem] transition-colors",
        active
          ? "bg-[rgb(15_112_93/0.08)] font-medium text-band-signal"
          : "text-band-muted hover:bg-band-fg/[0.04] hover:text-band-fg"
      )}
    >
      <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2 : 1.75} aria-hidden="true" />
      <span className="flex-1 text-left">{item.label}</span>
      {trailing}
    </button>
  );
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  const { unreadMessageCount: unreadCount } = useNotifications();
  return (
    <aside
      aria-label="Dashboard"
      className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col border-r lg:flex"
      style={{ borderColor: 'rgb(9 67 56 / 0.06)' }}
    >
      <nav aria-label="Dashboard sections" className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="label px-3.5 pb-1.5 text-band-faint">{group.label}</p>
            {group.items.map((item) => (
              <RailButton
                key={item.id}
                item={item}
                active={activeTab === item.id}
                onClick={() => onTabChange(item.id)}
                trailing={
                  item.id === 'messages' && unreadCount > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-band-signal px-1.5 text-[0.6875rem] font-semibold text-white tabular-nums">
                      <span className="sr-only">Unread messages: </span>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null
                }
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1 border-t px-4 py-4" style={{ borderColor: 'rgb(9 67 56 / 0.06)' }}>
        {bottomNavItems.map((item) => (
          <RailButton key={item.id} item={item} active={false} onClick={() => onTabChange(item.id)} />
        ))}
      </div>
    </aside>
  );
}
