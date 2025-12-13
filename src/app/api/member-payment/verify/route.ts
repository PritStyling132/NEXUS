import { razorpay } from "@/lib/razorpay"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        // Authenticate user via Clerk
        const user = await currentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            groupId,
            planId,
        } = await req.json()

        // Validate required fields
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return NextResponse.json(
                { success: false, error: "Missing payment verification fields" },
                { status: 400 }
            )
        }

        // Get DB user
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: { id: true, firstname: true, lastname: true },
        })

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            )
        }

        // Verify Razorpay signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            // Update payment status to failed
            await prisma.memberPayment.updateMany({
                where: { razorpayOrderId: razorpay_order_id },
                data: { status: "FAILED" },
            })

            return NextResponse.json(
                { success: false, error: "Invalid payment signature" },
                { status: 400 }
            )
        }

        // Find the pending payment record
        const payment = await prisma.memberPayment.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId: dbUser.id,
                status: "PENDING",
            },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        userId: true,
                    },
                },
            },
        })

        if (!payment) {
            return NextResponse.json(
                { success: false, error: "Payment record not found" },
                { status: 404 }
            )
        }

        // Verify group and plan match
        if (payment.groupId !== groupId || payment.planId !== planId) {
            return NextResponse.json(
                { success: false, error: "Group or plan mismatch" },
                { status: 400 }
            )
        }

        // Check if already a member (safety check)
        const existingMember = await prisma.members.findFirst({
            where: {
                userId: dbUser.id,
                groupId: payment.groupId,
            },
        })

        if (existingMember) {
            // Update payment but don't create duplicate membership
            await prisma.memberPayment.update({
                where: { id: payment.id },
                data: {
                    status: "COMPLETED",
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                },
            })

            return NextResponse.json({
                success: true,
                message: "Payment completed. Already a member.",
                memberId: existingMember.id,
            })
        }

        // Transaction: Update payment and create membership
        const result = await prisma.$transaction(async (tx) => {
            // Update payment status
            await tx.memberPayment.update({
                where: { id: payment.id },
                data: {
                    status: "COMPLETED",
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                },
            })

            // Create membership
            const member = await tx.members.create({
                data: {
                    userId: dbUser.id,
                    groupId: payment.groupId,
                },
            })

            // Create notification for group owner
            await tx.notification.create({
                data: {
                    title: "New Paid Member",
                    message: `${dbUser.firstname} ${dbUser.lastname} has paid and joined your group "${payment.group.name}"`,
                    type: "MEMBER_JOINED",
                    userId: payment.group.userId, // Notify the owner
                    groupId: payment.groupId,
                    relatedUserId: dbUser.id,
                },
            })

            return member
        })

        return NextResponse.json({
            success: true,
            message: "Payment verified and membership created",
            memberId: result.id,
        })
    } catch (error: any) {
        console.error("Error verifying member payment:", error)
        return NextResponse.json(
            { success: false, error: error.message || "Failed to verify payment" },
            { status: 500 }
        )
    }
}
