import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageSquareOff } from "lucide-react";

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

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [profiles, setProfiles] = useState<Record<string, Profile>>({});
    const [loading, setLoading] = useState(true);

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
            .channel("messages_list")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
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

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navigation />
            <div className="container mx-auto px-4 pt-24 pb-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <MessageSquareOff className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            No conversations yet
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            When you book a session or get booked, your chats will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {conversations.map((conv) => {
                            const otherUser = getOtherUser(conv);
                            return (
                                <Card
                                    key={conv.conversation_key}
                                    className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                                    onClick={() => navigate(`/messages/session/${conv.session_id}`)}
                                >
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={otherUser?.avatar_url || ""} />
                                            <AvatarFallback>
                                                {otherUser?.first_name?.[0]}
                                                {otherUser?.last_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {otherUser
                                                        ? `${otherUser.first_name} ${otherUser.last_name}`
                                                        : "Unknown User"}
                                                </h3>
                                                {conv.last_message_at && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(new Date(conv.last_message_at), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-sm truncate ${conv.unread_count > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                                                    {conv.last_message_text || "No messages yet"}
                                                </p>
                                                {conv.unread_count > 0 && (
                                                    <Badge variant="destructive" className="ml-2 h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                                                        {conv.unread_count}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
