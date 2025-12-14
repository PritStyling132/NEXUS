"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    MessageSquare,
    Send,
    Search,
    Users,
    Loader2,
    ArrowLeft,
    Sparkles,
    MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
    onGetConversations,
    onGetGroupMembers,
    onGetDirectMessages,
    onSendDirectMessage,
} from "@/actions/messages"
import { formatDistanceToNow } from "date-fns"

interface Props {
    groupid: string
    currentUserId: string
}

type Conversation = {
    id: string
    firstname: string
    lastname: string
    image: string | null
    lastMessage: string
    lastMessageAt: Date
}

type Member = {
    id: string
    firstname: string
    lastname: string
    image: string | null
    email: string | null
    isMember: boolean
    isOwner: boolean
}

type Message = {
    id: string
    message: string
    createdAt: string | Date
    sender: {
        id: string
        firstname: string
        lastname: string
        image: string | null
    } | null
    receiver: {
        id: string
        firstname: string
        lastname: string
        image: string | null
    } | null
}

export default function MessagesClient({ groupid, currentUserId }: Props) {
    const [selectedUser, setSelectedUser] = useState<
        Member | Conversation | null
    >(null)
    const [message, setMessage] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [view, setView] = useState<"conversations" | "members">(
        "conversations",
    )
    const queryClient = useQueryClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch existing conversations
    const { data: conversationsData, isLoading: conversationsLoading } =
        useQuery({
            queryKey: ["conversations"],
            queryFn: async () => {
                const result = await onGetConversations()
                return result.status === 200 ? result.data : []
            },
            refetchInterval: 10000,
        })

    // Fetch group members
    const { data: membersData, isLoading: membersLoading } = useQuery({
        queryKey: ["group-members", groupid],
        queryFn: async () => {
            const result = await onGetGroupMembers(groupid)
            return result.status === 200 ? result.data : []
        },
    })

    // Fetch messages for selected conversation
    const { data: messagesData, isLoading: messagesLoading } = useQuery({
        queryKey: ["direct-messages", selectedUser?.id],
        queryFn: async () => {
            if (!selectedUser?.id) return { messages: [] }
            const result = await onGetDirectMessages(selectedUser.id)
            return result.status === 200 ? result.data : { messages: [] }
        },
        enabled: !!selectedUser?.id,
        refetchInterval: 5000,
    })

    const conversations = conversationsData || []
    const members = membersData || []
    const messages = messagesData?.messages || []

    // Filter members based on search
    const filteredMembers = members.filter((member: Member) => {
        const name = `${member.firstname} ${member.lastname}`.toLowerCase()
        return name.includes(searchQuery.toLowerCase())
    })

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (messageText: string) => {
            if (!selectedUser?.id) throw new Error("No user selected")
            return await onSendDirectMessage(selectedUser.id, messageText)
        },
        onSuccess: (result) => {
            if (result.status === 200) {
                queryClient.invalidateQueries({
                    queryKey: ["direct-messages", selectedUser?.id],
                })
                queryClient.invalidateQueries({ queryKey: ["conversations"] })
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

    const handleSelectUser = (user: Member | Conversation) => {
        setSelectedUser(user)
    }

    const handleBack = () => {
        setSelectedUser(null)
    }

    // If a user is selected, show the conversation
    if (selectedUser) {
        return (
            <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0a0a0b] dark:via-[#0d0d0f] dark:to-[#101012]">
                {/* Header - Glassmorphism */}
                <div className="relative border-b border-white/5 dark:border-white/[0.02] px-4 sm:px-6 py-4 bg-background/80 dark:bg-[#0d0d0f]/90 backdrop-blur-xl sticky top-0 z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="rounded-xl hover:bg-white/5 dark:hover:bg-white/[0.03] transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-lg rounded-full" />
                            <Avatar className="relative h-11 w-11 ring-2 ring-white/10 dark:ring-white/5">
                                <AvatarImage src={selectedUser.image || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold">
                                    {selectedUser.firstname?.[0] || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
                                {selectedUser.firstname} {selectedUser.lastname}
                            </h2>
                            <p className="text-xs text-muted-foreground/60 dark:text-white/30 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Direct message
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea hideScrollbar className="flex-1 px-4 sm:px-6 py-6">
                    {messagesLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                                <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground/60">Loading messages...</p>
                        </div>
                    ) : messages.length > 0 ? (
                        <div className="space-y-3 pb-4">
                            {messages.map((msg: Message, index: number) => {
                                const isOwn = msg.sender?.id === currentUserId
                                const showAvatar =
                                    index === 0 ||
                                    messages[index - 1]?.sender?.id !== msg.sender?.id

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-3 group",
                                            isOwn && "flex-row-reverse",
                                        )}
                                    >
                                        <div className="flex-shrink-0 w-9">
                                            {showAvatar ? (
                                                <Avatar className="w-9 h-9 ring-2 ring-white/10 dark:ring-white/5">
                                                    <AvatarImage src={msg.sender?.image || ""} />
                                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold text-sm">
                                                        {msg.sender?.firstname?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : null}
                                        </div>
                                        <div
                                            className={cn(
                                                "max-w-[75%] rounded-2xl px-4 py-2.5 transition-all duration-300",
                                                isOwn
                                                    ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                                    : "bg-muted/80 dark:bg-white/[0.05] ring-1 ring-border/50 dark:ring-white/[0.05]",
                                            )}
                                        >
                                            {showAvatar && (
                                                <div
                                                    className={cn(
                                                        "flex items-baseline gap-2 mb-1",
                                                        isOwn && "flex-row-reverse",
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "font-semibold text-sm",
                                                            isOwn
                                                                ? "text-primary-foreground"
                                                                : "text-foreground dark:text-white/90",
                                                        )}
                                                    >
                                                        {msg.sender?.firstname}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-[10px] font-medium",
                                                            isOwn
                                                                ? "text-primary-foreground/60"
                                                                : "text-muted-foreground/50 dark:text-white/30",
                                                        )}
                                                    >
                                                        {new Date(msg.createdAt).toLocaleString("en-US", {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            <p className={cn(
                                                "text-[15px] leading-relaxed break-words",
                                                !isOwn && "text-foreground/90 dark:text-white/75"
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
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Card className="max-w-md w-full border-0 bg-gradient-to-b from-card/80 to-card/40 dark:from-white/[0.03] dark:to-white/[0.01] shadow-2xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm">
                                <CardHeader className="text-center pb-8">
                                    <div className="relative mx-auto mb-6">
                                        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                                        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20">
                                            <MessageCircle className="w-10 h-10 text-primary" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                                        Start a conversation
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground/70 dark:text-white/40 mt-3 text-base">
                                        Send your first message to {selectedUser.firstname}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    )}
                </ScrollArea>

                {/* Message Input */}
                <div className="relative px-4 sm:px-6 py-4 bg-gradient-to-t from-background via-background to-transparent dark:from-[#0a0a0b] dark:via-[#0a0a0b]">
                    <div className="absolute top-0 left-4 right-4 sm:left-6 sm:right-6 h-px bg-gradient-to-r from-transparent via-border/50 dark:via-white/5 to-transparent" />

                    <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                        <div className="flex-1 relative">
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
                                placeholder={`Message ${selectedUser.firstname}...`}
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

    // Main view - conversations and member list
    return (
        <div className="flex flex-col w-full h-full bg-gradient-to-b from-background via-background to-background/95 dark:from-[#0a0a0b] dark:via-[#0d0d0f] dark:to-[#101012]">
            {/* Header Section */}
            <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20 dark:border-primary/10">
                                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/70 bg-clip-text text-transparent">
                                Direct Messages
                            </h3>
                            <p className="text-sm text-muted-foreground/70 dark:text-white/40">
                                Private conversations with group members
                            </p>
                        </div>
                    </div>

                    {/* Toggle View - Pill style */}
                    <div className="flex gap-2 p-1 bg-muted/50 dark:bg-white/[0.03] rounded-2xl w-fit ring-1 ring-border/50 dark:ring-white/[0.05]">
                        <Button
                            variant="ghost"
                            onClick={() => setView("conversations")}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300",
                                view === "conversations"
                                    ? "bg-background dark:bg-white/[0.08] shadow-sm text-foreground dark:text-white"
                                    : "text-muted-foreground hover:text-foreground dark:hover:text-white/80 hover:bg-transparent"
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Conversations
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView("members")}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300",
                                view === "members"
                                    ? "bg-background dark:bg-white/[0.08] shadow-sm text-foreground dark:text-white"
                                    : "text-muted-foreground hover:text-foreground dark:hover:text-white/80 hover:bg-transparent"
                            )}
                        >
                            <Users className="w-4 h-4" />
                            Members
                        </Button>
                    </div>

                    {view === "members" && (
                        <div className="relative max-w-md">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl blur-xl opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 bg-muted/50 dark:bg-white/[0.03] border-0 ring-1 ring-border/50 dark:ring-white/[0.05] focus:ring-2 focus:ring-primary/50 rounded-2xl h-12 text-[15px] placeholder:text-muted-foreground/50"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <ScrollArea hideScrollbar className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 pb-6">
                {view === "conversations" ? (
                    conversationsLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                                <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground/60">Loading conversations...</p>
                        </div>
                    ) : conversations.length > 0 ? (
                        <div className="space-y-2">
                            {conversations.map((conv: Conversation) => (
                                <Card
                                    key={conv.id}
                                    className="group cursor-pointer border-0 bg-muted/30 dark:bg-white/[0.02] hover:bg-muted/60 dark:hover:bg-white/[0.04] ring-1 ring-border/30 dark:ring-white/[0.03] hover:ring-primary/30 dark:hover:ring-primary/20 transition-all duration-300 rounded-2xl overflow-hidden"
                                    onClick={() => handleSelectUser(conv)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <Avatar className="relative h-12 w-12 ring-2 ring-white/10 dark:ring-white/5">
                                                    <AvatarImage src={conv.image || ""} />
                                                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold">
                                                        {conv.firstname?.[0] || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-semibold text-foreground dark:text-white/90 group-hover:text-primary transition-colors">
                                                        {conv.firstname} {conv.lastname}
                                                    </p>
                                                    <span className="text-[11px] text-muted-foreground/50 dark:text-white/30 font-medium">
                                                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground/70 dark:text-white/40 truncate">
                                                    {conv.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-0 bg-gradient-to-b from-card/80 to-card/40 dark:from-white/[0.03] dark:to-white/[0.01] shadow-2xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm max-w-md mx-auto">
                            <CardHeader className="text-center pb-8">
                                <div className="relative mx-auto mb-6">
                                    <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                                    <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20">
                                        <Sparkles className="w-10 h-10 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                                    No conversations yet
                                </CardTitle>
                                <CardDescription className="text-muted-foreground/70 dark:text-white/40 mt-2">
                                    Start messaging group members to see your conversations here.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )
                ) : membersLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                            <Loader2 className="relative w-10 h-10 animate-spin text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground/60">Loading members...</p>
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <div className="space-y-2">
                        {filteredMembers.map((member: Member) => (
                            <Card
                                key={member.id}
                                className="group cursor-pointer border-0 bg-muted/30 dark:bg-white/[0.02] hover:bg-muted/60 dark:hover:bg-white/[0.04] ring-1 ring-border/30 dark:ring-white/[0.03] hover:ring-primary/30 dark:hover:ring-primary/20 transition-all duration-300 rounded-2xl overflow-hidden"
                                onClick={() => handleSelectUser(member)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Avatar className="relative h-12 w-12 ring-2 ring-white/10 dark:ring-white/5">
                                                <AvatarImage src={member.image || ""} />
                                                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold">
                                                    {member.firstname?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-foreground dark:text-white/90 group-hover:text-primary transition-colors">
                                                    {member.firstname} {member.lastname}
                                                </p>
                                                {member.isOwner && (
                                                    <span className="text-[10px] font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full ring-1 ring-amber-500/20">
                                                        Owner
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground/60 dark:text-white/40">
                                                {member.email}
                                            </p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-primary/10 dark:bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
                                            <MessageSquare className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-0 bg-gradient-to-b from-card/80 to-card/40 dark:from-white/[0.03] dark:to-white/[0.01] shadow-2xl shadow-black/5 dark:shadow-black/20 backdrop-blur-sm max-w-md mx-auto">
                        <CardHeader className="text-center pb-8">
                            <div className="relative mx-auto mb-6">
                                <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 border border-primary/20">
                                    <Users className="w-10 h-10 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                                {searchQuery ? "No members found" : "No members yet"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground/70 dark:text-white/40 mt-2">
                                {searchQuery
                                    ? "Try a different search term."
                                    : "Group members will appear here once they join."}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </ScrollArea>
        </div>
    )
}
