"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    CourseSchema,
    type CourseFormData,
} from "@/components/forms/course-form/schema"
import {
    CourseVideoSchema,
    type CourseVideoFormData,
} from "@/components/forms/course-video-form/schema"
import {
    CourseResourceSchema,
    type CourseResourceFormData,
} from "@/components/forms/course-resource-form/schema"
import { uploadFile } from "@/lib/uploadcare"
import {
    onCreateCourse,
    onUpdateCourse,
    onDeleteCourse,
    onGetCourse,
    onGetGroupCourses,
    onCreateCourseVideo,
    onUpdateCourseVideo,
    onDeleteCourseVideo,
    onCreateCourseResource,
    onDeleteCourseResource,
    onGetCourseStats,
} from "@/actions/courses"

// ============================================================================
// COURSE HOOKS
// ============================================================================

export const useCreateCourse = (
    groupId: string,
    onSuccess?: (courseId?: string) => void,
) => {
    const queryClient = useQueryClient()
    const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0 })

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<CourseFormData>({
        resolver: zodResolver(CourseSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: CourseFormData) => {
            let thumbnailUrl: string | undefined

            // Upload thumbnail if provided
            if (data.thumbnail && data.thumbnail[0]) {
                const file = data.thumbnail[0]
                thumbnailUrl = await uploadFile(file, (progress) => {
                    setUploadProgress({ thumbnail: progress })
                })
            }

            return await onCreateCourse(
                groupId,
                data.title,
                data.description,
                thumbnailUrl,
            )
        },
        onSuccess: (data) => {
            if (data.status === 200 && data.course) {
                toast.success(
                    "Course created! Now you can add videos and resources.",
                    {
                        duration: 4000,
                    },
                )
                queryClient.invalidateQueries({
                    queryKey: ["group-courses", groupId],
                })
                reset()
                setUploadProgress({ thumbnail: 0 })
                onSuccess?.(data.course.id)
            } else {
                toast.error(data.message || "Failed to create course")
            }
        },
        onError: () => {
            toast.error("Something went wrong. Please try again.")
        },
    })

    const onSubmit = handleSubmit((data) => mutate(data))

    return {
        register,
        errors,
        onSubmit,
        isPending,
        uploadProgress,
        watch,
    }
}

export const useUpdateCourse = (
    courseId: string,
    groupId?: string,
    onSuccess?: () => void,
) => {
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: {
            title?: string
            description?: string
            published?: boolean
            thumbnail?: string
        }) => {
            return await onUpdateCourse(courseId, data)
        },
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success("Course updated successfully!")
                // Invalidate both the single course and the courses list
                queryClient.invalidateQueries({
                    queryKey: ["course", courseId],
                })
                if (groupId) {
                    queryClient.invalidateQueries({
                        queryKey: ["group-courses", groupId],
                    })
                }
                onSuccess?.()
            } else {
                toast.error(data.message || "Failed to update course")
            }
        },
    })

    return { updateCourse: mutate, isPending }
}

export const useDeleteCourse = (groupId?: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (courseId: string) => {
            return await onDeleteCourse(courseId)
        },
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success("Course deleted successfully!")
                // Invalidate all course queries
                queryClient.invalidateQueries({ queryKey: ["group-courses"] })
                if (groupId) {
                    queryClient.invalidateQueries({
                        queryKey: ["group-courses", groupId],
                    })
                }
                onSuccess?.()
            } else {
                toast.error(data.message || "Failed to delete course")
            }
        },
    })

    return { deleteCourse: mutate, isPending }
}

export const useCourse = (courseId: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["course", courseId],
        queryFn: async () => {
            const result = await onGetCourse(courseId)
            if (result.status === 200) {
                return result.course
            }
            throw new Error(result.message)
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0, // Always refetch to ensure fresh data
    })

    return {
        course: data,
        isLoading,
        error,
        refetch,
        hasVideos: (data?.videos?.length ?? 0) > 0,
        hasResources: (data?.resources?.length ?? 0) > 0,
    }
}

export const useGroupCourses = (groupId: string) => {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["group-courses", groupId],
        queryFn: async () => {
            const result = await onGetGroupCourses(groupId)
            if (result.status === 200) {
                return result.courses
            }
            return []
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        staleTime: 0, // Always refetch to ensure fresh data
    })

    return {
        courses: data ?? [],
        isLoading,
        refetch,
        hasCourses: (data?.length ?? 0) > 0,
    }
}

