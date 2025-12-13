import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import client from "@/lib/prisma"

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

// Extract public_id from Cloudinary URL
function extractPublicId(url: string): string | null {
    const match = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/)
    if (match) {
        // Remove file extension for the public_id
        return match[1]
    }
    return null
}

export async function POST(_request: NextRequest) {
    try {
        // Check admin authentication
        const cookieStore = await cookies()
        const adminSession = cookieStore.get("admin_session")

        if (!adminSession?.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: "Cloudinary credentials not configured" },
                { status: 500 },
            )
        }

        // Get all pending owners with CV URLs
        const applications = await client.pendingOwner.findMany({
            where: {
                cvUrl: {
                    contains: "cloudinary.com",
                },
            },
            select: {
                id: true,
                cvUrl: true,
                firstname: true,
                lastname: true,
            },
        })

        const results: {
            id: string
            name: string
            status: string
            error?: string
        }[] = []

        for (const app of applications) {
            const publicId = extractPublicId(app.cvUrl)

            if (!publicId) {
                results.push({
                    id: app.id,
                    name: `${app.firstname} ${app.lastname}`,
                    status: "skipped",
                    error: "Could not extract public_id",
                })
                continue
            }

            try {
                // Use Cloudinary Admin API to update the asset's access_mode
                const authString = `${apiKey}:${apiSecret}`
                const authHeader = Buffer.from(authString).toString("base64")

                // Update resource to public access_mode
                const updateUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/raw/upload/${publicId}`

                const response = await fetch(updateUrl, {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        access_mode: "public",
                    }),
                })

                if (response.ok) {
                    results.push({
                        id: app.id,
                        name: `${app.firstname} ${app.lastname}`,
                        status: "migrated",
                    })
                } else {
                    const errorData = await response.json().catch(() => ({}))
                    results.push({
                        id: app.id,
                        name: `${app.firstname} ${app.lastname}`,
                        status: "failed",
                        error:
                            errorData.error?.message ||
                            `HTTP ${response.status}`,
                    })
                }
            } catch (err) {
                results.push({
                    id: app.id,
                    name: `${app.firstname} ${app.lastname}`,
                    status: "failed",
                    error: String(err),
                })
            }
        }

        return NextResponse.json({
            total: applications.length,
            results,
            migrated: results.filter((r) => r.status === "migrated").length,
            failed: results.filter((r) => r.status === "failed").length,
            skipped: results.filter((r) => r.status === "skipped").length,
        })
    } catch (error) {
        console.error("CV migration error:", error)
        return NextResponse.json(
            { error: "Failed to migrate CVs" },
            { status: 500 },
        )
    }
}
