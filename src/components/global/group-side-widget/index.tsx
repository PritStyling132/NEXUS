"use client"

import { useGroupInfo } from "@/hooks/groups"
import { truncateString } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { JoinButton } from "@/app/(discover)/about/_components/join-button"
import React from "react"
import { getGroupThumbnailUrl } from "@/lib/default-group-assets"
import { Users, Sparkles } from "lucide-react"

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
                className="border-primary/20 lg:sticky lg:top-0 mt-10 lg:mt-0 rounded-2xl overflow-hidden animate-pulse bg-card/50 backdrop-blur-sm"
            >
                <div className="w-full aspect-video bg-muted/50" />
                <div className="flex flex-col p-5 gap-y-3">
                    <div className="h-6 bg-muted/50 rounded-lg w-3/4" />
                    <div className="h-4 bg-muted/50 rounded-lg w-full" />
                    <div className="h-4 bg-muted/50 rounded-lg w-2/3" />
                </div>
            </Card>
        )
    }

    return (
        <Card
            className="border-primary/20 lg:sticky lg:top-0 mt-10 lg:mt-0 rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm shadow-xl"
        >
            {/* Thumbnail with gradient overlay */}
            <div className="relative">
                <img
                    src={getGroupThumbnailUrl(group.thumbnail, group.category)}
                    alt="thumbnail"
                    className="w-full aspect-video object-cover"
                />
                {/* Gradient overlay at bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card/90 to-transparent" />

                {/* Category badge */}
                {group.category && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-primary to-cyan-500 text-white border-0 text-xs px-3 py-1">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {group.category}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content section with gradient background */}
            <div className="bg-gradient-to-b from-card/50 via-card/80 to-card">
                <div className="flex flex-col p-5 gap-y-3">
                    <h2 className="font-bold text-xl text-foreground">
                        {group.name}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {group.description && truncateString(group.description)}
                    </p>
                </div>

                <Separator orientation="horizontal" className="bg-primary/10" />

                {/* Join Button Section */}
                {groupid && (
                    <div className="p-2 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5">
                        <JoinButton
                            groupid={groupid}
                            groupName={group.name}
                            owner={group.userId === userid}
                            isLoggedIn={isLoggedIn}
                            isMember={isMember}
                        />
                    </div>
                )}
            </div>
        </Card>
    )
}

export default GroupSideWidget
