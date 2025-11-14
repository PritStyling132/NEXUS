// import { prisma } from '@/lib/prisma';
// import { currentUser } from '@clerk/nextjs/server';
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//   try {
//     const user = await currentUser();
//     if (!user) {
//       return NextResponse.json(
//         { success: false, error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { name, category, description, privacy } = await req.json();

//     // Validate required fields
//     if (!name || !category) {
//       return NextResponse.json(
//         { success: false, error: 'Group name and category are required' },
//         { status: 400 }
//       );
//     }

//     // Get user from database
//     const dbUser = await prisma.user.findUnique({
//       where: { clerkId: user.id },
//       select: {
//         id: true,
//         razorpayCustomerId: true,
//         razorpayTokenId: true,
//         firstname: true,
//         lastname: true
//       }
//     });

//     if (!dbUser) {
//       return NextResponse.json(
//         { success: false, error: 'User not found in database' },
//         { status: 404 }
//       );
//     }

//     // Check if payment method exists
//     if (!dbUser.razorpayCustomerId || !dbUser.razorpayTokenId) {
//       return NextResponse.json({
//         success: false,
//         error: 'Payment method not added',
//         needsPayment: true
//       }, { status: 400 });
//     }

//     // Create the group
//     const group = await prisma.group.create({
//       data: {
//         name: name.trim(),
//         category: category,
//         description: description?.trim() || null,
//         privacy: privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
//         userId: dbUser.id,
//         active: true,
//       }
//     });

//     // Create subscription for the group
//     const subscriptionUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/razorpay/create-subscription`;

//     const subscriptionResponse = await fetch(subscriptionUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Cookie': req.headers.get('cookie') || '', // Forward auth cookies
//       },
//       body: JSON.stringify({ groupId: group.id }),
//     });

//     const subscriptionData = await subscriptionResponse.json();

//     if (!subscriptionData.success) {
//       // Rollback: delete the group if subscription creation fails
//       await prisma.group.delete({ where: { id: group.id } });
//       return NextResponse.json(
//         { success: false, error: `Subscription failed: ${subscriptionData.error}` },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       group: {
//         id: group.id,
//         name: group.name,
//         category: group.category,
//         privacy: group.privacy,
//       },
//       subscription: {
//         id: subscriptionData.subscriptionId,
//         status: subscriptionData.status,
//         trialEndDate: subscriptionData.trialEndDate,
//       }
//     });
//   } catch (error: any) {
//     console.error('Error creating group:', error);
//     return NextResponse.json(
//       { success: false, error: error.message || 'Failed to create group' },
//       { status: 500 }
//     );
//   }
// }

import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    console.log("🚀 [CREATE GROUP] API called")

    try {
        const user = await currentUser()
        console.log("👤 [CREATE GROUP] User:", user?.id)

        if (!user) {
            console.error("❌ [CREATE GROUP] No user found")
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 },
            )
        }

        const body = await req.json()
        console.log("📦 [CREATE GROUP] Request body:", body)

        const { name, category, description, privacy } = body

        // Validate required fields
        if (!name || !category) {
            console.error("❌ [CREATE GROUP] Missing required fields")
            return NextResponse.json(
                {
                    success: false,
                    error: "Group name and category are required",
                },
                { status: 400 },
            )
        }

        // Get user from database
        console.log("🔍 [CREATE GROUP] Finding user in database...")
        const dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
            select: {
                id: true,
                razorpayCustomerId: true,
                razorpayTokenId: true,
                firstname: true,
                lastname: true,
            },
        })

        console.log("👤 [CREATE GROUP] DB User found:", {
            id: dbUser?.id,
            hasRazorpayCustomer: !!dbUser?.razorpayCustomerId,
            hasRazorpayToken: !!dbUser?.razorpayTokenId,
        })

        if (!dbUser) {
            console.error("❌ [CREATE GROUP] User not found in database")
            return NextResponse.json(
                { success: false, error: "User not found in database" },
                { status: 404 },
            )
        }

        // Check if payment method exists
        if (!dbUser.razorpayCustomerId || !dbUser.razorpayTokenId) {
            console.error("❌ [CREATE GROUP] Payment method not added")
            return NextResponse.json(
                {
                    success: false,
                    error: "Payment method not added",
                    needsPayment: true,
                },
                { status: 400 },
            )
        }

        // Create the group
        console.log("📝 [CREATE GROUP] Creating group in database...")
        const group = await prisma.group.create({
            data: {
                name: name.trim(),
                category: category,
                description: description?.trim() || null,
                privacy: privacy === "PUBLIC" ? "PUBLIC" : "PRIVATE",
                userId: dbUser.id,
                active: true,
            },
        })

        console.log("✅ [CREATE GROUP] Group created:", group.id)

        // Create subscription for the group
        console.log("💳 [CREATE GROUP] Creating subscription...")
        const subscriptionUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/razorpay/create-subscription`
        console.log("🌐 [CREATE GROUP] Subscription URL:", subscriptionUrl)

        const subscriptionResponse = await fetch(subscriptionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ groupId: group.id }),
        })

        console.log(
            "📡 [CREATE GROUP] Subscription response status:",
            subscriptionResponse.status,
        )

        const subscriptionData = await subscriptionResponse.json()
        console.log("📦 [CREATE GROUP] Subscription data:", subscriptionData)

        if (!subscriptionData.success) {
            console.error(
                "❌ [CREATE GROUP] Subscription failed, rolling back group...",
            )
            // Rollback: delete the group if subscription creation fails
            await prisma.group.delete({ where: { id: group.id } })
            return NextResponse.json(
                {
                    success: false,
                    error: `Subscription failed: ${subscriptionData.error}`,
                },
                { status: 500 },
            )
        }

        console.log("✅ [CREATE GROUP] Success! Group and subscription created")

        return NextResponse.json({
            success: true,
            group: {
                id: group.id,
                name: group.name,
                category: group.category,
                privacy: group.privacy,
            },
            subscription: {
                id: subscriptionData.subscriptionId,
                status: subscriptionData.status,
                trialEndDate: subscriptionData.trialEndDate,
            },
        })
    } catch (error: any) {
        console.error("💥 [CREATE GROUP] Error:", error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to create group",
            },
            { status: 500 },
        )
    }
}
