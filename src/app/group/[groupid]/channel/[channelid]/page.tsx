import { onGetChannelInfo } from "@/actions/channels"
import ChannelClient from "./channel-client"

interface Props {
    params: Promise<{
        groupid: string
        channelid: string
    }>
}

const ChannelDetailPage = async ({ params }: Props) => {
    const { groupid, channelid } = await params
    const channelInfo = await onGetChannelInfo(channelid)

    return <ChannelClient channelInfo={channelInfo} groupid={groupid} channelid={channelid} />
}

export default ChannelDetailPage
