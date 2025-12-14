"use client"
import { useState, useEffect, useRef } from "react"
import { Hash, Send, ArrowLeft, Users, Loader2, Sparkles } from "lucide-react"
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
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { onGetChannelMessages, onSendChannelMessage } from "@/actions/messages"
import { toast } from "sonner"

interface Props {
    channelInfo: any
    groupid: string
    channelid: string
}

export default function LearnerChannelClient({
    channelInfo,
    groupid,
    channelid,
}: Props) {
    const [message, setMessage] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)
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

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (messageText: string) => {
            return await onSendChannelMessage(channelid, messageText)
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || sendMessageMutation.isPending) return

        const messageText = message.trim()
        setMessage("")
        sendMessageMutation.mutate(messageText)
    }

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0a0a0b] dark:via-[#0d0d0f] dark:to-[#101012]">
            {/* Channel Header - Glassmorphism style */}
            <div className="border-b border-white/5 dark:border-white/[0.02] px-4 sm:px-6 py-4 bg-background/80 dark:bg-[#0d0d0f]/90 backdrop-blur-xl sticky top-0 z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

                <div className="relative flex items-center gap-4">
                    <Link href={`/dashboard/group/${groupid}`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-white/5 dark:hover:bg-white/[0.03] transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
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
                </div>
            </div>

            {/* Messages Area - Hidden scrollbar */}
            <ScrollArea hideScrollbar className="flex-1 px-4 sm:px-6 py-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-350px)] gap-4">
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
                                        <p className="text-[15px] leading-relaxed text-foreground/90 dark:text-white/75 break-words">
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[calc(100vh-350px)]">
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
            <div className="relative px-4 sm:px-6 py-4 bg-gradient-to-t from-background via-background to-transparent dark:from-[#0a0a0b] dark:via-[#0a0a0b]">
                {/* Top border with gradient */}
                <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-px bg-gradient-to-r from-transparent via-border/50 dark:via-white/5 to-transparent" />

                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
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
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!message.trim() || sendMessageMutation.isPending}
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
                        {sendMessageMutation.isPending ? (
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
