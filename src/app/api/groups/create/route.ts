import { prisma } from "@/lib/prisma"
import { razorpay, PRICE_PER_GROUP, TRIAL_DAYS, PLAN_ID } from "@/lib/razorpay"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

// Helper function to get or create plan with detailed debugging
async function getOrCreatePlan(): Promise<string> {
    // Step 1: Try to fetch all existing plans
    console.log("\n📍 [PLAN STEP 1] Fetching all existing plans...")
    try {
        const allPlans = await razorpay.plans.all({ count: 10 })
        if (allPlans.items && allPlans.items.length > 0) {
            console.log("\n🔍 [PLAN] Searching for matching plan...")
            for (let i = 0; i < allPlans.items.length; i++) {
                const plan = allPlans.items[i]
                const isMatch =
                    plan.id === PLAN_ID &&
                    plan.item?.amount === PRICE_PER_GROUP &&
                    plan.period === "monthly" &&
                    plan.interval === 1

                if (isMatch) {
                    console.log("✅ [PLAN] Found matching plan!")
                    console.log("🎯 [PLAN] Using plan ID:", plan.id)
                    return plan.id
                }
            }
            console.log("⚠️ [PLAN] No matching plan found in existing plans")
        } else {
            console.log("⚠️ [PLAN] No plans exist yet")
        }
    } catch (fetchError: any) {
        console.error("\n❌ [PLAN STEP 1] Error fetching plans!")
        console.log("⚠️ [PLAN] Will try to create a new plan...")
    }

    // Step 2: Create a new plan
    console.log("\n📍 [PLAN STEP 2] Creating new plan...")
    const planConfig = {
        period: "monthly",
        interval: 1,
        item: {
            name: "NeXuS Pro Monthly",
            amount: PRICE_PER_GROUP,
            currency: "INR",
            description: "Monthly subscription for NeXuS Pro features",
        },
    }

    try {
        console.log("🔍 [PLAN] Calling razorpay.plans.create()...")
        const newPlan = await razorpay.plans.create(planConfig)
        console.log("✅ [PLAN] Plan created successfully!")
        return newPlan.id
    } catch (createError: any) {
        console.error("\n❌ [PLAN STEP 2] Error creating plan!")
        throw createError
    }
}

