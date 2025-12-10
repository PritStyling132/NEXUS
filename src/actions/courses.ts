"use server"

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

// ============================================================================
// COURSE CRUD OPERATIONS
// ============================================================================

export const onCreateCourse = async (
    groupId: string,
    title: string,
    description?: string,
    thumbnail?: string,
) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify group ownership
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { userId: true },
        })

        if (!group || group.userId !== user.id) {
            return {
                status: 403,
                message: "Only group owners can create courses",
            }
        }

        const course = await prisma.course.create({
            data: {
                title,
                description,
                thumbnail,
                groupId,
                published: false, // Start as draft
            },
        })

        revalidatePath(`/group/${groupId}/courses`)
        return { status: 200, course }
    } catch (error) {
        console.error("Error creating course:", error)
        return { status: 400, message: "Failed to create course" }
    }
}

export const onUpdateCourse = async (
    courseId: string,
    data: {
        title?: string
        description?: string
        thumbnail?: string
        published?: boolean
    },
) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership through course -> group
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { group: { select: { userId: true, id: true } } },
        })

        if (!course || course.group.userId !== user.id) {
            return {
                status: 403,
                message: "Only course owners can update courses",
            }
        }

        console.log("📝 Updating course with data:", data)

        const updated = await prisma.course.update({
            where: { id: courseId },
            data,
        })

        console.log("✅ Course updated successfully:", updated.id)

        revalidatePath(`/group/${course.group.id}/courses`)
        revalidatePath(`/group/${course.group.id}/courses/${courseId}`)
        return { status: 200, course: updated }
    } catch (error) {
        console.error("Error updating course:", error)
        return { status: 400, message: "Failed to update course" }
    }
}

export const onDeleteCourse = async (courseId: string) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { group: { select: { userId: true, id: true } } },
        })

        if (!course || course.group.userId !== user.id) {
            return {
                status: 403,
                message: "Only course owners can delete courses",
            }
        }

        await prisma.course.delete({
            where: { id: courseId },
        })

        revalidatePath(`/group/${course.group.id}/courses`)
        return { status: 200, message: "Course deleted successfully" }
    } catch (error) {
        console.error("Error deleting course:", error)
        return { status: 400, message: "Failed to delete course" }
    }
}

export const onGetCourse = async (courseId: string) => {
    try {
        const clerkUser = await currentUser()

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        userId: true,
                    },
                },
                videos: {
                    // Show all videos to owner, only published to others
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        title: true,
                        caption: true,
                        videoUrl: true,
                        thumbnailUrl: true,
                        duration: true,
                        order: true,
                        published: true,
                    },
                },
                resources: {
                    orderBy: { order: "asc" },
                },
            },
        })

        if (!course) {
            return { status: 404, message: "Course not found" }
        }

        // Filter videos based on ownership - owners see all, others see only published
        if (clerkUser) {
            const user = await prisma.user.findUnique({
                where: { clerkId: clerkUser.id },
                select: { id: true },
            })

            // If not the owner, filter to published videos only
            if (!user || course.group.userId !== user.id) {
                course.videos = course.videos.filter((v) => v.published)
            }
        } else {
            // Not logged in, show only published
            course.videos = course.videos.filter((v) => v.published)
        }

        return { status: 200, course }
    } catch (error) {
        console.error("Error fetching course:", error)
        return { status: 400, message: "Failed to fetch course" }
    }
}

export const onGetGroupCourses = async (groupId: string) => {
    try {
        const courses = await prisma.course.findMany({
            where: { groupId },
            include: {
                videos: {
                    where: { published: true },
                    select: { id: true },
                },
                _count: {
                    select: {
                        videos: true,
                        resources: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return { status: 200, courses }
    } catch (error) {
        console.error("Error fetching courses:", error)
        return { status: 400, message: "Failed to fetch courses" }
    }
}

// ============================================================================
// COURSE VIDEO OPERATIONS
// ============================================================================

export const onCreateCourseVideo = async (
    courseId: string,
    videoUrl: string,
    thumbnailUrl: string,
    title: string,
    caption?: string,
) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                group: { select: { userId: true } },
                videos: {
                    select: { order: true },
                    orderBy: { order: "desc" },
                    take: 1,
                },
            },
        })

        if (!course || course.group.userId !== user.id) {
            return { status: 403, message: "Only course owners can add videos" }
        }

        // Get next order number
        const nextOrder =
            course.videos.length > 0 ? course.videos[0].order + 1 : 0

        console.log("📹 Creating video with UUIDs:", {
            videoUrl,
            thumbnailUrl,
            title,
            courseId,
        })

        const video = await prisma.courseVideo.create({
            data: {
                courseId,
                title,
                caption,
                videoUrl,
                thumbnailUrl,
                order: nextOrder,
            },
        })

        console.log("✅ Video created successfully:", video.id)

        revalidatePath(`/group/${course.groupId}/courses/${courseId}`)
        return { status: 200, video }
    } catch (error) {
        console.error("Error creating course video:", error)
        return { status: 400, message: "Failed to create video" }
    }
}

