import { hostname } from "os"

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "339qsoofdz.ucarecd.net",
            },
            {
                protocol: "https",
                hostname: "ucarecdn.com",
            },
            {
                protocol: "https",
                hostname: "upload.uploadcare.com",
            },
        ],
    },
}
export default nextConfig
