import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { sendEmail, getRejectionEmailTemplate } from "@/lib/email"

async function verifyAdmin() {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin_session")?.value

    if (!adminSession) {
        return null
    }

    const admin = await prisma.admin.findUnique({
        where: { id: adminSession },
    })

    if (!admin || !admin.isActive) {
        return null
    }

    return admin
}

export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin()

        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            )
        }

        const { applicationId, reason } = await request.json()

        if (!applicationId) {
            return NextResponse.json(
                { error: "Application ID is required" },
                { status: 400 },
            )
        }

        if (!reason || reason.trim().length < 10) {
            return NextResponse.json(
                { error: "Please provide a valid rejection reason (at least 10 characters)" },
                { status: 400 },
            )
        }

        // Get the pending owner
        const pendingOwner = await prisma.pendingOwner.findUnique({
            where: { id: applicationId },
        })

        if (!pendingOwner) {
            return NextResponse.json(
                { error: "Application not found" },
                { status: 404 },
            )
        }

        if (pendingOwner.status !== "PENDING") {
            return NextResponse.json(
                { error: "Application has already been processed" },
                { status: 400 },
            )
        }

        // Update pending owner status
        await prisma.pendingOwner.update({
            where: { id: applicationId },
            data: {
                status: "REJECTED",
                reviewedAt: new Date(),
                reviewedBy: admin.id,
                rejectionReason: reason.trim(),
            },
        })

        // Send rejection email
        await sendEmail({
            to: pendingOwner.email,
            subject: "Update on Your NeXuS Application",
            html: getRejectionEmailTemplate(pendingOwner.firstname, reason.trim()),
        })

        return NextResponse.json({
            success: true,
            message: "Application rejected",
        })
    } catch (error: any) {
        console.error("Reject application error:", error)
        return NextResponse.json(
            { error: "Failed to reject application" },
            { status: 500 },
        )
    }
}
