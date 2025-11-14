import { prisma } from "@/lib/prisma"
import { razorpay, TRIAL_DAYS } from "@/lib/razorpay"
import { currentUser } from "@clerk/nextjs/server"
import crypto from "crypto"
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

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            customerId,
        } = await req.json()

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 },
            )
        }

        // Fetch payment to get token
        const payment = await razorpay.payments.fetch(razorpay_payment_id)

        // Calculate trial end date
        const trialEndsAt = new Date(
            Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
        )

        // Save in database
        await prisma.user.update({
            where: { clerkId: user.id },
            data: {
                razorpayTokenId: payment.token_id,
                razorpayCustomerId: customerId,
                trialEndsAt: trialEndsAt,
            },
        })

        // Refund the ₹1
        try {
            await razorpay.payments.refund(razorpay_payment_id, {
                amount: 100,
                notes: { reason: "Card validation refund" },
            })
        } catch (refundError) {
            console.error("Refund error (non-critical):", refundError)
        }

        return NextResponse.json({
            success: true,
            tokenId: payment.token_id,
            trialEndsAt: trialEndsAt.toISOString(),
        })
    } catch (error: any) {
        console.error("Error saving token:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        )
    }
}
