"use client"

import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { getGroupIconUrl } from "@/lib/default-group-assets"
import { cn } from "@/lib/utils"

type Props = {
    className?: string
}

export const SearchResults = ({ className }: Props) => {
    const searchState = useSelector((state: RootState) => state.search)

    // Guard against undefined state
    if (!searchState) {
        return null
    }

    const { isSearching, status, data, debounce } = searchState

    if (!debounce || debounce.length === 0) {
        return null
    }

    return (
        <Card
            className={cn(
                "absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto z-50 bg-background dark:bg-themeBlack border-border dark:border-themeGray shadow-lg",
                className,
            )}
        >
            {isSearching ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground dark:text-themeTextGray" />
                    <span className="ml-2 text-sm text-muted-foreground dark:text-themeTextGray">
                        Searching...
                    </span>
                </div>
            ) : status === 200 && data && data.length > 0 ? (
                <div className="py-2">
                    {data.map((group) => (
                        <Link
                            key={group.id}
                            href={`/group/${group.id}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent dark:hover:bg-themeGray/50 transition-colors border-b border-border dark:border-themeGray/30 last:border-0"
                        >
                            <img
                                src={getGroupIconUrl(
                                    group.thumbnail,
                                    group.category,
                                )}
                                alt={group.name}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground dark:text-themeTextWhite truncate">
                                    {group.name}
                                </h4>
                                <p className="text-xs text-muted-foreground dark:text-themeTextGray truncate">
                                    {group.category} •{" "}
                                    {group.privacy === "PUBLIC"
                                        ? "Public"
                                        : "Private"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : status === 404 ? (
                <div className="p-8 text-center">
                    <p className="text-sm text-muted-foreground dark:text-themeTextGray">
                        No groups found for "{debounce}"
                    </p>
                </div>
            ) : status === 400 ? (
                <div className="p-8 text-center">
                    <p className="text-sm text-red-500">
                        Something went wrong. Please try again.
                    </p>
                </div>
            ) : null}
        </Card>
    )
}
