import { z } from "zod"

const MAX_VIDEO_SIZE = 1024 * 1024 * 500 // 500MB
const MAX_THUMBNAIL_SIZE = 1024 * 1024 * 5 // 5MB

export const CourseVideoSchema = z.object({
    title: z
        .string()
        .min(3, "Video title must be at least 3 characters")
        .max(100, "Video title must be less than 100 characters"),

    caption: z
        .string()
        .min(5, "Caption must be at least 5 characters")
        .max(500, "Caption must be less than 500 characters")
        .optional(),

    video: z
        .any()
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return false
                return file[0].size <= MAX_VIDEO_SIZE
            },
            { message: "Video must be less than 500MB" },
        )
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return false
                const validTypes = [
                    "video/mp4",
                    "video/webm",
                    "video/quicktime",
                ]
                return validTypes.includes(file[0].type)
            },
            { message: "Video must be MP4, WebM, or MOV format" },
        ),

    thumbnail: z
        .any()
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return false
                return file[0].size <= MAX_THUMBNAIL_SIZE
            },
            { message: "Thumbnail must be less than 5MB" },
        )
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return false
                const validTypes = [
                    "image/png",
                    "image/jpg",
                    "image/jpeg",
                    "image/webp",
                ]
                return validTypes.includes(file[0].type)
            },
            { message: "Thumbnail must be PNG, JPG, JPEG, or WebP" },
        ),
})

export type CourseVideoFormData = z.infer<typeof CourseVideoSchema>
