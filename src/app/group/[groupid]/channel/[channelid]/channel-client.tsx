"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import {
    Hash,
    Send,
    MoreVertical,
    Users,
    Loader2,
    Sparkles,
    Smile,
    Image as ImageIcon,
    Video,
    Mic,
    X,
    Play,
    Pause,
    Square,
    FileImage,
    FileVideo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { onGetChannelMessages, onSendChannelMessage } from "@/actions/messages"
import { uploadFile } from "@/lib/cloudinary"
import { toast } from "sonner"

interface Props {
    channelInfo: any
    groupid: string
    channelid: string
}

// Common emoji categories
const emojiCategories = {
    "Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥"],
    "Gestures": ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏", "💪", "🦾"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
    "Objects": ["🎉", "🎊", "🎁", "🎈", "✨", "⭐", "🌟", "💫", "🔥", "💯", "💢", "💥", "💦", "💨", "🕳️", "💣", "💬", "👁️‍🗨️", "🗨️", "🗯️", "💭", "💤"],
    "Animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉"],
    "Food": ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒"],
}

export default function ChannelClient({
    channelInfo,
    groupid,
    channelid,
}: Props) {
    const [message, setMessage] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [mediaPreview, setMediaPreview] = useState<{
        type: "image" | "video" | "voice"
        url: string
        file?: File
    } | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const queryClient = useQueryClient()

    const channel =
        channelInfo && typeof channelInfo === "object" && "id" in channelInfo
            ? channelInfo
            : null

    // Fetch messages with polling
    const { data: messagesData, isLoading } = useQuery({
        queryKey: ["channel-messages", channelid],
        queryFn: async () => {
            const result = await onGetChannelMessages(channelid)
            return result.status === 200 ? result.data : { messages: [] }
        },
        refetchInterval: 5000,
    })

    const messages = messagesData?.messages || []

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Cleanup recording on unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop()
            }
        }
    }, [])

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({
            text,
            mediaType,
            mediaUrl,
        }: {
            text: string
            mediaType?: "image" | "video" | "voice" | null
            mediaUrl?: string | null
        }) => {
            return await onSendChannelMessage(channelid, text, mediaType, mediaUrl)
        },
        onSuccess: (result) => {
            if (result.status === 200) {
                queryClient.invalidateQueries({
                    queryKey: ["channel-messages", channelid],
                })
            } else {
                toast.error(result.message || "Failed to send message")
            }
        },
        onError: () => {
            toast.error("Failed to send message")
        },
    })

    const handleEmojiSelect = (emoji: string) => {
        setMessage((prev) => prev + emoji)
        setShowEmojiPicker(false)
    }

    const handleFileSelect = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "image" | "video"
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (50MB max for videos, 10MB for images)
        const maxSize = type === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error(`File too large. Max size: ${type === "video" ? "50MB" : "10MB"}`)
            return
        }

        // Create preview
        const previewUrl = URL.createObjectURL(file)
        setMediaPreview({ type, url: previewUrl, file })

        // Reset input
        e.target.value = ""
    }

    const handleRemoveMedia = () => {
        if (mediaPreview?.url) {
            URL.revokeObjectURL(mediaPreview.url)
        }
        setMediaPreview(null)
        setAudioBlob(null)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
                setAudioBlob(blob)
                const url = URL.createObjectURL(blob)
                setMediaPreview({ type: "voice", url })
                stream.getTracks().forEach((track) => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } catch (error) {
            toast.error("Could not access microphone. Please check permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current)
        }
        setIsRecording(false)
    }

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!message.trim() && !mediaPreview) || sendMessageMutation.isPending || isUploading) return

        try {
            let mediaUrl: string | null = null
            let mediaType: "image" | "video" | "voice" | null = null

            // Upload media if present
            if (mediaPreview) {
                setIsUploading(true)
                setUploadProgress(10)

                let fileToUpload: File

                if (mediaPreview.type === "voice" && audioBlob) {
                    fileToUpload = new File([audioBlob], `voice-${Date.now()}.webm`, {
                        type: "audio/webm",
                    })
                } else if (mediaPreview.file) {
                    fileToUpload = mediaPreview.file
                } else {
                    throw new Error("No file to upload")
                }

                mediaUrl = await uploadFile(fileToUpload, setUploadProgress)
                mediaType = mediaPreview.type
            }

            const messageText = message.trim()
            setMessage("")
            handleRemoveMedia()
            setIsUploading(false)
            setUploadProgress(0)

            sendMessageMutation.mutate({
                text: messageText,
                mediaType,
                mediaUrl,
            })
        } catch (error: any) {
            setIsUploading(false)
            setUploadProgress(0)
            toast.error(error.message || "Failed to upload media")
        }
    }

    // Render media content in message
    const renderMediaContent = (msg: any) => {
        if (!msg.mediaUrl) return null

        switch (msg.mediaType) {
            case "image":
                return (
                    <div className="mt-2 max-w-sm">
                        <img
                            src={msg.mediaUrl}
                            alt="Shared image"
                            className="rounded-xl border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(msg.mediaUrl, "_blank")}
                        />
                    </div>
                )
            case "video":
                return (
                    <div className="mt-2 max-w-md">
                        <video
                            src={msg.mediaUrl}
                            controls
                            className="rounded-xl border border-white/10 w-full"
                        />
                    </div>
                )
            case "voice":
                return (
                    <div className="mt-2 max-w-xs">
                        <audio
                            src={msg.mediaUrl}
                            controls
                            className="w-full h-10"
                        />
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="flex flex-col w-full h-full bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0a0a0b] dark:via-[#0d0d0f] dark:to-[#101012]">
            {/* Channel Header - Glassmorphism style */}
            <div className="relative border-b border-white/5 dark:border-white/[0.02] px-4 sm:px-6 md:px-8 py-4 bg-background/80 dark:bg-[#0d0d0f]/90 backdrop-blur-xl sticky top-0 z-10">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Icon with glow effect */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20 dark:border-primary/10">
                                <Hash className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
                                {channel?.name || "Channel"}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground/80 dark:text-white/40 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span>{messages.length} messages</span>
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-white/5 dark:hover:bg-white/[0.03] transition-all duration-300"
                    >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Messages Area - Hidden scrollbar */}
            <ScrollArea hideScrollbar className="flex-1 px-4 sm:px-6 md:px-8 py-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                            <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground/60">Loading messages...</p>
                    </div>
                ) : messages && messages.length > 0 ? (
                    <div className="space-y-1 pb-4">
                        {messages.map((msg: any, index: number) => {
                            const showAvatar =
                                index === 0 ||
                                messages[index - 1]?.sender?.firstname !==
                                    msg.sender?.firstname

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "group flex gap-4 -mx-3 px-3 py-2 rounded-xl transition-all duration-300",
                                        "hover:bg-gradient-to-r hover:from-primary/[0.03] hover:to-transparent",
                                        "dark:hover:from-white/[0.02] dark:hover:to-transparent",
                                        !showAvatar && "py-0.5",
                                    )}
                                >
                                    <div className="flex-shrink-0 w-10">
                                        {showAvatar ? (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <Avatar className="relative w-10 h-10 ring-2 ring-white/10 dark:ring-white/5">
                                                    <AvatarImage src={msg.sender?.image} />
                                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold text-sm">
                                                        {msg.sender?.firstname?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {showAvatar && (
                                            <div className="flex items-baseline gap-3 mb-1">
                                                <span className="font-semibold text-foreground dark:text-white/90 hover:text-primary transition-colors cursor-pointer">
                                                    {msg.sender?.firstname}{" "}
                                                    {msg.sender?.lastname}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground/50 dark:text-white/30 font-medium">
                                                    {new Date(msg.createdAt).toLocaleString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {msg.message && (
                                            <p className="text-[15px] leading-relaxed text-foreground/90 dark:text-white/75 break-words">
                                                {msg.message}
                                            </p>
                                        )}
                                        {renderMediaContent(msg)}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
                        <Card className="max-w-md w-full border-0 bg-gradient-to-b from-card/80 to-card/40 dark:from-white/[0.03] dark:to-white/[0.01] shadow-2xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm">
                            <CardHeader className="text-center pb-8">
                                {/* Animated icon */}
                                <div className="relative mx-auto mb-6">
                                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                                    <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20">
                                        <Sparkles className="w-10 h-10 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                                    Welcome to #{channel?.name || "channel"}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground/70 dark:text-white/40 mt-3 text-base leading-relaxed">
                                    This is the beginning of something great. Send your first message to start the conversation!
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </ScrollArea>

            {/* Message Input - Modern floating style */}
            <div className="relative px-4 sm:px-6 md:px-8 py-4 bg-gradient-to-t from-background via-background to-transparent dark:from-[#0a0a0b] dark:via-[#0a0a0b]">
                {/* Top border with gradient */}
                <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 md:left-8 md:right-8 h-px bg-gradient-to-r from-transparent via-border/50 dark:via-white/5 to-transparent" />

                {/* Media Preview */}
                {mediaPreview && (
                    <div className="mb-3 relative">
                        <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-muted/50 dark:bg-white/[0.03] border border-border/50 dark:border-white/[0.05]">
                            {mediaPreview.type === "image" && (
                                <div className="relative">
                                    <img
                                        src={mediaPreview.url}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="absolute -top-1 -left-1 p-1 rounded-full bg-blue-500">
                                        <FileImage className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            )}
                            {mediaPreview.type === "video" && (
                                <div className="relative">
                                    <video
                                        src={mediaPreview.url}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className="absolute -top-1 -left-1 p-1 rounded-full bg-purple-500">
                                        <FileVideo className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            )}
                            {mediaPreview.type === "voice" && (
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
                                        <Mic className="w-4 h-4 text-white" />
                                    </div>
                                    <audio src={mediaPreview.url} controls className="h-8" />
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-red-500/10"
                                onClick={handleRemoveMedia}
                            >
                                <X className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                        {isUploading && (
                            <div className="mt-2">
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Uploading... {uploadProgress}%
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                    <div className="mb-3 flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium text-red-500">
                            Recording... {formatRecordingTime(recordingTime)}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-500"
                            onClick={stopRecording}
                        >
                            <Square className="w-4 h-4 mr-1" />
                            Stop
                        </Button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    {/* Media Action Buttons */}
                    <div className="flex gap-1">
                        {/* Emoji Picker */}
                        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl hover:bg-yellow-500/10 dark:hover:bg-yellow-500/20 transition-colors"
                                >
                                    <Smile className="w-5 h-5 text-yellow-500" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 p-0 bg-card/95 dark:bg-[#1a1a1d]/95 backdrop-blur-xl border-border/50 dark:border-white/10"
                                align="start"
                                side="top"
                            >
                                <div className="p-3 max-h-[300px] overflow-y-auto">
                                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                                        <div key={category} className="mb-3">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                                                {category}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {emojis.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-xl"
                                                        onClick={() => handleEmojiSelect(emoji)}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Image Upload */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading || isRecording}
                        >
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            aria-label="Upload image"
                            onChange={(e) => handleFileSelect(e, "image")}
                        />

                        {/* Video Upload */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-colors"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={isUploading || isRecording}
                        >
                            <Video className="w-5 h-5 text-purple-500" />
                        </Button>
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            aria-label="Upload video"
                            onChange={(e) => handleFileSelect(e, "video")}
                        />

                        {/* Voice Recording */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-xl transition-colors",
                                isRecording
                                    ? "bg-red-500/20 hover:bg-red-500/30"
                                    : "hover:bg-green-500/10 dark:hover:bg-green-500/20"
                            )}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isUploading || !!mediaPreview}
                        >
                            <Mic className={cn(
                                "w-5 h-5",
                                isRecording ? "text-red-500" : "text-green-500"
                            )} />
                        </Button>
                    </div>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                        {/* Input glow effect on focus */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSendMessage(e)
                                }
                            }}
                            placeholder={`Message #${channel?.name || "channel"}...`}
                            className="relative min-h-[56px] max-h-[200px] resize-none bg-muted/50 dark:bg-white/[0.03] border-0 ring-1 ring-border/50 dark:ring-white/[0.05] focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 rounded-2xl text-[15px] placeholder:text-muted-foreground/50 dark:placeholder:text-white/30 transition-all duration-300"
                            disabled={isRecording}
                        />
                    </div>

                    {/* Send Button */}
                    <Button
                        type="submit"
                        size="icon"
                        disabled={(!message.trim() && !mediaPreview) || sendMessageMutation.isPending || isUploading || isRecording}
                        className={cn(
                            "relative h-14 w-14 rounded-2xl transition-all duration-300",
                            "bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary",
                            "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
                            "disabled:opacity-40 disabled:shadow-none disabled:from-muted disabled:to-muted",
                            "group overflow-hidden"
                        )}
                    >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {sendMessageMutation.isPending || isUploading ? (
                            <Loader2 className="relative w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="relative w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        )}
                    </Button>
                </form>
                <p className="text-[11px] text-muted-foreground/40 dark:text-white/20 mt-3 px-1 font-medium">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    )
}
