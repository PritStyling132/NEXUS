"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { uploadFileAndGetPath } from "@/lib/uploadcare"
import {
    onCreateVideo,
    onGetGroupVideos,
    onDeleteVideo,
} from "@/actions/videos"
import { VideoUploadSchema } from "@/components/forms/video-upload/schema"

export const useVideoUpload = (groupId: string, onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const [uploadProgress, setUploadProgress] = useState({
        video: 0,
        thumbnail: 0,
    })

    const {
        register,
        formState: { errors },
        handleSubmit,
        reset,
        watch,
    } = useForm<z.infer<typeof VideoUploadSchema>>({
        resolver: zodResolver(VideoUploadSchema),
        mode: "onChange",
    })

    const [previewVideo, setPreviewVideo] = useState<string | null>(null)
    const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(
        null,
    )

    const videoFile = watch("video")
    const thumbnailFile = watch("thumbnail")

    useEffect(() => {
        if (videoFile && videoFile[0]) {
            const url = URL.createObjectURL(videoFile[0])
            setPreviewVideo(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewVideo(null)
        }
    }, [videoFile])

    useEffect(() => {
        if (thumbnailFile && thumbnailFile[0]) {
            const url = URL.createObjectURL(thumbnailFile[0])
            setPreviewThumbnail(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewThumbnail(null)
        }
    }, [thumbnailFile])

    const { mutate: uploadVideo, isPending } = useMutation({
        mutationKey: ["upload-video", groupId],
        mutationFn: async (values: z.infer<typeof VideoUploadSchema>) => {
            setUploadProgress({ video: 0, thumbnail: 0 })

            toast.info("Uploading thumbnail...")
            const thumbnailUrl = await uploadFileAndGetPath(values.thumbnail[0])
            setUploadProgress({ video: 0, thumbnail: 100 })

            toast.info("Uploading video... This may take a while.")
            const videoUrl = await uploadFileAndGetPath(values.video[0])
            setUploadProgress({ video: 100, thumbnail: 100 })

            const videoSize = values.video[0].size

            const result = await onCreateVideo(
                groupId,
                videoUrl,
                thumbnailUrl,
                values.caption,
                videoSize,
            )

            if (result.status !== 200) {
                throw new Error(result.message || "Failed to upload video")
            }

            return result
        },
        onSuccess: () => {
            toast.success("Video uploaded successfully!")
            reset()
            setPreviewVideo(null)
            setPreviewThumbnail(null)
            setUploadProgress({ video: 0, thumbnail: 0 })
            queryClient.invalidateQueries({
                queryKey: ["group-videos", groupId],
            })
            if (onSuccess) onSuccess()
        },
        onError: (error: Error) => {
            toast.error("Upload failed", {
                description: error.message || "Something went wrong",
            })
            setUploadProgress({ video: 0, thumbnail: 0 })
        },
    })

    const onSubmit = handleSubmit((values) => uploadVideo(values))

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

export const useGroupVideos = (groupId: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["group-videos", groupId],
        queryFn: () => onGetGroupVideos(groupId),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    return {
        videos: data?.videos || [],
        isLoading,
        error,
        hasVideos: (data?.videos?.length || 0) > 0,
    }
}

export const useDeleteVideo = (groupId: string) => {
    const queryClient = useQueryClient()

    const { mutate: deleteVideo, isPending } = useMutation({
        mutationKey: ["delete-video"],
        mutationFn: async (videoId: string) => {
            const result = await onDeleteVideo(videoId, groupId)

            if (result.status !== 200) {
                throw new Error(result.message || "Failed to delete video")
            }

            return result
        },
        onSuccess: () => {
            toast.success("Video deleted successfully")
            queryClient.invalidateQueries({
                queryKey: ["group-videos", groupId],
            })
        },
        onError: (error: Error) => {
            toast.error("Failed to delete video", {
                description: error.message,
            })
        },
    })

    return { deleteVideo, isPending }
}
