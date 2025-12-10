import {
    QueryClient,
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { onGetGroupInfo } from "@/actions/groups"
import { onAuthenticatedUser } from "@/actions/auth"
import AboutGroup from "../_components/about"
import GroupSideWidget from "@/components/global/group-side-widget"

export default async function Page({
    params,
}: {
    params: Promise<{ groupid: string }>
}) {
    const { groupid } = await params
    const query = new QueryClient()

    await query.prefetchQuery({
        queryKey: ["about-group-info"],
        queryFn: () => onGetGroupInfo(groupid),
    })

    const userid = await onAuthenticatedUser()

    return (
        <HydrationBoundary state={dehydrate(query)}>
            <div className="pt-36 pb-10 container grid grid-cols-1 lg:grid-cols-3 gap-x-10">
                <div className="col-span-1 lg:col-span-2">
                    <AboutGroup userid={userid.id!} groupid={groupid} />
                </div>
                <div className="col-span-1 relative">
                    <GroupSideWidget userid={userid.id} groupid={groupid} />
                </div>
            </div>
        </HydrationBoundary>
    )
}
