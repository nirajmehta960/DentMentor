import { differenceInMinutes, format, isSameDay, isSameYear, isToday, isYesterday } from "date-fns";
import { ArrowLeft, Check, CheckCheck, Loader2, MessagesSquare, Send, type LucideIcon } from "lucide-react";
import { useId, useMemo, type FormEvent, type ReactNode, type RefObject } from "react";

import { HAIRLINE } from "@/components/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Presentation for the chat screens. No data, no effects: ChatSession and
 * ActiveChat keep their own fetching, realtime and send logic and hand the
 * results in. Every colour is a band token, so each piece must sit under a
 * `[data-dm-site]` ancestor (AppShell, or ActiveChat's own scope).
 */

export type ChatPerson = {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
};

export type ChatMessage = {
    id: string;
    sender_id: string;
    message_text: string;
    created_at: string;
    read_at: string | null;
};

/** First and last name, skipping missing parts. */
export function displayName(person: ChatPerson | null | undefined, fallback = "Unknown User") {
    const name = [person?.first_name, person?.last_name].filter(Boolean).join(" ").trim();
    return name || fallback;
}

function initials(person: ChatPerson | null | undefined) {
    return [person?.first_name?.[0], person?.last_name?.[0]].filter(Boolean).join("").toUpperCase();
}

function parseDate(value: string | null | undefined) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Compact list stamp: a time today, then a weekday, then a date. */
export function shortStamp(date: Date) {
    if (isToday(date)) return format(date, "p");
    if (isYesterday(date)) return "Yesterday";
    if (Math.abs(differenceInMinutes(new Date(), date)) < 6 * 24 * 60) return format(date, "EEE");
    return isSameYear(date, new Date()) ? format(date, "MMM d") : format(date, "MMM d, yyyy");
}

function dayLabel(date: Date) {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return isSameYear(date, new Date()) ? format(date, "EEEE, MMM d") : format(date, "MMM d, yyyy");
}

export function PersonAvatar({ person, size = "md" }: { person: ChatPerson | null | undefined; size?: "md" | "lg" }) {
    return (
        <Avatar className={size === "lg" ? "h-11 w-11" : "h-10 w-10"}>
            <AvatarImage src={person?.avatar_url || ""} alt="" className="object-cover" />
            <AvatarFallback className="bg-[rgb(15_112_93/0.1)] text-[0.8125rem] font-semibold text-band-signal">
                {initials(person)}
            </AvatarFallback>
        </Avatar>
    );
}

/** The landing's icon tile: 52px, hairline, teal glyph. */
export function IconTile({ icon: Icon = MessagesSquare, className }: { icon?: LucideIcon; className?: string }) {
    return (
        <span
            className={cn("grid size-[52px] shrink-0 place-items-center rounded-tile border-[1.5px] bg-white", className)}
            style={{ borderColor: HAIRLINE }}
        >
            <Icon className="size-6 text-band-signal" strokeWidth={1.75} aria-hidden="true" />
        </span>
    );
}

/**
 * The chat surface. `panel` is the rounded hairline card a page lays out;
 * `flush` fills a host that already draws the frame (the dashboards' messages
 * tab), as ActiveChat always has.
 */
export function ChatPanel({
    variant,
    label,
    children,
}: {
    variant: "panel" | "flush";
    label: string;
    children: ReactNode;
}) {
    return (
        <section
            data-band="paper"
            aria-label={label}
            className={cn(
                "flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-band-raised text-band-fg",
                variant === "panel" && "rounded-panel border shadow-[var(--card-shadow)]",
            )}
            style={variant === "panel" ? { borderColor: HAIRLINE } : undefined}
        >
            {children}
        </section>
    );
}

export function ChatHeader({
    person,
    context,
    onBack,
}: {
    person: ChatPerson | null;
    context: string;
    onBack?: () => void;
}) {
    return (
        <div className="flex min-h-[4.25rem] shrink-0 items-center gap-2 border-b px-3 py-3 sm:gap-3 sm:px-5" style={{ borderColor: HAIRLINE }}>
            {onBack ? (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    aria-label="Back to messages"
                    className="h-11 w-11 shrink-0 lg:hidden"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            ) : null}

            {person ? (
                <div className="flex min-w-0 items-center gap-3">
                    <PersonAvatar person={person} />
                    <div className="min-w-0">
                        <h2 className="truncate text-[0.9375rem] font-semibold leading-snug text-band-fg">{displayName(person, "")}</h2>
                        <p className="truncate text-[0.8125rem] leading-snug text-band-muted">{context}</p>
                    </div>
                </div>
            ) : (
                // Waiting on the profile: a still placeholder, not a pulse.
                <div className="flex items-center gap-3" aria-hidden="true">
                    <span className="size-10 rounded-full bg-band-fg/[0.06]" />
                    <span className="flex flex-col gap-1.5">
                        <span className="h-3 w-32 rounded-pill bg-band-fg/[0.06]" />
                        <span className="h-2.5 w-20 rounded-pill bg-band-fg/[0.04]" />
                    </span>
                </div>
            )}
        </div>
    );
}

type ThreadItem =
    | { kind: "day"; key: string; label: string }
    | {
          kind: "message";
          message: ChatMessage;
          mine: boolean;
          spaced: boolean;
          lastInRun: boolean;
          time: string | null;
          receipt: "read" | "sent" | null;
      };

/** Consecutive messages from one sender within five minutes read as one run. */
const RUN_GAP_MINUTES = 5;

function buildThread(messages: ChatMessage[], currentUserId: string | undefined): ThreadItem[] {
    let lastOwn = -1;
    messages.forEach((m, i) => {
        if (m.sender_id === currentUserId) lastOwn = i;
    });

    const items: ThreadItem[] = [];
    let prevDate: Date | null = null;
    let prevSender: string | null = null;

    messages.forEach((message, i) => {
        const date = parseDate(message.created_at);
        const newDay = !!date && (!prevDate || !isSameDay(date, prevDate));
        if (newDay) items.push({ kind: "day", key: `day-${format(date, "yyyy-MM-dd")}-${i}`, label: dayLabel(date) });

        const next = messages[i + 1];
        const nextDate = next ? parseDate(next.created_at) : null;
        const lastInRun =
            !next ||
            next.sender_id !== message.sender_id ||
            !date ||
            !nextDate ||
            !isSameDay(date, nextDate) ||
            differenceInMinutes(nextDate, date) > RUN_GAP_MINUTES;

        const startsRun =
            i === 0 ||
            prevSender !== message.sender_id ||
            !date ||
            !prevDate ||
            differenceInMinutes(date, prevDate) > RUN_GAP_MINUTES;

        const mine = message.sender_id === currentUserId;
        items.push({
            kind: "message",
            message,
            mine,
            spaced: i > 0 && !newDay && startsRun,
            lastInRun,
            time: date ? format(date, "p") : null,
            receipt: i === lastOwn ? (message.read_at ? "read" : "sent") : null,
        });

        if (date) prevDate = date;
        prevSender = message.sender_id;
    });

    return items;
}

/**
 * The scrolling message column. `endRef` is the caller's scroll sentinel and
 * stays the last child, exactly where the original placed it, so the callers'
 * `scrollIntoView` calls behave as before.
 */
export function MessageThread({
    messages,
    currentUserId,
    otherName,
    loading,
    hasMore,
    loadingMore,
    onLoadMore,
    endRef,
}: {
    messages: ChatMessage[];
    currentUserId: string | undefined;
    otherName?: string;
    loading: boolean;
    hasMore: boolean;
    loadingMore: boolean;
    onLoadMore: () => void;
    endRef: RefObject<HTMLDivElement>;
}) {
    const items = useMemo(() => buildThread(messages, currentUserId), [messages, currentUserId]);

    return (
        <div data-band="mist" className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-band-ground">
            {loading ? (
                <div className="flex h-full items-center justify-center py-10">
                    <Loader2 className="h-7 w-7 animate-spin text-band-signal" aria-hidden="true" />
                    <span className="sr-only">Loading messages</span>
                </div>
            ) : (
                <div className="flex min-h-full flex-col px-3 py-5 sm:px-6">
                    {hasMore && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onLoadMore}
                            disabled={loadingMore}
                            className="mb-5 h-11 self-center bg-band-raised px-5 text-[0.8125rem] text-band-muted"
                        >
                            {loadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Load older messages
                        </Button>
                    )}

                    {messages.length === 0 ? (
                        <div className="my-auto flex flex-col items-center gap-4 py-10 text-center">
                            <IconTile />
                            <p className="max-w-xs text-[0.9375rem] leading-relaxed text-band-muted">
                                No messages yet. Start the conversation!
                            </p>
                        </div>
                    ) : (
                        <ol className="mt-auto flex flex-col" aria-label="Messages">
                            {items.map((item) =>
                                item.kind === "day" ? (
                                    <li key={item.key} className="my-5 flex items-center gap-3 first:mt-0">
                                        <span aria-hidden="true" className="h-px flex-1 bg-band-rule" />
                                        <span className="label text-band-faint">{item.label}</span>
                                        <span aria-hidden="true" className="h-px flex-1 bg-band-rule" />
                                    </li>
                                ) : (
                                    <MessageBubble key={item.message.id} item={item} otherName={otherName} />
                                ),
                            )}
                        </ol>
                    )}
                    <div ref={endRef} />
                </div>
            )}
        </div>
    );
}

