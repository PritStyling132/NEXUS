"use client"

import { onGetGroupChannels } from "@/actions/groups"
import { IGroupInfo, IGroups } from "@/components/global/sidebar"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export const useNavigation = () => {
    const pathName = usePathname()
    const [section, setSection] = useState<string>(pathName)

    const onSetSection = (page: string) => {
        setSection(page)
    }

    return {
        section,
        onSetSection,
    }
}

export const useSideBar = (groupid: string) => {
    const { data: groups } = useQuery<IGroups>({
        queryKey: ["user-groups"],
        queryFn: async () => {
            // This data is prefetched in the layout, so we just return undefined
            // The data will be available from the cache
            return undefined as any
        },
        staleTime: Infinity,
    })

    const { data: groupInfo } = useQuery<IGroupInfo>({
        queryKey: ["group-info"],
        queryFn: async () => {
            // This data is prefetched in the layout, so we just return undefined
            // The data will be available from the cache
            return undefined as any
        },
        staleTime: Infinity,
    })

    const { data: channels } = useQuery({
        queryKey: ["group-channels"],
        queryFn: () => onGetGroupChannels(groupid),
    })

    const queryClient = useQueryClient()

    const { isPending, mutate, isError, variables } = useMutation({
        mutationFn: async (data: {
            id: string
            name: string
            icon: string
            createdAt: Date
            groupId: string | null
        }) => {
            // Call the server action (imported from actions file)
            const { onCreateNewChannels } = await import("@/actions/groups")
            return onCreateNewChannels(groupid, {
                id: data.id,
                name: data.name.toLowerCase(),
                icon: data.icon,
            })
        },
        onSuccess: () => {
            // Invalidate queries to refetch the latest channels
            queryClient.invalidateQueries({
                queryKey: ["group-channels"],
            })
            toast("Success", {
                description: "Channel created",
            })
        },
        onError: () => {
            toast("Error", {
                description: "Oops! something went wrong",
            })
        },
    })

    return { groupInfo, groups, mutate, variables, isPending, channels }
}
