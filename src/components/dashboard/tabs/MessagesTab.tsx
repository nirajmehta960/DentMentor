import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { Loader2, MessageSquare, MessageSquareOff, Search } from "lucide-react";
import { ActiveChat } from "@/components/chat/ActiveChat";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AppPageHeader } from "@/components/site";

interface Conversation {
    conversation_key: string;
    session_id: string;
    mentor_id: string;
    mentee_id: string;
    mentor_user_id: string;
    mentee_user_id: string;
    last_message_at: string | null;
    last_message_text: string | null;
    unread_count: number;
}

interface Profile {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
}

interface MessagesTabProps {
    /**
     * Render the tab's own "Messages" page header (the old component always
     * rendered a "Messages" heading). Defaults to true so every caller keeps a
     * heading; pass false only when the page supplies its own.
     */
    showHeader?: boolean;
}

export function MessagesTab({ showHeader = true }: MessagesTabProps = {}) {
    const { user, userType } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const sessionIdParam = searchParams.get('sessionId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Fetch conversations
            const { data: convs, error: convError } = await supabase
                .from("chat_conversations_v")
                .select("*")
                .order("last_message_at", { ascending: false });

            if (convError) throw convError;
            const typedConvs = convs as unknown as Conversation[];
            setConversations(typedConvs);

            // Collect other user IDs
            const otherUserIds = new Set<string>();
            typedConvs.forEach((conv) => {
                const otherId =
                    user.id === conv.mentor_user_id
                        ? conv.mentee_user_id
                        : conv.mentor_user_id;
                otherUserIds.add(otherId);
            });

            if (otherUserIds.size > 0) {
                const { data: profs, error: profError } = await supabase
                    .from("profiles")
                    .select("user_id, first_name, last_name, avatar_url")
                    .in("user_id", Array.from(otherUserIds) as any);

                if (profError) throw profError;

                const profMap: Record<string, Profile> = {};
                (profs as unknown as Profile[]).forEach((p) => {
                    profMap[p.user_id] = p;
                });
                setProfiles(profMap);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchConversations();

        // Subscribe to new messages for this user to refresh the list
        const channel = supabase
            .channel("messages_list_tab")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_id=eq.${user.id}`,
                },
                () => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchConversations]);

    const getOtherUser = (conv: Conversation) => {
        if (!user) return null;
        const otherId =
            user.id === conv.mentor_user_id
                ? conv.mentee_user_id
                : conv.mentor_user_id;
        return profiles[otherId];
    };

    const handleSelectSession = (sessionId: string) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('sessionId', sessionId);
        setSearchParams(newParams);
    };

    const getOtherUserId = (conv: Conversation) => {
        if (!user) return null;
        return user.id === conv.mentor_user_id ? conv.mentee_user_id : conv.mentor_user_id;
    };

    // Group conversations by the other user's ID, keeping only the most recent one
    const uniqueUserConversations = conversations.reduce((acc, conv) => {
        const otherUserId = getOtherUserId(conv);
        if (!otherUserId) return acc;

        // If we already have a conversation for this user, check if the new one is more recent
        if (acc[otherUserId]) {
            const existingTime = acc[otherUserId].last_message_at ? new Date(acc[otherUserId].last_message_at!).getTime() : 0;
            const newTime = conv.last_message_at ? new Date(conv.last_message_at).getTime() : 0;

            if (newTime > existingTime) {
                acc[otherUserId] = conv;
            }
        } else {
            acc[otherUserId] = conv;
        }
        return acc;
    }, {} as Record<string, Conversation>);

    // Convert back to array and filter by search query
    const filteredConversations = Object.values(uniqueUserConversations)
        .sort((a, b) => {
            const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return timeB - timeA;
        })
        .filter((conv) => {
            const otherUser = getOtherUser(conv);
            if (!otherUser) return false;
            const fullName = `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
        });

    // Shared by the mentor and mentee dashboards (both render inside the kit's
    // AppShell). The box below uses the app theme tokens (same teal ink and
    // hairline) and is sized to the space left under the dashboard chrome and
    // this header, so opening a thread doesn't scroll the whole window.
    const otherParty = userType === "mentor" ? "mentee" : "mentor";
    return (
        <div className="flex flex-col gap-6">
        {showHeader && (
            <AppPageHeader
                eyebrow="Messages"
                title="Inbox"
                description={`Each booked session has its own thread with your ${otherParty}.`}
            />
        )}
        <div
            className="flex h-[max(28rem,calc(100dvh_-_22.5rem))] overflow-hidden rounded-[14px] border bg-white shadow-soft lg:h-[max(32rem,calc(100dvh_-_18.5rem))]"
            style={{ borderColor: "#E3ECEA" }}
        >
            {/* Left Sidebar: Conversation List */}
            <div
                className={`${sessionIdParam ? 'hidden lg:flex' : 'flex'} w-full flex-col border-r lg:w-80 lg:shrink-0`}
                style={{ borderColor: "#E3ECEA" }}
            >
                <div className="flex flex-col gap-3 border-b px-4 py-4" style={{ borderColor: "#E3ECEA" }}>
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Conversations
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            type="search"
                            aria-label="Search conversations by name"
                            placeholder="Search by name"
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-10" role="status">
                            <Loader2 className="size-5 text-primary motion-safe:animate-spin" aria-hidden="true" />
                            <span className="sr-only">Loading conversations</span>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                            <span
                                aria-hidden="true"
                                className="grid size-[52px] place-items-center rounded-[10px] border-[1.5px] bg-white"
                                style={{ borderColor: "#E3ECEA" }}
                            >
                                <MessageSquareOff className="size-6 text-primary" strokeWidth={1.75} />
                            </span>
                            <p className="max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                                {searchQuery
                                    ? "No conversations match that name."
                                    : "No conversations yet. Each booked session opens a thread here."}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-[#E3ECEA]">
                            {filteredConversations.map((conv) => {
                                const otherUser = getOtherUser(conv);
                                const isSelected = sessionIdParam === conv.session_id;

                                return (
                                    <li key={conv.conversation_key}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectSession(conv.session_id)}
                                        aria-current={isSelected ? "true" : undefined}
                                        className={cn(
                                            "relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/60",
                                            isSelected && "bg-[rgb(15_112_93/0.06)]"
                                        )}
                                    >
                                        {isSelected && (
                                            <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-primary" />
                                        )}
                                        <Avatar className="size-10 shrink-0">
                                            <AvatarImage src={otherUser?.avatar_url || ""} className="object-cover" />
                                            <AvatarFallback className="bg-[rgb(15_112_93/0.1)] text-sm font-semibold text-primary">
                                                {otherUser?.first_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-0.5 flex items-baseline justify-between gap-2">
                                                <span className={cn("truncate text-[0.9375rem] font-medium", isSelected ? "text-primary" : "text-foreground")}>
                                                    {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Unknown"}
                                                </span>
                                                {conv.last_message_at && (
                                                    <span className="shrink-0 whitespace-nowrap text-[0.75rem] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn("min-w-0 truncate text-[0.8125rem]", conv.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                                                    {conv.last_message_text || "No messages yet"}
                                                </p>
                                                {conv.unread_count > 0 && (
                                                    <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[0.6875rem] font-semibold text-white tabular-nums">
                                                        <span className="sr-only">Unread: </span>
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Right Panel: Active Chat */}
            <div className={`${sessionIdParam ? 'flex' : 'hidden lg:flex'} min-w-0 flex-1 flex-col bg-[rgb(249_251_251)]`}>
                {sessionIdParam ? (
                    <ActiveChat
                        key={sessionIdParam} // Re-mount when session changes
                        sessionId={sessionIdParam}
                        initialOtherUser={
                            // Pass user info if we have it to avoid fetch delay
                            conversations.find(c => c.session_id === sessionIdParam)
                                ? getOtherUser(conversations.find(c => c.session_id === sessionIdParam)!)
                                : null
                        }
                        onRead={fetchConversations}
                    />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                        <span
                            aria-hidden="true"
                            className="grid size-[52px] place-items-center rounded-[10px] border-[1.5px] bg-white"
                            style={{ borderColor: "#E3ECEA" }}
                        >
                            <MessageSquare className="size-6 text-primary" strokeWidth={1.75} />
                        </span>
                        <div className="space-y-1.5">
                            <h3 className="font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-foreground">Pick a conversation</h3>
                            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                                Choose someone from the list to read and reply to your messages.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}
