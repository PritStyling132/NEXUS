"use server"

import client from "@/lib/prisma"
import { onAuthenticatedUser } from "./auth"
import { revalidatePath } from "next/cache"

// Create a new pricing plan
export const onCreatePricingPlan = async (data: {
    name: string
    description?: string
    price: number // in rupees, will convert to paise
    isActive?: boolean
}) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Convert price from rupees to paise
        const priceInPaise = Math.round(data.price * 100)

        // If setting this plan as active, deactivate all other plans first
        if (data.isActive) {
            await client.ownerPricingPlan.updateMany({
                where: { userId: user.id },
                data: { isActive: false },
            })
        }

        const plan = await client.ownerPricingPlan.create({
            data: {
                name: data.name,
                description: data.description || null,
                price: priceInPaise,
                isActive: data.isActive || false,
                userId: user.id,
            },
        })

        revalidatePath("/group/[groupid]/subscriptions")

        return {
            status: 200,
            message: "Pricing plan created successfully",
            data: plan,
        }
    } catch (error) {
        console.error("Error creating pricing plan:", error)
        return { status: 400, message: "Failed to create pricing plan" }
    }
}

// Get all pricing plans for the authenticated owner
export const onGetOwnerPricingPlans = async () => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized", data: [] }
        }

        const plans = await client.ownerPricingPlan.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { memberPayments: true },
                },
            },
        })

        return {
            status: 200,
            message: "Plans retrieved successfully",
            data: plans,
        }
    } catch (error) {
        console.error("Error getting pricing plans:", error)
        return { status: 400, message: "Failed to get pricing plans", data: [] }
    }
}

// Update a pricing plan
export const onUpdatePricingPlan = async (
    planId: string,
    data: {
        name?: string
        description?: string
        price?: number // in rupees
    },
) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify ownership
        const existingPlan = await client.ownerPricingPlan.findFirst({
            where: { id: planId, userId: user.id },
        })

        if (!existingPlan) {
            return { status: 404, message: "Plan not found" }
        }

        const updateData: any = {}
        if (data.name !== undefined) updateData.name = data.name
        if (data.description !== undefined)
            updateData.description = data.description
        if (data.price !== undefined)
            updateData.price = Math.round(data.price * 100)

        const plan = await client.ownerPricingPlan.update({
            where: { id: planId },
            data: updateData,
        })

        revalidatePath("/group/[groupid]/subscriptions")

        return {
            status: 200,
            message: "Plan updated successfully",
            data: plan,
        }
    } catch (error) {
        console.error("Error updating pricing plan:", error)
        return { status: 400, message: "Failed to update plan" }
    }
}

// Delete a pricing plan
export const onDeletePricingPlan = async (planId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Verify ownership
        const existingPlan = await client.ownerPricingPlan.findFirst({
            where: { id: planId, userId: user.id },
        })

        if (!existingPlan) {
            return { status: 404, message: "Plan not found" }
        }

        // Check if plan has any payments
        const paymentsCount = await client.memberPayment.count({
            where: { planId },
        })

        if (paymentsCount > 0) {
            return {
                status: 400,
                message:
                    "Cannot delete plan with existing payments. Deactivate it instead.",
            }
        }

        await client.ownerPricingPlan.delete({
            where: { id: planId },
        })

        revalidatePath("/group/[groupid]/subscriptions")

        return { status: 200, message: "Plan deleted successfully" }
    } catch (error) {
        console.error("Error deleting pricing plan:", error)
        return { status: 400, message: "Failed to delete plan" }
    }
}

// Set a plan as active (deactivates all others)
export const onSetActivePlan = async (planId: string | null) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, message: "Unauthorized" }
        }

        // Deactivate all plans first
        await client.ownerPricingPlan.updateMany({
            where: { userId: user.id },
            data: { isActive: false },
        })

        // If planId is null, just deactivate all (free mode)
        if (planId === null) {
            revalidatePath("/group/[groupid]/subscriptions")
            return {
                status: 200,
                message: "All plans deactivated. Groups are now free to join.",
            }
        }

        // Verify ownership and activate the selected plan
        const plan = await client.ownerPricingPlan.findFirst({
            where: { id: planId, userId: user.id },
        })

        if (!plan) {
            return { status: 404, message: "Plan not found" }
        }

        await client.ownerPricingPlan.update({
            where: { id: planId },
            data: { isActive: true },
        })

        revalidatePath("/group/[groupid]/subscriptions")

        return {
            status: 200,
            message: "Plan activated successfully",
        }
    } catch (error) {
        console.error("Error setting active plan:", error)
        return { status: 400, message: "Failed to set active plan" }
    }
}

// Get the active plan for an owner (used in join flow)
export const onGetActiveOwnerPlan = async (ownerId: string) => {
    try {
        const activePlan = await client.ownerPricingPlan.findFirst({
            where: {
                userId: ownerId,
                isActive: true,
            },
        })

        if (!activePlan) {
            return {
                status: 200,
                message: "No active plan - free to join",
                data: null,
            }
        }

        return {
            status: 200,
            message: "Active plan found",
            data: {
                id: activePlan.id,
                name: activePlan.name,
                description: activePlan.description,
                price: activePlan.price, // in paise
                priceDisplay: activePlan.price / 100, // in rupees for display
                currency: activePlan.currency,
            },
        }
    } catch (error) {
        console.error("Error getting active plan:", error)
        return { status: 400, message: "Failed to get active plan", data: null }
    }
}

// Get active plan by group ID (looks up owner first)
export const onGetActivePlanByGroup = async (groupId: string) => {
    try {
        const group = await client.group.findUnique({
            where: { id: groupId },
            select: { userId: true },
        })

        if (!group) {
            return { status: 404, message: "Group not found", data: null }
        }

        return await onGetActiveOwnerPlan(group.userId)
    } catch (error) {
        console.error("Error getting active plan by group:", error)
        return { status: 400, message: "Failed to get active plan", data: null }
    }
}

// Check if user has already paid for a group
export const onCheckMemberPayment = async (groupId: string) => {
    try {
        const user = await onAuthenticatedUser()
        if (user.status !== 200 || !user.id) {
            return { status: 401, hasPaid: false }
        }

        const payment = await client.memberPayment.findFirst({
            where: {
                userId: user.id,
                groupId: groupId,
                status: "COMPLETED",
            },
        })

        return {
            status: 200,
            hasPaid: !!payment,
            payment: payment,
        }
    } catch (error) {
        console.error("Error checking member payment:", error)
        return { status: 400, hasPaid: false }
    }
}
