"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { onGetGroupChannels, onJoinGroup } from "@/actions/groups"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

type JoinButtonProps = {
    owner: boolean
    groupid: string
}

const useActiveGroupSubscription = (groupId: string) => {
    const { data } = useQuery({
        queryKey: ["active-subscription", groupId],
        queryFn: async (): Promise<{
            status: number
            subscription: { price: number } | null
        }> => {
            return { status: 404, subscription: null }
        },
    })
    return { data }
}

const useJoinFree = (groupid: string) => {
    const router = useRouter()

    const onJoinFreeGroup = async () => {
        const member = await onJoinGroup(groupid)
        if (member?.status === 200) {
            const channels = await onGetGroupChannels(groupid)
            router.push(
                `/group/${groupid}/channel/${channels?.channels?.[0].id}`,
            )
        }
    }

    return { onJoinFreeGroup }
}

export const JoinButton = ({ owner, groupid }: JoinButtonProps) => {
    const { data } = useActiveGroupSubscription(groupid)
    const { onJoinFreeGroup } = useJoinFree(groupid)

    if (!owner) {
        if (data?.status === 200 && data.subscription) {
            return (
                <Button className="w-full p-10" variant="ghost" disabled>
                    Join ${data.subscription?.price}/Month
                </Button>
            )
        }
        return (
            <Button
                onClick={onJoinFreeGroup}
                className="w-full p-10"
                variant="ghost"
            >
                Join now
            </Button>
        )
    }

    return (
        <Button disabled={owner} className="w-full p-10" variant="ghost">
            Owner
        </Button>
    )
}
