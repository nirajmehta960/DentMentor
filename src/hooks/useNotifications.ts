import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'session_booked' | 'payment_received' | 'feedback_received' | 'system';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    read_at: string | null;
    data: any;
    created_at: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadSystemCount, setUnreadSystemCount] = useState(0);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    // Fetch Messages Count
    useEffect(() => {
        if (!user) return;

        const fetchMessageCount = async () => {
            try {
                const { data, error } = await supabase
                    .from("chat_conversations_v")
                    .select("unread_count");

                if (error) {
                    console.error("Error fetching message count:", error);
                    return;
                }
                const total = data?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0;
                setUnreadMessageCount(total);
            } catch (err) {
                console.error("Failed to fetch message count:", err);
            }
        };

        fetchMessageCount();

        const channel = supabase.channel("global_messages_count")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "messages",
                    filter: `recipient_id=eq.${user.id}`,
                },
                fetchMessageCount
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Fetch System Notifications
    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20);

            if (!error && data) {
                setNotifications(data as Notification[]);
            }
        };

        const fetchSystemCount = async () => {
            const { count, error } = await supabase
                .from("notifications")
                .select("*", { count: 'exact', head: true })
                .eq("user_id", user.id)
                .is("read_at", null);

            if (!error && count !== null) {
                setUnreadSystemCount(count);
            }
        };

        fetchNotifications();
        fetchSystemCount();

        const channel = supabase.channel("global_notifications")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchNotifications();
                    fetchSystemCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Combine counts
    useEffect(() => {
        setTotalUnreadCount(unreadMessageCount + unreadSystemCount);
    }, [unreadMessageCount, unreadSystemCount]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        setUnreadSystemCount(prev => Math.max(0, prev - 1));

        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error("Error marking notification as read:", error);
            // Revert if needed, but keeping simple for now
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        setUnreadSystemCount(0);

        const { error } = await supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .eq('user_id', user?.id)
            .is('read_at', null);

        if (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    return {
        notifications,
        unreadMessageCount,
        unreadSystemCount,
        totalUnreadCount,
        markAsRead,
        markAllAsRead
    };
}
