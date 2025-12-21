"use client"
import {
    Users,
    Hash,
    BookOpen,
    MessageSquare,
    TrendingUp,
    Crown,
    Settings,
    Sparkles,
    ArrowUpRight,
    Activity,
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
    // Use nullish coalescing (??) instead of || to properly handle 0 values
    const memberCount =
        dashboardData?.data?.memberCount ?? subscriptions?.count ?? 0
    const channelCount =
        dashboardData?.data?.channelCount ?? channels?.channels?.length ?? 0
    const courseCount = dashboardData?.data?.courseCount ?? 0
    const subscriptionCount =
        dashboardData?.data?.subscriptionCount ??
        subscriptions?.subscriptions?.length ??
        0

    const stats = [
        {
            title: "Total Members",
            value: memberCount,
            subtitle: "Active members",
            icon: Users,
            gradient: "from-violet-500 to-purple-600",
            bgGradient: "from-violet-500/20 to-purple-600/20",
        },
        {
            title: "Channels",
            value: channelCount,
            subtitle: "Discussion channels",
            icon: Hash,
            gradient: "from-blue-500 to-cyan-500",
            bgGradient: "from-blue-500/20 to-cyan-500/20",
        },
        {
            title: "Courses",
            value: courseCount,
            subtitle: "Available courses",
            icon: BookOpen,
            gradient: "from-emerald-500 to-green-500",
            bgGradient: "from-emerald-500/20 to-green-500/20",
        },
        {
            title: "Subscriptions",
            value: subscriptionCount,
            subtitle: "Total subscriptions",
            icon: TrendingUp,
            gradient: "from-orange-500 to-amber-500",
            bgGradient: "from-orange-500/20 to-amber-500/20",
        },
    ]

    const quickActions = [
        {
            title: "View Courses",
            description: "Explore educational content",
            icon: BookOpen,
            href: `/group/${groupid}/courses`,
            gradient: "from-emerald-500 to-green-500",
        },
        {
            title: "Direct Messages",
            description: "Chat with members",
            icon: MessageSquare,
            href: `/group/${groupid}/messages`,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            title: "General Settings",
            description: "Manage your group",
            icon: Settings,
            href: `/group/${groupid}/general-settings`,
            gradient: "from-violet-500 to-purple-600",
        },
    ]

    return (
        <div className="flex flex-col w-full h-full gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0a0a0b] dark:via-[#0d0d0f] dark:to-[#101012]">
            {/* Header Section with Premium Banner */}
            <div className="relative rounded-3xl overflow-hidden group">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-purple-500/30 to-cyan-500/30 dark:from-primary/20 dark:via-purple-500/20 dark:to-cyan-500/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/40 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/40 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

                <div className="relative flex flex-col gap-5 p-6 sm:p-8 md:p-10 backdrop-blur-sm">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 dark:from-white dark:via-white dark:to-white/60 bg-clip-text text-transparent">
                                    {group?.name || "Your Group"}
                                </h1>
                                {groupInfo?.groupOwner && (
                                    <Badge className="gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/25 px-3 py-1">
                                        <Crown className="w-3.5 h-3.5" />
                                        Owner
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground dark:text-white/60 leading-relaxed max-w-3xl">
                                {group?.description ||
                                    "Welcome to your group dashboard. Manage your community, courses, and content from here."}
                            </p>
                        </div>
                    </div>

                    {/* Quick stats badges */}
                    <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/[0.05] backdrop-blur-sm border border-white/10 dark:border-white/[0.05]">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <Users className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground dark:text-white/90">
                                {memberCount} member{memberCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/[0.05] backdrop-blur-sm border border-white/10 dark:border-white/[0.05]">
                            <Hash className="w-4 h-4 text-cyan-500" />
                            <span className="font-medium text-foreground dark:text-white/90">
                                {channelCount} channel{channelCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/[0.05] backdrop-blur-sm border border-white/10 dark:border-white/[0.05]">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium text-foreground dark:text-white/90">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="relative group">
                            {/* Glow effect on hover */}
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500`} />

                            <Card className="relative h-full border-border/50 dark:border-white/[0.05] bg-card/80 dark:bg-white/[0.02] backdrop-blur-sm hover:bg-card dark:hover:bg-white/[0.04] transition-all duration-300 rounded-2xl overflow-hidden">
                                {/* Subtle gradient background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <CardHeader className="relative pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium text-muted-foreground dark:text-white/50">
                                            {stat.title}
                                        </CardTitle>
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                            <Icon className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-4xl font-bold text-foreground dark:text-white tracking-tight">
                                        {stat.value}
                                    </div>
                                    <p className="text-xs text-muted-foreground dark:text-white/40 mt-1">
                                        {stat.subtitle}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 dark:from-primary/30 dark:to-purple-500/30">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground dark:text-white">
                        Quick Actions
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                            <Link key={index} href={action.href} className="group">
                                <div className="relative">
                                    {/* Glow effect on hover */}
                                    <div className={`absolute -inset-[1px] bg-gradient-to-r ${action.gradient} rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500`} />

                                    <Card className="relative h-full border-border/50 dark:border-white/[0.05] bg-card/80 dark:bg-white/[0.02] backdrop-blur-sm hover:bg-card dark:hover:bg-white/[0.04] transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden">
                                        {/* Animated gradient on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`} />

                                        <CardHeader className="relative">
                                            <div className="flex items-start justify-between">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <ArrowUpRight className="w-5 h-5 text-muted-foreground dark:text-white/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                                            </div>
                                            <CardTitle className="text-lg font-semibold text-foreground dark:text-white mt-4 group-hover:text-primary transition-colors">
                                                {action.title}
                                            </CardTitle>
                                            <CardDescription className="text-muted-foreground dark:text-white/50">
                                                {action.description}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
