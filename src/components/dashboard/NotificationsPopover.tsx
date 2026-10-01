import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, DollarSign, Star, Info, MessageSquare, Check } from 'lucide-react';
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconTile } from "./dashboard-ui";

/*
 * Shared with the mentee dashboard's top bar, and the panel portals to <body>,
 * so everything here uses the app theme tokens rather than the site's band tokens.
 */
export function NotificationsPopover() {
    const { notifications, unreadMessageCount, totalUnreadCount, markAsRead, markAllAsRead } = useNotifications();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);

    const handleItemClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        setOpen(false);

        switch (notification.type) {
            case 'session_booked':
                navigate('/dashboard?tab=sessions');
                break;
            case 'payment_received':
                navigate('/dashboard?tab=overview');
                break;
            case 'feedback_received':
                navigate('/dashboard?tab=overview');
                break;
            default:
                break;
        }
    };

    const handleMessagesClick = () => {
        setOpen(false);
        navigate('/dashboard?tab=messages');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'session_booked': return Calendar;
            case 'payment_received': return DollarSign;
            case 'feedback_received': return Star;
            default: return Info;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={totalUnreadCount > 0 ? `Notifications, ${totalUnreadCount} unread` : "Notifications"}
                    className="relative grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Bell className="size-5" strokeWidth={1.75} aria-hidden="true" />
                    {totalUnreadCount > 0 && (
                        <span
                            aria-hidden="true"
                            className="absolute right-1 top-1 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-white tabular-nums ring-2 ring-white"
                        >
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden p-0" align="end" collisionPadding={12}>
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                    <h4 className="font-display text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">Notifications</h4>
                    {totalUnreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-mr-2 h-9 px-3 text-[0.8125rem] text-muted-foreground hover:text-foreground"
                            onClick={() => markAllAsRead()}
                        >
                            <Check className="size-3.5" aria-hidden="true" /> Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {unreadMessageCount > 0 && (
                        <button
                            type="button"
                            className="flex w-full gap-3 border-b bg-[rgb(15_112_93/0.04)] px-4 py-3 text-left transition-colors hover:bg-muted"
                            onClick={handleMessagesClick}
                        >
                            <IconTile icon={MessageSquare} />
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-[0.8125rem] font-semibold leading-snug text-foreground tabular-nums">
                                    {unreadMessageCount} unread message{unreadMessageCount !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Open your inbox to reply
                                </p>
                            </div>
                            <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                        </button>
                    )}

                    {notifications.length === 0 && unreadMessageCount === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                            <IconTile icon={Bell} />
                            <p className="text-sm text-muted-foreground">You're all caught up.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const Icon = getIcon(notification.type);
                                const unread = !notification.read_at;
                                return (
                                    <button
                                        type="button"
                                        key={notification.id}
                                        className={cn(
                                            "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
                                            unread && "bg-[rgb(15_112_93/0.03)]"
                                        )}
                                        onClick={() => handleItemClick(notification)}
                                    >
                                        <IconTile icon={Icon} />
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className={cn("text-[0.8125rem] leading-snug text-foreground", unread ? "font-semibold" : "font-medium")}>
                                                {notification.title}
                                            </p>
                                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="text-[0.6875rem] text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {unread && (
                                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                                                <span className="sr-only">Unread</span>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
                {/* Footer link to all messages */}
                <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="h-10 w-full text-[0.8125rem]" onClick={handleMessagesClick}>
                        View all messages
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
