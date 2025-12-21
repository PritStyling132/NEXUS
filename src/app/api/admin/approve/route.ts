import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import {
    generateTemporaryPassword,
    hashPassword,
    getPasswordExpiryDate,
} from "@/lib/password"
import { sendEmail, getApprovalEmailTemplate } from "@/lib/email"

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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { applicationId } = await request.json()

        if (!applicationId) {
            return NextResponse.json(
                { error: "Application ID is required" },
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

        // Generate temporary password
        const tempPassword = generateTemporaryPassword(12)
        const hashedTempPassword = await hashPassword(tempPassword)
        const passwordExpiry = getPasswordExpiryDate(24)

        // Update pending owner status
        await prisma.pendingOwner.update({
            where: { id: applicationId },
            data: {
                status: "APPROVED",
                reviewedAt: new Date(),
                reviewedBy: admin.id,
                temporaryPassword: hashedTempPassword,
                passwordExpiresAt: passwordExpiry,
            },
        })

        // Send approval email with credentials
        await sendEmail({
            to: pendingOwner.email,
            subject: "Your Nexus Application Has Been Approved!",
            html: getApprovalEmailTemplate(
                pendingOwner.firstname,
                pendingOwner.email,
                tempPassword,
            ),
        })

        return NextResponse.json({
            success: true,
            message: "Application approved successfully",
        })
    } catch (error: any) {
        console.error("Approve application error:", error)
        return NextResponse.json(
            { error: "Failed to approve application" },
            { status: 500 },
        )
    }
}
