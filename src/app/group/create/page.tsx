import BackdropGradient from "@/components/global/backdrop-gradient"
import GradientText from "@/components/global/gradient-text"
import PaymentForm from "@/components/global/razorPay/payment-form"
import { UserMenu } from "@/components/global/user-menu"
import { NEXUS_CONSTANTS } from "@/constants"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import GroupCreationForm from "./group-creation-form"

export default async function CreateGroupPage() {
    try {
        // Await currentUser properly for Next.js 15
        const user = await currentUser()

        if (!user) {
            redirect("/sign-in")
        }

        console.log("🔍 [GROUP CREATE] Looking up user:", user.id)

        // Check if user exists in database with timeout
        let dbUser
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
            console.error("❌ [GROUP CREATE] Database error:", dbError.message)

            // If database is unreachable, show error page
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-red-900 mb-2">
                            Database Connection Error
                        </h2>
                        <p className="text-red-700 mb-4">
                            Unable to connect to the database. Please try again
                            in a few moments.
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
            console.log("⚠️ [GROUP CREATE] User not in database, creating...")

            try {
                await prisma.user.create({
                    data: {
                        clerkId: user.id,
                        firstname: user.firstName || "",
                        lastname: user.lastName || "",
                        image: user.imageUrl || "",
                    },
                })

                console.log("✅ [GROUP CREATE] User created, redirecting...")
                // Refresh the page to get the new user data
                redirect("/group/create")
            } catch (createError: any) {
                console.error(
                    "❌ [GROUP CREATE] Failed to create user:",
                    createError,
                )

                // Check if user already exists (race condition)
                if (createError.code === "P2002") {
                    redirect("/group/create")
                }

                throw createError
            }
        }

        console.log("✅ [GROUP CREATE] User found:", dbUser.id)

        const hasPaymentMethod = !!(
            dbUser?.razorpayCustomerId && dbUser?.razorpayTokenId
        )

        return (
            <div className="min-h-screen">
                {/* Header with User Menu */}
                <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center justify-between">
                        <h2 className="text-2xl font-bold text-themeTextWhite">
                            NeXuS.
                        </h2>
                        <UserMenu />
                    </div>
                </header>

                {/* Main Content */}
                <div className="container grid grid-cols-1 lg:grid-cols-2 content-center gap-8 py-16 min-h-[calc(100vh-4rem)]">
                    {/* Left Side - Information */}
                    <div className="flex items-center">
                        <BackdropGradient className="w-full h-full opacity-50">
                            <div className="p-8">
                                <h5 className="text-2xl font-bold text-themeTextWhite mb-4">
                                    Welcome, {dbUser.firstname}!
                                </h5>

                                <GradientText
                                    element="H2"
                                    className="text-4xl font-semibold py-1"
                                >
                                    {hasPaymentMethod
                                        ? "Create Your Group"
                                        : "Get Started"}
                                </GradientText>

                                <p className="text-themeTextGray mt-4">
                                    Free for 14 days, then INR 99/month. Cancel
                                    anytime. All features. Unlimited everything.
                                    No hidden fees.
                                </p>

                                <div className="flex flex-col gap-3 mt-16 pl-5">
                                    {NEXUS_CONSTANTS.createGroupPlaceholder.map(
                                        (placeholder) => (
                                            <div
                                                className="flex gap-3 items-start"
                                                key={placeholder.id}
                                            >
                                                <div className="mt-1">
                                                    {placeholder.icon}
                                                </div>
                                                <p className="text-themeTextGray">
                                                    {placeholder.label}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {!hasPaymentMethod && (
                                    <div className="mt-8 p-4 bg-themeBlack/50 rounded-lg border border-themeGray">
                                        <p className="text-sm text-themeTextGray">
                                            💳{" "}
                                            <strong className="text-themeTextWhite">
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
                    <div className="flex items-center justify-center">
                        {hasPaymentMethod ? (
                            <GroupCreationForm />
                        ) : (
                            <PaymentForm />
                        )}
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("💥 [GROUP CREATE] Unexpected error:", error)

        // Generic error page
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
                        <a
                            href="/sign-in"
                            className="block text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                        >
                            Back to Sign In
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className="block w-full text-center text-red-600 hover:text-red-800 font-medium"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
