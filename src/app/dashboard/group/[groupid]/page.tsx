import { onAuthenticatedUser } from "@/actions/auth"
import { onGetGroupInfo, onGetGroupChannels } from "@/actions/groups"
import { onGetGroupCourses } from "@/actions/courses"
import { redirect } from "next/navigation"
import { LearnerGroupView } from "./_components/group-view"

type Props = {
    params: Promise<{ groupid: string }>
}

export default async function LearnerGroupPage({ params }: Props) {
    const { groupid } = await params
    const auth = await onAuthenticatedUser()

    if (auth.status !== 200) {
        redirect("/sign-in?redirect_url=/dashboard")
    }

    const [groupInfo, channels, courses] = await Promise.all([
        onGetGroupInfo(groupid),
        onGetGroupChannels(groupid),
        onGetGroupCourses(groupid),
    ])

    if (groupInfo.status !== 200 || !groupInfo.group) {
        redirect("/dashboard")
    }

    return (
        <LearnerGroupView
            groupId={groupid}
            groupInfo={groupInfo.group as any}
            channels={channels?.channels || []}
            courses={(courses?.courses as any) || []}
        />
    )
}
