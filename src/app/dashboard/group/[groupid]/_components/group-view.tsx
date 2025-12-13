"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash, BookOpen, ArrowLeft, Play, MessageSquare } from "lucide-react"
import Link from "next/link"
import { getGroupThumbnailUrl } from "@/lib/default-group-assets"

type Channel = {
    id: string
    name: string
    icon: string | null
}

type Course = {
    id: string
    title: string
    description: string | null
    thumbnail: string | null
    published: boolean
}

type GroupInfo = {
    id: string
    name: string
    description: string | null
    thumbnail: string | null
    category: string
    icon: string | null
}

type Props = {
    groupId: string
    groupInfo: GroupInfo
    channels: Channel[]
    courses: Course[]
}

export const LearnerGroupView = ({ groupId, groupInfo, channels, courses }: Props) => {
    const publishedCourses = courses.filter((c) => c.published)

    return (
        <div className="container py-6 px-4 sm:px-6">
            {/* Back Button */}
            <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>

            {/* Group Header */}
            <div className="relative rounded-xl overflow-hidden mb-8">
                <div className="aspect-[3/1] sm:aspect-[4/1]">
                    <img
                        src={getGroupThumbnailUrl(groupInfo.thumbnail, groupInfo.category)}
                        alt={groupInfo.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-sm mb-2 inline-block">
                        {groupInfo.category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {groupInfo.name}
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl">
                        {groupInfo.description}
                    </p>
                </div>
            </div>

            {/* Tabs for Channels and Courses */}
            <Tabs defaultValue="channels" className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
                    <TabsTrigger value="channels" className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Channels ({channels.length})
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Courses ({publishedCourses.length})
                    </TabsTrigger>
                    <TabsTrigger value="messages" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Messages
                    </TabsTrigger>
                </TabsList>

                {/* Channels Tab */}
                <TabsContent value="channels">
                    {channels.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
                            <p className="text-muted-foreground">
                                This group doesn't have any channels yet.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid gap-3">
                            {channels.map((channel) => (
                                <Link
                                    key={channel.id}
                                    href={`/dashboard/group/${groupId}/channel/${channel.id}`}
                                >
                                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                                        <CardContent className="flex items-center gap-4 p-4">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Hash className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-foreground">
                                                    {channel.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Click to view discussions
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                Enter
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses">
                    {publishedCourses.length === 0 ? (
                        <Card className="p-8 text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                            <p className="text-muted-foreground">
                                This group doesn't have any published courses yet.
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {publishedCourses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/dashboard/group/${groupId}/courses/${course.id}`}
                                >
                                    <Card className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer h-full">
                                        <div className="aspect-video relative bg-muted">
                                            {course.thumbnail ? (
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <div className="p-3 rounded-full bg-primary">
                                                    <Play className="h-6 w-6 text-primary-foreground" />
                                                </div>
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base line-clamp-1">
                                                {course.title}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {course.description || "No description"}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages">
                    <Card className="p-8 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Direct Messages</h3>
                        <p className="text-muted-foreground mb-4">
                            Send and receive private messages from the group owner.
                        </p>
                        <Link href={`/dashboard/group/${groupId}/messages`}>
                            <Button>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Open Messages
                            </Button>
                        </Link>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
