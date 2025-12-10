"use server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export const onAuthenticatedUser = async () => {
    try {
        const clerk = await currentUser()
        if (!clerk) {
            console.log("⚠️ No authenticated user found")
            return { status: 404 }
        }

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

        return {
            status: 404,
        }
    } catch (error) {
        console.error(" onAuthenticatedUser Error:", error)
        return {
            status: 400,
        }
    }
}

export const onSignUpUser = async (data: {
    firstname: string
    lastname: string
    image: string
    clerkId: string
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
