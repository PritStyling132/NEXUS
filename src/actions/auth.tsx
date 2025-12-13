"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"

export const onAuthenticatedUser = async () => {
    try {
        // First check for owner session (cookie-based auth)
        // This must be checked BEFORE Clerk to avoid issues with owner sessions
        const cookieStore = await cookies()
        const ownerSessionId = cookieStore.get("owner_session")?.value

        if (ownerSessionId) {
            const user = await prisma.user.findUnique({
                where: {
                    id: ownerSessionId,
                },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    image: true,
                },
            })

            if (user) {
                return {
                    status: 200,
                    id: user.id,
                    image: user.image || "",
                    username: `${user.firstname} ${user.lastname}`,
                }
            }
        }

        // Then try Clerk authentication for learners
        const clerk = await currentUser()

        if (clerk) {
            const user = await prisma.user.findUnique({
                where: {
                    clerkId: clerk.id,
                },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    image: true,
                },
            })

            if (user) {
                return {
                    status: 200,
                    id: user.id,
                    image: user.image || clerk.imageUrl,
                    username: `${user.firstname} ${user.lastname}`,
                }
            }
        }

        console.log("⚠️ No authenticated user found")
        return { status: 404 }
    } catch (error) {
        console.error(" onAuthenticatedUser Error:", error)
        return {
            status: 400,
        }
    }
}

export const onGetUserProfile = async () => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.id },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                image: true,
                pendingOwnerId: true,
                groups: {
                    select: { id: true },
                    take: 1,
                },
            },
        })

        if (!user) {
            return { status: 404, message: "User not found" }
        }

        // Check if this is an owner (has pendingOwnerId)
        const isOwner = !!user.pendingOwnerId
        const firstGroupId = user.groups[0]?.id || null

        // For owners without email in User table, fetch from PendingOwner
        let email = user.email
        if (!email && user.pendingOwnerId) {
            const pendingOwner = await prisma.pendingOwner.findUnique({
                where: { id: user.pendingOwnerId },
                select: { email: true },
            })
            email = pendingOwner?.email || null

            // Also update the user's email for future requests
            if (email) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { email },
                })
            }
        }

        return {
            status: 200,
            data: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email,
                image: user.image,
                isOwner,
                firstGroupId,
            }
        }
    } catch (error) {
        console.error("onGetUserProfile Error:", error)
        return { status: 400, message: "Failed to fetch profile" }
    }
}

export const onUpdateUserProfile = async (data: {
    firstname: string
    lastname: string
    image?: string
}) => {
    try {
        const auth = await onAuthenticatedUser()
        if (auth.status !== 200 || !auth.id) {
            return { status: 401, message: "Unauthorized" }
        }

        const updateData: { firstname: string; lastname: string; image?: string } = {
            firstname: data.firstname,
            lastname: data.lastname,
        }

        // Only update image if provided
        if (data.image !== undefined) {
            updateData.image = data.image
        }

        const updatedUser = await prisma.user.update({
            where: { id: auth.id },
            data: updateData,
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                image: true,
            },
        })

        return {
            status: 200,
            message: "Profile updated successfully",
            data: updatedUser
        }
    } catch (error) {
        console.error("onUpdateUserProfile Error:", error)
        return { status: 400, message: "Failed to update profile" }
    }
}

export const onSignUpUser = async (data: {
    firstname: string
    lastname: string
    image: string
    clerkId: string
    email?: string
}) => {
    try {
        console.log(" Starting user creation with data:", data)

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: data.clerkId,
            },
        })

        if (existingUser) {
            console.log(" User already exists:", existingUser.id)
            return {
                status: 200,
                message: "User already registered",
                id: existingUser.id,
            }
        }

        // Create new user
        const createdUser = await prisma.user.create({
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                image: data.image || "",
                clerkId: data.clerkId,
                email: data.email || null,
            },
        })

        console.log(" User created successfully:", createdUser.id)

        if (createdUser) {
            return {
                status: 200,
                message: "User successfully created",
                id: createdUser.id,
            }
        }

        return {
            status: 400,
            message: "User could not be created! Try again",
        }
    } catch (error: any) {
        console.error(" onSignUpUser Error:", error)
        console.error(" Error details:", error.message)
        console.error(" Error code:", error.code)

        // Handle unique constraint violation (user already exists)
        if (error.code === "P2002") {
            console.log(" Unique constraint violation - user already exists")
            return {
                status: 200,
                message: "User already registered",
            }
        }

        return {
            status: 400,
            message: "Oops! something went wrong. Try again",
        }
    }
}
