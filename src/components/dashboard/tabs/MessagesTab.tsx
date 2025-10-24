import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { Loader2, MessageSquare, MessageSquareOff, Search } from "lucide-react";
import { ActiveChat } from "@/components/chat/ActiveChat";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

export function MessagesTab() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const sessionIdParam = searchParams.get('sessionId');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
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
        };

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
    }, [user]);

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

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-background rounded-xl overflow-hidden border shadow-sm">
            {/* Left Sidebar: Conversation List */}
            <div className={`${sessionIdParam ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-col border-r bg-card`}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-9 bg-muted/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageSquareOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No conversations found</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredConversations.map((conv) => {
                                const otherUser = getOtherUser(conv);
                                const isSelected = sessionIdParam === conv.session_id;

                                return (
                                    <button
                                        key={conv.conversation_key}
                                        onClick={() => handleSelectSession(conv.session_id)}
                                        className={cn(
                                            "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left",
                                            isSelected && "bg-muted/80 border-l-4 border-l-primary pl-3"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src={otherUser?.avatar_url || ""} />
                                                <AvatarFallback>{otherUser?.first_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            {/* Online indicator placeholder if we had online status */}
                                            {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span> */}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className={cn("font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
                                                    {otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Unknown"}
                                                </span>
                                                {conv.last_message_at && (
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-1">
                                                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={cn("text-sm truncate max-w-[140px]", conv.unread_count > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                                                    {conv.last_message_text || "No messages yet"}
                                                </p>
                                                {conv.unread_count > 0 && (
                                                    <Badge variant="destructive" className="ml-2 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-[10px]">
                                                        {conv.unread_count}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Active Chat */}
            <div className={`${sessionIdParam ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-muted/30`}>
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
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
                        <p className="max-w-xs text-center text-sm">
                            Select a conversation from the list to start chatting with your mentors or mentees.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
