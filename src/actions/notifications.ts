"use server"

import { prisma } from "@/lib/prisma"
import { onAuthenticatedUser } from "./auth"
import { NotificationType } from "@prisma/client"

export const onGetNotifications = async (limit: number = 20) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                    },
                },
            },
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: user.id,
                isRead: false,
            },
        })

        return {
            status: 200,
            data: {
                notifications,
                unreadCount,
            },
        }
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return { status: 400, message: "Failed to fetch notifications" }
    }
}

export const onMarkNotificationAsRead = async (notificationId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: user.id,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        })

        return { status: 200, message: "Notification marked as read" }
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return { status: 400, message: "Failed to mark notification as read" }
    }
}

export const onMarkAllNotificationsAsRead = async () => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        await prisma.notification.updateMany({
            where: {
                userId: user.id,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        })

        return { status: 200, message: "All notifications marked as read" }
    } catch (error) {
        console.error("Error marking all notifications as read:", error)
        return { status: 400, message: "Failed to mark notifications as read" }
    }
}

// Internal function to create notifications (used by other actions)
export const createNotification = async (data: {
    title: string
    message: string
    type: NotificationType
    userId: string
    groupId?: string
    relatedUserId?: string
}) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                userId: data.userId,
                groupId: data.groupId,
                relatedUserId: data.relatedUserId,
            },
        })

        return { status: 200, data: notification }
    } catch (error) {
        console.error("Error creating notification:", error)
        return { status: 400, message: "Failed to create notification" }
    }
}

export const onGetUnreadCount = async () => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, count: 0 }
        }

        const count = await prisma.notification.count({
            where: {
                userId: user.id,
                isRead: false,
            },
        })

        return { status: 200, count }
    } catch (error) {
        console.error("Error fetching unread count:", error)
        return { status: 400, count: 0 }
    }
}
