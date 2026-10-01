import { Label } from "@/components/site";
import { cn } from "@/lib/utils";
import { RAIL_FOOT, RAIL_GROUPS, type MenteeNavItem } from "./nav-items";
import { TEAL_TINT } from "./parts";

interface MenteeDashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Unread messages, from the layout's single `useNotifications` call. */
  unreadCount?: number;
}

/**
 * The desktop rail: quiet label groups on the mist ground, the active item in
 * teal on a tint pill. Sticky under the top bar so it stays put while the
 * content scrolls the page.
 */
export function MenteeDashboardSidebar({ activeTab, onTabChange, unreadCount = 0 }: MenteeDashboardSidebarProps) {
  return (
    <aside
      aria-label="Dashboard"
      className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col self-start border-r border-band-rule-faint lg:flex"
    >
      <nav aria-label="Dashboard sections" className="flex flex-1 flex-col gap-7 overflow-y-auto px-4 py-7">
        {RAIL_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <Label as="p" className="px-3.5 text-band-faint">
              {group.label}
            </Label>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <RailItem
                    item={item}
                    active={activeTab === item.id}
                    onSelect={onTabChange}
                    count={item.id === "messages" ? unreadCount : 0}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <ul className="flex flex-col gap-0.5 border-t border-band-rule-faint px-4 py-4">
        {RAIL_FOOT.map((item) => (
          <li key={item.id}>
            <RailItem item={item} active={activeTab === item.id} onSelect={onTabChange} />
          </li>
        ))}
      </ul>
    </aside>
  );
}

function RailItem({
  item,
  active,
  onSelect,
  count = 0,
}: {
  item: MenteeNavItem;
  active: boolean;
  onSelect: (tab: string) => void;
  count?: number;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-pill px-3.5 text-left text-[0.875rem] transition-colors duration-200",
        active
          ? cn(TEAL_TINT, "font-medium text-band-signal")
          : "text-band-muted hover:bg-band-fg/[0.04] hover:text-band-fg",
      )}
    >
      <Icon className="size-[1.125rem] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="flex-1 truncate">{item.label}</span>
      {count > 0 ? (
        <span className="min-w-5 rounded-pill bg-band-signal px-1.5 text-center text-[0.6875rem] font-semibold leading-5 text-white tabular-nums">
          {count > 99 ? "99+" : count}
          <span className="sr-only"> unread</span>
        </span>
      ) : null}
    </button>
  );
}
