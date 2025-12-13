import { NextResponse } from "next/server"
import { onGetUserProfile } from "@/actions/auth"

export async function GET() {
    try {
        const result = await onGetUserProfile()
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({
            status: 400,
            message: "Failed to fetch profile",
        })
    }
}
