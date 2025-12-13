import { razorpay } from "@/lib/razorpay"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        // Authenticate user via Clerk
        const user = await currentUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 },
            )
        }

        const { groupId, phone } = await req.json()

        if (!groupId) {
            return NextResponse.json(
                { success: false, error: "Group ID is required" },
                { status: 400 },
            )
        }

        if (!phone || phone.length !== 10) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Valid 10-digit phone number is required",
                },
                { status: 400 },
            )
        }

        // Get the group and its owner
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: {
                id: true,
                name: true,
                userId: true,
            },
        })

        if (!group) {
            return NextResponse.json(
                { success: false, error: "Group not found" },
                { status: 404 },
            )
        }

        // Get the DB user
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                phone: true,
            },
        })

        if (!dbUser) {
            return NextResponse.json(
                { success: false, error: "User not found in database" },
                { status: 404 },
            )
        }

        // Check if user is already a member
        const existingMember = await prisma.members.findFirst({
            where: {
                userId: dbUser.id,
                groupId: groupId,
            },
        })

        if (existingMember) {
            return NextResponse.json(
                { success: false, error: "Already a member of this group" },
                { status: 400 },
            )
        }

        // Check if user is the owner
        if (group.userId === dbUser.id) {
            return NextResponse.json(
                { success: false, error: "You are the owner of this group" },
                { status: 400 },
            )
        }

        // Get the owner's active pricing plan
        const activePlan = await prisma.ownerPricingPlan.findFirst({
            where: {
                userId: group.userId,
                isActive: true,
            },
        })

        if (!activePlan) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No active pricing plan. Group is free to join.",
                },
                { status: 400 },
            )
        }

        // Check if user already has a completed payment for this group
        const existingPayment = await prisma.memberPayment.findFirst({
            where: {
                userId: dbUser.id,
                groupId: groupId,
                status: "COMPLETED",
            },
        })

        if (existingPayment) {
            return NextResponse.json(
                { success: false, error: "Already paid for this group" },
                { status: 400 },
            )
        }

        const customerName =
            `${dbUser.firstname} ${dbUser.lastname}`.trim() || "Customer"
        const customerEmail =
            dbUser.email || user.emailAddresses[0]?.emailAddress || ""

        // Create Razorpay order (simple payment - no customer_id needed)
        // Note: All notes values must be strings for Razorpay
        const order = await razorpay.orders.create({
            amount: activePlan.price, // Already in paise
            currency: activePlan.currency,
            receipt: `mbr_${Date.now()}`,
            notes: {
                purpose: "member_payment",
                userId: String(dbUser.id),
                groupId: String(groupId),
                planId: String(activePlan.id),
                groupName: String(group.name || "Group"),
            },
        })

        // Create pending payment record
        await prisma.memberPayment.create({
            data: {
                amount: activePlan.price,
                currency: activePlan.currency,
                status: "PENDING",
                razorpayOrderId: order.id,
                userId: dbUser.id,
                groupId: groupId,
                planId: activePlan.id,
            },
        })

        // Update user phone if not set
        if (!dbUser.phone && phone) {
            await prisma.user.update({
                where: { clerkId: user.id },
                data: { phone },
            })
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: activePlan.price,
            amountDisplay: activePlan.price / 100, // in rupees for display
            currency: activePlan.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            planId: activePlan.id,
            planName: activePlan.name,
            groupName: group.name,
            prefill: {
                name: customerName,
                email: customerEmail,
                contact: phone,
            },
        })
    } catch (error: any) {
        console.error("Error creating member payment order:", error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create order",
            },
            { status: 500 },
        )
    }
}
