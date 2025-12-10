import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const truncateString = (string: string) => {
    return string.slice(0, 60) + "..."
}

export const validateURLString = (
    url: string,
): { url: string | undefined; type: "IMAGE" | "YOUTUBE" | "LOOM" } => {
    // Regular expressions to test for specific domains
    const youtubeRegex = new RegExp("www.youtube.com")
    const loomRegex = new RegExp("www.loom.com")

    // Check if the URL matches YouTube
    if (youtubeRegex.test(url)) {
        return {
            url,
            type: "YOUTUBE" as const,
        }
    }

    // Check if the URL matches Loom
    if (loomRegex.test(url)) {
        return {
            url,
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
