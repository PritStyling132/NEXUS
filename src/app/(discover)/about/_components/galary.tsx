"use client"

import { GlassModal } from "@/components/global/glass-model"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    validateURLString,
    getYouTubeEmbedUrl,
    getLoomEmbedUrl,
} from "@/lib/utils"
import { BadgePlus, Trash2, Play, Image as ImageIcon } from "lucide-react"
import MediaGalleryForm from "@/components/forms/media-gallery"
import React, { useState } from "react"
import { MediaType } from "@/hooks/groups"
import { onDeleteFromGallery } from "@/actions/groups"
import { toast } from "sonner"
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

type Props = {
    gallery: string[]
    groupid: string
    onActive: (media: MediaType) => void
    userid?: string
    groupUserid: string
}

export const MediaGallery = ({
    gallery,
    groupUserid,
    groupid,
    onActive,
    userid,
}: Props) => {
    const [deleteUrl, setDeleteUrl] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const isOwner = userid === groupUserid

    const handleDelete = async () => {
        if (!deleteUrl) return

        setIsDeleting(true)
        try {
            const result = await onDeleteFromGallery(groupid, deleteUrl)
            if (result.status === 200) {
                toast.success("Media deleted successfully")
                // Force a page refresh to update the gallery
                window.location.reload()
            } else {
                toast.error(result.message || "Failed to delete media")
            }
        } catch (error) {
            toast.error("Failed to delete media")
        } finally {
            setIsDeleting(false)
            setDeleteUrl(null)
        }
    }

    const getEmbedUrl = (url: string, type: "YOUTUBE" | "LOOM") => {
        if (type === "YOUTUBE") {
            return getYouTubeEmbedUrl(url)
        }
        return getLoomEmbedUrl(url)
    }

    return (
        <>
            <div className="flex justify-start gap-4 flex-wrap">
                {gallery.length > 0 &&
                    gallery.map((gal, key) => {
                        const mediaInfo = validateURLString(gal)

                        if (mediaInfo.type === "IMAGE") {
                            return (
                                <div
                                    key={key}
                                    className="relative group w-40 aspect-video rounded-xl overflow-hidden border border-border shadow-sm"
                                >
                                    <img
                                        onClick={() =>
                                            onActive({
                                                url: gal,
                                                type: "IMAGE",
                                            })
                                        }
                                        src={gal}
                                        alt="gallery-img"
                                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                    {/* Overlay with icon */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <ImageIcon className="h-6 w-6 text-white" />
                                    </div>
                                    {/* Delete button for owner */}
                                    {isOwner && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteUrl(gal)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            )
                        } else if (mediaInfo.type === "LOOM") {
                            const embedUrl = getEmbedUrl(gal, "LOOM")
                            return (
                                <div
                                    key={key}
                                    className="relative group w-40 aspect-video rounded-xl overflow-hidden border border-border shadow-sm"
                                >
                                    <div
                                        className="w-full h-full absolute z-10 cursor-pointer"
                                        onClick={() =>
                                            onActive({
                                                url: embedUrl,
                                                type: "LOOM",
                                            })
                                        }
                                    />
                                    <iframe
                                        src={embedUrl}
                                        className="absolute outline-none border-0 top-0 left-0 w-full h-full"
                                        style={{ pointerEvents: "none" }}
                                    />
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
                                        <div className="p-2 rounded-full bg-white/90 shadow-lg">
                                            <Play className="h-4 w-4 text-primary fill-primary" />
                                        </div>
                                    </div>
                                    {/* Delete button for owner */}
                                    {isOwner && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteUrl(gal)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            )
                        } else {
                            // YouTube
                            const embedUrl = getEmbedUrl(gal, "YOUTUBE")
                            return (
                                <div
                                    key={key}
                                    className="relative group w-40 aspect-video rounded-xl overflow-hidden border border-border shadow-sm"
                                >
                                    <div
                                        className="w-full h-full absolute z-10 cursor-pointer"
                                        onClick={() =>
                                            onActive({
                                                url: embedUrl,
                                                type: "YOUTUBE",
                                            })
                                        }
                                    />
                                    <iframe
                                        className="w-full absolute top-0 left-0 h-full"
                                        src={embedUrl}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        style={{ pointerEvents: "none" }}
                                    />
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
                                        <div className="p-2 rounded-full bg-red-600 shadow-lg">
                                            <Play className="h-4 w-4 text-white fill-white" />
                                        </div>
                                    </div>
                                    {/* Delete button for owner */}
                                    {isOwner && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteUrl(gal)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            )
                        }
                    })}

                {/* Add new media button - only for owner */}
                {isOwner && (
                    <GlassModal
                        title="Add Media to Gallery"
                        description="Upload an image or add a YouTube/Loom video link"
                        trigger={
                            <Card className="w-40 aspect-video border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 bg-transparent cursor-pointer transition-colors">
                                <CardContent className="flex flex-col justify-center items-center h-full p-0">
                                    <div className="p-2 rounded-full bg-primary/10 mb-2">
                                        <BadgePlus className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Add Media
                                    </p>
                                </CardContent>
                            </Card>
                        }
                    >
                        <MediaGalleryForm groupid={groupid} />
                    </GlassModal>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteUrl}
                onOpenChange={() => setDeleteUrl(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Media?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            remove this media from your gallery.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
