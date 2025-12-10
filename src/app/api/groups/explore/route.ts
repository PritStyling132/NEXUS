import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "12")
        const search = searchParams.get("search") || ""
        const category = searchParams.get("category") || ""

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {
            privacy: "PUBLIC",
            active: true,
        }

        // Add search filter
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ]
        }

        // Add category filter
        if (category && category !== "All") {
            where.category = category
        }

        // Fetch groups with pagination
        const [groups, totalCount] = await Promise.all([
            prisma.group.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    thumbnail: true,
                    description: true,
                    privacy: true,
                    userId: true,
                    createdAt: true,
                    _count: {
                        select: {
                            members: true,
                        },
                    },
                },
            }),
            prisma.group.count({ where }),
        ])

        const totalPages = Math.ceil(totalCount / limit)

        return NextResponse.json({
            success: true,
            groups,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasMore: page < totalPages,
            },
        })
    } catch (error: any) {
        console.error("Error fetching groups:", error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to fetch groups",
            },
            { status: 500 },
        )
    }
}
