"use server"

import { prisma } from "@/lib/prisma"
import { onAuthenticatedUser } from "./auth"

// Create a new reel (owners only)
export const onCreateReel = async (data: {
    groupId: string
    videoUrl: string
    thumbnailUrl?: string
    caption?: string
    duration?: number
}) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify user owns this group
        const group = await prisma.group.findFirst({
            where: {
                id: data.groupId,
                userId: auth.id,
            },
        })

        if (!group) {
            return { status: 403, message: "You don't own this group" }
        }

        const reel = await prisma.reel.create({
            data: {
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl,
                caption: data.caption,
                duration: data.duration,
                groupId: data.groupId,
            },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                        owner: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        })

        return { status: 200, data: reel }
    } catch (error) {
        console.error("onCreateReel Error:", error)
        return { status: 500, message: "Failed to create reel" }
    }
}

// Get all reels for marketing page (public)
export const onGetReels = async (
    cursor?: string,
    limit: number = 10
) => {
    try {
        const reels = await prisma.reel.findMany({
            take: limit + 1, // Fetch one extra to check if there are more
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1, // Skip the cursor itself
            }),
            orderBy: { createdAt: "desc" },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        })

        const hasMore = reels.length > limit
        const data = hasMore ? reels.slice(0, -1) : reels
        const nextCursor = hasMore ? data[data.length - 1]?.id : undefined

        return {
            status: 200,
            data: {
                reels: data,
                nextCursor,
                hasMore,
            },
        }
    } catch (error) {
        console.error("onGetReels Error:", error)
        return { status: 500, message: "Failed to fetch reels" }
    }
}

// Get a single reel by ID (for sharing)
export const onGetReelById = async (reelId: string) => {
    try {
        const reel = await prisma.reel.findUnique({
            where: { id: reelId },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                        category: true,
                        description: true,
                        owner: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        })

        if (!reel) {
            return { status: 404, message: "Reel not found" }
        }

        // Increment view count
        await prisma.reel.update({
            where: { id: reelId },
            data: { views: { increment: 1 } },
        })

        return { status: 200, data: reel }
    } catch (error) {
        console.error("onGetReelById Error:", error)
        return { status: 500, message: "Failed to fetch reel" }
    }
}

// Get reels by group (for group owners to manage)
export const onGetGroupReels = async (groupId: string) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify user owns this group
        const group = await prisma.group.findFirst({
            where: {
                id: groupId,
                userId: auth.id,
            },
        })

        if (!group) {
            return { status: 403, message: "You don't own this group" }
        }

        const reels = await prisma.reel.findMany({
            where: { groupId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        })

        return { status: 200, data: reels }
    } catch (error) {
        console.error("onGetGroupReels Error:", error)
        return { status: 500, message: "Failed to fetch group reels" }
    }
}

// Like/Unlike a reel
export const onToggleReelLike = async (reelId: string) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Please sign in to like reels" }
        }

        // Check if already liked
        const existingLike = await prisma.reelLike.findUnique({
            where: {
                reelId_userId: {
                    reelId,
                    userId: auth.id,
                },
            },
        })

        if (existingLike) {
            // Unlike
            await prisma.reelLike.delete({
                where: { id: existingLike.id },
            })
            return { status: 200, data: { liked: false } }
        } else {
            // Like
            await prisma.reelLike.create({
                data: {
                    reelId,
                    userId: auth.id,
                },
            })
            return { status: 200, data: { liked: true } }
        }
    } catch (error) {
        console.error("onToggleReelLike Error:", error)
        return { status: 500, message: "Failed to toggle like" }
    }
}

// Check if user has liked a reel
export const onCheckReelLike = async (reelId: string) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 200, data: { liked: false } }
        }

        const like = await prisma.reelLike.findUnique({
            where: {
                reelId_userId: {
                    reelId,
                    userId: auth.id,
                },
            },
        })

        return { status: 200, data: { liked: !!like } }
    } catch (error) {
        console.error("onCheckReelLike Error:", error)
        return { status: 200, data: { liked: false } }
    }
}

// Add a comment to a reel
export const onAddReelComment = async (
    reelId: string,
    content: string,
    parentId?: string
) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Please sign in to comment" }
        }

        if (!content.trim()) {
            return { status: 400, message: "Comment cannot be empty" }
        }

        const comment = await prisma.reelComment.create({
            data: {
                content: content.trim(),
                reelId,
                userId: auth.id,
                parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        })

        return { status: 200, data: comment }
    } catch (error) {
        console.error("onAddReelComment Error:", error)
        return { status: 500, message: "Failed to add comment" }
    }
}

// Get comments for a reel
export const onGetReelComments = async (reelId: string) => {
    try {
        const comments = await prisma.reelComment.findMany({
            where: {
                reelId,
                parentId: null, // Only top-level comments
            },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        image: true,
                    },
                },
                replies: {
                    orderBy: { createdAt: "asc" },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
        })

        return { status: 200, data: comments }
    } catch (error) {
        console.error("onGetReelComments Error:", error)
        return { status: 500, message: "Failed to fetch comments" }
    }
}

// Delete a comment (owner of comment or group owner)
export const onDeleteReelComment = async (commentId: string) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const comment = await prisma.reelComment.findUnique({
            where: { id: commentId },
            include: {
                reel: {
                    include: {
                        group: {
                            select: { userId: true },
                        },
                    },
                },
            },
        })

        if (!comment) {
            return { status: 404, message: "Comment not found" }
        }

        // Check if user is comment owner or group owner
        const isCommentOwner = comment.userId === auth.id
        const isGroupOwner = comment.reel.group.userId === auth.id

        if (!isCommentOwner && !isGroupOwner) {
            return { status: 403, message: "You cannot delete this comment" }
        }

        await prisma.reelComment.delete({
            where: { id: commentId },
        })

        return { status: 200, message: "Comment deleted" }
    } catch (error) {
        console.error("onDeleteReelComment Error:", error)
        return { status: 500, message: "Failed to delete comment" }
    }
}

// Delete a reel (owner only)
export const onDeleteReel = async (reelId: string) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const reel = await prisma.reel.findUnique({
            where: { id: reelId },
            include: {
                group: {
                    select: { userId: true },
                },
            },
        })

        if (!reel) {
            return { status: 404, message: "Reel not found" }
        }

        if (reel.group.userId !== auth.id) {
            return { status: 403, message: "You don't own this reel" }
        }

        await prisma.reel.delete({
            where: { id: reelId },
        })

        return { status: 200, message: "Reel deleted successfully" }
    } catch (error) {
        console.error("onDeleteReel Error:", error)
        return { status: 500, message: "Failed to delete reel" }
    }
}

// Update reel caption
export const onUpdateReelCaption = async (reelId: string, caption: string) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const reel = await prisma.reel.findUnique({
            where: { id: reelId },
            include: {
                group: {
                    select: { userId: true },
                },
            },
        })

        if (!reel) {
            return { status: 404, message: "Reel not found" }
        }

        if (reel.group.userId !== auth.id) {
            return { status: 403, message: "You don't own this reel" }
        }

        const updated = await prisma.reel.update({
            where: { id: reelId },
            data: { caption },
        })

        return { status: 200, data: updated }
    } catch (error) {
        console.error("onUpdateReelCaption Error:", error)
        return { status: 500, message: "Failed to update reel" }
    }
}
