import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

export function ActiveChat({ sessionId, initialOtherUser }: ActiveChatProps) {
    const { user, session: authSession } = useAuth();
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<Participant | null>(initialOtherUser || null);
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
                } else if (user.id === menteeUserId) {
                    otherUserId = mentorUserId;
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
                        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="bg-card border-b p-4 flex items-center gap-4 shadow-sm flex-shrink-0">
                {otherUser ? (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={otherUser.avatar_url || ""} />
                            <AvatarFallback>{otherUser.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-foreground">
                                {otherUser.first_name} {otherUser.last_name}
                            </h2>
                            <span className="text-xs text-green-600 flex items-center gap-1">
                                ● Online
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                )}
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4">
                {loading ? (
                    <div className="flex h-full items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {hasMore && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="self-center text-xs text-muted-foreground"
                            >
                                {loadingMore ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                Load older messages
                            </Button>
                        )}

                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground my-10">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`
                                        max-w-[75%] px-4 py-2 rounded-2xl text-sm 
                                        ${isMe
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted text-foreground rounded-bl-none"
                                                }
                                    `}
                                        >
                                            {msg.message_text}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Composer */}
            <div className="p-4 border-t bg-card mt-auto">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={sending}
                    />
                    <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
