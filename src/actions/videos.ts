"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export const onCreateVideo = async (
    groupId: string,
    videoUrl: string,
    thumbnailUrl: string,
    caption: string,
    videoSize?: number,
    videoDuration?: number,
) => {
    try {
        const user = await currentUser()
        if (!user) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify ownership
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { userId: true },
        })

        if (!group) {
            return { status: 404, message: "Group not found" }
        }

        if (group.userId !== user.id) {
            return { status: 403, message: "Only group owners can add videos" }
        }

        // Check 30-video limit
        const videoCount = await prisma.video.count({
            where: { groupId },
        })

        if (videoCount >= 30) {
            return {
                status: 400,
                message: "Maximum of 30 videos allowed per group",
            }
        }

        // Get next order number
        const lastVideo = await prisma.video.findFirst({
            where: { groupId },
            orderBy: { order: "desc" },
            select: { order: true },
        })

        const nextOrder = lastVideo ? lastVideo.order + 1 : 0

        // Create video entry
        const video = await prisma.video.create({
            data: {
                groupId,
                videoUrl,
                thumbnailUrl,
                caption,
                videoSize,
                videoDuration,
                order: nextOrder,
            },
        })

        revalidatePath(`/about/${groupId}`)

        return {
            status: 200,
            message: "Video uploaded successfully",
            video,
        }
    } catch (error) {
        console.error("Error creating video:", error)
        return { status: 400, message: "Failed to create video" }
    }
}

export const onGetGroupVideos = async (groupId: string) => {
    try {
        const videos = await prisma.video.findMany({
            where: { groupId },
            orderBy: { order: "asc" },
            select: {
                id: true,
                videoUrl: true,
                thumbnailUrl: true,
                caption: true,
                createdAt: true,
                videoDuration: true,
                order: true,
            },
        })

        return { status: 200, videos }
    } catch (error) {
        console.error("Error fetching videos:", error)
        return { status: 400, message: "Failed to fetch videos", videos: [] }
    }
}

export const onDeleteVideo = async (videoId: string, groupId: string) => {
    try {
        const user = await currentUser()
        if (!user) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify ownership
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { userId: true },
        })

        if (!group || group.userId !== user.id) {
            return {
                status: 403,
                message: "Only group owners can delete videos",
            }
        }

        await prisma.video.delete({
            where: { id: videoId },
        })

        revalidatePath(`/about/${groupId}`)

        return { status: 200, message: "Video deleted successfully" }
    } catch (error) {
        console.error("Error deleting video:", error)
        return { status: 400, message: "Failed to delete video" }
    }
}
