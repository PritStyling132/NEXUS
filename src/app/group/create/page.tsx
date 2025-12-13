import BackdropGradient from "@/components/global/backdrop-gradient"
import GradientText from "@/components/global/gradient-text"
import PaymentForm from "@/components/global/razorPay/payment-form"
import { UserMenu } from "@/components/global/user-menu"
import { NEXUS_CONSTANTS } from "@/constants"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import GroupCreationForm from "./group-creation-form"

export default async function CreateGroupPage() {
    try {
        // Check for Clerk user (learner) or owner session
        const user = await currentUser()
        const cookieStore = await cookies()
        const ownerSessionId = cookieStore.get("owner_session")?.value

        // If neither Clerk user nor owner session, redirect to sign-in
        if (!user && !ownerSessionId) {
            redirect("/sign-in")
        }

        let dbUser

        // If owner session exists, get owner's user data
        if (ownerSessionId) {
            console.log(
                "🔍 [GROUP CREATE] Looking up owner user:",
                ownerSessionId,
            )

            try {
                dbUser = (await Promise.race([
                    prisma.user.findUnique({
                        where: { id: ownerSessionId },
                        select: {
                            id: true,
                            razorpayCustomerId: true,
                            razorpayTokenId: true,
                            trialEndsAt: true,
                            firstname: true,
                            lastname: true,
                        },
                    }),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error("Database query timeout")),
                            10000,
                        ),
                    ),
                ])) as any
            } catch (dbError: any) {
                console.error(
                    "❌ [GROUP CREATE] Database error:",
                    dbError.message,
                )

                return (
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-red-900 mb-2">
                                Database Connection Error
                            </h2>
                            <p className="text-red-700 mb-4">
                                Unable to connect to the database. Please try
                                again in a few moments.
                            </p>
                            <details className="text-sm text-red-600">
                                <summary className="cursor-pointer font-medium">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                                    {dbError.message}
                                </pre>
                            </details>
                            <div className="mt-4">
                                <a
                                    href="/sign-in"
                                    className="text-red-600 hover:text-red-800 font-medium"
                                >
                                    ← Back to Sign In
                                </a>
                            </div>
                        </div>
                    </div>
                )
            }

            // If owner not found in database, redirect to sign-in
            if (!dbUser) {
                console.error("❌ [GROUP CREATE] Owner not found in database")
                redirect("/sign-in")
            }
        } else if (user) {
            // Clerk user (learner) flow
            console.log("🔍 [GROUP CREATE] Looking up user:", user.id)

            try {
                dbUser = (await Promise.race([
                    prisma.user.findUnique({
                        where: { clerkId: user.id },
                        select: {
                            id: true,
                            razorpayCustomerId: true,
                            razorpayTokenId: true,
                            trialEndsAt: true,
                            firstname: true,
                            lastname: true,
                        },
                    }),
                    new Promise((_, reject) =>
                        setTimeout(
                            () => reject(new Error("Database query timeout")),
                            10000,
                        ),
                    ),
                ])) as any
            } catch (dbError: any) {
                console.error(
                    "❌ [GROUP CREATE] Database error:",
                    dbError.message,
                )

                return (
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-red-900 mb-2">
                                Database Connection Error
                            </h2>
                            <p className="text-red-700 mb-4">
                                Unable to connect to the database. Please try
                                again in a few moments.
                            </p>
                            <details className="text-sm text-red-600">
                                <summary className="cursor-pointer font-medium">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                                    {dbError.message}
                                </pre>
                            </details>
                            <div className="mt-4">
                                <a
                                    href="/sign-in"
                                    className="text-red-600 hover:text-red-800 font-medium"
                                >
                                    ← Back to Sign In
                                </a>
                            </div>
                        </div>
                    </div>
                )
            }

            // If user doesn't exist in DB, create them (for OAuth users)
            if (!dbUser) {
                console.log(
                    "⚠️ [GROUP CREATE] User not in database, creating...",
                )

                try {
                    await prisma.user.create({
                        data: {
                            clerkId: user.id,
                            firstname: user.firstName || "",
                            lastname: user.lastName || "",
                            image: user.imageUrl || "",
                        },
                    })

                    console.log(
                        "✅ [GROUP CREATE] User created, redirecting...",
                    )
                    redirect("/group/create")
                } catch (createError: any) {
                    console.error(
                        "❌ [GROUP CREATE] Failed to create user:",
                        createError,
                    )

                    if (createError.code === "P2002") {
                        redirect("/group/create")
                    }

                    throw createError
                }
            }
        }

        console.log("✅ [GROUP CREATE] User found:", dbUser!.id)

        const hasPaymentMethod = !!(
            dbUser?.razorpayCustomerId && dbUser?.razorpayTokenId
        )

        return (
            <div className="min-h-screen bg-background dark:bg-black">
                {/* Header with User Menu */}
                <header className="border-b border-border dark:border-border/40 bg-background/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                    <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground dark:text-themeTextWhite">
                            NeXuS.
                        </h2>
                        <UserMenu />
                    </div>
                </header>

                {/* Main Content */}
                <div className="container grid grid-cols-1 lg:grid-cols-2 content-center gap-8 lg:gap-12 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 min-h-[calc(100vh-4rem)]">
                    {/* Left Side - Information */}
                    <div className="flex items-center order-2 lg:order-1">
                        <BackdropGradient className="w-full h-full opacity-50">
                            <div className="p-6 sm:p-8 lg:p-10">
                                <h5 className="text-xl sm:text-2xl font-bold text-foreground dark:text-themeTextWhite mb-4">
                                    Welcome, {dbUser!.firstname}!
                                </h5>

                                <GradientText
                                    element="H2"
                                    className="text-3xl sm:text-4xl lg:text-5xl font-semibold py-1"
                                >
                                    {hasPaymentMethod
                                        ? "Create Your Group"
                                        : "Get Started"}
                                </GradientText>

                                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray mt-4 leading-relaxed">
                                    Free for 14 days, then INR 4,999/month.
                                    Cancel anytime. All features. Unlimited
                                    everything. No hidden fees.
                                </p>

                                <div className="flex flex-col gap-3 sm:gap-4 mt-8 sm:mt-12 lg:mt-16 pl-2 sm:pl-5">
                                    {NEXUS_CONSTANTS.createGroupPlaceholder.map(
                                        (placeholder) => (
                                            <div
                                                className="flex gap-3 items-start"
                                                key={placeholder.id}
                                            >
                                                <div className="mt-1 text-primary dark:text-primary">
                                                    {placeholder.icon}
                                                </div>
                                                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray">
                                                    {placeholder.label}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {!hasPaymentMethod && (
                                    <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-primary/5 dark:bg-themeBlack/50 rounded-lg border border-primary/20 dark:border-themeGray">
                                        <p className="text-xs sm:text-sm text-muted-foreground dark:text-themeTextGray leading-relaxed">
                                            💳{" "}
                                            <strong className="text-foreground dark:text-themeTextWhite">
                                                One-time setup:
                                            </strong>{" "}
                                            Add your payment method to start
                                            your free trial. You won't be
                                            charged for 14 days.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </BackdropGradient>
                    </div>

                    {/* Right Side - Payment Form or Group Creation Form */}
                    <div className="flex items-center justify-center order-1 lg:order-2">
                        <div className="w-full max-w-md">
                            {hasPaymentMethod ? (
                                <GroupCreationForm />
                            ) : (
                                <PaymentForm />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("💥 [GROUP CREATE] Unexpected error:", error)

        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-bold text-red-900 mb-2">
                        Something Went Wrong
                    </h2>
                    <p className="text-red-700 mb-4">
                        We encountered an unexpected error. Please try again.
                    </p>
                    <div className="mt-4 space-y-2">
                        <Link
                            href="/sign-in"
                            className="block text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                        >
                            Back to Sign In
                        </Link>
                        <Link
                            href="/group/create"
                            className="block w-full text-center text-red-600 hover:text-red-800 font-medium"
                        >
                            Refresh Page
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
}
