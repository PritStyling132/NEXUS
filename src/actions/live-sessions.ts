"use server"

import { prisma as client } from "@/lib/prisma"
import { onAuthenticatedUser } from "./auth"
import { sendEmail, getLiveSessionEmailTemplate } from "@/lib/email"

// Generate a unique Jitsi room URL
function generateJitsiRoomUrl(sessionId: string): string {
    const roomName = `nexus-live-${sessionId}`
    return `https://meet.jit.si/${roomName}`
}

// Create a new live session
export const onCreateLiveSession = async (
    courseId: string,
    groupId: string,
    title: string,
    description?: string,
    scheduledAt?: Date,
    isInstant?: boolean,
) => {
    try {
        const user = await onAuthenticatedUser()
        if (!user || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify user owns the group
        const group = await client.group.findFirst({
            where: {
                id: groupId,
                userId: user.id,
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstname: true,
                                lastname: true,
                            },
                        },
                    },
                },
                owner: {
                    select: {
                        firstname: true,
                        lastname: true,
                    },
                },
            },
        })

        if (!group) {
            return { status: 403, message: "You don't own this group" }
        }

        // Get course info
        const course = await client.course.findUnique({
            where: { id: courseId },
            select: { title: true },
        })

        if (!course) {
            return { status: 404, message: "Course not found" }
        }

        // Create the live session
        const session = await client.liveSession.create({
            data: {
                title,
                description,
                scheduledAt: isInstant ? null : scheduledAt,
                status: isInstant ? "LIVE" : "SCHEDULED",
                startedAt: isInstant ? new Date() : null,
                roomUrl: "", // Will be updated after creation
                courseId,
                groupId,
                createdBy: user.id,
            },
        })

        // Update with the Jitsi room URL
        const roomUrl = generateJitsiRoomUrl(session.id)
        await client.liveSession.update({
            where: { id: session.id },
            data: { roomUrl },
        })

        // Get the app URL for email links
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const joinUrl = `${appUrl}/group/${groupId}/live-sessions/${session.id}`

        // Send email notifications to all group members
        const ownerName = `${group.owner.firstname} ${group.owner.lastname}`
        const scheduledTimeStr = scheduledAt
            ? new Date(scheduledAt).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
              })
            : null

        // Send emails in parallel (but don't block the response)
        const emailPromises = group.members
            .filter((member) => member.user?.email)
            .map((member) =>
                sendEmail({
                    to: member.user!.email!,
                    subject: isInstant
                        ? `🔴 LIVE NOW: ${title} - ${course.title}`
                        : `📅 Upcoming Live Session: ${title} - ${course.title}`,
                    html: getLiveSessionEmailTemplate(
                        member.user!.firstname || "Member",
                        course.title,
                        title,
                        !!isInstant,
                        scheduledTimeStr,
                        joinUrl,
                        ownerName,
                    ),
                }),
            )

        // Also create in-app notifications
        const notificationPromises = group.members
            .filter((member) => member.user?.id)
            .map((member) =>
                client.notification.create({
                    data: {
                        title: isInstant
                            ? `🔴 Live Session Started: ${title}`
                            : `📅 New Live Session Scheduled: ${title}`,
                        message: isInstant
                            ? `${ownerName} has started a live session for "${course.title}". Join now!`
                            : `${ownerName} has scheduled a live session for "${course.title}" on ${scheduledTimeStr}.`,
                        type: "LIVE_SESSION",
                        userId: member.user!.id,
                        groupId,
                    },
                }),
            )

        // Execute notifications (don't await to avoid blocking)
        Promise.all([...emailPromises, ...notificationPromises]).catch(
            (error) => {
                console.error("Error sending notifications:", error)
            },
        )

        return {
            status: 200,
            data: { ...session, roomUrl },
            message: "Live session created successfully",
        }
    } catch (error) {
        console.error("Error creating live session:", error)
        return { status: 500, message: "Failed to create live session" }
    }
}

// Get all live sessions for a group
export const onGetGroupLiveSessions = async (groupId: string) => {
    try {
        const sessions = await client.liveSession.findMany({
            where: { groupId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
            orderBy: [{ status: "asc" }, { scheduledAt: "desc" }, { createdAt: "desc" }],
        })

        return { status: 200, data: sessions }
    } catch (error) {
        console.error("Error fetching live sessions:", error)
        return { status: 500, message: "Failed to fetch live sessions" }
    }
}

// Get live sessions for a specific course
export const onGetCourseLiveSessions = async (courseId: string) => {
    try {
        const sessions = await client.liveSession.findMany({
            where: { courseId },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
            orderBy: [{ status: "asc" }, { scheduledAt: "desc" }],
        })

        return { status: 200, data: sessions }
    } catch (error) {
        console.error("Error fetching course live sessions:", error)
        return { status: 500, message: "Failed to fetch live sessions" }
    }
}

// Get a single live session
export const onGetLiveSession = async (sessionId: string) => {
    try {
        const session = await client.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                    },
                },
                group: {
                    select: {
                        id: true,
                        name: true,
                        userId: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
            },
        })

        if (!session) {
            return { status: 404, message: "Live session not found" }
        }

        return { status: 200, data: session }
    } catch (error) {
        console.error("Error fetching live session:", error)
        return { status: 500, message: "Failed to fetch live session" }
    }
}

