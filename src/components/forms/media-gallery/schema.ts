import { z } from "zod"

const MAX_UPLOAD_SIZE = 1024 * 1024 * 10 // 10MB

export const UpdateGallerySchema = z.object({
    videourl: z
        .string()
        .refine(
            (url) =>
                /https?:\/\/.+?\.(?:youtube|loom)\.com[\/A-Za-z0-9\-\._~:\/\?#\[\]@!\$&'\(\)\*\+,;=]*$/.test(
                    url,
                ),
            "Invalid url, embedded videos must either be loom or youtube urls",
        )
        .optional()
        .or(z.literal("").transform(() => undefined)),

    image: z
        .any()
        .refine(
            (images: FileList) => {
                if (!images.length) {
                    return true
                }

                if (images.length > 4) {
                    return false
                }

                const fileValidity = Array.from(images).find(
                    (file) => file.size > MAX_UPLOAD_SIZE,
                )

                if (fileValidity) {
                    return false
                }

                return true
            },
            { message: "Looks like your images are too big or too many" },
        )
        .optional(),
})
