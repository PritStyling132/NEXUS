import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// API route to clear owner session cookie
export async function POST() {
    try {
        const cookieStore = await cookies()

        // Delete owner session cookie by setting it to expire
        cookieStore.delete("owner_session")
        cookieStore.delete("owner_pending_id")

        return NextResponse.json({
            success: true,
            message: "Owner session cleared",
        })
    } catch (error) {
        console.error("Error clearing owner session:", error)
        return NextResponse.json(
            {
                success: false,
                error: "Failed to clear session",
            },
            { status: 500 },
        )
    }
}

// Also support GET for easy clearing
export async function GET() {
    return POST()
}
