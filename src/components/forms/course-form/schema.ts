import { z } from "zod"

const MAX_FILE_SIZE = 1024 * 1024 * 5 // 5MB for thumbnail

export const CourseSchema = z.object({
    title: z
        .string()
        .min(3, "Course title must be at least 3 characters")
        .max(100, "Course title must be less than 100 characters"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description must be less than 2000 characters")
        .optional(),

    thumbnail: z
        .any()
        .refine(
            (file: FileList) => {
                if (!file || file.length === 0) return true // Optional
                return file[0].size <= MAX_FILE_SIZE
            },
            { message: "Thumbnail must be less than 5MB" },
        )
        .optional(),
})

export type CourseFormData = z.infer<typeof CourseSchema>
