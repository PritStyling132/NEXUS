import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const cursor = searchParams.get("cursor") || undefined
        const limit = parseInt(searchParams.get("limit") || "10")
        const reelId = searchParams.get("reelId") // For fetching single reel

        // If reelId is provided, fetch single reel
        if (reelId) {
            const reel = await prisma.reel.findUnique({
                where: { id: reelId },
                include: {
                    group: {
                        select: {
                            id: true,
                            name: true,
                            thumbnail: true,
                            category: true,
                            description: true,
                            owner: {
                                select: {
                                    id: true,
                                    firstname: true,
                                    lastname: true,
                                    image: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            })

            if (!reel) {
                return NextResponse.json(
                    { success: false, error: "Reel not found" },
                    { status: 404 }
                )
            }

            // Increment view count
            await prisma.reel.update({
                where: { id: reelId },
                data: { views: { increment: 1 } },
            })

            return NextResponse.json({
                success: true,
                reel,
            })
        }

        // Fetch multiple reels with cursor pagination
        const reels = await prisma.reel.findMany({
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1,
            }),
            orderBy: { createdAt: "desc" },
            include: {
                group: {
                    select: {
                        id: true,
                        name: true,
                        thumbnail: true,
                        category: true,
                        owner: {
                            select: {
                                id: true,
                                firstname: true,
                                lastname: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        })

        const hasMore = reels.length > limit
        const data = hasMore ? reels.slice(0, -1) : reels
        const nextCursor = hasMore ? data[data.length - 1]?.id : null

        return NextResponse.json({
            success: true,
            reels: data,
            nextCursor,
            hasMore,
        })
    } catch (error) {
        console.error("Error fetching reels:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch reels" },
            { status: 500 }
        )
    }
}
