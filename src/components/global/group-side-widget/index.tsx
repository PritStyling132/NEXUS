"use client"

import { useGroupInfo } from "@/hooks/groups"
import { truncateString } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { JoinButton } from "@/app/(discover)/about/_components/join-button"
import React from "react"
import { getGroupThumbnailUrl } from "@/lib/default-group-assets"

type Props = {
    light?: boolean
    groupid?: string
    userid?: string
    isMember?: boolean
}

const GroupSideWidget = ({
    groupid,
    light,
    userid,
    isMember = false,
}: Props) => {
    const { group } = useGroupInfo()

    // Check if user is logged in (userid is defined means logged in)
    const isLoggedIn = !!userid

    // Show loading state if group data isn't available yet
    if (!group || !group.name) {
        return (
            <Card
                className={cn(
                    "border-themeGray lg:sticky lg:top-0 mt-10 lg:mt-0 rounded-xl overflow-hidden animate-pulse",
                    light ? "border-themeGray bg-[#1A1A1D]" : "bg-themeBlack",
                )}
            >
                <div className="w-full aspect-video bg-themeGray/50" />
                <div className="flex flex-col p-5 gap-y-2">
                    <div className="h-6 bg-themeGray/50 rounded w-3/4" />
                    <div className="h-4 bg-themeGray/50 rounded w-full" />
                </div>
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                "border-themeGray lg:sticky lg:top-0 mt-10 lg:mt-0 rounded-xl overflow-hidden",
                light ? "border-themeGray bg-[#1A1A1D]" : "bg-themeBlack",
            )}
        >
            <img
                src={getGroupThumbnailUrl(group.thumbnail, group.category)}
                alt="thumbnail"
                className="w-full aspect-video object-cover"
            />
            <div className="flex flex-col p-5 gap-y-2">
                <h2 className="font-bold text-lg">{group.name}</h2>
                <p className="text-sm text-themeTextGray">
                    {group.description && truncateString(group.description)}
                </p>
            </div>
            <Separator orientation="horizontal" className="bg-themeGray" />
            {groupid && (
                <JoinButton
                    groupid={groupid}
                    groupName={group.name}
                    owner={group.userId === userid}
                    isLoggedIn={isLoggedIn}
                    isMember={isMember}
                />
            )}
        </Card>
    )
}

export default GroupSideWidget
