"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    MessageSquare,
    Send,
    Search,
    Users,
    Loader2,
    ArrowLeft,
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
            <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
                {/* Header */}
                <div className="border-b border-border px-4 sm:px-6 py-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            className="rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <Avatar className="h-10 w-10 border-2 border-border">
                            <AvatarImage src={selectedUser.image || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                {selectedUser.firstname?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">
                                {selectedUser.firstname} {selectedUser.lastname}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Direct message
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 sm:px-6 py-6">
                    {messagesLoading ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : messages.length > 0 ? (
                        <div className="space-y-4 pb-4">
                            {messages.map((msg: Message, index: number) => {
                                const isOwn = msg.sender?.id === currentUserId
                                const showAvatar =
                                    index === 0 ||
                                    messages[index - 1]?.sender?.id !==
                                        msg.sender?.id

                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex gap-3",
                                            isOwn && "flex-row-reverse",
                                        )}
                                    >
                                        <div className="flex-shrink-0 w-10">
                                            {showAvatar ? (
                                                <Avatar className="w-10 h-10 border-2 border-border">
                                                    <AvatarImage
                                                        src={
                                                            msg.sender?.image ||
                                                            ""
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                                        {msg.sender
                                                            ?.firstname?.[0] ||
                                                            "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : null}
                                        </div>
                                        <div
                                            className={cn(
                                                "max-w-[70%] rounded-2xl px-4 py-2",
                                                isOwn
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted",
                                            )}
                                        >
                                            {showAvatar && (
                                                <div
                                                    className={cn(
                                                        "flex items-baseline gap-2 mb-1",
                                                        isOwn &&
                                                            "flex-row-reverse",
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "font-semibold text-sm",
                                                            isOwn
                                                                ? "text-primary-foreground"
                                                                : "text-foreground",
                                                        )}
                                                    >
                                                        {msg.sender?.firstname}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-xs",
                                                            isOwn
                                                                ? "text-primary-foreground/70"
                                                                : "text-muted-foreground",
                                                        )}
                                                    >
                                                        {new Date(
                                                            msg.createdAt,
                                                        ).toLocaleString(
                                                            "en-US",
                                                            {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm break-words">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <Card className="max-w-md w-full border-border bg-card/50 shadow-lg">
                                <CardHeader className="text-center">
                                    <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                                        <MessageSquare className="w-12 h-12 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl text-foreground">
                                        Start a conversation
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground mt-2">
                                        Send your first message to{" "}
                                        {selectedUser.firstname}
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
                                placeholder={`Message ${selectedUser.firstname}...`}
                                className="min-h-[60px] max-h-[200px] resize-none bg-background border-border focus:ring-2 focus:ring-primary rounded-xl"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={
                                !message.trim() || sendMessageMutation.isPending
                            }
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

    // Main view - conversations and member list
    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                        Direct Messages
                    </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                    Private conversations with group members.
                </p>
            </div>

            {/* Toggle View */}
            <div className="flex gap-2">
                <Button
                    variant={view === "conversations" ? "default" : "outline"}
                    onClick={() => setView("conversations")}
                    className="flex items-center gap-2"
                >
                    <MessageSquare className="w-4 h-4" />
                    Conversations
                </Button>
                <Button
                    variant={view === "members" ? "default" : "outline"}
                    onClick={() => setView("members")}
                    className="flex items-center gap-2"
                >
                    <Users className="w-4 h-4" />
                    Members
                </Button>
            </div>

            {view === "members" && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            )}

            {/* Content */}
            <ScrollArea className="flex-1">
                {view === "conversations" ? (
                    conversationsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : conversations.length > 0 ? (
                        <div className="space-y-2">
                            {conversations.map((conv: Conversation) => (
                                <Card
                                    key={conv.id}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                    onClick={() => handleSelectUser(conv)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 border-2 border-border">
                                                <AvatarImage
                                                    src={conv.image || ""}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                                    {conv.firstname?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-foreground">
                                                        {conv.firstname}{" "}
                                                        {conv.lastname}
                                                    </p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                conv.lastMessageAt,
                                                            ),
                                                            { addSuffix: true },
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conv.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-border bg-card/50">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                                    <MessageSquare className="w-12 h-12 text-primary" />
                                </div>
                                <CardTitle className="text-foreground">
                                    No conversations yet
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Start messaging group members to see your
                                    conversations here.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )
                ) : membersLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <div className="space-y-2">
                        {filteredMembers.map((member: Member) => (
                            <Card
                                key={member.id}
                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => handleSelectUser(member)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-border">
                                            <AvatarImage
                                                src={member.image || ""}
                                            />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                                                {member.firstname?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-foreground">
                                                    {member.firstname}{" "}
                                                    {member.lastname}
                                                </p>
                                                {member.isOwner && (
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        Owner
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-border bg-card/50">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                                <Users className="w-12 h-12 text-primary" />
                            </div>
                            <CardTitle className="text-foreground">
                                {searchQuery
                                    ? "No members found"
                                    : "No members yet"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
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
