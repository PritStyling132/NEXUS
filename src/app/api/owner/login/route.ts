import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, isPasswordExpired } from "@/lib/password"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 },
            )
        }

        // Find the pending owner with this email
        const pendingOwner = await prisma.pendingOwner.findUnique({
            where: { email },
        })

        if (!pendingOwner) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 },
            )
        }

        if (pendingOwner.status === "PENDING") {
            return NextResponse.json(
                { error: "Your application is still under review" },
                { status: 401 },
            )
        }

        if (pendingOwner.status === "REJECTED") {
            return NextResponse.json(
                { error: "Your application was rejected" },
                { status: 401 },
            )
        }

        // Check if user account exists
        const user = await prisma.user.findFirst({
            where: { pendingOwnerId: pendingOwner.id },
            include: {
                groups: {
                    select: { id: true },
                    take: 1,
                },
            },
        })

        // For first login (no user account yet)
        if (!user) {
            // Verify against temporary password
            if (!pendingOwner.temporaryPassword) {
                return NextResponse.json(
                    { error: "Account not properly configured. Contact support." },
                    { status: 401 },
                )
            }

            // Check if temporary password expired
            if (isPasswordExpired(pendingOwner.passwordExpiresAt)) {
                return NextResponse.json(
                    { error: "Temporary password has expired. Contact support for a new one." },
                    { status: 401 },
                )
            }

            const isValidPassword = await verifyPassword(
                password,
                pendingOwner.temporaryPassword,
            )

            if (!isValidPassword) {
                return NextResponse.json(
                    { error: "Invalid email or password" },
                    { status: 401 },
                )
            }

            // Set session cookie for first login flow
            const cookieStore = await cookies()
            cookieStore.set("owner_pending_id", pendingOwner.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60, // 1 hour
            })

            return NextResponse.json({
                success: true,
                isFirstLogin: true,
                pendingOwnerId: pendingOwner.id,
            })
        }

        // For returning users - verify against their set password
        if (!user.ownerPassword) {
            return NextResponse.json(
                { error: "Account not properly configured. Contact support." },
                { status: 401 },
            )
        }

        const isValidPassword = await verifyPassword(password, user.ownerPassword)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 },
            )
        }

        // Set session cookie
        const cookieStore = await cookies()
        cookieStore.set("owner_session", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        return NextResponse.json({
            success: true,
            isFirstLogin: false,
            hasGroup: user.groups.length > 0,
            firstGroupId: user.groups[0]?.id || null,
            hasPaymentMethod: !!(user.razorpayCustomerId && user.razorpayTokenId),
            skippedGroupCreation: user.skippedGroupCreation,
            userId: user.id,
        })
    } catch (error: any) {
        console.error("Owner login error:", error)
        return NextResponse.json(
            { error: "Login failed. Please try again." },
            { status: 500 },
        )
    }
}
