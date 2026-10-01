import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { HAIRLINE, Panel } from "@/components/site";
import { cn } from "@/lib/utils";
import { PersonAvatar, displayName, shortStamp } from "./chat-parts";
import type { Conversation, ConversationProfile } from "./use-conversations";

function Stamp({ iso }: { iso: string }) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return (
        <time dateTime={iso} title={format(date, "PPpp")} className="shrink-0 text-[0.75rem] text-band-faint tabular-nums">
            {shortStamp(date)}
        </time>
    );
}

/**
 * The inbox list. Rows are buttons calling `onSelect` with the session id — the
 * page decides what selecting means (Messages navigates to the chat route).
 *
 * The active row is tinted and carries no unread pill: its thread is open and
 * has just been marked read, but this list only refetches on new messages, so
 * the count it holds for that row is already stale.
 */
export function ConversationList({
    conversations,
    getOtherUser,
    loading,
    activeSessionId,
    onSelect,
    className,
}: {
    conversations: Conversation[];
    getOtherUser: (conv: Conversation) => ConversationProfile | null | undefined;
    loading: boolean;
    activeSessionId?: string;
    onSelect: (sessionId: string) => void;
    className?: string;
}) {
    return (
        <Panel className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)} style={{ borderColor: HAIRLINE }}>
            <div className="flex shrink-0 items-center border-b px-4 py-3.5 sm:px-5" style={{ borderColor: HAIRLINE }}>
                <h2 className="label text-band-signal">Conversations</h2>
            </div>

            {loading && conversations.length === 0 ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-band-signal" aria-hidden="true" />
                    <span className="sr-only">Loading conversations</span>
                </div>
            ) : conversations.length === 0 ? (
                <p className="px-5 py-10 text-center text-[0.875rem] text-band-muted">No conversations yet.</p>
            ) : (
                <ul className="min-h-0 flex-1 divide-y divide-[#E3ECEA] overflow-y-auto overscroll-contain">
                    {conversations.map((conv) => {
                        const otherUser = getOtherUser(conv);
                        const active = conv.session_id === activeSessionId;
                        const unread = !active && conv.unread_count > 0;

                        return (
                            <li key={conv.conversation_key}>
                                <button
                                    type="button"
                                    onClick={() => onSelect(conv.session_id)}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex min-h-[4.5rem] w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 ease-dm sm:px-5",
                                        active
                                            ? "bg-[rgb(243_247_246)] shadow-[inset_3px_0_0_rgb(15_112_93)]"
                                            : "hover:bg-[rgb(249_251_251)]",
                                    )}
                                >
                                    <PersonAvatar person={otherUser} size="lg" />
                                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <span className="flex items-baseline justify-between gap-3">
                                            <span
                                                className={cn(
                                                    "truncate text-[0.9375rem] text-band-fg",
                                                    unread || active ? "font-semibold" : "font-medium",
                                                )}
                                            >
                                                {otherUser ? displayName(otherUser) : "Unknown User"}
                                            </span>
                                            {conv.last_message_at ? <Stamp iso={conv.last_message_at} /> : null}
                                        </span>
                                        <span className="flex items-center justify-between gap-3">
                                            <span
                                                className={cn(
                                                    "truncate text-[0.875rem]",
                                                    unread ? "font-medium text-band-fg" : "text-band-muted",
                                                )}
                                            >
                                                {conv.last_message_text || "No messages yet"}
                                            </span>
                                            {unread ? (
                                                <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-pill bg-band-signal px-1.5 text-[0.6875rem] font-semibold leading-none text-white tabular-nums">
                                                    {conv.unread_count}
                                                    <span className="sr-only"> unread</span>
                                                </span>
                                            ) : null}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Panel>
    );
}
