import { z } from "zod"

export const MAX_VIDEO_SIZE = 1024 * 1024 * 500 // 500MB
export const MAX_THUMBNAIL_SIZE = 1024 * 1024 * 5 // 5MB
export const ACCEPTED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime", // .mov
]
export const ACCEPTED_THUMBNAIL_TYPES = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
]

export const VideoUploadSchema = z.object({
    video: z
        .any()
        .refine((file: FileList) => file && file.length > 0, {
            message: "Video file is required",
        })
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return true
                return ACCEPTED_VIDEO_TYPES.includes(file[0].type)
            },
            { message: "Only MP4, WebM, and MOV formats are accepted" },
        )
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return true
                return file[0].size <= MAX_VIDEO_SIZE
            },
            { message: "Video must be less than 500MB" },
        ),

    thumbnail: z
        .any()
        .refine((file: FileList) => file && file.length > 0, {
            message: "Thumbnail image is required",
        })
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return true
                return ACCEPTED_THUMBNAIL_TYPES.includes(file[0].type)
            },
            { message: "Only PNG, JPG, JPEG, and WebP are accepted" },
        )
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return true
                return file[0].size <= MAX_THUMBNAIL_SIZE
            },
            { message: "Thumbnail must be less than 5MB" },
        ),

    caption: z
        .string()
        .min(5, { message: "Caption must be at least 5 characters" })
        .max(500, { message: "Caption must be less than 500 characters" }),
})
