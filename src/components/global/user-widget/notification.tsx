"use client"

import {
    Bell,
    Check,
    CheckCheck,
    Users,
    MessageSquare,
    BookOpen,
    Hash,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { onMarkNotificationAsRead } from "@/actions/notifications"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type Notification = {
    id: string
    title: string
    message: string
    type: "MEMBER_JOINED" | "NEW_MESSAGE" | "COURSE_ADDED" | "CHANNEL_CREATED"
    createdAt: string
    isRead: boolean
    groupId: string | null
    group: {
        id: string
        name: string
        thumbnail: string | null
    } | null
}

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
    switch (type) {
        case "MEMBER_JOINED":
            return <Users className="h-4 w-4 text-green-500" />
        case "NEW_MESSAGE":
            return <MessageSquare className="h-4 w-4 text-blue-500" />
        case "COURSE_ADDED":
            return <BookOpen className="h-4 w-4 text-purple-500" />
        case "CHANNEL_CREATED":
            return <Hash className="h-4 w-4 text-orange-500" />
        default:
            return <Bell className="h-4 w-4" />
    }
}

export const Notification = () => {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)

    const { data, refetch } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const response = await fetch("/api/notifications")
            const result = await response.json()
            return result.status === 200
                ? result.data
                : { notifications: [], unreadCount: 0 }
        },
        refetchInterval: 30000, // Poll every 30 seconds
    })

    const notifications = data?.notifications || []
    const unreadCount = data?.unreadCount || 0

    const handleMarkAsRead = async (notificationId: string) => {
        await onMarkNotificationAsRead(notificationId)
        refetch()
    }

    const handleMarkAllAsRead = async () => {
        await fetch("/api/notifications", { method: "POST" })
        refetch()
    }

    const getNotificationLink = (notification: Notification) => {
        if (notification.groupId) {
            return `/group/${notification.groupId}`
        }
        return "#"
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full hover:bg-accent"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                            <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground text-center">
                                No notifications yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 text-center mt-1">
                                You'll be notified when members join your groups
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification: Notification) => (
                                <Link
                                    key={notification.id}
                                    href={getNotificationLink(notification)}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            handleMarkAsRead(notification.id)
                                        }
                                        setIsOpen(false)
                                    }}
                                >
                                    <div
                                        className={`flex gap-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer ${
                                            !notification.isRead
                                                ? "bg-primary/5"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                <NotificationIcon
                                                    type={notification.type}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-tight">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            notification.createdAt,
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        },
                                                    )}
                                                </span>
                                                {notification.group && (
                                                    <span className="text-xs text-primary truncate">
                                                        {
                                                            notification.group
                                                                .name
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
