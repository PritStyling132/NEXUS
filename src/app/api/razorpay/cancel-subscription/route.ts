import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            )
        }

        const { groupId } = await req.json()

        // Find subscription by groupId using findFirst (since groupId is unique)
        const subscription = await prisma.subscription.findFirst({
            where: { groupId: groupId },
            include: { user: true },
        })

        if (!subscription) {
            return NextResponse.json(
                { success: false, error: "Subscription not found" },
                { status: 404 },
            )
        }

        if (subscription.user.clerkId !== user.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 },
            )
        }

        // Cancel on Razorpay
        if (subscription.razorpaySubscriptionId) {
            // FIXED: Use boolean instead of object
            await razorpay.subscriptions.cancel(
                subscription.razorpaySubscriptionId,
                false, // Cancel immediately (false), or at cycle end (true)
            )
        }

        // Update database - use findFirst since we're matching on groupId
        await prisma.subscription.updateMany({
            where: { groupId: groupId },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
            },
        })

        return NextResponse.json({
            success: true,
            message: "Subscription cancelled successfully",
        })
    } catch (error: any) {
        console.error("Error cancelling subscription:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        )
    }
}
