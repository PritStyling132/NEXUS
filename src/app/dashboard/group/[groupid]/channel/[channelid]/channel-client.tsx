"use client"
import { useState, useEffect, useRef } from "react"
import { Hash, Send, ArrowLeft, Users, Loader2 } from "lucide-react"
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
        refetchInterval: 5000, // Poll every 5 seconds
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
                // Invalidate and refetch messages
                queryClient.invalidateQueries({ queryKey: ["channel-messages", channelid] })
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
        setMessage("") // Clear input immediately
        sendMessageMutation.mutate(messageText)
    }

    return (
        <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-background">
            {/* Channel Header */}
            <div className="border-b border-border px-4 sm:px-6 py-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/group/${groupid}`}>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Hash className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground">
                                {channel?.name || "Channel"}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span>{messages.length} messages</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 sm:px-6 py-6">
                {isLoading ? (
                    <div className="flex items-center justify-center min-h-[calc(100vh-350px)]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : messages && messages.length > 0 ? (
                    <div className="space-y-4 pb-4">
                        {messages.map((msg: any, index: number) => {
                            const showAvatar =
                                index === 0 ||
                                messages[index - 1]?.sender?.firstname !==
                                    msg.sender?.firstname

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 group hover:bg-accent/30 -mx-2 px-2 py-1 rounded-lg transition-colors",
                                        !showAvatar && "mt-1",
                                    )}
                                >
                                    <div className="flex-shrink-0 w-10">
                                        {showAvatar ? (
                                            <Avatar className="w-10 h-10 border-2 border-border">
                                                <AvatarImage
                                                    src={msg.sender?.image}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                                    {msg.sender
                                                        ?.firstname?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {showAvatar && (
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-foreground">
                                                    {msg.sender?.firstname}{" "}
                                                    {msg.sender?.lastname}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        msg.createdAt,
                                                    ).toLocaleString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        <p
                                            className={cn(
                                                "text-sm text-foreground break-words",
                                                !showAvatar && "text-sm",
                                            )}
                                        >
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
                        <Card className="max-w-md w-full border-border bg-card/50 shadow-lg">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                                    <Hash className="w-12 h-12 text-primary" />
                                </div>
                                <CardTitle className="text-xl text-foreground">
                                    Welcome to #{channel?.name || "channel"}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground mt-2">
                                    This is the start of the #
                                    {channel?.name || "channel"} channel. Send
                                    your first message below to get the
                                    conversation started!
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border px-4 sm:px-6 py-4 bg-background">
                <form
                    onSubmit={handleSendMessage}
                    className="flex gap-2 items-end"
                >
                    <div className="flex-1">
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
                            className="min-h-[60px] max-h-[200px] resize-none bg-background border-border focus:ring-2 focus:ring-primary rounded-xl"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                        className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg disabled:opacity-50 h-[60px] w-[60px]"
                    >
                        {sendMessageMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 px-1">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    )
}
