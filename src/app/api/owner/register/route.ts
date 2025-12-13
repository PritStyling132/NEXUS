import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
    sendEmail,
    getApplicationReceivedEmailTemplate,
    getAdminNotificationEmailTemplate,
} from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()

        const firstname = formData.get("firstname") as string
        const lastname = formData.get("lastname") as string
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string
        const cvUrl = formData.get("cvUrl") as string
        const cvFileName = formData.get("cvFileName") as string

        // Validate required fields
        if (!firstname || !lastname || !email || !phone || !cvUrl) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 },
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 },
            )
        }

        // Validate phone (10 digits)
        const phoneRegex = /^\d{10}$/
        if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
            return NextResponse.json(
                { error: "Phone number must be 10 digits" },
                { status: 400 },
            )
        }

        // Check if email already exists in PendingOwner
        const existingApplication = await prisma.pendingOwner.findUnique({
            where: { email },
        })

        if (existingApplication) {
            if (existingApplication.status === "PENDING") {
                return NextResponse.json(
                    { error: "An application with this email is already pending review" },
                    { status: 400 },
                )
            }
            if (existingApplication.status === "APPROVED" || existingApplication.status === "COMPLETED") {
                return NextResponse.json(
                    { error: "This email has already been approved. Please login instead." },
                    { status: 400 },
                )
            }
        }

        // Check if email exists in User table
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { clerkId: email },
                    { pendingOwnerId: existingApplication?.id },
                ],
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 400 },
            )
        }

        // Create or update PendingOwner record
        let pendingOwner
        if (existingApplication && existingApplication.status === "REJECTED") {
            // Allow reapplication for rejected applications
            pendingOwner = await prisma.pendingOwner.update({
                where: { id: existingApplication.id },
                data: {
                    firstname,
                    lastname,
                    phone,
                    cvUrl,
                    cvFileName,
                    status: "PENDING",
                    rejectionReason: null,
                    reviewedAt: null,
                    reviewedBy: null,
                },
            })
        } else {
            pendingOwner = await prisma.pendingOwner.create({
                data: {
                    firstname,
                    lastname,
                    email,
                    phone,
                    cvUrl,
                    cvFileName,
                },
            })
        }

        // Send confirmation email to applicant
        await sendEmail({
            to: email,
            subject: "Application Received - NeXuS",
            html: getApplicationReceivedEmailTemplate(firstname),
        })

        // Send notification to admin
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
            await sendEmail({
                to: adminEmail,
                subject: "New Owner Application - NeXuS",
                html: getAdminNotificationEmailTemplate(
                    `${firstname} ${lastname}`,
                    email,
                    phone,
                ),
            })
        }

        return NextResponse.json({
            success: true,
            message: "Application submitted successfully",
            applicationId: pendingOwner.id,
        })
    } catch (error: any) {
        console.error("Owner registration error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to submit application" },
            { status: 500 },
        )
    }
}
