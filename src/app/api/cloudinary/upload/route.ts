import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

export async function POST(request: NextRequest) {
    try {
        if (!cloudName || !apiKey || !apiSecret) {
            console.error("Cloudinary config missing:", {
                cloudName: !!cloudName,
                apiKey: !!apiKey,
                apiSecret: !!apiSecret,
            })
            return NextResponse.json(
                { error: "Cloudinary is not configured" },
                { status: 500 },
            )
        }

        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 },
            )
        }

        // Determine resource type based on file type
        const fileType = file.type
        let resourceType = "auto"

        // PDF and documents should use "raw" resource type
        if (
            fileType === "application/pdf" ||
            fileType === "application/msword" ||
            fileType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            resourceType = "raw"
        }

        // Generate timestamp and signature for signed upload
        const timestamp = Math.round(new Date().getTime() / 1000)
        const folder = "nexus-cv"

        // Build the string to sign (parameters must be in alphabetical order)
        // Include access_mode for raw files to make them publicly accessible
        const stringToSign = `access_mode=public&folder=${folder}&timestamp=${timestamp}${apiSecret}`
        const signature = crypto
            .createHash("sha1")
            .update(stringToSign)
            .digest("hex")

        // Create form data for Cloudinary
        const cloudinaryFormData = new FormData()
        cloudinaryFormData.append("file", file)
        cloudinaryFormData.append("api_key", apiKey)
        cloudinaryFormData.append("timestamp", timestamp.toString())
        cloudinaryFormData.append("signature", signature)
        cloudinaryFormData.append("folder", folder)
        cloudinaryFormData.append("access_mode", "public")

        // Upload to Cloudinary
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

        console.log("Uploading to Cloudinary:", {
            uploadUrl,
            fileType,
            resourceType,
            fileName: file.name,
            fileSize: file.size,
        })

        const response = await fetch(uploadUrl, {
            method: "POST",
            body: cloudinaryFormData,
        })

        const responseData = await response.json()

        if (!response.ok) {
            console.error("Cloudinary upload error:", responseData)
            return NextResponse.json(
                { error: responseData.error?.message || "Upload failed" },
                { status: response.status },
            )
        }

        console.log("Cloudinary upload success:", responseData.secure_url)

        // Return the secure URL directly
        return NextResponse.json({
            url: responseData.secure_url,
            public_id: responseData.public_id,
            resource_type: responseData.resource_type,
        })
    } catch (error: any) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: error.message || "Upload failed" },
            { status: 500 },
        )
    }
}
