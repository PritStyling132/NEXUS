"use client"
import { useState, useEffect, useRef } from "react"
import { Hash, Send, Image, Smile, MoreVertical, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Props {
    channelInfo: any
    groupid: string
    channelid: string
}

export default function ChannelClient({ channelInfo, groupid, channelid }: Props) {
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState(channelInfo?.messages || [])
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const channel = channelInfo && typeof channelInfo === "object" && "id" in channelInfo
        ? channelInfo
        : null

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        // TODO: Implement actual message sending to backend
        const newMessage = {
            id: Date.now().toString(),
            message: message,
            createdAt: new Date().toISOString(),
            sender: {
                firstname: "You",
                lastname: "",
            },
        }

        setMessages([...messages, newMessage])
        setMessage("")
    }

    return (
        <div className="flex flex-col w-full h-full bg-background dark:bg-[#101011]">
            {/* Channel Header */}
            <div className="border-b border-border dark:border-[#28282D] px-4 sm:px-6 md:px-8 py-4 bg-background/95 dark:bg-[#1A1A1D] backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20">
                            <Hash className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-themeTextWhite">
                                {channel?.name || "Channel"}
                            </h2>
                            <p className="text-xs sm:text-sm text-muted-foreground dark:text-themeTextGray flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span>{messages.length} messages</span>
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 sm:px-6 md:px-8 py-6">
                {messages && messages.length > 0 ? (
                    <div className="space-y-4 pb-4">
                        {messages.map((msg: any, index: number) => {
                            const showAvatar = index === 0 || messages[index - 1]?.sender?.firstname !== msg.sender?.firstname

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 group hover:bg-accent/30 dark:hover:bg-themeGray/10 -mx-2 px-2 py-1 rounded-lg transition-colors",
                                        !showAvatar && "mt-1"
                                    )}
                                >
                                    <div className="flex-shrink-0 w-10">
                                        {showAvatar ? (
                                            <Avatar className="w-10 h-10 border-2 border-border dark:border-themeGray">
                                                <AvatarImage src={msg.sender?.image} />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                                    {msg.sender?.firstname?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : null}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {showAvatar && (
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-foreground dark:text-themeTextWhite">
                                                    {msg.sender?.firstname} {msg.sender?.lastname}
                                                </span>
                                                <span className="text-xs text-muted-foreground dark:text-themeTextGray">
                                                    {new Date(msg.createdAt).toLocaleString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        <p className={cn(
                                            "text-sm text-foreground dark:text-themeTextGray break-words",
                                            !showAvatar && "text-sm"
                                        )}>
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
                        <Card className="max-w-md w-full border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20 shadow-lg">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 dark:bg-primary/20 w-fit">
                                    <Hash className="w-12 h-12 text-primary" />
                                </div>
                                <CardTitle className="text-xl text-foreground dark:text-themeTextWhite">
                                    Welcome to #{channel?.name || "channel"}
                                </CardTitle>
                                <CardDescription className="text-muted-foreground dark:text-themeTextGray mt-2">
                                    This is the start of the #{channel?.name || "channel"} channel.
                                    Send your first message below to get the conversation started!
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border dark:border-[#28282D] px-4 sm:px-6 md:px-8 py-4 bg-background dark:bg-[#1A1A1D]">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
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
                            className="min-h-[60px] max-h-[200px] resize-none bg-background dark:bg-themeGray/20 border-border dark:border-themeGray focus:ring-2 focus:ring-primary rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-xl border-border dark:border-themeGray hover:bg-accent dark:hover:bg-themeGray/50"
                        >
                            <Image className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="rounded-xl border-border dark:border-themeGray hover:bg-accent dark:hover:bg-themeGray/50"
                        >
                            <Smile className="w-4 h-4" />
                        </Button>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!message.trim()}
                            className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
                <p className="text-xs text-muted-foreground dark:text-themeTextGray mt-2 px-1">
                    Press Enter to send, Shift + Enter for new line
                </p>
            </div>
        </div>
    )
}
