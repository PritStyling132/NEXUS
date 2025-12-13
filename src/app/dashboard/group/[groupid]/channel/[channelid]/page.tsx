import { onAuthenticatedUser } from "@/actions/auth"
import { onGetChannelInfo } from "@/actions/channels"
import { redirect } from "next/navigation"
import LearnerChannelClient from "./channel-client"

type Props = {
    params: Promise<{
        groupid: string
        channelid: string
    }>
}

export default async function LearnerChannelPage({ params }: Props) {
    const { groupid, channelid } = await params
    const auth = await onAuthenticatedUser()

    if (auth.status !== 200) {
        redirect("/sign-in?redirect_url=/dashboard")
    }

    const channelInfo = await onGetChannelInfo(channelid)

    return (
        <LearnerChannelClient
            channelInfo={channelInfo}
            groupid={groupid}
            channelid={channelid}
        />
    )
}
