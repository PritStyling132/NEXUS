"use server"

import { prisma } from "@/lib/prisma"
import { onAuthenticatedUser } from "./auth"

// ============ CHANNEL MESSAGES ============

export const onSendChannelMessage = async (channelId: string, message: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        if (!message.trim()) {
            return { status: 400, message: "Message cannot be empty" }
        }

        const newMessage = await prisma.message.create({
            data: {
                message: message.trim(),
                senderId: user.id,
                channelId: channelId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
        })

        return { status: 200, data: newMessage }
    } catch (error) {
        console.error("Error sending channel message:", error)
        return { status: 400, message: "Failed to send message" }
    }
}

export const onGetChannelMessages = async (
    channelId: string,
    limit: number = 50,
    cursor?: string
) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const messages = await prisma.message.findMany({
            where: { channelId },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy: { createdAt: "desc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
        })

        // Reverse to get oldest first for display
        const reversedMessages = messages.reverse()

        return {
            status: 200,
            data: {
                messages: reversedMessages,
                nextCursor: messages.length === limit ? messages[0]?.id : null,
            },
        }
    } catch (error) {
        console.error("Error fetching channel messages:", error)
        return { status: 400, message: "Failed to fetch messages" }
    }
}

// ============ DIRECT MESSAGES ============

export const onSendDirectMessage = async (receiverId: string, message: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        if (!message.trim()) {
            return { status: 400, message: "Message cannot be empty" }
        }

        const newMessage = await prisma.message.create({
            data: {
                message: message.trim(),
                senderId: user.id,
                receiverId: receiverId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
        })

        return { status: 200, data: newMessage }
    } catch (error) {
        console.error("Error sending direct message:", error)
        return { status: 400, message: "Failed to send message" }
    }
}

export const onGetDirectMessages = async (
    otherUserId: string,
    limit: number = 50,
    cursor?: string
) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const messages = await prisma.message.findMany({
            where: {
                channelId: null, // Only DMs
                OR: [
                    { senderId: user.id, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: user.id },
                ],
            },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
            orderBy: { createdAt: "desc" },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
        })

        // Reverse to get oldest first for display
        const reversedMessages = messages.reverse()

        return {
            status: 200,
            data: {
                messages: reversedMessages,
                nextCursor: messages.length === limit ? messages[0]?.id : null,
            },
        }
    } catch (error) {
        console.error("Error fetching direct messages:", error)
        return { status: 400, message: "Failed to fetch messages" }
    }
}

export const onGetConversations = async () => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get all unique users this user has exchanged DMs with
        const sentMessages = await prisma.message.findMany({
            where: {
                senderId: user.id,
                channelId: null,
                receiverId: { not: null },
            },
            select: {
                receiverId: true,
                createdAt: true,
                message: true,
                receiver: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        const receivedMessages = await prisma.message.findMany({
            where: {
                receiverId: user.id,
                channelId: null,
                senderId: { not: null },
            },
            select: {
                senderId: true,
                createdAt: true,
                message: true,
                sender: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        // Combine and deduplicate conversations
        const conversationMap = new Map<string, {
            id: string
            firstname: string
            lastname: string
            image: string | null
            lastMessage: string
            lastMessageAt: Date
        }>()

        sentMessages.forEach((msg) => {
            if (msg.receiverId && msg.receiver) {
                const existing = conversationMap.get(msg.receiverId)
                if (!existing || msg.createdAt > existing.lastMessageAt) {
                    conversationMap.set(msg.receiverId, {
                        id: msg.receiver.id,
                        firstname: msg.receiver.firstname,
                        lastname: msg.receiver.lastname,
                        image: msg.receiver.image,
                        lastMessage: msg.message,
                        lastMessageAt: msg.createdAt,
                    })
                }
            }
        })

        receivedMessages.forEach((msg) => {
            if (msg.senderId && msg.sender) {
                const existing = conversationMap.get(msg.senderId)
                if (!existing || msg.createdAt > existing.lastMessageAt) {
                    conversationMap.set(msg.senderId, {
                        id: msg.sender.id,
                        firstname: msg.sender.firstname,
                        lastname: msg.sender.lastname,
                        image: msg.sender.image,
                        lastMessage: msg.message,
                        lastMessageAt: msg.createdAt,
                    })
                }
            }
        })

        // Sort by last message date
        const conversations = Array.from(conversationMap.values()).sort(
            (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
        )

        return { status: 200, data: conversations }
    } catch (error) {
        console.error("Error fetching conversations:", error)
        return { status: 400, message: "Failed to fetch conversations" }
    }
}

export const onGetGroupMembers = async (groupId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get all members of the group
        const members = await prisma.members.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        // Also include the group owner
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: {
                owner: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                        email: true,
                    },
                },
            },
        })

        const memberUsers = members
            .filter((m) => m.user && m.user.id !== user.id)
            .map((m) => ({
                ...m.user!,
                isMember: true,
                isOwner: false,
            }))

        // Add owner if not the current user
        if (group?.owner && group.owner.id !== user.id) {
            memberUsers.unshift({
                ...group.owner,
                isMember: false,
                isOwner: true,
            })
        }

        return { status: 200, data: memberUsers }
    } catch (error) {
        console.error("Error fetching group members:", error)
        return { status: 400, message: "Failed to fetch members" }
    }
}
