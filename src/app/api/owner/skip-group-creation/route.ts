import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

export async function POST() {
    try {
        // Check for Clerk authentication first
        const clerkUser = await currentUser()

        if (clerkUser) {
            // Regular Clerk user - update skippedGroupCreation flag
            const user = await prisma.user.update({
                where: { clerkId: clerkUser.id },
                data: { skippedGroupCreation: true },
                select: { id: true, groups: { select: { id: true } } },
            })

            // If user has a group, redirect to that group's dashboard
            if (user.groups && user.groups.length > 0) {
                return NextResponse.json({
                    success: true,
                    redirectUrl: `/group/${user.groups[0].id}`,
                })
            }

            // Otherwise redirect to explore page for Clerk users
            return NextResponse.json({ success: true, redirectUrl: "/explore" })
        }

        // Check for owner session
        const cookieStore = await cookies()
        const ownerSession = cookieStore.get("owner_session")?.value

        if (ownerSession) {
            const user = await prisma.user.update({
                where: { id: ownerSession },
                data: { skippedGroupCreation: true },
                select: { id: true, groups: { select: { id: true } } },
            })

            // If owner has a group, redirect to that group's dashboard
            if (user.groups && user.groups.length > 0) {
                return NextResponse.json({
                    success: true,
                    redirectUrl: `/group/${user.groups[0].id}`,
                })
            }

            // Otherwise redirect to owner dashboard
            return NextResponse.json({
                success: true,
                redirectUrl: "/owner/dashboard",
            })
        }

        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    } catch (error: any) {
        console.error("Skip group creation error:", error)
        return NextResponse.json(
            { error: "Failed to skip group creation" },
            { status: 500 },
        )
    }
}
