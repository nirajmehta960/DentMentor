import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
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

export interface ConversationProfile {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
}

/**
 * The inbox's data, lifted unchanged from the original Messages page: the
 * `chat_conversations_v` list, the other participants' profiles, and a realtime
 * channel that refetches when a message arrives for this user.
 *
 * `channel` is the realtime topic. Messages keeps its original "messages_list";
 * the chat route's side list passes its own, because supabase-js hands back an
 * existing channel by topic, and the one Messages is still leaving on unmount
 * would swallow the new subscription. `enabled: false` mounts nothing at all.
 *
 * `refetch` reloads the list on demand. The channel only fires for messages
 * sent TO this user, so the chat route calls it after marking a thread read and
 * after the user sends, to keep the side list's counts and previews current.
 */
export function useConversations({ channel: channelName, enabled = true }: { channel: string; enabled?: boolean }) {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [profiles, setProfiles] = useState<Record<string, ConversationProfile>>({});
    const [loading, setLoading] = useState(true);

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

                const profMap: Record<string, ConversationProfile> = {};
                (profs as unknown as ConversationProfile[]).forEach((p) => {
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
        if (!user || !enabled) return;

        fetchConversations();

        // Subscribe to new messages for this user to refresh the list
        const channel = supabase
            .channel(channelName)
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
    }, [user, enabled, channelName, fetchConversations]);

    const getOtherUser = (conv: Conversation) => {
        if (!user) return null;
        const otherId =
            user.id === conv.mentor_user_id
                ? conv.mentee_user_id
                : conv.mentor_user_id;
        return profiles[otherId];
    };

    return { conversations, loading, getOtherUser, refetch: fetchConversations };
}