function MessageBubble({ item, otherName }: { item: Extract<ThreadItem, { kind: "message" }>; otherName?: string }) {
    const { message, mine, spaced, lastInRun, time, receipt } = item;

    return (
        <li className={cn("flex flex-col", mine ? "items-end" : "items-start", spaced ? "mt-4" : "mt-1 first:mt-0")}>
            <div
                className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-[1.25rem] px-4 py-2.5 text-[0.9375rem] leading-relaxed [overflow-wrap:anywhere] sm:max-w-[70%]",
                    mine ? "bg-band-fg text-white" : "border bg-band-raised text-band-fg",
                    lastInRun && (mine ? "rounded-br-md" : "rounded-bl-md"),
                )}
                style={mine ? undefined : { borderColor: HAIRLINE }}
            >
                <span className="sr-only">{mine ? "You: " : `${otherName || "Them"}: `}</span>
                {message.message_text}
            </div>

            {lastInRun && (time || receipt) ? (
                <p className="mt-1 flex items-center gap-1 px-1 text-[0.6875rem] text-band-faint tabular-nums">
                    {time ? <time dateTime={message.created_at}>{time}</time> : null}
                    {receipt ? (
                        <>
                            {time ? <span aria-hidden="true">·</span> : null}
                            {receipt === "read" ? (
                                <span className="inline-flex items-center gap-0.5 text-band-signal">
                                    <CheckCheck className="size-3.5" strokeWidth={2} aria-hidden="true" />
                                    Read
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-0.5">
                                    <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                                    Sent
                                </span>
                            )}
                        </>
                    ) : null}
                </p>
            ) : null}
        </li>
    );
}

export function ChatComposer({
    value,
    onValueChange,
    onSubmit,
    sending,
}: {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: (e: FormEvent) => void;
    sending: boolean;
}) {
    const id = useId();

    return (
        <div className="shrink-0 border-t bg-band-raised px-3 py-3 sm:px-5" style={{ borderColor: HAIRLINE }}>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
                <label htmlFor={id} className="sr-only">
                    Message
                </label>
                <Input
                    id={id}
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                    className="h-11 flex-1 rounded-full bg-[rgb(249_251_251)] px-5"
                    disabled={sending}
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={sending || !value.trim()}
                    aria-label="Send message"
                    className="h-11 w-11 shrink-0"
                >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
