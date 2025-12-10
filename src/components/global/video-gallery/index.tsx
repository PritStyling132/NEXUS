"use client"

import { useState } from "react"
import { useGroupVideos, useDeleteVideo } from "@/hooks/videos"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Video, Plus, Trash2, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import VideoUploadForm from "@/components/forms/video-upload"

type VideoGalleryProps = {
    groupId: string
    userId: string | null
    groupOwnerId: string
}

export default function VideoGallery({
    groupId,
    userId,
    groupOwnerId,
}: VideoGalleryProps) {
    const { videos, isLoading, hasVideos } = useGroupVideos(groupId)
    const { deleteVideo, isPending: isDeleting } = useDeleteVideo(groupId)
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState<{
        id: string
        videoUrl: string
        caption: string
    } | null>(null)
    const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

    const isOwner = userId === groupOwnerId
    const videoCount = videos.length
    const canAddMore = videoCount < 30

    const handleDeleteConfirm = () => {
        if (videoToDelete) {
            deleteVideo(videoToDelete)
            setVideoToDelete(null)
        }
    }

    const handleUploadSuccess = () => {
        setShowUploadDialog(false)
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Videos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="aspect-video bg-muted animate-pulse" />
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Videos</h2>
                    <p className="text-sm text-muted-foreground">
                        {videoCount} / 30 videos
                    </p>
                </div>
                {isOwner && canAddMore && (
                    <Dialog
                        open={showUploadDialog}
                        onOpenChange={setShowUploadDialog}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Video
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Upload New Video</DialogTitle>
                                <DialogDescription>
                                    Add a video to your group. Maximum 30 videos
                                    per group.
                                </DialogDescription>
                            </DialogHeader>
                            <VideoUploadForm
                                groupId={groupId}
                                onSuccess={handleUploadSuccess}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Empty State */}
            {!hasVideos && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Video className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No videos yet
                        </h3>
                        <p className="text-sm text-muted-foreground text-center mb-6">
                            {isOwner
                                ? "Upload your first video to get started"
                                : "This group doesn't have any videos yet"}
                        </p>
                        {isOwner && (
                            <Dialog
                                open={showUploadDialog}
                                onOpenChange={setShowUploadDialog}
                            >
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Upload Video
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Upload New Video
                                        </DialogTitle>
                                        <DialogDescription>
                                            Add a video to your group. Maximum
                                            30 videos per group.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <VideoUploadForm
                                        groupId={groupId}
                                        onSuccess={handleUploadSuccess}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Video Grid */}
            {hasVideos && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((video) => (
                        <Card
                            key={video.id}
                            className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                        >
                            <div
                                onClick={() =>
                                    setSelectedVideo({
                                        id: video.id,
                                        videoUrl: video.videoUrl,
                                        caption: video.caption,
                                    })
                                }
                                className="relative aspect-video bg-muted"
                            >
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.caption}
                                    className="w-full h-full object-cover"
                                />
                                {/* Play Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 rounded-full p-4">
                                        <Play className="h-8 w-8 text-black fill-black" />
                                    </div>
                                </div>
                                {/* Delete Button (Owner Only) */}
                                {isOwner && (
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setVideoToDelete(video.id)
                                        }}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <p className="text-sm line-clamp-2">
                                    {video.caption}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(
                                        video.createdAt,
                                    ).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Video Player Dialog */}
            <Dialog
                open={!!selectedVideo}
                onOpenChange={() => setSelectedVideo(null)}
            >
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedVideo?.caption}</DialogTitle>
                    </DialogHeader>
                    {selectedVideo && (
                        <video
                            src={selectedVideo.videoUrl}
                            controls
                            autoPlay
                            className="w-full rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!videoToDelete}
                onOpenChange={() => setVideoToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the video from your group.
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
        </div>
    )
}
