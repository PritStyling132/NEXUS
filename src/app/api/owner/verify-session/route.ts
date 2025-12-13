import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const pendingOwnerId = cookieStore.get("owner_pending_id")?.value
        const ownerSession = cookieStore.get("owner_session")?.value

        if (pendingOwnerId) {
            // First login flow - verify pending owner
            const pendingOwner = await prisma.pendingOwner.findUnique({
                where: { id: pendingOwnerId },
            })

            if (pendingOwner && pendingOwner.status === "APPROVED") {
                return NextResponse.json({
                    valid: true,
                    type: "first_login",
                    pendingOwnerId,
                })
            }
        }

        if (ownerSession) {
            // Regular session - verify user
            const user = await prisma.user.findUnique({
                where: { id: ownerSession },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    isFirstLogin: true,
                    razorpayCustomerId: true,
                    razorpayTokenId: true,
                    groups: {
                        select: { id: true },
                        take: 1,
                    },
                },
            })

            if (user) {
                return NextResponse.json({
                    valid: true,
                    type: "authenticated",
                    userId: user.id,
                    name: `${user.firstname} ${user.lastname}`,
                    email: user.email || "",
                    hasPaymentMethod: !!(
                        user.razorpayCustomerId && user.razorpayTokenId
                    ),
                    hasGroups: user.groups.length > 0,
                    firstGroupId: user.groups[0]?.id || null,
                })
            }
        }

        return NextResponse.json({ valid: false }, { status: 401 })
    } catch (error) {
        console.error("Session verification error:", error)
        return NextResponse.json({ valid: false }, { status: 500 })
    }
}
