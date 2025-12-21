"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Bot,
    X,
    Send,
    Loader2,
    MessageSquare,
    Sparkles,
    User,
    Minimize2,
    Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

type Message = {
    role: "user" | "assistant"
    content: string
}

type CourseContext = {
    title: string
    description?: string
    topics?: string
}

type AiTutorChatProps = {
    courseContext: CourseContext
}

export default function AiTutorChat({ courseContext }: AiTutorChatProps) {
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Mount check for portal
    useEffect(() => {
        setMounted(true)
    }, [])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen, isMinimized])

    // Don't render until mounted (for SSR)
    if (!mounted) return null

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages((prev) => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    courseContext,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error("AI Tutor error:", data)
                throw new Error(data.error || "Failed to get response")
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.message },
            ])
        } catch (error) {
            console.error("AI Tutor chat error:", error)
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const suggestedQuestions = [
        "Explain this topic in simple terms",
        "What should I learn first?",
        "Give me a practice exercise",
        "Summarize the key concepts",
    ]

    // Floating button when closed
    if (!isOpen) {
        return createPortal(
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 z-[9999]"
                size="icon"
            >
                <Bot className="h-6 w-6 text-white" />
                <span className="sr-only">Open AI Tutor</span>
                {/* Pulse effect */}
                <span className="absolute -inset-1 rounded-full bg-violet-500/30 animate-ping" />
            </Button>,
            document.body
        )
    }

    return createPortal(
        <div
            className={cn(
                "fixed z-[9999] transition-all duration-300 ease-in-out",
                isMinimized
                    ? "bottom-6 right-6 w-72"
                    : "bottom-6 right-6 w-96 h-[600px] max-h-[80vh]"
            )}
        >
            <div
                className={cn(
                    "bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden",
                    isMinimized ? "h-auto" : "h-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Bot className="h-5 w-5" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">AI Tutor</h3>
                            <p className="text-xs text-white/80">Powered by Grok</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            {isMinimized ? (
                                <Maximize2 className="h-4 w-4" />
                            ) : (
                                <Minimize2 className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Chat Content - Hidden when minimized */}
                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                                        <Sparkles className="h-8 w-8 text-violet-500" />
                                    </div>
                                    <h4 className="font-semibold mb-2">
                                        Hi! I'm your AI Tutor
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                                        I'm here to help you learn{" "}
                                        <span className="font-medium text-foreground">
                                            {courseContext.title}
                                        </span>
                                        . Ask me anything!
                                    </p>

                                    {/* Suggested Questions */}
                                    <div className="space-y-2 w-full">
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Try asking:
                                        </p>
                                        {suggestedQuestions.map((question, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setInput(question)
                                                    inputRef.current?.focus()
                                                }}
                                                className="w-full text-left text-sm p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                            >
                                                <MessageSquare className="inline h-3 w-3 mr-2 text-violet-500" />
                                                {question}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex gap-3",
                                                message.role === "user"
                                                    ? "justify-end"
                                                    : "justify-start"
                                            )}
                                        >
                                            {message.role === "assistant" && (
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                                                        <Bot className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                                                    message.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                                        : "bg-muted rounded-bl-md"
                                                )}
                                            >
                                                {message.role === "assistant" ? (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown>
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    message.content
                                                )}
                                            </div>
                                            {message.role === "user" && (
                                                <Avatar className="h-8 w-8 flex-shrink-0">
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        <User className="h-4 w-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3">
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarFallback className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                                                    <Bot className="h-4 w-4" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 border-t bg-background"
                        >
                            <div className="flex gap-2">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-violet-500"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>,
        document.body
    )
}
