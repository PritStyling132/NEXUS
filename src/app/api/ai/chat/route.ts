import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
    try {
        const { messages, courseContext } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages are required" },
                { status: 400 }
            )
        }

        const apiKey = process.env.GEMINI_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: "AI service not configured" },
                { status: 500 }
            )
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Build system prompt with course context
        const systemPrompt = `You are an AI Tutor assistant for an online learning platform called Nexus. Your role is to help learners understand course material and answer their questions.

${courseContext ? `
COURSE CONTEXT:
- Course Title: ${courseContext.title}
- Course Description: ${courseContext.description || "No description provided"}
- Available Topics: ${courseContext.topics || "General course content"}
` : ""}

GUIDELINES:
1. Be helpful, encouraging, and patient with learners
2. Explain concepts clearly and use examples when appropriate
3. If you don't know something, admit it and suggest where to find more information
4. Keep responses concise but informative
5. Use markdown formatting for better readability
6. If the question is unrelated to learning or the course, politely redirect the conversation
7. Encourage learners and celebrate their progress`

        // Convert messages to Gemini format
        // Gemini uses 'user' and 'model' roles, and expects alternating turns
        const chatHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }))

        // Get the latest user message
        const latestMessage = messages[messages.length - 1]?.content || ""

        // Start chat with system instruction and history
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            },
        })

        // Prepend system prompt to first message if no history, otherwise just send the message
        const promptToSend = chatHistory.length === 0
            ? `${systemPrompt}\n\nUser question: ${latestMessage}`
            : latestMessage

        const result = await chat.sendMessage(promptToSend)
        const response = await result.response
        const aiMessage = response.text() || "I apologize, but I couldn't generate a response. Please try again."

        return NextResponse.json({
            message: aiMessage,
            usage: {
                prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
                completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
                total_tokens: response.usageMetadata?.totalTokenCount || 0,
            },
        })
    } catch (error) {
        console.error("AI chat error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