// Start a scheduled live session
export const onStartLiveSession = async (sessionId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (!user || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const session = await client.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                group: {
                    select: { userId: true },
                },
            },
        })

        if (!session) {
            return { status: 404, message: "Session not found" }
        }

        if (session.group.userId !== user.id) {
            return { status: 403, message: "Only the group owner can start this session" }
        }

        if (session.status === "LIVE") {
            return { status: 400, message: "Session is already live" }
        }

        if (session.status === "ENDED" || session.status === "CANCELLED") {
            return { status: 400, message: "Cannot start an ended or cancelled session" }
        }

        const updatedSession = await client.liveSession.update({
            where: { id: sessionId },
            data: {
                status: "LIVE",
                startedAt: new Date(),
            },
        })

        return { status: 200, data: updatedSession, message: "Session started" }
    } catch (error) {
        console.error("Error starting live session:", error)
        return { status: 500, message: "Failed to start live session" }
    }
}

// End a live session
export const onEndLiveSession = async (sessionId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (!user || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const session = await client.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                group: {
                    select: { userId: true },
                },
            },
        })

        if (!session) {
            return { status: 404, message: "Session not found" }
        }

        if (session.group.userId !== user.id) {
            return { status: 403, message: "Only the group owner can end this session" }
        }

        const updatedSession = await client.liveSession.update({
            where: { id: sessionId },
            data: {
                status: "ENDED",
                endedAt: new Date(),
            },
        })

        return { status: 200, data: updatedSession, message: "Session ended" }
    } catch (error) {
        console.error("Error ending live session:", error)
        return { status: 500, message: "Failed to end live session" }
    }
}

// Cancel a scheduled live session
export const onCancelLiveSession = async (sessionId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (!user || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const session = await client.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                group: {
                    select: { userId: true },
                },
            },
        })

        if (!session) {
            return { status: 404, message: "Session not found" }
        }

        if (session.group.userId !== user.id) {
            return { status: 403, message: "Only the group owner can cancel this session" }
        }

        if (session.status === "ENDED") {
            return { status: 400, message: "Cannot cancel an ended session" }
        }

        const updatedSession = await client.liveSession.update({
            where: { id: sessionId },
            data: {
                status: "CANCELLED",
            },
        })

        return { status: 200, data: updatedSession, message: "Session cancelled" }
    } catch (error) {
        console.error("Error cancelling live session:", error)
        return { status: 500, message: "Failed to cancel live session" }
    }
}

// Delete a live session
export const onDeleteLiveSession = async (sessionId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (!user || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const session = await client.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                group: {
                    select: { userId: true },
                },
            },
        })

        if (!session) {
            return { status: 404, message: "Session not found" }
        }

        if (session.group.userId !== user.id) {
            return { status: 403, message: "Only the group owner can delete this session" }
        }

        await client.liveSession.delete({
            where: { id: sessionId },
        })

        return { status: 200, message: "Session deleted successfully" }
    } catch (error) {
        console.error("Error deleting live session:", error)
        return { status: 500, message: "Failed to delete live session" }
    }
}

// Check if user can join a live session (is a member of the group)
export const onCanJoinLiveSession = async (sessionId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (!user || !user.id) {
            return { status: 401, canJoin: false, message: "Unauthorized" }
        }

        const session = await client.liveSession.findUnique({
            where: { id: sessionId },
            include: {
                group: {
                    include: {
                        members: {
                            where: { userId: user.id },
                        },
                    },
                },
            },
        })

        if (!session) {
            return { status: 404, canJoin: false, message: "Session not found" }
        }

        // Check if user is owner or member
        const isOwner = session.group.userId === user.id
        const isMember = session.group.members.length > 0

        if (!isOwner && !isMember) {
            return {
                status: 403,
                canJoin: false,
                message: "You must be a member of this group to join",
            }
        }

        return {
            status: 200,
            canJoin: true,
            isOwner,
            session,
        }
    } catch (error) {
        console.error("Error checking join permission:", error)
        return { status: 500, canJoin: false, message: "Failed to check permission" }
    }
}
