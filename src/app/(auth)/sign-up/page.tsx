"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Briefcase } from "lucide-react"
import Link from "next/link"

// Learner Registration Components
import SignUpForm from "@/components/forms/sign-up"
import { GoogleAuthButton } from "@/components/global/google_oauth_button"
import { Separator } from "@/components/ui/separator"

// Owner Registration Component
import OwnerRegistrationForm from "@/components/forms/owner-register"

const SignupPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const tabParam = searchParams.get("tab")
    const [activeTab, setActiveTab] = useState("learner")

    useEffect(() => {
        if (tabParam && ["learner", "owner"].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value)
        router.push(`/sign-up?tab=${value}`, { scroll: false })
    }, [router])

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="space-y-2 text-center">
                <h5 className="font-bold text-xl sm:text-2xl text-foreground dark:text-themeTextWhite">
                    Create Your Account
                </h5>
                <p className="text-sm text-muted-foreground dark:text-themeTextGray">
                    Join NeXuS as a learner or apply to become an owner
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 dark:bg-themeGray/30">
                    <TabsTrigger
                        value="learner"
                        className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
                    >
                        <GraduationCap className="w-4 h-4" />
                        Learner
                    </TabsTrigger>
                    <TabsTrigger
                        value="owner"
                        className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all"
                    >
                        <Briefcase className="w-4 h-4" />
                        Owner
                    </TabsTrigger>
                </TabsList>

                {/* Learner Registration Tab */}
                <TabsContent value="learner" className="space-y-4">
                    <p className="text-sm text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        Network with people from around the world, join groups,
                        watch courses and become the best version of yourself.
                    </p>

                    <SignUpForm />

                    <div className="my-6 w-full relative">
                        <div className="bg-background dark:bg-black px-3 py-2 absolute text-muted-foreground dark:text-themeTextGray text-xs font-medium top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                            OR CONTINUE WITH
                        </div>
                        <Separator
                            orientation="horizontal"
                            className="bg-border dark:bg-themeGray"
                        />
                    </div>

                    <GoogleAuthButton method="signup" />

                    <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mt-4">
                        Already have an account?{" "}
                        <Link
                            href="/sign-in?tab=learner"
                            className="text-blue-500 hover:underline font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </TabsContent>

                {/* Owner Registration Tab */}
                <TabsContent value="owner" className="space-y-4">
                    <p className="text-sm text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        Build your community, create courses, and grow your
                        audience with NeXuS platform.
                    </p>

                    <OwnerRegistrationForm />

                    <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mt-4">
                        Already have owner access?{" "}
                        <Link
                            href="/sign-in?tab=owner"
                            className="text-purple-500 hover:underline font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SignupPage
