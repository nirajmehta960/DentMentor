import { cn } from "@/lib/utils";
import { STRIP_ITEMS } from "./nav-items";
import { TEAL_TINT } from "./parts";

interface MenteeDashboardMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Unread messages, from the layout's single `useNotifications` call. */
  unreadCount?: number;
}

/**
 * Below `lg`, the rail becomes a frosted strip of pills under the top bar. The
 * strip scrolls sideways inside itself; the page never does.
 */
export function MenteeDashboardMobileNav({ activeTab, onTabChange, unreadCount = 0 }: MenteeDashboardMobileNavProps) {
  return (
    <div data-band="paper" className="sticky top-16 z-30 text-band-fg lg:hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 border-b border-band-rule-faint bg-white/[0.72] backdrop-blur-md"
      />
      <nav aria-label="Dashboard sections" className="scrollbar-hide flex gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {STRIP_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const count = item.id === "messages" ? unreadCount : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-pill px-4 text-[0.875rem] transition-colors duration-200",
                isActive
                  ? cn(TEAL_TINT, "font-medium text-band-signal")
                  : "text-band-muted hover:bg-band-fg/[0.04] hover:text-band-fg",
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              {item.short ?? item.label}
              {count > 0 ? (
                <span className="min-w-5 rounded-pill bg-band-signal px-1.5 text-center text-[0.6875rem] font-semibold leading-5 text-white tabular-nums">
                  {count > 99 ? "99+" : count}
                  <span className="sr-only"> unread</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
