import {
    Users,
    Hash,
    BookOpen,
    MessageSquare,
    TrendingUp,
    Crown,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Props = {
    groupid: string
    groupInfo: any
    subscriptions: any
    channels: any
    dashboardData?: any
}

export const GroupDashboard = ({
    groupid,
    groupInfo,
    subscriptions,
    channels,
    dashboardData,
}: Props) => {
    const group = groupInfo?.group
    const memberCount =
        dashboardData?.data?.memberCount || subscriptions?.count || 0
    const channelCount =
        dashboardData?.data?.channelCount || channels?.channels?.length || 0
    const courseCount = dashboardData?.data?.courseCount || 0
    const subscriptionCount =
        dashboardData?.data?.subscriptionCount ||
        subscriptions?.subscriptions?.length ||
        0

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section with Banner */}
            <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-20" />
                <div className="relative flex flex-col gap-4 p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                                    {group?.name || "Your Group"}
                                </h3>
                                {groupInfo?.groupOwner && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        <Crown className="w-3 h-3" />
                                        Owner
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed max-w-3xl">
                                {group?.description ||
                                    "Group dashboard and overview"}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground dark:text-themeTextGray">
                            <Users className="w-4 h-4" />
                            <span>
                                {memberCount} member
                                {memberCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground dark:text-themeTextGray">
                            <Hash className="w-4 h-4" />
                            <span>
                                {channelCount} channel
                                {channelCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-themeTextGray">
                                Total Members
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                                <Users className="w-4 h-4 text-purple-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            {memberCount}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-themeTextGray mt-1">
                            Active members
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-themeTextGray">
                                Channels
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                                <Hash className="w-4 h-4 text-blue-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            {channelCount}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-themeTextGray mt-1">
                            Discussion channels
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-themeTextGray">
                                Courses
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                                <BookOpen className="w-4 h-4 text-green-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            {courseCount}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-themeTextGray mt-1">
                            Available courses
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground dark:text-themeTextGray">
                                Subscriptions
                            </CardTitle>
                            <div className="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            {subscriptionCount}
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-themeTextGray mt-1">
                            Total subscriptions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h4 className="text-lg font-semibold text-foreground dark:text-themeTextWhite mb-4">
                    Quick Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href={`/group/${groupid}/courses`}>
                        <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:bg-accent/50 dark:hover:bg-themeGray/40 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 w-fit">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-foreground dark:text-themeTextWhite">
                                    View Courses
                                </CardTitle>
                                <CardDescription className="text-muted-foreground dark:text-themeTextGray">
                                    Explore educational content
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href={`/group/${groupid}/messages`}>
                        <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:bg-accent/50 dark:hover:bg-themeGray/40 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 w-fit">
                                    <MessageSquare className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-foreground dark:text-themeTextWhite">
                                    Direct Messages
                                </CardTitle>
                                <CardDescription className="text-muted-foreground dark:text-themeTextGray">
                                    Chat with members
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href={`/group/${groupid}/settings`}>
                        <Card className="border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 hover:bg-accent/50 dark:hover:bg-themeGray/40 transition-colors cursor-pointer h-full">
                            <CardHeader>
                                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20 w-fit">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-foreground dark:text-themeTextWhite">
                                    Group Settings
                                </CardTitle>
                                <CardDescription className="text-muted-foreground dark:text-themeTextGray">
                                    Manage your group
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