export async function POST(req: NextRequest) {
    console.log("\n" + "=".repeat(60))
    console.log("🚀 [CREATE GROUP] API CALLED")
    console.log("=".repeat(60))
    console.log("⏰ [DEBUG] Timestamp:", new Date().toISOString())
    console.log("🔧 [DEBUG] Environment check:")
    console.log(
        "  - RAZORPAY_KEY_ID:",
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 15) + "...",
    )
    console.log(
        "  - RAZORPAY_KEY_SECRET exists:",
        !!process.env.RAZORPAY_KEY_SECRET,
    )
    console.log("  - PRICE_PER_GROUP:", PRICE_PER_GROUP)
    console.log("  - TRIAL_DAYS:", TRIAL_DAYS)

    try {
        // Step 1: Get authenticated user
        console.log("\n📍 [STEP 1] Getting authenticated user...")
        const user = await currentUser()

        if (!user) {
            console.error("❌ [STEP 1] No authenticated user!")
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            )
        }
        console.log("✅ [STEP 1] User authenticated:", user.id)

        // Step 2: Parse request body
        console.log("\n📍 [STEP 2] Parsing request body...")
        const body = await req.json()
        console.log("📦 [STEP 2] Request body:", JSON.stringify(body, null, 2))

        const { name, category, description, privacy } = body

        if (!name || !category) {
            console.error("❌ [STEP 2] Missing required fields!")
            return NextResponse.json(
                { success: false, error: "Name and category are required" },
                { status: 400 },
            )
        }
        console.log("✅ [STEP 2] Request body valid")

        // Step 3: Get user from database
        console.log("\n📍 [STEP 3] Fetching user from database...")
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                razorpayCustomerId: true,
                razorpayTokenId: true,
            },
        })

        if (!dbUser) {
            console.error("❌ [STEP 3] User not found in database!")
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 },
            )
        }

        console.log("✅ [STEP 3] User found in database:")
        console.log("  - DB User ID:", dbUser.id)
        console.log("  - Razorpay Customer ID:", dbUser.razorpayCustomerId)
        console.log("  - Razorpay Token ID:", dbUser.razorpayTokenId)

        if (!dbUser.razorpayCustomerId) {
            console.error("❌ [STEP 3] User has no Razorpay customer ID!")
            return NextResponse.json(
                {
                    success: false,
                    error: "Payment method required",
                    redirectTo: "/group/create",
                },
                { status: 400 },
            )
        }
        console.log("✅ [STEP 3] User has payment method")

        // Step 4: Create the group
        console.log("\n📍 [STEP 4] Creating group in database...")
        console.log("🔧 [STEP 4] Group data:", {
            name: name.trim(),
            category,
            description: description?.trim() || null,
            privacy: privacy || "PRIVATE",
            userId: dbUser.id,
        })

        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                category,
                description: description?.trim() || null,
                privacy: privacy || "PRIVATE",
                userId: dbUser.id,
                active: true,
            },
        })
        console.log("✅ [STEP 4] Group created:", group.id)

        // Step 5: Calculate trial end date
        console.log("\n📍 [STEP 5] Calculating trial end date...")
        const trialEndDate = new Date()
        console.log("  - Current date:", trialEndDate.toISOString())
        trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DAYS)
        console.log("  - Trial days:", TRIAL_DAYS)
        console.log("  - Trial end date:", trialEndDate.toISOString())
        console.log(
            "  - Unix timestamp:",
            Math.floor(trialEndDate.getTime() / 1000),
        )
        console.log("✅ [STEP 5] Trial end date calculated")

        // Step 6: Get or create plan
        console.log("\n📍 [STEP 6] Getting/Creating Razorpay plan...")
        let planId: string
        try {
            planId = await getOrCreatePlan()
            console.log("✅ [STEP 6] Plan ID obtained:", planId)
        } catch (planError: any) {
            console.error("❌ [STEP 6] Failed to get/create plan!")
            console.log("🔄 [STEP 6] Rolling back: Deleting group...")
            await prisma.group.delete({ where: { id: group.id } })
            console.log("✅ [STEP 6] Group deleted (rollback complete)")

            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to get/create plan: ${planError.error?.description || planError.message}`,
                    debug: {
                        step: "getOrCreatePlan",
                        errorType: planError.constructor.name,
                        razorpayError: planError.error,
                    },
                },
                { status: 500 },
            )
        }

        // Step 7: Create Razorpay subscription
        console.log("\n📍 [STEP 7] Creating Razorpay subscription...")
        console.log("🔧 [STEP 7] Subscription config:")
        const subscriptionConfig = {
            plan_id: planId,
            customer_id: dbUser.razorpayCustomerId,
            quantity: 1,
            total_count: 120,
            start_at: Math.floor(trialEndDate.getTime() / 1000),
            customer_notify: 1,
            notes: {
                groupId: group.id,
                userId: dbUser.id,
            },
        }
        console.log(JSON.stringify(subscriptionConfig, null, 2))

        let razorpaySubscription
        try {
            console.log(
                "🔍 [STEP 7] Calling razorpay.subscriptions.create()...",
            )
            razorpaySubscription =
                await razorpay.subscriptions.create(subscriptionConfig)

            console.log("✅ [STEP 7] Subscription created successfully!")
            console.log("🎯 [STEP 7] Subscription ID:", razorpaySubscription.id)
            console.log(
                "📊 [STEP 7] Full response:",
                JSON.stringify(razorpaySubscription, null, 2),
            )
        } catch (subError: any) {
            console.error("❌ [STEP 7] Failed to create subscription!")
            console.error("❌ [STEP 7] Error type:", subError.constructor.name)
            console.error("❌ [STEP 7] Error message:", subError.message)
            console.error("❌ [STEP 7] Error details:", {
                statusCode: subError.statusCode,
                error: subError.error,
                description: subError.error?.description,
                code: subError.error?.code,
            })
            console.error("❌ [STEP 7] Full error:", subError)

            console.log("🔄 [STEP 7] Rolling back: Deleting group...")
            await prisma.group.delete({ where: { id: group.id } })
            console.log("✅ [STEP 7] Group deleted (rollback complete)")

            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to create subscription: ${subError.error?.description || subError.message}`,
                    debug: {
                        step: "createSubscription",
                        planId: planId,
                        customerId: dbUser.razorpayCustomerId,
                        errorType: subError.constructor.name,
                        razorpayError: subError.error,
                    },
                },
                { status: 500 },
            )
        }

        // Step 8: Save subscription to database
        console.log("\n📍 [STEP 8] Saving subscription to database...")
        console.log("🔧 [STEP 8] Subscription data:", {
            razorpaySubscriptionId: razorpaySubscription.id,
            razorpayPlanId: planId,
            status: "TRIAL",
            trialEndDate: trialEndDate,
            userId: dbUser.id,
            groupId: group.id,
        })

        const subscription = await prisma.subscription.create({
            data: {
                razorpaySubscriptionId: razorpaySubscription.id,
                razorpayPlanId: planId,
                status: "TRIAL",
                trialEndDate: trialEndDate,
                userId: dbUser.id,
                groupId: group.id,
            },
        })
        console.log("✅ [STEP 8] Subscription saved:", subscription.id)

        // Success!
        console.log("\n" + "=".repeat(60))
        console.log("🎉 [CREATE GROUP] SUCCESS!")
        console.log("=".repeat(60))
        console.log("📊 Final result:")
        console.log("  - Group ID:", group.id)
        console.log("  - Group Name:", group.name)
        console.log("  - Subscription ID:", subscription.id)
        console.log("  - Razorpay Subscription ID:", razorpaySubscription.id)
        console.log("  - Plan ID:", planId)
        console.log("  - Trial End Date:", trialEndDate.toISOString())
        console.log("=".repeat(60) + "\n")

        return NextResponse.json({
            success: true,
            group: {
                id: group.id,
                name: group.name,
                category: group.category,
                privacy: group.privacy,
            },
            subscription: {
                id: subscription.id,
                razorpayId: razorpaySubscription.id,
                planId: planId,
                status: "TRIAL",
                trialEndDate: trialEndDate.toISOString(),
            },
        })
    } catch (error: any) {
        console.error("\n" + "=".repeat(60))
        console.error("💥 [CREATE GROUP] UNEXPECTED ERROR!")
        console.error("=".repeat(60))
        console.error("❌ Error type:", error.constructor.name)
        console.error("❌ Error message:", error.message)
        console.error("❌ Error stack:", error.stack)
        console.error("=".repeat(60) + "\n")

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create group",
                debug: {
                    step: "unknown",
                    errorType: error.constructor.name,
                },
            },
            { status: 500 },
        )
    }
}
