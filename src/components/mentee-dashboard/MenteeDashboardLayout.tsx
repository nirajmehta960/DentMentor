import type { ReactNode } from "react";

import { useNotifications } from "@/hooks/useNotifications";
import { MenteeDashboardMobileNav } from "./MenteeDashboardMobileNav";
import { MenteeDashboardNavigation } from "./MenteeDashboardNavigation";
import { MenteeDashboardSidebar } from "./MenteeDashboardSidebar";

/**
 * The work screen's frame, rendered inside `AppShell nav={false}`: frosted top
 * bar, the rail (desktop) or the pill strip (below `lg`), and the content column
 * on the mist ground. The page itself scrolls; the rail is sticky.
 *
 * `useNotifications` is called once here and shared by the rail and the strip —
 * the same single instance the rail used to own — so the unread count reaches
 * mobile without opening another realtime channel.
 */
export function MenteeDashboardLayout({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}) {
  const { unreadMessageCount } = useNotifications();

  return (
    <>
      <MenteeDashboardNavigation />
      <MenteeDashboardMobileNav activeTab={activeTab} onTabChange={onTabChange} unreadCount={unreadMessageCount} />

      <div className="flex min-w-0">
        <MenteeDashboardSidebar activeTab={activeTab} onTabChange={onTabChange} unreadCount={unreadMessageCount} />

        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
        </div>
      </div>
    </>
  );
}
