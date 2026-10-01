import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/site";
import { ChatComposer, ChatHeader, ChatPanel, MessageThread, displayName } from "@/components/chat/chat-parts";
import { ConversationList } from "@/components/chat/conversation-list";
import { InboxFrame, InboxHeader, useIsDesktop } from "@/components/chat/inbox-frame";
import { useConversations } from "@/components/chat/use-conversations";

interface Message {
    id: string;
    sender_id: string;
    message_text: string;
    created_at: string;
    read_at: string | null;
    recipient_id: string;
}

interface Participant {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
}

/**
 * The chat route. At lg the inbox list sits beside the thread (the list only
 * mounts there, so phones make no extra request); below lg the thread has the
 * whole viewport. The thread is keyed by session, so picking another
 * conversation from the list starts it fresh, exactly like opening the route.
 *
 * The side list's channel only fires for messages sent to this user, so the
 * thread tells it (via `onListStale`) when it has marked messages read or the
 * user has sent one; otherwise its unread pills and previews would go stale.
 */
const ChatSession = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const isDesktop = useIsDesktop();
    const { conversations, loading, getOtherUser, refetch } = useConversations({
        channel: "messages_list_session",
        enabled: isDesktop,
    });

    return (
        <AppShell>
            <InboxFrame
                view="thread"
                header={<InboxHeader />}
                list={
                    isDesktop ? (
                        <ConversationList
                            conversations={conversations}
                            getOtherUser={getOtherUser}
                            loading={loading}
                            activeSessionId={sessionId}
                            onSelect={(id) => navigate(`/messages/session/${id}`)}
                        />
                    ) : null
                }
            >
                <ChatSessionThread key={sessionId} onListStale={isDesktop ? refetch : undefined} />
            </InboxFrame>
        </AppShell>
    );
};

const ChatSessionThread = ({ onListStale }: { onListStale?: () => void }) => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user, session: authSession } = useAuth(); // Need authSession for token
    const navigate = useNavigate();
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<Participant | null>(null);
    // Which side of the session the other person is on, for the header's context line.
    const [otherRole, setOtherRole] = useState<"mentor" | "mentee" | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 50;
    // Read through a ref: markRead also runs from the realtime callback, whose closure is fixed per session.
    const onListStaleRef = useRef(onListStale);
    onListStaleRef.current = onListStale;

    // 1. Fetch Session & Participant Info
    useEffect(() => {
        if (!user || !sessionId) return;

        const fetchSessionInfo = async () => {
            try {
                // Get session details to find participants
                const { data: sessionData, error: sessionError } = await supabase
                    .from("sessions")
                    .select(`
            mentor_id,
            mentee_id,
            mentor:mentor_profiles!mentor_id(user_id),
            mentee:mentee_profiles!mentee_id(user_id)
          `)
                    .eq("id", sessionId as any)
                    .single();

                if (sessionError || !sessionData) throw sessionError || new Error("Session not found");

                // Identify other user
                // Note: The select returns arrays or objects depending on query complexity, but 'single()' implies objects if relations are 1-1 correct.
                // Actually relations return arrays by default unless `!inner` or explicit hint?
                // Let's check types or assume standard Supabase return.
                // Profiles are usually 1-1 with users table but here we join via mentee_id/mentor_id to profiles tables.

                // Casting for safety if types are loose
                const sessionAny = sessionData as any;
                const mentorUserId = sessionAny?.mentor?.user_id;
                const menteeUserId = sessionAny?.mentee?.user_id;

                let otherUserId: string | null = null;
                if (user.id === mentorUserId) {
                    otherUserId = menteeUserId;
                    setOtherRole("mentee");
                } else if (user.id === menteeUserId) {
                    otherUserId = mentorUserId;
                    setOtherRole("mentor");
                } else {
                    // Not a participant
                    toast({
                        variant: "destructive",
                        title: "Access Denied",
                        description: "You are not a participant in this session.",
                    });
                    navigate("/messages");
                    return;
                }

                if (otherUserId) {
                    const { data: profile, error: profileError } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("user_id", otherUserId as any)
                        .single();

                    if (!profileError && profile) {
                        setOtherUser(profile as unknown as Participant);
                    }
                }

            } catch (error) {
                console.error("Error loading session:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load chat session.",
                });
                navigate("/messages");
            }
        };

        fetchSessionInfo();
    }, [user, sessionId, navigate, toast]);

    // 2. Fetch Messages (Initial)
    useEffect(() => {
        if (!sessionId) return;

        fetchMessages(0, true);
        markRead();

        // Realtime Subscription
        const channel = supabase
            .channel(`session:${sessionId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => {
                        // Deduplicate
                        if (prev.some((m) => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });

                    // Auto-mark read if it's for me
                    if (newMsg.recipient_id === user?.id) {
                        markRead();
                    }

                    // Auto scroll
                    setTimeout(() => {
                        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, user]); // Added user to dependency for markRead check


    const fetchMessages = async (currentOffset: number, initial: boolean) => {
        try {
            if (initial) setLoading(true);
            else setLoadingMore(true);

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("session_id", sessionId as any)
                .order("created_at", { ascending: false }) // Get newest first
                .range(currentOffset, currentOffset + LIMIT - 1);

            if (error) throw error;

            const typedData = data as unknown as Message[];
            const newMessages = (typedData || []).reverse(); // Reverse to oldest-first for display

            if (data.length < LIMIT) {
                setHasMore(false);
            }

            setMessages((prev) => initial ? newMessages : [...newMessages, ...prev]);
            setOffset(currentOffset + LIMIT);

        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            if (initial) setLoading(false);
            else setLoadingMore(false);
        }
    };

    const markRead = async () => {
        if (!sessionId || !authSession?.access_token) return;

        try {
            await fetch("/api/messages/mark-read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authSession.access_token}`
                },
                body: JSON.stringify({ sessionId })
            });
        } catch (err) {
            console.error("Failed to mark read", err);
        } finally {
            onListStaleRef.current?.();
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !sessionId || !authSession?.access_token) return;

        setSending(true);
        try {
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authSession.access_token}`
                },
                body: JSON.stringify({
                    sessionId,
                    text: newMessage.trim()
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to send");
            }

            const sentMsg = await response.json();

            // Optimistically append (or use the returned message)
            setMessages((prev) => [...prev, sentMsg]);
            setNewMessage("");
            onListStaleRef.current?.();

            // Scroll to bottom
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setSending(false);
        }
    };

    const loadMore = () => {
        fetchMessages(offset, false);
    };

    // Scroll to bottom on initial load
    useEffect(() => {
        if (!loading && messages.length > 0) {
            scrollRef.current?.scrollIntoView();
        }
    }, [loading]);

    const name = otherUser ? displayName(otherUser, "") : "";

    return (
        <ChatPanel variant="panel" label={name ? `Conversation with ${name}` : "Conversation"}>
            <ChatHeader
                person={otherUser}
                context={otherRole ? `Your ${otherRole} · Session chat` : "Session chat"}
                onBack={() => navigate("/messages")}
            />

            <MessageThread
                messages={messages}
                currentUserId={user?.id}
                otherName={name}
                loading={loading}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
                endRef={scrollRef}
            />

            <ChatComposer
                value={newMessage}
                onValueChange={setNewMessage}
                onSubmit={handleSendMessage}
                sending={sending}
            />
        </ChatPanel>
    );
};

export default ChatSession;
