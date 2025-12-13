/**
 * Default icons and thumbnails for groups based on category
 * These will be used when users don't provide custom assets
 */

export const DEFAULT_GROUP_ASSETS = {
    Technology: {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=technology&backgroundColor=4f46e5&shape1Color=818cf8",
        thumbnail:
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop&q=80",
    },
    Business: {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=business&backgroundColor=059669&shape1Color=34d399",
        thumbnail:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop&q=80",
    },
    Education: {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=education&backgroundColor=dc2626&shape1Color=f87171",
        thumbnail:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&q=80",
    },
    Entertainment: {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=entertainment&backgroundColor=d946ef&shape1Color=f0abfc",
        thumbnail:
            "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&h=400&fit=crop&q=80",
    },
    "Health & Fitness": {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=health&backgroundColor=ea580c&shape1Color=fb923c",
        thumbnail:
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=400&fit=crop&q=80",
    },
    Lifestyle: {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=lifestyle&backgroundColor=0891b2&shape1Color=67e8f9",
        thumbnail:
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=400&fit=crop&q=80",
    },
    Other: {
        icon: "https://api.dicebear.com/7.x/shapes/svg?seed=other&backgroundColor=6366f1&shape1Color=a5b4fc",
        thumbnail:
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop&q=80",
    },
} as const

/**
 * Get default icon URL for a given category
 */
export function getDefaultIcon(category?: string | null): string {
    if (!category) {
        return DEFAULT_GROUP_ASSETS.Other.icon
    }

    const categoryAssets =
        DEFAULT_GROUP_ASSETS[category as keyof typeof DEFAULT_GROUP_ASSETS]
    return categoryAssets?.icon || DEFAULT_GROUP_ASSETS.Other.icon
}

/**
 * Get default thumbnail URL for a given category
 */
export function getDefaultThumbnail(category?: string | null): string {
    if (!category) {
        return DEFAULT_GROUP_ASSETS.Other.thumbnail
    }

    const categoryAssets =
        DEFAULT_GROUP_ASSETS[category as keyof typeof DEFAULT_GROUP_ASSETS]
    return categoryAssets?.thumbnail || DEFAULT_GROUP_ASSETS.Other.thumbnail
}

/**
 * Get icon URL with fallback to default based on category
 * Now stores full Cloudinary URLs directly in database
 */
export function getGroupIconUrl(
    icon?: string | null,
    category?: string | null,
): string {
    // If icon exists, return it directly (it's already a full URL)
    if (icon) {
        return icon
    }

    return getDefaultIcon(category)
}

/**
 * Get thumbnail URL with fallback to default based on category
 * Now stores full Cloudinary URLs directly in database
 */
export function getGroupThumbnailUrl(
    thumbnail?: string | null,
    category?: string | null,
): string {
    // If thumbnail exists, return it directly (it's already a full URL)
    if (thumbnail) {
        return thumbnail
    }

    return getDefaultThumbnail(category)
}
