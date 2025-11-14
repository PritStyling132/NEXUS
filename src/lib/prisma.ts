import { PrismaClient } from "@prisma/client"

// Declare global type for Prisma Client
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

// Connection URL with proper pooling for Supabase
// Use connection pooler (port 6543) instead of direct connection (port 5432)
const getConnectionString = () => {
    const url = process.env.DATABASE_URL
    if (!url) {
        throw new Error("DATABASE_URL environment variable is not set")
    }

    // For Supabase, use connection pooler in production
    // Transaction mode: Replace 5432 with 6543 and add ?pgbouncer=true
    if (process.env.NODE_ENV === "production" && url.includes("supabase.co")) {
        return url.replace(":5432", ":6543") + "?pgbouncer=true"
    }

    return url
}

// Create Prisma Client instance with optimized settings
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: getConnectionString(),
            },
        },
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    })

// In development, save the instance to global to prevent multiple instances
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}

// Export default as well for flexibility
export default prisma
