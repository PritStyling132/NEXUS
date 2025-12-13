import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
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

        const admin = await prisma.admin.findUnique({
            where: { email },
        })

        if (!admin) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 },
            )
        }

        if (!admin.isActive) {
            return NextResponse.json(
                { error: "Account is disabled" },
                { status: 401 },
            )
        }

        const isValidPassword = await verifyPassword(password, admin.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 },
            )
        }

        // Update last login time
        await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        })

        // Set admin session cookie
        const cookieStore = await cookies()
        cookieStore.set("admin_session", admin.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
        })

        return NextResponse.json({
            success: true,
            adminId: admin.id,
            name: `${admin.firstname} ${admin.lastname}`,
        })
    } catch (error: any) {
        console.error("Admin login error:", error)
        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 },
        )
    }
}