// ============================================================================
// COURSE VIDEO HOOKS
// ============================================================================

export const useCreateCourseVideo = (
    courseId: string,
    onSuccess?: () => void,
) => {
    const queryClient = useQueryClient()
    const [uploadProgress, setUploadProgress] = useState({
        video: 0,
        thumbnail: 0,
    })

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<CourseVideoFormData>({
        resolver: zodResolver(CourseVideoSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: CourseVideoFormData) => {
            // Upload video
            const videoFile = data.video[0]
            const videoUpload = await uploadFile(videoFile, (progress) => {
                setUploadProgress((prev) => ({ ...prev, video: progress }))
            })

            // Upload thumbnail
            const thumbnailFile = data.thumbnail[0]
            const thumbnailUpload = await uploadFile(
                thumbnailFile,
                (progress) => {
                    setUploadProgress((prev) => ({
                        ...prev,
                        thumbnail: progress,
                    }))
                },
            )

            return await onCreateCourseVideo(
                courseId,
                videoUpload,
                thumbnailUpload,
                data.title,
                data.caption,
            )
        },
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success("Video added successfully!")
                queryClient.invalidateQueries({
                    queryKey: ["course", courseId],
                })
                reset()
                setUploadProgress({ video: 0, thumbnail: 0 })
                onSuccess?.()
            } else {
                toast.error(data.message || "Failed to add video")
            }
        },
        onError: () => {
            toast.error("Failed to upload video. Please try again.")
        },
    })

    const onSubmit = handleSubmit((data) => mutate(data))

    const videoFile = watch("video")
    const thumbnailFile = watch("thumbnail")

    const previewVideo = videoFile?.[0]
        ? URL.createObjectURL(videoFile[0])
        : null
    const previewThumbnail = thumbnailFile?.[0]
        ? URL.createObjectURL(thumbnailFile[0])
        : null

    return {
        register,
        errors,
        onSubmit,
        isPending,
        uploadProgress,
        previewVideo,
        previewThumbnail,
    }
}

export const useDeleteCourseVideo = (courseId: string) => {
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (videoId: string) => {
            return await onDeleteCourseVideo(videoId)
        },
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success("Video deleted successfully!")
                queryClient.invalidateQueries({
                    queryKey: ["course", courseId],
                })
            } else {
                toast.error(data.message || "Failed to delete video")
            }
        },
    })

    return { deleteVideo: mutate, isPending }
}

// ============================================================================
// COURSE RESOURCE HOOKS
// ============================================================================

export const useCreateCourseResource = (
    courseId: string,
    onSuccess?: () => void,
) => {
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<CourseResourceFormData>({
        resolver: zodResolver(CourseResourceSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: CourseResourceFormData) => {
            return await onCreateCourseResource(
                courseId,
                data.title,
                data.url,
                data.type,
                data.description,
            )
        },
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success("Resource added successfully!")
                queryClient.invalidateQueries({
                    queryKey: ["course", courseId],
                })
                reset()
                onSuccess?.()
            } else {
                toast.error(data.message || "Failed to add resource")
            }
        },
    })

    const onSubmit = handleSubmit((data) => mutate(data))

    return {
        register,
        errors,
        onSubmit,
        isPending,
        watch,
    }
}

export const useDeleteCourseResource = (courseId: string) => {
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (resourceId: string) => {
            return await onDeleteCourseResource(resourceId)
        },
        onSuccess: (data) => {
            if (data.status === 200) {
                toast.success("Resource deleted successfully!")
                queryClient.invalidateQueries({
                    queryKey: ["course", courseId],
                })
            } else {
                toast.error(data.message || "Failed to delete resource")
            }
        },
    })

    return { deleteResource: mutate, isPending }
}

// ============================================================================
// STATS HOOKS
// ============================================================================

export const useCourseStats = (groupId: string) => {
    const { data, isLoading } = useQuery({
        queryKey: ["course-stats", groupId],
        queryFn: async () => {
            const result = await onGetCourseStats(groupId)
            if (result.status === 200) {
                return result.stats
            }
            return null
        },
    })

    return {
        stats: data,
        isLoading,
    }
}
