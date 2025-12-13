import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

// Extract public_id from Cloudinary URL
function extractPublicId(url: string): string | null {
    // URL format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{folder}/{public_id}.{ext}
    // Or: https://res.cloudinary.com/{cloud_name}/raw/upload/{folder}/{public_id}.{ext}
    const match = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/)
    if (match) {
        return match[1]
    }
    return null
}

// Generate a signed Cloudinary URL for private/authenticated resources
function generateSignedUrl(publicId: string): string {
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Cloudinary credentials not configured")
    }

    // Expiration time (1 hour from now)
    const expiresAt = Math.floor(Date.now() / 1000) + 3600

    // For raw files, we need to sign the URL properly
    // The signature is created from: public_id + timestamp + api_secret
    const toSign = `public_id=${publicId}&timestamp=${expiresAt}${apiSecret}`
    const signature = crypto
        .createHash("sha256")
        .update(toSign)
        .digest("hex")

    return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}?api_key=${apiKey}&timestamp=${expiresAt}&signature=${signature}`
}

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const cookieStore = await cookies()
        const adminSession = cookieStore.get("admin_session")

        if (!adminSession?.value) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get the CV URL from query params
        const { searchParams } = new URL(request.url)
        const cvUrl = searchParams.get("url")
        const fileName = searchParams.get("fileName") || "cv.pdf"

        if (!cvUrl) {
            return NextResponse.json(
                { error: "CV URL is required" },
                { status: 400 }
            )
        }

        console.log("Attempting to fetch CV:", cvUrl)

        let response: Response
        let fetchUrl = cvUrl

        // For Cloudinary URLs, try multiple approaches
        if (cvUrl.includes("cloudinary.com")) {
            const publicId = extractPublicId(cvUrl)
            console.log("Extracted public_id:", publicId)

            // Approach 1: Try direct URL first (works if file is public)
            response = await fetch(cvUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; Server-side fetch)"
                }
            })

            if (!response.ok && publicId) {
                console.log("Direct fetch failed with status:", response.status)

                // Approach 2: Try signed URL
                if (apiKey && apiSecret && cloudName) {
                    fetchUrl = generateSignedUrl(publicId)
                    console.log("Trying signed URL...")
                    response = await fetch(fetchUrl)
                }

                // Approach 3: Try without version number
                if (!response.ok) {
                    const noVersionUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}`
                    console.log("Trying URL without version:", noVersionUrl)
                    response = await fetch(noVersionUrl)
                }

                // Approach 4: Try with fl_attachment flag
                if (!response.ok) {
                    const attachmentUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${publicId}`
                    console.log("Trying attachment URL:", attachmentUrl)
                    response = await fetch(attachmentUrl)
                }
            }
        } else {
            // Non-Cloudinary URL, try direct fetch
            response = await fetch(cvUrl)
        }

        if (!response.ok) {
            console.error("All fetch attempts failed:", response.status, response.statusText)

            // For debugging, log response body
            const errorBody = await response.text().catch(() => "")
            console.error("Error body:", errorBody.substring(0, 500))

            return NextResponse.json(
                {
                    error: `Failed to fetch CV: ${response.status}`,
                    message: "The file could not be accessed. This may be due to Cloudinary access restrictions.",
                    suggestion: "Please go to Cloudinary Dashboard > Settings > Security and ensure 'Restrict unsigned uploads' is configured correctly, or re-upload the CV."
                },
                { status: response.status || 500 }
            )
        }

        // Get the file content
        const fileBuffer = await response.arrayBuffer()

        if (fileBuffer.byteLength === 0) {
            return NextResponse.json(
                { error: "Downloaded file is empty" },
                { status: 500 }
            )
        }

        // Determine content type based on file extension
        let contentType = "application/pdf"
        const lowerFileName = fileName.toLowerCase()
        if (lowerFileName.endsWith(".doc")) {
            contentType = "application/msword"
        } else if (lowerFileName.endsWith(".docx")) {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }

        console.log("Successfully fetched CV, size:", fileBuffer.byteLength, "bytes")

        // Return the file with proper headers for inline viewing
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${fileName}"`,
                "Content-Length": fileBuffer.byteLength.toString(),
                "Cache-Control": "private, max-age=3600",
            },
        })
    } catch (error) {
        console.error("Download CV error:", error)
        return NextResponse.json(
            { error: "Failed to download CV", details: String(error) },
            { status: 500 }
        )
    }
}
