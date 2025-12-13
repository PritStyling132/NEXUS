"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { onAuthenticatedUser } from "./auth"
import client from "@/lib/prisma"

import { revalidatePath } from "next/cache"

// ADD THIS FUNCTION to check payment before group creation
export const createGroupWithSubscription = async (groupData: any) => {
    try {
        const user = await currentUser()
        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user has payment method
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                razorpayCustomerId: true,
                razorpayTokenId: true,
            },
        })

        if (!dbUser?.razorpayCustomerId || !dbUser?.razorpayTokenId) {
            return {
                success: false,
                error: "Payment method required",
                redirectTo: "/payment-setup",
            }
        }

        // Create the group first
        const group = await prisma.group.create({
            data: {
                ...groupData,
                userId: dbUser.id,
            },
        })

        // Then create subscription for the group
        const subscriptionResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/razorpay/create-subscription`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId: group.id }),
            },
        )

        const subscriptionData = await subscriptionResponse.json()

        if (!subscriptionData.success) {
            // Rollback: delete the group if subscription creation fails
            await prisma.group.delete({ where: { id: group.id } })
            return { success: false, error: subscriptionData.error }
        }

        return {
            success: true,
            group,
            subscription: subscriptionData,
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export const onGetGroupInfo = async (groupid: string) => {
    try {
        const user = await onAuthenticatedUser()
        const group = await client.group.findUnique({
            where: {
                id: groupid,
            },
        })

        if (group) {
            return {
                status: 200,
                group,
                // Only mark as owner if user is authenticated and matches group owner
                groupOwner: user.status === 200 && user.id === group.userId,
            }
        }

        return { status: 404 }
    } catch (error) {
        return { status: 400 }
    }
}

export const onGetUserGroups = async (id: string) => {
    try {
        const result = await client.user.findUnique({
            where: {
                id,
            },
            select: {
                groups: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        channels: {
                            where: {
                                name: "general",
                            },
                            select: {
                                id: true,
                            },
                        },
                    },
                },

                memberships: {
                    select: {
                        group: {
                            select: {
                                id: true,
                                icon: true,
                                name: true,
                                channels: {
                                    where: {
                                        name: "general",
                                    },
                                    select: {
                                        id: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (
            result &&
            (result.groups.length > 0 || result.memberships.length > 0)
        ) {
            return {
                status: 200,
                groups: result.groups,
                members: result.memberships,
            }
        }
        return {
            status: 404,
        }
    } catch (error) {
        return { status: 400 }
    }
}

export const onGetGroupChannels = async (groupid: string) => {
    try {
        const channels = await client.channel.findMany({
            where: {
                groupId: groupid,
            },
            orderBy: {
                createdAt: "asc",
            },
        })

        return { status: 200, channels }
    } catch (error) {
        return { status: 400, message: "Oops! something went wrong" }
    }
}

export const onGetGroupSubscriptions = async (groupid: string) => {
    try {
        const subscriptions = await client.subscription.findMany({
            where: {
                groupId: groupid,
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        const count = await client.members.count({
            where: {
                groupId: groupid,
            },
        })

        if (subscriptions) {
            return {
                status: 200,
                subscriptions,
                count,
            }
        }
    } catch (error) {
        return { status: 400 }
    }
}

export const onGetGroupDashboardData = async (groupid: string) => {
    try {
        // Get member count
        const memberCount = await client.members.count({
            where: {
                groupId: groupid,
            },
        })

        // Get channel count
        const channelCount = await client.channel.count({
            where: {
                groupId: groupid,
            },
        })

        // Get course count
        const courseCount = await client.course.count({
            where: {
                groupId: groupid,
            },
        })

        // Get subscription count
        const subscriptionCount = await client.subscription.count({
            where: {
                groupId: groupid,
            },
        })

        // Get recent activity (posts/messages)
        const recentPosts = await client.post.count({
            where: {
                module: {
                    groupId: groupid,
                },
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
            },
        })

        return {
            status: 200,
            data: {
                memberCount,
                channelCount,
                courseCount,
                subscriptionCount,
                recentActivity: recentPosts,
            },
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        return {
            status: 400,
            message: "Failed to fetch dashboard data",
        }
    }
}

// Get learner dashboard data (joined groups and stats)
export const onGetLearnerDashboardData = async () => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get all groups the user has joined as a member
        // Use distinct to avoid duplicates if any exist
        const memberships = await client.members.findMany({
            where: { userId: user.id },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        thumbnail: true,
                        description: true,
                        category: true,
                        channels: {
                            select: { id: true },
                            take: 1,
                        },
                        _count: {
                            select: {
                                members: true,
                                courses: true,
                                channels: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        // Filter out memberships with null groups and deduplicate by group ID
        const validMemberships = memberships.filter((m) => m.group !== null)

        // Deduplicate groups by ID (keep the first/most recent membership)
        const seenGroupIds = new Set<string>()
        const uniqueMemberships = validMemberships.filter((m) => {
            if (m.group && !seenGroupIds.has(m.group.id)) {
                seenGroupIds.add(m.group.id)
                return true
            }
            return false
        })

        const totalGroupsJoined = uniqueMemberships.length

        // Count total courses across all unique joined groups
        const totalCoursesAvailable = uniqueMemberships.reduce(
            (acc, m) => acc + (m.group?._count?.courses || 0),
            0,
        )

        // Count total channels across all unique joined groups
        const totalChannelsAvailable = uniqueMemberships.reduce(
            (acc, m) => acc + (m.group?._count?.channels || 0),
            0,
        )

        // Count total members across all unique joined groups (for community size)
        const totalCommunityMembers = uniqueMemberships.reduce(
            (acc, m) => acc + (m.group?._count?.members || 0),
            0,
        )

        return {
            status: 200,
            data: {
                joinedGroups: uniqueMemberships.map((m) => ({
                    ...m.group!,
                    joinedAt: m.createdAt,
                })),
                stats: {
                    totalGroupsJoined,
                    totalCoursesAvailable,
                    totalChannelsAvailable,
                    totalCommunityMembers,
                },
            },
        }
    } catch (error) {
        console.error("Error fetching learner dashboard data:", error)
        return { status: 400, message: "Failed to fetch dashboard data" }
    }
}

// Check if current user is a member of a group
export const onCheckGroupMembership = async (groupid: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, isMember: false, isOwner: false }
        }

        // Check if user is the owner
        const group = await client.group.findUnique({
            where: { id: groupid },
            select: { userId: true },
        })

        if (group?.userId === user.id) {
            return { status: 200, isMember: true, isOwner: true }
        }

        // Check if user is a member
        const membership = await client.members.findFirst({
            where: {
                userId: user.id,
                groupId: groupid,
            },
        })

        return {
            status: 200,
            isMember: !!membership,
            isOwner: false,
        }
    } catch (error) {
        console.error("Error checking group membership:", error)
        return { status: 400, isMember: false, isOwner: false }
    }
}

// Public stats for the about page (no auth required)
export const onGetGroupPublicStats = async (groupid: string) => {
    try {
        // Get member count
        const memberCount = await client.members.count({
            where: { groupId: groupid },
        })

        // Get channel count
        const channelCount = await client.channel.count({
            where: { groupId: groupid },
        })

        // Get course count
        const courseCount = await client.course.count({
            where: { groupId: groupid },
        })

        return {
            status: 200,
            data: {
                memberCount,
                channelCount,
                courseCount,
            },
        }
    } catch (error) {
        console.error("Error fetching public group stats:", error)
        return {
            status: 400,
            data: {
                memberCount: 0,
                channelCount: 0,
                courseCount: 0,
            },
        }
    }
}

export const onCreateNewChannels = async (
    groupid: string,
    data: {
        id: string
        name: string
        icon: string
    },
) => {
    try {
        const group = await client.group.update({
            where: {
                id: groupid,
            },
            data: {
                channels: {
                    create: {
                        ...data,
                    },
                },
            },
            select: {
                channels: true,
            },
        })

        if (group) {
            return { status: 200, channels: group.channels }
        }

        return {
            status: 404,
            message: "Channel could not be created",
        }
    } catch (error) {
        return {
            status: 400,
            message: "Oops! something went wrong",
        }
    }
}

export const onUpdateChannelInfo = async (
    channelId: string,
    icon?: string,
    name?: string,
) => {
    try {
        // Build update data dynamically
        const updateData: { icon?: string; name?: string } = {}
        if (icon) updateData.icon = icon
        if (name) updateData.name = name

        // Single update call
        const channel = await client.channel.update({
            where: { id: channelId },
            data: updateData,
        })

        if (channel) {
            return {
                status: 200,
                message: "Channel successfully updated",
            }
        }

        return {
            status: 404,
            message: "Channel not found! try again later",
        }
    } catch (error) {
        console.log(error)
        return {
            status: 400,
            message: "Oops! something went wrong",
        }
    }
}

export const onDeleteChannel = async (channelId: string) => {
    try {
        const channel = await client.channel.delete({
            where: {
                id: channelId,
            },
        })

        if (channel) {
            return { status: 200, message: "Channel deleted successfully" }
        }

        return { status: 404, message: "Channel not found!" }
    } catch (error) {
        return { status: 400, message: "Oops! something went wrong" }
    }
}

// or wherever your prisma client is defined

export const onSearchGroups = async (
    mode: "GROUPS" | "POSTS",
    query: string,
    paginate?: number,
) => {
    try {
        if (mode === "GROUPS") {
            const fetchedGroups = await client.group.findMany({
                where: {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                take: 6,
                skip: paginate || 0,
            })

            if (fetchedGroups) {
                if (fetchedGroups.length > 0) {
                    return {
                        status: 200,
                        groups: fetchedGroups,
                    }
                }
            }

            return { status: 404 }
        }

        if (mode === "POSTS") {
            // Logic for posts would go here
        }
    } catch (error) {
        return { status: 400, message: "Oops! something went wrong" }
    }
}

export const onUpdateGroupSettings = async (
    groupid: string,
    type:
        | "IMAGE"
        | "ICON"
        | "NAME"
        | "DESCRIPTION"
        | "JSONDESCRIPTION"
        | "HTMLDESCRIPTION",
    content: string,
    path: string,
) => {
    try {
        console.log(
            `🔧 [Server] Updating group ${groupid} - ${type}:`,
            content.substring(0, 100),
        )

        if (type === "IMAGE") {
            const result = await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    thumbnail: content,
                },
            })
            console.log("✅ [Server] Thumbnail updated successfully")
        }

        if (type === "ICON") {
            const result = await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    icon: content,
                },
            })
            console.log("✅ [Server] Icon updated successfully")
        }

        if (type === "NAME") {
            const result = await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    name: content,
                },
            })
            console.log("✅ [Server] Name updated successfully")
        }

        if (type === "DESCRIPTION") {
            const result = await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    description: content,
                },
            })
            console.log("✅ [Server] Description updated successfully")
        }

        if (type === "JSONDESCRIPTION") {
            const result = await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    jsonDescription: content,
                },
            })
            console.log("✅ [Server] JSON description updated successfully")
        }

        if (type === "HTMLDESCRIPTION") {
            const result = await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    htmlDescription: content,
                },
            })
            console.log("✅ [Server] HTML description updated successfully")
        }

        revalidatePath(path)
        console.log("✅ [Server] Path revalidated:", path)
        return { status: 200 }
    } catch (error) {
        console.error("❌ [Server] Error updating group settings:", error)
        return { status: 400 }
    }
}

export const onUpdateGroupGallery = async (
    groupid: string,
    content: string,
) => {
    try {
        // 1. Fetch the current gallery to check the limit
        const mediaLimit = await client.group.findUnique({
            where: {
                id: groupid,
            },
            select: {
                gallery: true,
            },
        })

        // 2. Check if the gallery length is less than 6
        if (mediaLimit && mediaLimit?.gallery.length < 6) {
            // 3. If within limits, push the new content to the gallery array
            await client.group.update({
                where: {
                    id: groupid,
                },
                data: {
                    gallery: {
                        push: content,
                    },
                },
            })

            // Invalidate the cache for the group's about page
            revalidatePath(`/about/${groupid}`)

            // Success response
            return { status: 200 }
        }

        // 4. Return an error if the limit is exceeded
        return {
            status: 400,
            message: "Looks like your gallery has the maximum media allowed",
        }
    } catch (error) {
        // 5. Handle unexpected server/database errors
        return { status: 400, message: "Looks like something went wrong" }
    }
}

export const onDeleteFromGallery = async (
    groupid: string,
    mediaUrl: string,
) => {
    try {
        // Get the current gallery
        const group = await client.group.findUnique({
            where: { id: groupid },
            select: { gallery: true, userId: true },
        })

        if (!group) {
            return { status: 404, message: "Group not found" }
        }

        // Verify the user is the group owner
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || user.id !== group.userId) {
            return {
                status: 403,
                message: "Only the group owner can delete gallery items",
            }
        }

        // Filter out the media URL to delete
        const updatedGallery = group.gallery.filter((url) => url !== mediaUrl)

        // Update the group with the new gallery
        await client.group.update({
            where: { id: groupid },
            data: { gallery: updatedGallery },
        })

        // Invalidate the cache
        revalidatePath(`/about/${groupid}`)

        return { status: 200, message: "Media deleted successfully" }
    } catch (error) {
        console.error("Error deleting from gallery:", error)
        return { status: 400, message: "Failed to delete media" }
    }
}

export const onJoinGroup = async (groupid: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Check if user is already a member
        const existingMembership = await client.members.findFirst({
            where: {
                userId: user.id,
                groupId: groupid,
            },
        })

        if (existingMembership) {
            return { status: 200, message: "Already a member" }
        }

        // Get full group info including owner and name
        const group = await client.group.findUnique({
            where: { id: groupid },
            select: {
                userId: true,
                name: true,
            },
        })

        if (group?.userId === user.id) {
            return { status: 200, message: "You are the owner" }
        }

        // Get the joining user's name
        const joiningUser = await client.user.findUnique({
            where: { id: user.id },
            select: { firstname: true, lastname: true },
        })

        // Create new membership
        const member = await client.members.create({
            data: {
                userId: user.id,
                groupId: groupid,
            },
        })

        if (member && group) {
            // Create notification for the group owner
            await client.notification.create({
                data: {
                    title: "New Member Joined",
                    message:
                        `${joiningUser?.firstname || "Someone"} ${joiningUser?.lastname || ""} has joined your group "${group.name}"`.trim(),
                    type: "MEMBER_JOINED",
                    userId: group.userId, // Notify the owner
                    groupId: groupid,
                    relatedUserId: user.id,
                },
            })

            return { status: 200, message: "Successfully joined" }
        }

        return { status: 400, message: "Failed to join group" }
    } catch (error) {
        console.error("Error joining group:", error)
        return { status: 404, message: "Group not found" }
    }
}
