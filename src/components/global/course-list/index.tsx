"use client"

import { useState } from "react"
import { useGroupCourses, useDeleteCourse } from "@/hooks/courses"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
    BookOpen,
    Video,
    Link as LinkIcon,
    Trash2,
    Eye,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type CourseListProps = {
    groupId: string
    isOwner: boolean
}

export default function CourseList({ groupId, isOwner }: CourseListProps) {
    const { courses, isLoading, hasCourses } = useGroupCourses(groupId)
    const { deleteCourse, isPending: isDeleting } = useDeleteCourse(groupId)
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

    const handleDeleteConfirm = () => {
        if (courseToDelete) {
            deleteCourse(courseToDelete)
            setCourseToDelete(null)
        }
    }

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="aspect-video bg-muted animate-pulse" />
                        <CardHeader>
                            <div className="h-6 bg-muted animate-pulse rounded" />
                            <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        )
    }

    if (!hasCourses) {
        return null
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                    const videoCount = course._count?.videos || 0
                    const resourceCount = course._count?.resources || 0

                    return (
                        <Card
                            key={course.id}
                            className="group overflow-hidden hover:shadow-lg transition-all"
                        >
                            {/* Course Thumbnail */}
                            <Link
                                href={`/group/${groupId}/courses/${course.id}`}
                            >
                                <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-16 w-16 text-primary/30" />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2">
                                        {course.published ? (
                                            <Badge className="bg-green-500/90 hover:bg-green-500">
                                                Published
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-yellow-500/90 hover:bg-yellow-500"
                                            >
                                                Draft
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            <CardHeader>
                                <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
                                    <Link
                                        href={`/group/${groupId}/courses/${course.id}`}
                                    >
                                        {course.title}
                                    </Link>
                                </CardTitle>
                                {course.description && (
                                    <CardDescription className="line-clamp-2">
                                        {course.description}
                                    </CardDescription>
                                )}
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Video className="h-4 w-4" />
                                        <span>
                                            {videoCount} video
                                            {videoCount !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    {resourceCount > 0 && (
                                        <div className="flex items-center gap-1">
                                            <LinkIcon className="h-4 w-4" />
                                            <span>
                                                {resourceCount} resource
                                                {resourceCount !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Link
                                            href={`/group/${groupId}/courses/${course.id}`}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </Button>

                                    {isOwner && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCourseToDelete(course.id)
                                            }
                                            disabled={isDeleting}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!courseToDelete}
                onOpenChange={() => setCourseToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the course, including all videos and
                            resources.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
