import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        // Check for Clerk user or owner session
        const user = await currentUser()
        const cookieStore = await cookies()
        const ownerSessionId = cookieStore.get("owner_session")?.value

        if (!user && !ownerSessionId) {
            console.error("No Clerk user or owner session found")
            return NextResponse.json(
                { success: false, error: "Please sign in to continue" },
                { status: 401 },
            )
        }

        console.log("Auth check passed:", {
            hasClerkUser: !!user,
            clerkUserId: user?.id,
            hasOwnerSession: !!ownerSessionId,
        })

        const { phone, name } = await req.json()

        // Validate phone number
        if (!phone || phone.length !== 10) {
            return NextResponse.json(
                { success: false, error: "Invalid phone number" },
                { status: 400 },
            )
        }

        let existingCustomerId: string | null = null
        let userEmail = ""
        let userName = ""

        if (ownerSessionId) {
            // Owner flow - find by user ID
            const ownerUser = await prisma.user.findUnique({
                where: { id: ownerSessionId },
                select: {
                    id: true,
                    razorpayCustomerId: true,
                    firstname: true,
                    lastname: true,
                    pendingOwnerId: true,
                },
            })

            if (ownerUser?.razorpayCustomerId) {
                return NextResponse.json({
                    success: true,
                    customerId: ownerUser.razorpayCustomerId,
                    message: "Customer already exists",
                })
            }

            // Get email from PendingOwner table
            if (ownerUser?.pendingOwnerId) {
                const pendingOwner = await prisma.pendingOwner.findUnique({
                    where: { id: ownerUser.pendingOwnerId },
                    select: { email: true },
                })
                userEmail = pendingOwner?.email ?? ""
            }
            userName =
                name ||
                `${ownerUser?.firstname ?? ""} ${ownerUser?.lastname ?? ""}`
        } else if (user) {
            // Clerk user flow - find by clerkId
            const clerkUser = await prisma.user.findUnique({
                where: { clerkId: user.id },
                select: {
                    id: true,
                    razorpayCustomerId: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                },
            })

            if (!clerkUser) {
                console.error(
                    "User not found in database for clerkId:",
                    user.id,
                )
                return NextResponse.json(
                    {
                        success: false,
                        error: "User profile not found. Please try signing out and back in.",
                    },
                    { status: 404 },
                )
            }

            if (clerkUser.razorpayCustomerId) {
                return NextResponse.json({
                    success: true,
                    customerId: clerkUser.razorpayCustomerId,
                    message: "Customer already exists",
                })
            }

            userEmail =
                clerkUser.email || user.emailAddresses[0]?.emailAddress || ""
            userName =
                name ||
                `${clerkUser.firstname || user.firstName || ""} ${clerkUser.lastname || user.lastName || ""}`.trim()
        }

        // Ensure userName is not empty (Razorpay requires a name)
        if (!userName || userName.trim() === "") {
            userName = "Customer"
        }

        console.log("Creating Razorpay customer with:", {
            userName,
            userEmail,
            phone,
        })

        // Create Razorpay customer
        const customer = await razorpay.customers.create({
            name: userName,
            email: userEmail,
            contact: phone,
            notes: ownerSessionId
                ? { ownerId: ownerSessionId }
                : { clerkId: user!.id },
        })

        console.log("Razorpay customer created:", customer.id)

        // Save customer ID in database
        if (ownerSessionId) {
            await prisma.user.update({
                where: { id: ownerSessionId },
                data: {
                    razorpayCustomerId: customer.id,
                    phone: phone,
                },
            })
        } else if (user) {
            await prisma.user.update({
                where: { clerkId: user.id },
                data: {
                    razorpayCustomerId: customer.id,
                    phone: phone,
                },
            })
        }

        return NextResponse.json({
            success: true,
            customerId: customer.id,
        })
    } catch (error: any) {
        console.error("Error creating customer:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        return NextResponse.json(
            {
                success: false,
                error:
                    error.message ||
                    "Failed to create customer. Please try again.",
            },
            { status: 500 },
        )
    }
}
