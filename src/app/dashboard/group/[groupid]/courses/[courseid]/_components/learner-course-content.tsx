"use client"

import { useState } from "react"
import { useCourse } from "@/hooks/courses"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Play,
    ExternalLink,
    Youtube,
    Link2,
    FileText,
    ArrowLeft,
    BookOpen,
    CheckCircle,
} from "lucide-react"
import Link from "next/link"
import AiTutorChat from "@/components/global/ai-tutor-chat"

type LearnerCourseContentProps = {
    groupId: string
    courseId: string
    groupName: string
}

export default function LearnerCourseContent({
    groupId,
    courseId,
    groupName,
}: LearnerCourseContentProps) {
    const { course, isLoading, hasVideos, hasResources } = useCourse(courseId)
    const [selectedVideo, setSelectedVideo] = useState<any | null>(null)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[400px]">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">
                    Course not found
                </p>
                <Button asChild>
                    <Link href={`/dashboard/group/${groupId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Group
                    </Link>
                </Button>
            </div>
        )
    }

    // Auto-select first video if none selected
    if (!selectedVideo && hasVideos) {
        setSelectedVideo(course.videos[0])
    }

    return (
        <div className="flex flex-col w-full h-full overflow-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/group/${groupId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                            {groupName}
                        </p>
                        <h1 className="text-xl sm:text-2xl font-bold line-clamp-1">
                            {course.title}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {course.videos?.length || 0} videos •{" "}
                            {course.resources?.length || 0} resources
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        {selectedVideo ? (
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <video
                                        key={selectedVideo.videoUrl}
                                        src={selectedVideo.videoUrl}
                                        poster={selectedVideo.thumbnailUrl}
                                        controls
                                        controlsList="nodownload"
                                        className="w-full aspect-video"
                                    />
                                    <div className="p-4 sm:p-6">
                                        <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                            {selectedVideo.title}
                                        </h2>
                                        {selectedVideo.caption && (
                                            <p className="text-muted-foreground">
                                                {selectedVideo.caption}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-20">
                                    <Play className="h-16 w-16 text-muted-foreground mb-4" />
                                    <p className="text-xl font-semibold mb-2">
                                        No Video Selected
                                    </p>
                                    <p className="text-sm text-muted-foreground text-center">
                                        {hasVideos
                                            ? "Select a video from the sidebar to start learning"
                                            : "No videos available in this course yet"}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Course Description */}
                        {course.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>About This Course</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {course.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Resources Section */}
                        {hasResources && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Resources</CardTitle>
                                    <CardDescription>
                                        Additional materials to help you learn
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {course.resources?.map((resource) => (
                                        <a
                                            key={resource.id}
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    {resource.type ===
                                                        "YOUTUBE" && (
                                                        <Youtube className="h-4 w-4 text-primary" />
                                                    )}
                                                    {resource.type ===
                                                        "LINK" && (
                                                        <Link2 className="h-4 w-4 text-primary" />
                                                    )}
                                                    {resource.type ===
                                                        "DOCUMENT" && (
                                                        <FileText className="h-4 w-4 text-primary" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">
                                                        {resource.title}
                                                    </p>
                                                    {resource.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {
                                                                resource.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                        </a>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Video List Sidebar */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Play className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            Course Content
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {course.videos?.length || 0} video
                                            {(course.videos?.length || 0) !== 1
                                                ? "s"
                                                : ""}{" "}
                                            in this course
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                                {course.videos?.map((video, index) => (
                                    <div
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`group flex items-start gap-3 p-4 border-b last:border-b-0 cursor-pointer transition-all ${
                                            selectedVideo?.id === video.id
                                                ? "bg-primary/5"
                                                : "hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0 w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-muted">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                                <div className="p-1.5 rounded-full bg-white/90 shadow-lg">
                                                    <Play className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary" />
                                                </div>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="absolute top-1 left-1 text-[10px] px-1.5 py-0 h-5 bg-black/70 text-white border-0"
                                            >
                                                {index + 1}
                                            </Badge>
                                            {selectedVideo?.id === video.id && (
                                                <div className="absolute top-1 right-1">
                                                    <CheckCircle className="h-4 w-4 text-green-500 fill-green-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`font-medium line-clamp-2 text-sm ${
                                                    selectedVideo?.id ===
                                                    video.id
                                                        ? "text-primary"
                                                        : "text-foreground"
                                                }`}
                                            >
                                                {video.title}
                                            </p>
                                            {video.caption && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                    {video.caption}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!hasVideos && (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                                            <Play className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground text-center mb-1">
                                            No videos yet
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 text-center">
                                            Videos will appear here once the
                                            instructor adds them
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* AI Tutor Chat - Available for learners while watching course content */}
            <AiTutorChat
                courseContext={{
                    title: course.title,
                    description: course.description || undefined,
                    topics: course.videos?.map((v) => v.title).join(", ") || undefined,
                }}
            />
        </div>
    )
}
