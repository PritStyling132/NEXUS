import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const pendingOwnerId = cookieStore.get("owner_pending_id")?.value

        if (!pendingOwnerId) {
            return NextResponse.json(
                { error: "Session expired. Please login again." },
                { status: 401 },
            )
        }

        const { newPassword } = await request.json()

        if (!newPassword) {
            return NextResponse.json(
                { error: "New password is required" },
                { status: 400 },
            )
        }

        // Validate password strength
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json(
                { error: "Password does not meet requirements" },
                { status: 400 },
            )
        }

        // Get pending owner
        const pendingOwner = await prisma.pendingOwner.findUnique({
            where: { id: pendingOwnerId },
        })

        if (!pendingOwner || pendingOwner.status !== "APPROVED") {
            return NextResponse.json(
                { error: "Invalid session" },
                { status: 401 },
            )
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword)

        // Create user account and update pending owner status in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the user account with a generated clerkId (since this is separate auth)
            const user = await tx.user.create({
                data: {
                    firstname: pendingOwner.firstname,
                    lastname: pendingOwner.lastname,
                    email: pendingOwner.email, // Include the owner's email
                    clerkId: `owner_${uuidv4()}`, // Generate unique clerkId for owner accounts
                    phone: pendingOwner.phone,
                    pendingOwnerId: pendingOwner.id,
                    ownerPassword: hashedPassword,
                    isFirstLogin: false,
                },
            })

            // Update pending owner status
            await tx.pendingOwner.update({
                where: { id: pendingOwnerId },
                data: {
                    status: "COMPLETED",
                    temporaryPassword: null, // Clear temporary password
                },
            })

            return user
        })

        // Clear the pending session cookie
        cookieStore.delete("owner_pending_id")

        // Set the user session cookie
        cookieStore.set("owner_session", result.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return NextResponse.json({
            success: true,
            userId: result.id,
            hasPaymentMethod: false, // New user, no payment method yet
        })
    } catch (error: any) {
        console.error("Change password error:", error)
        return NextResponse.json(
            { error: "Failed to change password" },
            { status: 500 },
        )
    }
}
