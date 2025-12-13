import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

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

export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin()

        if (!admin) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            )
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status") || "PENDING"
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")

        const skip = (page - 1) * limit

        const [applications, total] = await Promise.all([
            prisma.pendingOwner.findMany({
                where: {
                    status: status as any,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.pendingOwner.count({
                where: {
                    status: status as any,
                },
            }),
        ])

        // Get counts for each status
        const [pendingCount, approvedCount, rejectedCount, completedCount] =
            await Promise.all([
                prisma.pendingOwner.count({ where: { status: "PENDING" } }),
                prisma.pendingOwner.count({ where: { status: "APPROVED" } }),
                prisma.pendingOwner.count({ where: { status: "REJECTED" } }),
                prisma.pendingOwner.count({ where: { status: "COMPLETED" } }),
            ])

        return NextResponse.json({
            applications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            counts: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
                completed: completedCount,
            },
        })
    } catch (error: any) {
        console.error("Get applications error:", error)
        return NextResponse.json(
            { error: "Failed to fetch applications" },
            { status: 500 },
        )
    }
}
