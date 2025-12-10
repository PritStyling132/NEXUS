import { z } from "zod"

export const CourseResourceSchema = z.object({
    title: z
        .string()
        .min(3, "Resource title must be at least 3 characters")
        .max(100, "Resource title must be less than 100 characters"),

    url: z
        .string()
        .url("Must be a valid URL")
        .refine((url) => {
            // Check if it's a valid YouTube, Google Drive, or general URL
            const youtubePattern =
                /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
            const generalUrlPattern = /^https?:\/\/.+\..+/
            return youtubePattern.test(url) || generalUrlPattern.test(url)
        }, "Must be a valid URL"),

    type: z.enum(["YOUTUBE", "LINK", "DOCUMENT"], {
        errorMap: () => ({ message: "Please select a resource type" }),
    }),

    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
})

export type CourseResourceFormData = z.infer<typeof CourseResourceSchema>
