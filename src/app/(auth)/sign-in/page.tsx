"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Briefcase, Shield } from "lucide-react"
import Link from "next/link"

// Learner Sign-in Components
import SignInForm from "@/components/forms/sign-in"
import { GoogleAuthButton } from "@/components/global/google_oauth_button"
import { Separator } from "@/components/ui/separator"

// Owner & Admin Sign-in Components
import OwnerSignInForm from "@/components/forms/owner-sign-in"
import AdminSignInForm from "@/components/forms/admin-sign-in"

const SignInPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabParam = searchParams.get("tab")
    const [activeTab, setActiveTab] = useState("learner")

    useEffect(() => {
        if (tabParam && ["learner", "owner", "admin"].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const handleTabChange = useCallback(
        (value: string) => {
            setActiveTab(value)
            router.push(`/sign-in?tab=${value}`, { scroll: false })
        },
        [router],
    )

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="space-y-2 text-center">
                <h5 className="font-bold text-xl sm:text-2xl text-foreground dark:text-themeTextWhite">
                    Welcome Back
                </h5>
                <p className="text-sm text-muted-foreground dark:text-themeTextGray">
                    Sign in to continue to Nexus
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 dark:bg-themeGray/30">
                    <TabsTrigger
                        value="learner"
                        className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span className="hidden sm:inline">Learner</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="owner"
                        className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
                    >
                        <Briefcase className="w-4 h-4" />
                        <span className="hidden sm:inline">Owner</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="admin"
                        className="flex items-center gap-1.5 text-xs sm:text-sm data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"
                    >
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Admin</span>
                    </TabsTrigger>
                </TabsList>

                {/* Learner Sign-in Tab */}
                <TabsContent value="learner" className="space-y-4">
                    <p className="text-sm text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        Join groups, watch courses, and connect with
                        communities.
                    </p>

                    <SignInForm />

                    <div className="my-6 w-full relative">
                        <div className="bg-background dark:bg-black px-3 py-2 absolute text-muted-foreground dark:text-themeTextGray text-xs font-medium top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                            OR CONTINUE WITH
                        </div>
                        <Separator
                            orientation="horizontal"
                            className="bg-border dark:bg-themeGray"
                        />
                    </div>

                    <GoogleAuthButton method="signin" />

                    <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mt-4">
                        Don't have an account?{" "}
                        <Link
                            href="/sign-up?tab=learner"
                            className="text-blue-500 hover:underline font-semibold transition-colors"
                        >
                            Sign Up
                        </Link>
                    </p>
                </TabsContent>

                {/* Owner Sign-in Tab */}
                <TabsContent value="owner" className="space-y-4">
                    <p className="text-sm text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        Manage your groups, courses, and community.
                    </p>

                    <OwnerSignInForm />

                    <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mt-4">
                        Don't have owner access?{" "}
                        <Link
                            href="/sign-up?tab=owner"
                            className="text-purple-500 hover:underline font-semibold transition-colors"
                        >
                            Apply to become an owner
                        </Link>
                    </p>
                </TabsContent>

                {/* Admin Sign-in Tab */}
                <TabsContent value="admin" className="space-y-4">
                    <p className="text-sm text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        Access admin dashboard to manage owner applications.
                    </p>

                    <AdminSignInForm />

                    <p className="text-xs text-center text-muted-foreground pt-2">
                        Admin access is restricted to authorized personnel only.
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SignInPage
