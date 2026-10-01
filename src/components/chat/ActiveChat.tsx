import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatComposer, ChatHeader, ChatPanel, MessageThread, displayName } from "./chat-parts";

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

interface ActiveChatProps {
    sessionId: string;
    // Optional: Pass pre-fetched participant info if available to avoid extra fetch
    initialOtherUser?: Participant | null;
    onRead?: () => void;
}

export function ActiveChat({ sessionId, initialOtherUser, onRead }: ActiveChatProps) {
    const { user, session: authSession } = useAuth();
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<Participant | null>(initialOtherUser || null);
    // Known only when this component looked the session up itself; the header
    // falls back to a plain context line when the host passed the participant in.
    const [otherRole, setOtherRole] = useState<"mentor" | "mentee" | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 50;

    // Reset state when sessionId changes
    // Since we key by sessionId in the parent, this component remounts when sessionId changes.
    // However, we want to avoid resetting if just initialOtherUser reference changes due to parent updates.
    // So we can remove the explicit reset effect for sessionId, or ensure it doesn't depend on initialOtherUser.

    // We only need to check if we need to fetch user info if it wasn't provided or needed update
    // But honestly, since we remount, we can rely on mount logic.

    // Let's remove the problematic effect that resets everything when initialOtherUser changes.


    // 1. Fetch Session & Participant Info (if not provided)
    useEffect(() => {
        if (!user || !sessionId) return;
        if (otherUser) return; // Already have user info

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
            }
        };

        fetchSessionInfo();
    }, [user, sessionId, otherUser]);

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
                        if (prev.some((m) => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });

                    if (newMsg.recipient_id === user?.id) {
                        markRead();
                    }

                    setTimeout(() => {
                        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, user]);


    const fetchMessages = async (currentOffset: number, initial: boolean) => {
        try {
            if (initial) setLoading(true);
            else setLoadingMore(true);

            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("session_id", sessionId as any)
                .order("created_at", { ascending: false })
                .range(currentOffset, currentOffset + LIMIT - 1);

            if (error) throw error;

            const typedData = data as unknown as Message[];
            const newMessages = (typedData || []).reverse();

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
            if (onRead) onRead();
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
            setMessages((prev) => [...prev, sentMsg]);
            setNewMessage("");

            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            scrollRef.current?.scrollIntoView({ block: 'nearest' });
        }
    }, [loading]);

    const name = otherUser ? displayName(otherUser, "") : "";

    // Its own site scope (`display: contents`, so the host's flex layout is
    // untouched): the dashboards embed this, and its band colours must resolve
    // whether or not the host renders inside an AppShell.
    return (
        <div data-dm-site="" className="contents">
            <ChatPanel variant="flush" label={name ? `Conversation with ${name}` : "Conversation"}>
                <ChatHeader
                    person={otherUser}
                    context={otherRole ? `Your ${otherRole} · Session chat` : "Session chat"}
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
        </div>
    );
}
