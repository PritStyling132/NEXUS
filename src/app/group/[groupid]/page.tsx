import {
    onGetGroupInfo,
    onGetGroupChannels,
    onGetGroupSubscriptions,
    onGetGroupDashboardData,
} from "@/actions/groups"
import { GroupDashboard } from "./dashboard-page"

type Props = {
    params: Promise<{
        groupid: string
    }>
}

const GroupHomePage = async ({ params }: Props) => {
    const { groupid } = await params

    const [groupInfo, channels, subscriptions, dashboardData] =
        await Promise.all([
            onGetGroupInfo(groupid),
            onGetGroupChannels(groupid),
            onGetGroupSubscriptions(groupid),
            onGetGroupDashboardData(groupid),
        ])

    return (
        <GroupDashboard
            groupid={groupid}
            groupInfo={groupInfo}
            channels={channels}
            subscriptions={subscriptions}
            dashboardData={dashboardData}
        />
    )
}

export default GroupHomePage
