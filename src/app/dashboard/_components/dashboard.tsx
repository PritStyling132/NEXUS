"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Compass, ArrowRight, Hash, MessageSquare } from "lucide-react"
import Link from "next/link"
import { getGroupThumbnailUrl } from "@/lib/default-group-assets"

type JoinedGroup = {
    id: string
    name: string
    icon: string | null
    thumbnail: string | null
    description: string | null
    category: string
    channels: { id: string }[]
    _count: {
        members: number
        courses: number
        channels: number
    }
    joinedAt: Date
}

type DashboardData = {
    status: number
    data?: {
        joinedGroups: JoinedGroup[]
        stats: {
            totalGroupsJoined: number
            totalCoursesAvailable: number
            totalChannelsAvailable: number
            totalCommunityMembers: number
        }
    }
    message?: string
}

type Props = {
    username: string
    dashboardData: DashboardData
}

export const LearnerDashboard = ({ username, dashboardData }: Props) => {
    const data = dashboardData.data
    const stats = data?.stats || {
        totalGroupsJoined: 0,
        totalCoursesAvailable: 0,
        totalChannelsAvailable: 0,
        totalCommunityMembers: 0,
    }
    const joinedGroups = data?.joinedGroups || []

    return (
        <div className="container py-8 px-4 sm:px-6">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Welcome back, {username.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground">
                    Here's an overview of your learning journey
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Groups Joined
                        </CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {stats.totalGroupsJoined}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active memberships
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Courses Available
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {stats.totalCoursesAvailable}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all groups
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Channels Available
                        </CardTitle>
                        <Hash className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {stats.totalChannelsAvailable}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Discussion channels
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Community Size
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {stats.totalCommunityMembers}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Fellow learners
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Discover More CTA */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-8">
                <CardContent className="flex items-center justify-between py-4">
                    <div>
                        <h3 className="font-semibold text-foreground">Discover More Groups</h3>
                        <p className="text-sm text-muted-foreground">
                            Explore new learning communities and expand your knowledge
                        </p>
                    </div>
                    <Link href="/explore">
                        <Button>
                            <Compass className="mr-2 h-4 w-4" />
                            Explore
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            {/* Joined Groups Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Your Groups</h2>
                    <Link href="/explore">
                        <Button variant="ghost" size="sm">
                            Browse more
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {joinedGroups.length === 0 ? (
                    <Card className="p-8 text-center">
                        <div className="text-5xl mb-4">📚</div>
                        <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Start your learning journey by joining a group
                        </p>
                        <Link href="/explore">
                            <Button>
                                <Compass className="mr-2 h-4 w-4" />
                                Explore Groups
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {joinedGroups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/dashboard/group/${group.id}`}
                            >
                                <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer h-full">
                                    <div className="aspect-video relative">
                                        <img
                                            src={getGroupThumbnailUrl(group.thumbnail, group.category)}
                                            alt={group.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-sm">
                                                {group.category}
                                            </span>
                                        </div>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg line-clamp-1">
                                            {group.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {group.description || "No description"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Hash className="h-3.5 w-3.5" />
                                                {group._count.channels} channels
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                {group._count.courses} courses
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {group._count.members}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
