import { onAuthenticatedUser } from "@/actions/auth"
import {
    onGetGroupChannels,
    onGetGroupInfo,
    onGetGroupSubscriptions,
    onGetUserGroups,
} from "@/actions/groups"
import SideBar from "@/components/global/sidebar"
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from "@tanstack/react-query"
import { redirect } from "next/navigation"
import React from "react"
import { Navbar } from "./_components/navbar"

type Props = {
    children: React.ReactNode
    params: Promise<{
        groupid: string
    }>
}

const GroupLayout = async ({ children, params }: Props) => {
    const { groupid } = await params

    const query = new QueryClient()
    const user = await onAuthenticatedUser()
    if (!user.id) redirect("/sign-in")

    await query.prefetchQuery({
        queryKey: ["group-info"],
        queryFn: () => onGetGroupInfo(groupid),
    })

    await query.prefetchQuery({
        queryKey: ["user-groups"],
        queryFn: () => onGetUserGroups(user.id as string),
    })

    await query.prefetchQuery({
        queryKey: ["group-channels"],
        queryFn: () => onGetGroupChannels(groupid),
    })

    await query.prefetchQuery({
        queryKey: ["group-subscriptions"],
        queryFn: () => onGetGroupSubscriptions(groupid),
    })

    return (
        <HydrationBoundary state={dehydrate(query)}>
            <div className="flex h-screen md:pt-5 bg-background dark:bg-black">
                <SideBar groupid={groupid} userid={user.id} />

                <div className="md:ml-[300px] flex-col flex-1 bg-background dark:bg-[#101011] md:rounded-tl-xl overflow-y-auto border-l border-t border-border dark:border-[#28282D]">
                    <Navbar groupid={groupid} userid={user.id} />
                    {children}
                </div>
            </div>
        </HydrationBoundary>
    )
}

export default GroupLayout
