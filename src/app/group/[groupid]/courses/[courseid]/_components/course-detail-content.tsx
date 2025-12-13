"use client"

import { useState } from "react"
import {
    useCourse,
    useDeleteCourseVideo,
    useDeleteCourseResource,
    useUpdateCourse,
} from "@/hooks/courses"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
    Play,
    Plus,
    Trash2,
    ExternalLink,
    Youtube,
    Link2,
    FileText,
    ArrowLeft,
    Eye,
    EyeOff,
} from "lucide-react"
import Link from "next/link"
import CourseVideoForm from "@/components/forms/course-video-form"
import CourseResourceForm from "@/components/forms/course-resource-form"

type CourseDetailContentProps = {
    groupId: string
    courseId: string
    isOwner: boolean
}

export default function CourseDetailContent({
    groupId,
    courseId,
    isOwner,
}: CourseDetailContentProps) {
    const { course, isLoading, hasVideos, hasResources } = useCourse(courseId)
    const { deleteVideo, isPending: isDeletingVideo } =
        useDeleteCourseVideo(courseId)
    const { deleteResource, isPending: isDeletingResource } =
        useDeleteCourseResource(courseId)
    const { updateCourse, isPending: isUpdating } = useUpdateCourse(
        courseId,
        groupId,
    )

    const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
    const [showVideoDialog, setShowVideoDialog] = useState(false)
    const [showResourceDialog, setShowResourceDialog] = useState(false)
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null)
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(
        null,
    )

    const handleTogglePublish = () => {
        if (course) {
            updateCourse({ published: !course.published })
        }
    }

    const handleDeleteVideo = () => {
        if (videoToDelete) {
            deleteVideo(videoToDelete)
            if (selectedVideo?.id === videoToDelete) {
                setSelectedVideo(null)
            }
            setVideoToDelete(null)
        }
    }

    const handleDeleteResource = () => {
        if (resourceToDelete) {
            deleteResource(resourceToDelete)
            setResourceToDelete(null)
        }
    }

    const handleVideoDialogSuccess = () => {
        setShowVideoDialog(false)
    }

    const handleResourceDialogSuccess = () => {
        setShowResourceDialog(false)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <p className="text-xl text-muted-foreground">
                    Course not found
                </p>
                <Button asChild>
                    <Link href={`/group/${groupId}/courses`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
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
                <div className="container py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/group/${groupId}/courses`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {course.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {course.videos?.length || 0} videos •{" "}
                                {course.resources?.length || 0} resources
                            </p>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTogglePublish}
                                disabled={isUpdating}
                            >
                                {course.published ? (
                                    <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Unpublish
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Publish
                                    </>
                                )}
                            </Button>
                            <Badge
                                variant={
                                    course.published ? "default" : "secondary"
                                }
                            >
                                {course.published ? "Published" : "Draft"}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="container py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        {selectedVideo ? (
                            <Card>
                                <CardContent className="p-0">
                                    <video
                                        key={selectedVideo.videoUrl}
                                        src={selectedVideo.videoUrl}
                                        poster={selectedVideo.thumbnailUrl}
                                        controls
                                        className="w-full aspect-video rounded-t-lg"
                                    />
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold mb-2">
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
                                    <p className="text-sm text-muted-foreground">
                                        {hasVideos
                                            ? "Select a video from the sidebar to start learning"
                                            : "No videos added yet"}
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
                                    <p className="text-muted-foreground">
                                        {course.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Resources Section */}
                        {(hasResources || isOwner) && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Resources</CardTitle>
                                        {isOwner && (
                                            <Dialog
                                                open={showResourceDialog}
                                                onOpenChange={
                                                    setShowResourceDialog
                                                }
                                            >
                                                <DialogTrigger asChild>
                                                    <Button size="sm">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Resource
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Add Resource
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Add a YouTube video,
                                                            external link, or
                                                            document to help
                                                            students learn.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <CourseResourceForm
                                                        courseId={courseId}
                                                        onSuccess={
                                                            handleResourceDialogSuccess
                                                        }
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {course.resources?.map((resource) => (
                                        <div
                                            key={resource.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
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
                                                <div className="flex-1">
                                                    <p className="font-medium">
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
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                {isOwner && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setResourceToDelete(
                                                                resource.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isDeletingResource
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {!hasResources && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No resources added yet
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Video List Sidebar */}
                    <div className="space-y-4">
                        <Card className="border-border dark:border-themeGray overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border-b border-border dark:border-themeGray">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                                            <Play className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                Course Content
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {course.videos?.length || 0}{" "}
                                                video
                                                {(course.videos?.length ||
                                                    0) !== 1
                                                    ? "s"
                                                    : ""}{" "}
                                                in this course
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <Dialog
                                            open={showVideoDialog}
                                            onOpenChange={setShowVideoDialog}
                                        >
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-primary hover:bg-primary/90 shadow-md">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add New Video
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Upload Video
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Add a new video lesson
                                                        to this course.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <CourseVideoForm
                                                    courseId={courseId}
                                                    onSuccess={
                                                        handleVideoDialogSuccess
                                                    }
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                                {course.videos?.map((video, index) => (
                                    <div
                                        key={video.id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`group flex items-start gap-3 p-4 border-b border-border dark:border-themeGray last:border-b-0 cursor-pointer transition-all ${
                                            selectedVideo?.id === video.id
                                                ? "bg-primary/5 dark:bg-primary/10"
                                                : "hover:bg-muted/50 dark:hover:bg-themeGray/30"
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-muted shadow-sm">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                                <div className="p-1.5 rounded-full bg-white/90 shadow-lg">
                                                    <Play className="h-4 w-4 text-primary fill-primary" />
                                                </div>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="absolute top-1 left-1 text-[10px] px-1.5 py-0 h-5 bg-black/70 text-white border-0"
                                            >
                                                {index + 1}
                                            </Badge>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`font-medium line-clamp-2 mb-1 text-sm ${
                                                    selectedVideo?.id ===
                                                    video.id
                                                        ? "text-primary"
                                                        : "text-foreground dark:text-themeTextWhite"
                                                }`}
                                            >
                                                {video.title}
                                            </p>
                                            {video.caption && (
                                                <p className="text-xs text-muted-foreground dark:text-themeTextGray line-clamp-2">
                                                    {video.caption}
                                                </p>
                                            )}
                                            {isOwner && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setVideoToDelete(
                                                            video.id,
                                                        )
                                                    }}
                                                    disabled={isDeletingVideo}
                                                >
                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!hasVideos && (
                                    <div className="flex flex-col items-center justify-center py-12 px-4">
                                        <div className="p-4 rounded-full bg-muted/50 dark:bg-themeGray/30 mb-4">
                                            <Play className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground dark:text-themeTextGray text-center mb-1">
                                            No videos yet
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 dark:text-themeTextGray/70 text-center">
                                            {isOwner
                                                ? "Click 'Add New Video' above to get started"
                                                : "Videos will appear here once added"}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Video Confirmation */}
            <AlertDialog
                open={!!videoToDelete}
                onOpenChange={() => setVideoToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the video from this course.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteVideo}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Resource Confirmation */}
            <AlertDialog
                open={!!resourceToDelete}
                onOpenChange={() => setResourceToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the resource from this course.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteResource}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
