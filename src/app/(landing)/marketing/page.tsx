"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import {
    Heart,
    MessageCircle,
    Share2,
    Volume2,
    VolumeX,
    Play,
    Pause,
    ChevronUp,
    ChevronDown,
    Loader2,
    X,
    Send,
    MoreHorizontal,
    ExternalLink,
    Copy,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    onToggleReelLike,
    onCheckReelLike,
    onGetReelComments,
    onAddReelComment,
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
    group: {
        id: string
        name: string
        thumbnail: string | null
        category: string
        owner: {
            id: string
            firstname: string
            lastname: string
            image: string | null
        }
    }
    _count: {
        likes: number
        comments: number
    }
}

type CommentUser = {
    id: string
    firstname: string
    lastname: string
    image: string | null
}

type Comment = {
    id: string
    content: string
    createdAt: string | Date
    user: CommentUser
    replies?: any[]
    _count?: {
        replies: number
    }
}

export default function MarketingPage() {
    const { isSignedIn } = useUser()
    const [reels, setReels] = useState<Reel[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [muted, setMuted] = useState(true)
    const [playing, setPlaying] = useState(true)
    const [likedReels, setLikedReels] = useState<Set<string>>(new Set())
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [submittingComment, setSubmittingComment] = useState(false)
    const [copied, setCopied] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

    // Fetch reels
    const fetchReels = useCallback(async (cursor?: string) => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (cursor) params.set("cursor", cursor)
            params.set("limit", "10")

            const response = await fetch(`/api/reels?${params}`)
            const data = await response.json()

            if (data.success) {
                if (cursor) {
                    setReels((prev) => [...prev, ...data.reels])
                } else {
                    setReels(data.reels)
                }
                setNextCursor(data.nextCursor)
                setHasMore(data.hasMore)

                // Initialize like and comment counts
                const newLikeCounts: Record<string, number> = {}
                const newCommentCounts: Record<string, number> = {}
                data.reels.forEach((reel: Reel) => {
                    newLikeCounts[reel.id] = reel._count.likes
                    newCommentCounts[reel.id] = reel._count.comments
                })
                setLikeCounts((prev) => ({ ...prev, ...newLikeCounts }))
                setCommentCounts((prev) => ({ ...prev, ...newCommentCounts }))
            }
        } catch (error) {
            console.error("Error fetching reels:", error)
            toast.error("Failed to load reels")
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchReels()
    }, [fetchReels])

    // Check like status for current reel
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (!isSignedIn || !reels[currentIndex]) return
            const result = await onCheckReelLike(reels[currentIndex].id)
            if (result.status === 200 && result.data?.liked) {
                setLikedReels((prev) => new Set(prev).add(reels[currentIndex].id))
            }
        }
        checkLikeStatus()
    }, [currentIndex, reels, isSignedIn])

    // Handle video playback on index change
    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === currentIndex) {
                    video.currentTime = 0
                    video.play().catch(() => {})
                } else {
                    video.pause()
                }
            }
        })
    }, [currentIndex])

    // Handle scroll navigation
    const handleScroll = useCallback(
        (direction: "up" | "down") => {
            if (direction === "up" && currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1)
            } else if (direction === "down" && currentIndex < reels.length - 1) {
                setCurrentIndex((prev) => prev + 1)
                // Load more when near end
                if (currentIndex >= reels.length - 3 && hasMore && nextCursor) {
                    fetchReels(nextCursor)
                }
            }
        },
        [currentIndex, reels.length, hasMore, nextCursor, fetchReels]
    )

    // Wheel event handler
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let lastScrollTime = 0
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            const now = Date.now()
            if (now - lastScrollTime < 500) return // Debounce
            lastScrollTime = now

            if (e.deltaY > 0) {
                handleScroll("down")
            } else if (e.deltaY < 0) {
                handleScroll("up")
            }
        }

        container.addEventListener("wheel", handleWheel, { passive: false })
        return () => container.removeEventListener("wheel", handleWheel)
    }, [handleScroll])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't handle keyboard shortcuts when typing in an input or textarea
            const target = e.target as HTMLElement
            const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable

            if (isTyping) return

            if (e.key === "ArrowUp") {
                e.preventDefault()
                handleScroll("up")
            } else if (e.key === "ArrowDown") {
                e.preventDefault()
                handleScroll("down")
            } else if (e.key === " ") {
                e.preventDefault()
                setPlaying((prev) => !prev)
            } else if (e.key === "m") {
                setMuted((prev) => !prev)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleScroll])

    // Toggle play/pause
    const togglePlay = () => {
        const video = videoRefs.current[currentIndex]
        if (video) {
            if (playing) {
                video.pause()
            } else {
                video.play()
            }
            setPlaying(!playing)
        }
    }

    // Handle like
    const handleLike = async (reelId: string) => {
        if (!isSignedIn) {
            toast.error("Please sign in to like reels")
            return
        }

        const wasLiked = likedReels.has(reelId)

        // Optimistic update
        setLikedReels((prev) => {
            const newSet = new Set(prev)
            if (wasLiked) {
                newSet.delete(reelId)
            } else {
                newSet.add(reelId)
            }
            return newSet
        })
        setLikeCounts((prev) => ({
            ...prev,
            [reelId]: (prev[reelId] || 0) + (wasLiked ? -1 : 1),
        }))

        const result = await onToggleReelLike(reelId)
        if (result.status !== 200) {
            // Revert on error
            setLikedReels((prev) => {
                const newSet = new Set(prev)
                if (wasLiked) {
                    newSet.add(reelId)
                } else {
                    newSet.delete(reelId)
                }
                return newSet
            })
            setLikeCounts((prev) => ({
                ...prev,
                [reelId]: (prev[reelId] || 0) + (wasLiked ? 1 : -1),
            }))
            toast.error(result.message || "Failed to like")
        }
    }

    // Open comments
    const openComments = async (reelId: string) => {
        setShowComments(true)
        setCommentsLoading(true)
        const result = await onGetReelComments(reelId)
        if (result.status === 200) {
            setComments(result.data || [])
        }
        setCommentsLoading(false)
    }

    // Submit comment
    const handleSubmitComment = async () => {
        if (!newComment.trim() || submittingComment) return
        if (!isSignedIn) {
            toast.error("Please sign in to comment")
            return
        }

        const currentReel = reels[currentIndex]
        if (!currentReel) return

        setSubmittingComment(true)
        const result = await onAddReelComment(currentReel.id, newComment)
        if (result.status === 200 && result.data) {
            setComments((prev) => [result.data, ...prev])
            setCommentCounts((prev) => ({
                ...prev,
                [currentReel.id]: (prev[currentReel.id] || 0) + 1,
            }))
            setNewComment("")
            toast.success("Comment added!")
        } else {
            toast.error(result.message || "Failed to add comment")
        }
        setSubmittingComment(false)
    }

    // Share reel
    const handleShare = async (reel: Reel) => {
        const shareUrl = `${window.location.origin}/marketing?reel=${reel.id}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${reel.group.name} - ${reel.caption || "Check out this reel!"}`,
                    text: reel.caption || "Check out this amazing reel on NeXuS!",
                    url: shareUrl,
                })
            } catch {
                copyToClipboard(shareUrl)
            }
        } else {
            copyToClipboard(shareUrl)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    // Check for shared reel in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const sharedReelId = params.get("reel")
        if (sharedReelId && reels.length > 0) {
            const index = reels.findIndex((r) => r.id === sharedReelId)
            if (index !== -1) {
                setCurrentIndex(index)
            }
        }
    }, [reels])

    const currentReel = reels[currentIndex]

    if (loading && reels.length === 0) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-white/60">Loading reels...</p>
                </div>
            </div>
        )
    }

    if (reels.length === 0) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-background to-black/90">
                <div className="text-center max-w-md px-4">
                    <div className="relative mx-auto mb-6 w-24 h-24">
                        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                            <Play className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        No Reels Yet
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Be the first to discover amazing content from our community groups!
                    </p>
                    <Link href="/explore">
                        <Button className="bg-primary hover:bg-primary/90">
                            Explore Groups
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-black overflow-hidden"
            style={{ touchAction: "none" }}
        >
            {/* Reels Container */}
            <div
                className="h-full w-full transition-transform duration-500 ease-out"
                style={{ transform: `translateY(-${currentIndex * 100}%)` }}
            >
                {reels.map((reel, index) => (
                    <div
                        key={reel.id}
                        className="h-full w-full relative flex items-center justify-center"
                    >
                        {/* Video */}
                        <video
                            ref={(el) => {
                                videoRefs.current[index] = el
                            }}
                            src={reel.videoUrl}
                            poster={reel.thumbnailUrl || undefined}
                            className="h-full w-full object-contain max-w-[500px] mx-auto"
                            loop
                            muted={muted}
                            playsInline
                            onClick={togglePlay}
                        />

                        {/* Play/Pause Overlay */}
                        {!playing && index === currentIndex && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                                onClick={togglePlay}
                            >
                                <div className="p-6 rounded-full bg-black/50 backdrop-blur-sm">
                                    <Play className="w-16 h-16 text-white" fill="white" />
                                </div>
                            </div>
                        )}

                        {/* Gradient Overlays */}
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                        {/* Right Side Actions */}
                        <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 z-10">
                            {/* Like */}
                            <button
                                onClick={() => handleLike(reel.id)}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div
                                    className={cn(
                                        "p-3 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300",
                                        "group-hover:bg-white/20 group-active:scale-90",
                                        likedReels.has(reel.id) && "bg-red-500/20"
                                    )}
                                >
                                    <Heart
                                        className={cn(
                                            "w-7 h-7 transition-all",
                                            likedReels.has(reel.id)
                                                ? "text-red-500 fill-red-500"
                                                : "text-white"
                                        )}
                                    />
                                </div>
                                <span className="text-white text-xs font-medium">
                                    {likeCounts[reel.id] || reel._count.likes}
                                </span>
                            </button>

                            {/* Comments */}
                            <button
                                onClick={() => openComments(reel.id)}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-active:scale-90">
                                    <MessageCircle className="w-7 h-7 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium">
                                    {commentCounts[reel.id] || reel._count.comments}
                                </span>
                            </button>

                            {/* Share */}
                            <button
                                onClick={() => handleShare(reel)}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/20 group-active:scale-90">
                                    {copied ? (
                                        <Check className="w-7 h-7 text-green-500" />
                                    ) : (
                                        <Share2 className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <span className="text-white text-xs font-medium">Share</span>
                            </button>

                            {/* Mute Toggle */}
                            <button
                                onClick={() => setMuted(!muted)}
                                className="p-3 rounded-full bg-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-90"
                            >
                                {muted ? (
                                    <VolumeX className="w-6 h-6 text-white" />
                                ) : (
                                    <Volume2 className="w-6 h-6 text-white" />
                                )}
                            </button>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute left-4 right-20 bottom-8 z-10">
                            {/* Group Info */}
                            <Link
                                href={`/about/${reel.group.id}`}
                                className="flex items-center gap-3 mb-4 group/link"
                            >
                                <Avatar className="w-12 h-12 ring-2 ring-white/20 group-hover/link:ring-primary/50 transition-all">
                                    <AvatarImage
                                        src={
                                            reel.group.owner.image ||
                                            reel.group.thumbnail ||
                                            ""
                                        }
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold">
                                        {reel.group.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-white font-semibold text-lg group-hover/link:text-primary transition-colors">
                                        {reel.group.name}
                                    </p>
                                    <p className="text-white/60 text-sm">
                                        @{reel.group.owner.firstname?.toLowerCase()}
                                        {reel.group.owner.lastname?.toLowerCase()} &bull;{" "}
                                        {reel.group.category}
                                    </p>
                                </div>
                            </Link>

                            {/* Caption */}
                            {reel.caption && (
                                <p className="text-white text-sm leading-relaxed line-clamp-3">
                                    {reel.caption}
                                </p>
                            )}

                            {/* View Group Button */}
                            <Link href={`/about/${reel.group.id}`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Group
                                </Button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleScroll("up")}
                    disabled={currentIndex === 0}
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                >
                    <ChevronUp className="w-6 h-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleScroll("down")}
                    disabled={currentIndex === reels.length - 1 && !hasMore}
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                >
                    <ChevronDown className="w-6 h-6" />
                </Button>
            </div>

            {/* Progress Indicator */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
                {reels.slice(0, 10).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "w-1 rounded-full transition-all duration-300",
                            index === currentIndex
                                ? "h-6 bg-white"
                                : "h-2 bg-white/30"
                        )}
                    />
                ))}
                {reels.length > 10 && (
                    <span className="text-white/50 text-[10px]">+{reels.length - 10}</span>
                )}
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
                <h1 className="text-white font-bold text-xl">Reels</h1>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                    <span>{currentIndex + 1}/{reels.length}</span>
                </div>
            </div>

            {/* Comments Sheet */}
            <Sheet open={showComments} onOpenChange={setShowComments}>
                <SheetContent
                    side="bottom"
                    className="h-[70vh] rounded-t-3xl bg-background/95 backdrop-blur-xl border-t border-white/10"
                >
                    <SheetHeader className="border-b border-border pb-4">
                        <SheetTitle className="text-center">
                            Comments ({commentCounts[currentReel?.id] || 0})
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea hideScrollbar className="flex-1 h-[calc(70vh-140px)] py-4">
                        {commentsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground">No comments yet</p>
                                <p className="text-sm text-muted-foreground/60">
                                    Be the first to comment!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 px-1">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="w-9 h-9 flex-shrink-0">
                                            <AvatarImage src={comment.user.image || ""} />
                                            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-sm">
                                                {comment.user.firstname?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-semibold text-sm">
                                                    {comment.user.firstname} {comment.user.lastname}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/90 mt-1">
                                                {comment.content}
                                            </p>
                                            {/* Replies */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-3 ml-4 space-y-3 border-l-2 border-border pl-4">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="flex gap-2">
                                                            <Avatar className="w-7 h-7 flex-shrink-0">
                                                                <AvatarImage
                                                                    src={reply.user.image || ""}
                                                                />
                                                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white text-xs">
                                                                    {reply.user.firstname?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <span className="font-medium text-xs">
                                                                    {reply.user.firstname}
                                                                </span>
                                                                <p className="text-xs text-foreground/80">
                                                                    {reply.content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Comment Input */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
                        <div className="flex gap-3 items-center">
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={
                                    isSignedIn
                                        ? "Add a comment..."
                                        : "Sign in to comment"
                                }
                                disabled={!isSignedIn || submittingComment}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmitComment()
                                    }
                                }}
                                className="flex-1 bg-muted/50 border-0 focus:ring-2 focus:ring-primary/50 rounded-xl"
                            />
                            <Button
                                size="icon"
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || submittingComment || !isSignedIn}
                                className="rounded-xl"
                            >
                                {submittingComment ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
