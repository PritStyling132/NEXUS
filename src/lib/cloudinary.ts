/**
 * Cloudinary upload utilities
 * Uses signed uploads via API route for security
 * Returns full URLs to store directly in database
 */

/**
 * Upload file to Cloudinary via API route and return the full URL
 * @returns string - Full Cloudinary URL to store in database
 */
export const uploadFileAndGetPath = async (file: File): Promise<string> => {
    try {
        console.log("📤 Starting upload for file:", {
            name: file.name,
            size: file.size,
            type: file.type,
        })

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/cloudinary/upload", {
            method: "POST",
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Upload failed")
        }

        const data = await response.json()

        console.log("✅ Upload successful!")
        console.log("🔗 URL:", data.url)

        // Return the full URL to store in database
        return data.url
    } catch (error: any) {
        console.error("❌ Upload failed:", error)

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
 * @returns string - Full Cloudinary URL to store in database
 */
export const uploadFile = async (
    file: File,
    onProgress?: (progress: number) => void,
): Promise<string> => {
    try {
        // Start progress
        onProgress?.(10)

        const formData = new FormData()
        formData.append("file", file)

        // Simulate progress during upload
        onProgress?.(30)

        const response = await fetch("/api/cloudinary/upload", {
            method: "POST",
            body: formData,
        })

        onProgress?.(70)

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Upload failed")
        }

        const data = await response.json()

        onProgress?.(100)

        console.log("✅ File uploaded to Cloudinary:", {
            url: data.url,
            fileName: file.name,
        })

        // Return the full URL to store in database
        return data.url
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
        } else {
            throw new Error(
                `Upload failed: ${error.message || "Unknown error"}`,
            )
        }
    }
}

/**
 * Helper object for compatibility with existing code that uses upload.uploadFile()
 */
export const upload = {
    uploadFile: async (file: File) => {
        const url = await uploadFileAndGetPath(file)
        return {
            url,
            // For backward compatibility with code expecting these properties
            uuid: url,
            public_id: url,
        }
    },
}
