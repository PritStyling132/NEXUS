import { NextResponse } from "next/server"
import {
    onGetNotifications,
    onMarkAllNotificationsAsRead,
} from "@/actions/notifications"

export async function GET() {
    try {
        const result = await onGetNotifications()
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({
            status: 400,
            message: "Failed to fetch notifications",
        })
    }
}

export async function POST() {
    try {
        const result = await onMarkAllNotificationsAsRead()
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error marking notifications as read:", error)
        return NextResponse.json({
            status: 400,
            message: "Failed to mark notifications as read",
        })
    }
}
