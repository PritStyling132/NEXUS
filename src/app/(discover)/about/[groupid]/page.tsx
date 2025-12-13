import {
    QueryClient,
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { onGetGroupInfo, onCheckGroupMembership } from "@/actions/groups"
import { onAuthenticatedUser } from "@/actions/auth"
import AboutGroup from "../_components/about"
import GroupSideWidget from "@/components/global/group-side-widget"
import LandingPageNavbar from "@/app/(landing)/_components/navbar"
import { Footer } from "@/components/global/footer"

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

    const authResult = await onAuthenticatedUser()
    // User might not be logged in - that's okay, they can still view the about page
    const userid = authResult.status === 200 ? authResult.id : undefined

    // Check if user is already a member
    const membershipResult = userid
        ? await onCheckGroupMembership(groupid)
        : null
    const isMember = membershipResult?.isMember || false

    return (
        <>
            <LandingPageNavbar />
            <HydrationBoundary state={dehydrate(query)}>
                <div className="pt-8 pb-10 container grid grid-cols-1 lg:grid-cols-3 gap-x-10 min-h-[calc(100vh-200px)]">
                    <div className="col-span-1 lg:col-span-2">
                        <AboutGroup userid={userid} groupid={groupid} />
                    </div>
                    <div className="col-span-1 relative">
                        <GroupSideWidget
                            userid={userid}
                            groupid={groupid}
                            isMember={isMember}
                        />
                    </div>
                </div>
            </HydrationBoundary>
            <Footer />
        </>
    )
}
