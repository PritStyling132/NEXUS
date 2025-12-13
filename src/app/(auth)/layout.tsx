import BackdropGradient from "@/components/global/backdrop-gradient"
import GlassCard from "@/components/global/glass-card"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import React from "react"

type Props = {
    children: React.ReactNode
}

const AuthLayout = async ({ children }: Props) => {
    // checking authentication, don't query database here
    const user = await currentUser()

    // If user is authenticated in Clerk, redirect to explore page
    if (user) {
        redirect("/explore")
    }

    return (
        <div className="min-h-screen bg-background flex justify-center items-center px-4 py-8">
            <div className="flex flex-col w-full items-center">
                <Link href="/" className="mb-8">
                    <Image
                        src="/assets/nexus-logo.png"
                        alt="Nexus Logo"
                        width={150}
                        height={60}
                        className="object-contain h-auto"
                        priority
                    />
                </Link>
                <BackdropGradient
                    className="w-4/12 h-2/6 opacity-40"
                    container="flex flex-col items-center"
                >
                    <GlassCard className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 bg-card/80 dark:bg-themeBlack/80 backdrop-blur-xl border border-border dark:border-themeGray shadow-xl">
                        {children}
                    </GlassCard>
                </BackdropGradient>
                <p className="mt-6 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-primary transition-colors">
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default AuthLayout
