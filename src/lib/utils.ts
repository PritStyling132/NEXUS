import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const truncateString = (string: string) => {
    return string.slice(0, 60) + "..."
}

/**
 * Convert a YouTube URL to an embed URL
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export const getYouTubeEmbedUrl = (url: string): string => {
    // Already an embed URL
    if (url.includes("/embed/")) {
        return url
    }

    // Extract video ID from various YouTube URL formats
    let videoId: string | null = null

    // Format: youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/)
    if (watchMatch) {
        videoId = watchMatch[1]
    }

    // Format: youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
    if (shortMatch) {
        videoId = shortMatch[1]
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
    }

    // Return original if no match
    return url
}

/**
 * Convert a Loom share URL to an embed URL
 */
export const getLoomEmbedUrl = (url: string): string => {
    // Already an embed URL
    if (url.includes("/embed/")) {
        return url
    }

    // Convert share URL to embed URL
    // Format: https://www.loom.com/share/VIDEO_ID -> https://www.loom.com/embed/VIDEO_ID
    return url.replace("/share/", "/embed/")
}

export const validateURLString = (
    url: string,
): { url: string | undefined; type: "IMAGE" | "YOUTUBE" | "LOOM" } => {
    // Regular expressions to test for specific domains
    const youtubeRegex = /youtube\.com|youtu\.be/
    const loomRegex = /loom\.com/

    // Check if the URL matches YouTube
    if (youtubeRegex.test(url)) {
        return {
            url: getYouTubeEmbedUrl(url),
            type: "YOUTUBE" as const,
        }
    }

    // Check if the URL matches Loom
    if (loomRegex.test(url)) {
        return {
            url: getLoomEmbedUrl(url),
            type: "LOOM" as const,
        }
    }

    // If neither matches, return the URL as undefined and classify the type as IMAGE
    else {
        return {
            url: undefined,
            type: "IMAGE" as const,
        }
    }
}