export const onUpdateCourseVideo = async (
    videoId: string,
    data: {
        title?: string
        caption?: string
        order?: number
        published?: boolean
    },
) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership
        const video = await prisma.courseVideo.findUnique({
            where: { id: videoId },
            include: {
                course: {
                    include: { group: { select: { userId: true, id: true } } },
                },
            },
        })

        if (!video || video.course.group.userId !== user.id) {
            return { status: 403, message: "Unauthorized" }
        }

        const updated = await prisma.courseVideo.update({
            where: { id: videoId },
            data,
        })

        revalidatePath(
            `/group/${video.course.group.id}/courses/${video.courseId}`,
        )
        return { status: 200, video: updated }
    } catch (error) {
        console.error("Error updating video:", error)
        return { status: 400, message: "Failed to update video" }
    }
}

export const onDeleteCourseVideo = async (videoId: string) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership
        const video = await prisma.courseVideo.findUnique({
            where: { id: videoId },
            include: {
                course: {
                    include: { group: { select: { userId: true, id: true } } },
                },
            },
        })

        if (!video || video.course.group.userId !== user.id) {
            return { status: 403, message: "Unauthorized" }
        }

        await prisma.courseVideo.delete({
            where: { id: videoId },
        })

        revalidatePath(
            `/group/${video.course.group.id}/courses/${video.courseId}`,
        )
        return { status: 200, message: "Video deleted successfully" }
    } catch (error) {
        console.error("Error deleting video:", error)
        return { status: 400, message: "Failed to delete video" }
    }
}

// ============================================================================
// COURSE RESOURCE OPERATIONS
// ============================================================================

export const onCreateCourseResource = async (
    courseId: string,
    title: string,
    url: string,
    type: "YOUTUBE" | "LINK" | "DOCUMENT",
    description?: string,
) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                group: { select: { userId: true } },
                resources: {
                    select: { order: true },
                    orderBy: { order: "desc" },
                    take: 1,
                },
            },
        })

        if (!course || course.group.userId !== user.id) {
            return {
                status: 403,
                message: "Only course owners can add resources",
            }
        }

        // Get next order number
        const nextOrder =
            course.resources.length > 0 ? course.resources[0].order + 1 : 0

        const resource = await prisma.courseResource.create({
            data: {
                courseId,
                title,
                url,
                type,
                description,
                order: nextOrder,
            },
        })

        revalidatePath(`/group/${course.groupId}/courses/${courseId}`)
        return { status: 200, resource }
    } catch (error) {
        console.error("Error creating resource:", error)
        return { status: 400, message: "Failed to create resource" }
    }
}

export const onDeleteCourseResource = async (resourceId: string) => {
    try {
        const clerkUser = await currentUser()
        if (!clerkUser) {
            return { status: 401, message: "Unauthorized" }
        }

        // Get Prisma user from Clerk ID
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUser.id },
            select: { id: true },
        })

        if (!user) {
            return { status: 401, message: "User not found" }
        }

        // Verify ownership
        const resource = await prisma.courseResource.findUnique({
            where: { id: resourceId },
            include: {
                course: {
                    include: { group: { select: { userId: true, id: true } } },
                },
            },
        })

        if (!resource || resource.course.group.userId !== user.id) {
            return { status: 403, message: "Unauthorized" }
        }

        await prisma.courseResource.delete({
            where: { id: resourceId },
        })

        revalidatePath(
            `/group/${resource.course.group.id}/courses/${resource.courseId}`,
        )
        return { status: 200, message: "Resource deleted successfully" }
    } catch (error) {
        console.error("Error deleting resource:", error)
        return { status: 400, message: "Failed to delete resource" }
    }
}

// ============================================================================
// STATS AND ANALYTICS
// ============================================================================

export const onGetCourseStats = async (groupId: string) => {
    try {
        const [totalCourses, publishedCourses, totalVideos, totalResources] =
            await Promise.all([
                prisma.course.count({ where: { groupId } }),
                prisma.course.count({ where: { groupId, published: true } }),
                prisma.courseVideo.count({
                    where: {
                        course: { groupId },
                    },
                }),
                prisma.courseResource.count({
                    where: {
                        course: { groupId },
                    },
                }),
            ])

        return {
            status: 200,
            stats: {
                totalCourses,
                publishedCourses,
                totalVideos,
                totalResources,
            },
        }
    } catch (error) {
        console.error("Error fetching course stats:", error)
        return { status: 400, message: "Failed to fetch stats" }
    }
}
