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

        const { customerId } = await req.json()

        // Create order for ₹1 (will be refunded)
        const order = await razorpay.orders.create({
            amount: 100, // ₹1 in paise
            currency: "INR",
            customer_id: customerId,
            notes: {
                purpose: "card_validation",
                clerkId: user.id,
            },
        })

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        })
    } catch (error: any) {
        console.error("Error creating order:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        )
    }
}
