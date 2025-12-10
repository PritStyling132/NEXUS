import { UploadClient } from "@uploadcare/upload-client"

const publicKey = process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY

if (!publicKey) {
    console.error(
        "❌ NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY is not defined in environment variables",
    )
}

export const upload = new UploadClient({
    publicKey: publicKey as string,
    retryThrottledRequestMaxTimes: 3,
    maxConcurrentRequests: 2,
})

/**
 * Upload file and return the UUID for storage
 * UploadCare automatically sanitizes filenames in CDN URLs, so we only store the UUID
 * @returns string UUID to construct ucarecd.net URLs
 */
export const uploadFileAndGetPath = async (file: File): Promise<string> => {
    try {
        console.log("📤 Starting upload for file:", {
            name: file.name,
            size: file.size,
            type: file.type,
        })

        // Check if public key exists
        if (!publicKey) {
            throw new Error("Uploadcare public key is not configured")
        }

        // Upload with progress tracking
        const uploaded = await upload.uploadFile(file, {
            onProgress: (progress) => {
                if (progress.isComputable) {
                    console.log(
                        `📊 Upload progress: ${Math.round((progress as any).value * 100)}%`,
                    )
                }
            },
        })

        console.log("✅ Upload successful!")
        console.log("📦 UploadCare full response:", uploaded)
        console.log("🔗 CDN URL from UploadCare:", uploaded.cdnUrl)
        console.log("🆔 UUID:", uploaded.uuid)

        // Return just the UUID - UploadCare handles filename sanitization in the CDN URL
        return uploaded.uuid
    } catch (error: any) {
        console.error("❌ Upload failed:", error)
        console.error("❌ Error details:", {
            message: error.message,
            name: error.name,
            stack: error.stack,
        })

        // Provide user-friendly error messages
        if (
            error.message?.includes("NetworkError") ||
            error.message?.includes("network")
        ) {
            throw new Error(
                "Network error: Please check your internet connection and try again",
            )
        } else if (error.message?.includes("timeout")) {
            throw new Error(
                "Upload timeout: The file took too long to upload. Please try again",
            )
        } else if (error.message?.includes("key")) {
            throw new Error(
                "Configuration error: Uploadcare is not properly configured",
            )
        } else {
            throw new Error(
                `Upload failed: ${error.message || "Unknown error"}`,
            )
        }
    }
}

/**
 * Upload file with progress tracking
 * @param file File to upload
 * @param onProgress Progress callback
 * @returns string UUID to construct ucarecd.net URLs
 */
export const uploadFile = async (
    file: File,
    onProgress?: (progress: number) => void,
): Promise<string> => {
    try {
        if (!publicKey) {
            throw new Error("Uploadcare public key is not configured")
        }

        const uploaded = await upload.uploadFile(file, {
            onProgress: (progress) => {
                if (progress.isComputable && onProgress) {
                    onProgress((progress as any).value * 100)
                }
            },
        })

        console.log("✅ File uploaded to Uploadcare:", {
            uuid: uploaded.uuid,
            cdnUrl: uploaded.cdnUrl,
            fileName: file.name,
        })

        return uploaded.uuid
    } catch (error: any) {
        console.error("Upload failed:", error)

        if (
            error.message?.includes("NetworkError") ||
            error.message?.includes("network")
        ) {
            throw new Error(
                "Network error: Please check your internet connection",
            )
        } else if (error.message?.includes("timeout")) {
            throw new Error("Upload timeout: Please try again")
        } else if (error.message?.includes("key")) {
            throw new Error("Uploadcare is not properly configured")
        } else {
            throw new Error(
                `Upload failed: ${error.message || "Unknown error"}`,
            )
        }
    }
}
