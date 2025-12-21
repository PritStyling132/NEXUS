import { NextRequest, NextResponse } from "next/server"

// Grok AI uses OpenAI-compatible API format
const GROK_API_URL = "https://api.x.ai/v1/chat/completions"

export async function POST(request: NextRequest) {
    try {
        const { messages, courseContext } = await request.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Messages are required" },
                { status: 400 }
            )
        }

        const apiKey = process.env.GROK_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: "AI service not configured" },
                { status: 500 }
            )
        }

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

        const response = await fetch(GROK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "grok-beta",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 1024,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Grok API error:", response.status, errorText)
            return NextResponse.json(
                { error: `AI error: ${response.status}`, details: errorText },
                { status: response.status }
            )
        }

        const data = await response.json()
        const aiMessage = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."

        return NextResponse.json({
            message: aiMessage,
            usage: data.usage,
        })
    } catch (error) {
        console.error("AI chat error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
