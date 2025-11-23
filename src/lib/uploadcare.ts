import { UploadClient } from "@uploadcare/upload-client"

export const upload = new UploadClient({
    publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

/**
 * Upload file and return the UUID for storage
 * UploadCare automatically sanitizes filenames in CDN URLs, so we only store the UUID
 * @returns string UUID to construct ucarecd.net URLs
 */
export const uploadFileAndGetPath = async (file: File): Promise<string> => {
    const uploaded = await upload.uploadFile(file)
    console.log("📦 UploadCare full response:", uploaded)
    console.log("🔗 CDN URL from UploadCare:", uploaded.cdnUrl)
    // Return just the UUID - UploadCare handles filename sanitization in the CDN URL
    return uploaded.uuid
}
