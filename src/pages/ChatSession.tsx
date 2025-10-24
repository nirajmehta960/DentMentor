import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";

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

const ChatSession = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user, session: authSession } = useAuth(); // Need authSession for token
    const navigate = useNavigate();
    const { toast } = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<Participant | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const LIMIT = 50;

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
                } else if (user.id === menteeUserId) {
                    otherUserId = mentorUserId;
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            <div className="flex-1 container mx-auto px-4 pt-24 pb-6 flex flex-col max-w-4xl h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="bg-white border-b p-4 flex items-center gap-4 rounded-t-xl shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    {otherUser ? (
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={otherUser.avatar_url || ""} />
                                <AvatarFallback>{otherUser.first_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    {otherUser.first_name} {otherUser.last_name}
                                </h2>
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                    ● Active in session
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
                    )}
                </div>

                {/* Chat Area */}
                <ScrollArea className="flex-1 bg-white p-4 shadow-sm border-x">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
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
                                <div className="text-center text-gray-500 my-10">
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
                                                        ? "bg-primary text-white rounded-br-none"
                                                        : "bg-gray-100 text-gray-900 rounded-bl-none"
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
                <div className="bg-white p-4 border-t rounded-b-xl shadow-sm">
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
        </div>
    );
};

export default ChatSession;
