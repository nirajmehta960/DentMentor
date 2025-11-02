import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, DollarSign, Star, Info, MessageSquare, Check } from 'lucide-react';
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            case 'session_booked': return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'payment_received': return <DollarSign className="h-4 w-4 text-green-500" />;
            case 'feedback_received': return <Star className="h-4 w-4 text-yellow-500" />;
            default: return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 p-0"
                >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {totalUnreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full text-[8px] sm:text-xs flex items-center justify-center text-white font-bold">
                            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {totalUnreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto text-xs px-2 text-muted-foreground hover:text-primary"
                            onClick={() => markAllAsRead()}
                        >
                            <Check className="w-3 h-3 mr-1" /> Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {unreadMessageCount > 0 && (
                        <button
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 border-b bg-primary/5"
                            onClick={handleMessagesClick}
                        >
                            <div className="mt-0.5 shrink-0">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-xs font-semibold leading-none">
                                    {unreadMessageCount} Unread Message{unreadMessageCount !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Check your messages inbox
                                </p>
                            </div>
                            <div className="shrink-0 mt-1.5">
                                <div className="w-2 h-2 bg-primary rounded-full" />
                            </div>
                        </button>
                    )}

                    {notifications.length === 0 && unreadMessageCount === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground h-full flex flex-col items-center justify-center">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className={cn(
                                        "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3",
                                        !notification.read_at && "bg-muted/20"
                                    )}
                                    onClick={() => handleItemClick(notification)}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-xs leading-none", !notification.read_at ? "font-semibold" : "font-medium")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground pt-0.5">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.read_at && (
                                        <div className="shrink-0 mt-1.5">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {/* Footer link to all messages */}
                <div className="p-2 border-t bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={handleMessagesClick}>
                        View all messages
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
