import { ArrowRight, Inbox, MessagesSquare } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { AppPageHeader, Frame, HAIRLINE, Panel, SiteCta, useSiteRoutes } from "@/components/site";
import { cn } from "@/lib/utils";
import { IconTile } from "./chat-parts";

const DESKTOP_QUERY = "(min-width: 1024px)";

/** True at the `lg` breakpoint, where the inbox shows the list beside the thread. */
export function useIsDesktop() {
    const [matches, setMatches] = useState(
        () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(DESKTOP_QUERY).matches,
    );

    useEffect(() => {
        if (!window.matchMedia) return;
        const query = window.matchMedia(DESKTOP_QUERY);
        const update = () => setMatches(query.matches);
        update();
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
    }, []);

    return matches;
}

/** The one title row both inbox routes share, so moving between them doesn't jump. */
export function InboxHeader() {
    return (
        <AppPageHeader
            eyebrow="Inbox"
            title="Messages"
            description="Every booked session has its own conversation with your mentor or mentee."
        />
    );
}

/**
 * The inbox layout for both routes.
 *
 *   lg and up  title row, then the list beside the main pane, filling the
 *              viewport under the nav; each pane scrolls on its own.
 *   below lg   one pane. `view="list"` shows the title and the list in normal
 *              page flow; `view="thread"` gives the chat the whole viewport
 *              under the nav (the title stays for screen readers).
 *
 * With no `children` the list takes the full width (the empty inbox).
 */
export function InboxFrame({
    view,
    header,
    list,
    children,
}: {
    view: "list" | "thread";
    header: ReactNode;
    list: ReactNode;
    children?: ReactNode;
}) {
    const thread = view === "thread";
    const split = children !== undefined && children !== null;

    return (
        <Frame
            className={cn(
                "flex flex-col gap-6",
                thread
                    ? "h-[calc(100svh-3.5rem)] px-3 py-3 sm:px-8 sm:py-6 lg:h-[calc(100svh-4rem)] lg:px-12 lg:py-8"
                    : "py-8 sm:py-10 lg:h-[calc(100svh-4rem)] lg:py-8",
            )}
        >
            <div className={cn("shrink-0", thread && "sr-only lg:not-sr-only")}>{header}</div>

            <div
                className={cn(
                    "flex min-h-0 flex-1 flex-col",
                    split && "lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]",
                )}
            >
                <div className={cn("min-h-0 flex-col", thread ? "hidden lg:flex" : "flex flex-1")}>{list}</div>
                {split ? (
                    <div className={cn("min-h-0 min-w-0 flex-1 flex-col", thread ? "flex" : "hidden lg:flex")}>{children}</div>
                ) : null}
            </div>
        </Frame>
    );
}

/** The main pane on `/messages` at lg, before a conversation is picked. */
export function SelectConversationPane() {
    return (
        <Panel className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16 text-center" style={{ borderColor: HAIRLINE }}>
            <IconTile icon={Inbox} />
            <div className="flex max-w-sm flex-col gap-2">
                <h2 className="text-balance font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-band-fg">
                    Select a conversation
                </h2>
                <p className="text-[0.9375rem] leading-relaxed text-band-muted">
                    Choose a session from the list to read and reply to its messages.
                </p>
            </div>
        </Panel>
    );
}

/** No conversations at all. Mentees get a way to the mentor directory. */
export function EmptyInbox() {
    const r = useSiteRoutes();

    return (
        <Panel className="flex flex-col items-center gap-5 px-6 py-16 text-center sm:py-24" style={{ borderColor: HAIRLINE }}>
            <IconTile icon={MessagesSquare} />
            <div className="flex max-w-sm flex-col gap-2">
                <h2 className="text-balance font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-band-fg">
                    No conversations yet
                </h2>
                <p className="text-[0.9375rem] leading-relaxed text-band-muted">
                    When you book a session or get booked, your chats will appear here.
                </p>
            </div>
            {r.userType === "mentee" ? (
                <SiteCta to={r.mentors} variant="ink" className="group/find mt-1">
                    Find a mentor
                    <ArrowRight
                        className="size-4 transition-transform duration-200 group-hover/find:translate-x-1"
                        strokeWidth={2.25}
                        aria-hidden="true"
                    />
                </SiteCta>
            ) : null}
        </Panel>
    );
}
