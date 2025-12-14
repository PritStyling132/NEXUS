"use client"

import { useState, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Play,
    Upload,
    Trash2,
    Loader2,
    Video,
    Eye,
    Heart,
    MessageCircle,
    Plus,
    X,
    Film,
    Sparkles,
    ExternalLink,
    Edit2,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { uploadFile } from "@/lib/cloudinary"
import {
    onCreateReel,
    onGetGroupReels,
    onDeleteReel,
    onUpdateReelCaption,
} from "@/actions/reels"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type Reel = {
    id: string
    videoUrl: string
    thumbnailUrl: string | null
    caption: string | null
    duration: number | null
    views: number
    createdAt: string | Date
    _count: {
        likes: number
        comments: number
    }
}

export default function ReelsManagementPage() {
    const params = useParams()
    const groupId = params.groupid as string
    const queryClient = useQueryClient()

    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [caption, setCaption] = useState("")
    const [videoPreview, setVideoPreview] = useState<string | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [deleteReelId, setDeleteReelId] = useState<string | null>(null)
    const [editingReel, setEditingReel] = useState<Reel | null>(null)
    const [editCaption, setEditCaption] = useState("")
    const [playingVideo, setPlayingVideo] = useState<string | null>(null)

    const videoInputRef = useRef<HTMLInputElement>(null)
    const thumbnailInputRef = useRef<HTMLInputElement>(null)

    // Fetch group reels
    const { data: reelsData, isLoading } = useQuery({
        queryKey: ["group-reels", groupId],
        queryFn: async () => {
            const result = await onGetGroupReels(groupId)
            return result.status === 200 ? result.data : []
        },
    })

    const reels: Reel[] = reelsData || []

    // Handle video file selection
    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("video/")) {
            toast.error("Please select a video file")
            return
        }

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            toast.error("Video must be less than 100MB")
            return
        }

        setVideoFile(file)
        setVideoPreview(URL.createObjectURL(file))
    }

    // Handle thumbnail selection
    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        setThumbnailFile(file)
        setThumbnailPreview(URL.createObjectURL(file))
    }

    // Upload reel
    const uploadReelMutation = useMutation({
        mutationFn: async () => {
            if (!videoFile) throw new Error("No video selected")

            setUploading(true)
            setUploadProgress(10)

            // Upload video
            const videoUrl = await uploadFile(videoFile, (progress) => {
                setUploadProgress(10 + progress * 0.6) // 10-70%
            })

            setUploadProgress(75)

            // Upload thumbnail if provided
            let thumbnailUrl: string | undefined
            if (thumbnailFile) {
                thumbnailUrl = await uploadFile(thumbnailFile, (progress) => {
                    setUploadProgress(75 + progress * 0.15) // 75-90%
                })
            }

            setUploadProgress(95)

            // Create reel in database
            const result = await onCreateReel({
                groupId,
                videoUrl,
                thumbnailUrl,
                caption: caption.trim() || undefined,
            })

            setUploadProgress(100)

            if (result.status !== 200) {
                throw new Error(result.message || "Failed to create reel")
            }

            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-reels", groupId] })
            toast.success("Reel uploaded successfully!")
            resetUploadForm()
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
        onSettled: () => {
            setUploading(false)
            setUploadProgress(0)
        },
    })

    // Delete reel
    const deleteReelMutation = useMutation({
        mutationFn: async (reelId: string) => {
            const result = await onDeleteReel(reelId)
            if (result.status !== 200) {
                throw new Error(result.message || "Failed to delete reel")
            }
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-reels", groupId] })
            toast.success("Reel deleted successfully")
            setDeleteReelId(null)
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    // Update caption
    const updateCaptionMutation = useMutation({
        mutationFn: async ({ reelId, caption }: { reelId: string; caption: string }) => {
            const result = await onUpdateReelCaption(reelId, caption)
            if (result.status !== 200) {
                throw new Error(result.message || "Failed to update caption")
            }
            return result
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["group-reels", groupId] })
            toast.success("Caption updated!")
            setEditingReel(null)
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const resetUploadForm = () => {
        setShowUploadDialog(false)
        setVideoFile(null)
        setThumbnailFile(null)
        setCaption("")
        setVideoPreview(null)
        setThumbnailPreview(null)
    }

    const handleUpload = () => {
        if (!videoFile) {
            toast.error("Please select a video")
            return
        }
        uploadReelMutation.mutate()
    }

    const handleEditCaption = () => {
        if (!editingReel) return
        updateCaptionMutation.mutate({
            reelId: editingReel.id,
            caption: editCaption,
        })
    }

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20 dark:border-primary/10">
                            <Film className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
                            Marketing Reels
                        </h3>
                        <p className="text-sm text-muted-foreground/70 dark:text-white/40">
                            Create short videos to promote your group
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href="/marketing" target="_blank">
                        <Button variant="outline" className="gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Live
                        </Button>
                    </Link>
                    <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Upload Reel
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 bg-muted/30 dark:bg-white/[0.02]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <Video className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{reels.length}</p>
                                <p className="text-xs text-muted-foreground">Total Reels</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-muted/30 dark:bg-white/[0.02]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-500/10">
                                <Eye className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {reels.reduce((acc, r) => acc + r.views, 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Views</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-muted/30 dark:bg-white/[0.02]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-500/10">
                                <Heart className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {reels.reduce((acc, r) => acc + r._count.likes, 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Likes</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 bg-muted/30 dark:bg-white/[0.02]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-green-500/10">
                                <MessageCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {reels.reduce((acc, r) => acc + r._count.comments, 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Comments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reels Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : reels.length === 0 ? (
                <Card className="border-0 bg-gradient-to-b from-card/80 to-card/40 dark:from-white/[0.03] dark:to-white/[0.01] max-w-md mx-auto">
                    <CardHeader className="text-center pb-8">
                        <div className="relative mx-auto mb-6">
                            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                            <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20">
                                <Sparkles className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-xl">Create Your First Reel</CardTitle>
                        <CardDescription className="mt-2">
                            Upload short promotional videos to attract more learners to your group.
                        </CardDescription>
                        <Button
                            onClick={() => setShowUploadDialog(true)}
                            className="mt-6 gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Reel
                        </Button>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {reels.map((reel) => (
                        <Card
                            key={reel.id}
                            className="group overflow-hidden border-0 bg-muted/30 dark:bg-white/[0.02] hover:bg-muted/50 dark:hover:bg-white/[0.04] transition-all"
                        >
                            {/* Video Preview */}
                            <div className="relative aspect-[9/16] bg-black">
                                <video
                                    src={reel.videoUrl}
                                    poster={reel.thumbnailUrl || undefined}
                                    className="w-full h-full object-cover"
                                    loop
                                    muted
                                    playsInline
                                    onMouseEnter={(e) => {
                                        e.currentTarget.play()
                                        setPlayingVideo(reel.id)
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.pause()
                                        e.currentTarget.currentTime = 0
                                        setPlayingVideo(null)
                                    }}
                                />
                                {playingVideo !== reel.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="p-3 rounded-full bg-black/50">
                                            <Play className="w-8 h-8 text-white" fill="white" />
                                        </div>
                                    </div>
                                )}

                                {/* Stats Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="flex items-center gap-4 text-white text-sm">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {reel.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {reel._count.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" />
                                            {reel._count.comments}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 text-gray-700 dark:text-white"
                                        onClick={() => {
                                            setEditingReel(reel)
                                            setEditCaption(reel.caption || "")
                                        }}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8"
                                        onClick={() => setDeleteReelId(reel.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Caption */}
                            <CardContent className="p-3">
                                <p className="text-sm line-clamp-2 text-foreground/80">
                                    {reel.caption || "No caption"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(reel.createdAt), {
                                        addSuffix: true,
                                    })}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Upload New Reel</DialogTitle>
                        <DialogDescription>
                            Create a short promotional video for the marketing feed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Video Upload */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Video <span className="text-red-500">*</span>
                            </label>
                            {videoPreview ? (
                                <div className="relative aspect-[9/16] max-h-[300px] bg-black rounded-xl overflow-hidden">
                                    <video
                                        src={videoPreview}
                                        className="w-full h-full object-contain"
                                        controls
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={() => {
                                            setVideoFile(null)
                                            setVideoPreview(null)
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => videoInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                    <Video className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload video
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        MP4, WebM, MOV (max 100MB)
                                    </p>
                                </div>
                            )}
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoSelect}
                            />
                        </div>

                        {/* Thumbnail Upload */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Thumbnail (optional)
                            </label>
                            {thumbnailPreview ? (
                                <div className="relative aspect-[9/16] max-h-[150px] bg-muted rounded-xl overflow-hidden">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => {
                                            setThumbnailFile(null)
                                            setThumbnailPreview(null)
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        Click to add custom thumbnail
                                    </p>
                                </div>
                            )}
                            <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailSelect}
                            />
                        </div>

                        {/* Caption */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Caption</label>
                            <Textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write a caption for your reel..."
                                className="resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={resetUploadForm}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!videoFile || uploading}
                            className="gap-2"
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            {uploading ? "Uploading..." : "Upload Reel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Caption Dialog */}
            <Dialog open={!!editingReel} onOpenChange={() => setEditingReel(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Caption</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Write a caption..."
                        rows={4}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingReel(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditCaption}
                            disabled={updateCaptionMutation.isPending}
                        >
                            {updateCaptionMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteReelId} onOpenChange={() => setDeleteReelId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reel?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The reel and all its likes and
                            comments will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteReelId && deleteReelMutation.mutate(deleteReelId)}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleteReelMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
