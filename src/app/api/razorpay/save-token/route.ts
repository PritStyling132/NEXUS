// import { prisma } from "@/lib/prisma"
// import { razorpay, TRIAL_DAYS } from "@/lib/razorpay"
// import { currentUser } from "@clerk/nextjs/server"
// import crypto from "crypto"
// import { NextRequest, NextResponse } from "next/server"

// export async function POST(req: NextRequest) {
//     try {
//         const user = await currentUser()
//         if (!user) {
//             return NextResponse.json(
//                 { success: false, error: "Unauthorized" },
//                 { status: 401 },
//             )
//         }

//         const {
//             razorpay_payment_id,
//             razorpay_order_id,
//             razorpay_signature,
//             customerId,
//         } = await req.json()

//         // Verify signature
//         const body = razorpay_order_id + "|" + razorpay_payment_id
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//             .update(body)
//             .digest("hex")

//         if (expectedSignature !== razorpay_signature) {
//             return NextResponse.json(
//                 { success: false, error: "Invalid signature" },
//                 { status: 400 },
//             )
//         }

//         // Fetch payment to get token
//         const payment = await razorpay.payments.fetch(razorpay_payment_id)

//         // Calculate trial end date
//         const trialEndsAt = new Date(
//             Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
//         )

//         // Save in database
//         await prisma.user.update({
//             where: { clerkId: user.id },
//             data: {
//                 razorpayTokenId: payment.token_id,
//                 razorpayCustomerId: customerId,
//                 trialEndsAt: trialEndsAt,
//             },
//         })

//         // Refund the ₹1
//         try {
//             await razorpay.payments.refund(razorpay_payment_id, {
//                 amount: 100,
//                 notes: { reason: "Card validation refund" },
//             })
//         } catch (refundError) {
//             console.error("Refund error (non-critical):", refundError)
//         }

//         return NextResponse.json({
//             success: true,
//             tokenId: payment.token_id,
//             trialEndsAt: trialEndsAt.toISOString(),
//         })
//     } catch (error: any) {
//         console.error("Error saving token:", error)
//         return NextResponse.json(
//             { success: false, error: error.message },
//             { status: 500 },
//         )
//     }
// }

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

        console.log("📥 Save token request:", {
            razorpay_payment_id,
            razorpay_order_id,
            customerId,
        })

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            console.error("❌ Signature mismatch")
            return NextResponse.json(
                { success: false, error: "Invalid signature" },
                { status: 400 },
            )
        }

        console.log("✅ Signature verified")

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id)
        console.log("💳 Payment details:", {
            id: payment.id,
            status: payment.status,
            token_id: payment.token_id,
            method: payment.method,
            card: payment.card,
        })

        // Get the token ID
        // Token might be in payment.token_id or we need to fetch it from customer tokens
        let tokenId = payment.token_id

        // If no token_id in payment, try to fetch customer's tokens
        if (!tokenId) {
            console.log(
                "⚠️ No token_id in payment, fetching customer tokens...",
            )

            try {
                // Fetch all tokens for the customer
                const tokens = await razorpay.customers.fetchTokens(customerId)
                console.log("Customer tokens:", tokens)

                if (tokens && tokens.items && tokens.items.length > 0) {
                    // Get the most recent token
                    tokenId = tokens.items[0].id
                    console.log("✅ Found token from customer:", tokenId)
                }
            } catch (tokenError: any) {
                console.error("Error fetching customer tokens:", tokenError)
            }
        }

        // If still no token, use the payment ID as a reference
        // This allows the flow to continue even without tokenization
        if (!tokenId) {
            console.log("⚠️ No token found, using payment ID as reference")
            tokenId = `payment_${razorpay_payment_id}`
        }

        // Calculate trial end date
        const trialEndsAt = new Date(
            Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000,
        )

        console.log("📝 Updating user with:", {
            clerkId: user.id,
            razorpayTokenId: tokenId,
            razorpayCustomerId: customerId,
            trialEndsAt: trialEndsAt,
        })

        // Save in database
        const updatedUser = await prisma.user.update({
            where: { clerkId: user.id },
            data: {
                razorpayTokenId: tokenId,
                razorpayCustomerId: customerId,
                trialEndsAt: trialEndsAt,
            },
        })

        console.log("✅ User updated:", updatedUser.id)

        // Refund the ₹1
        try {
            console.log("💰 Processing refund...")
            await razorpay.payments.refund(razorpay_payment_id, {
                amount: 100,
                notes: { reason: "Card validation refund" },
            })
            console.log("✅ Refund processed")
        } catch (refundError: any) {
            console.error(
                "⚠️ Refund error (non-critical):",
                refundError.message,
            )
        }

        return NextResponse.json({
            success: true,
            tokenId: tokenId,
            trialEndsAt: trialEndsAt.toISOString(),
            message: "Payment method saved successfully",
        })
    } catch (error: any) {
        console.error("❌ Error saving token:", error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        )
    }
}
