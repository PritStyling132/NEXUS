"use client"

import GlassSheet from "@/components/global/glass-sheet"
import { ThemeToggle } from "@/components/global/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, MenuIcon, LogOut, Settings, LayoutDashboard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import Menu from "./menu"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

type UserProfile = {
    firstname: string
    lastname: string
    email: string
    image?: string
    isOwner?: boolean
    firstGroupId?: string | null
}

const LandingPageNavbar: React.FC = () => {
    const { user, isLoaded, isSignedIn } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [isOwner, setIsOwner] = useState(false)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    // Check for owner session and fetch user profile
    useEffect(() => {
        const checkAuthAndFetchProfile = async () => {
            setIsCheckingAuth(true)
            try {
                // Always try to fetch profile - this works for both Clerk users and owners
                const response = await fetch("/api/user/profile")
                const data = await response.json()

                if (data.status === 200 && data.data) {
                    setUserProfile({
                        firstname: data.data.firstname || "",
                        lastname: data.data.lastname || "",
                        email: data.data.email || "",
                        image: data.data.image || "",
                        isOwner: data.data.isOwner || false,
                        firstGroupId: data.data.firstGroupId || null,
                    })
                    // If we got a profile but not signed in via Clerk, must be an owner
                    if (!isSignedIn || data.data.isOwner) {
                        setIsOwner(true)
                    }
                } else {
                    setIsOwner(false)
                    setUserProfile(null)
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error)
                setIsOwner(false)
            } finally {
                setIsCheckingAuth(false)
            }
        }

        // Only check once Clerk is loaded
        if (isLoaded) {
            checkAuthAndFetchProfile()
        }
    }, [isLoaded, isSignedIn])

    const handleSignOut = async () => {
        if (isOwner) {
            // Clear owner session cookies
            document.cookie = "owner_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie = "owner_pending_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            router.push("/sign-in")
        } else {
            // Clerk sign out
            signOut({ redirectUrl: "/sign-in" })
        }
    }

    // Check if user is authenticated (either Clerk or owner)
    const isAuthenticated = isSignedIn || isOwner

    // Use database profile if available, otherwise fall back to Clerk user
    const displayName = userProfile
        ? `${userProfile.firstname} ${userProfile.lastname}`.trim()
        : user?.fullName || "User"

    const displayEmail = userProfile?.email || user?.primaryEmailAddress?.emailAddress || ""

    const displayInitial = userProfile?.firstname?.[0]?.toUpperCase() ||
        user?.firstName?.[0] ||
        user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
        "U"

    // Get profile image
    const displayImage = userProfile?.image || user?.imageUrl || ""

    // Get the dashboard link based on user type
    // For owners with groups, go to their first group; otherwise go to create page
    const dashboardLink = isOwner
        ? (userProfile?.firstGroupId ? `/group/${userProfile.firstGroupId}` : "/group/create")
        : "/dashboard"

    return (
        <div className="w-full flex justify-between items-center py-3 sm:py-5 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 bg-background/80 dark:bg-black/30 backdrop-blur-lg border-b border-border dark:border-themeGray transition-all">
            {/* Left Logo or Title */}
            <Link href="/" className="flex-shrink-0">
                <Image
                    src="/assets/nexus-logo.png"
                    alt="Nexus Logo"
                    width={190}
                    height={80}
                    className="object-contain w-32 sm:w-40 md:w-48 h-auto"
                    priority
                />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex flex-1 justify-center">
                <Menu orientation="desktop" />
            </div>

            {/* Right Controls (Theme Toggle + Login/Profile + Mobile Menu) */}
            <div className="flex gap-2 items-center">
                {/* Theme Toggle - visible on all screens */}
                <ThemeToggle />

                {/* User Profile or Login Button */}
                {isLoaded && !isCheckingAuth && isAuthenticated ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-full hidden sm:flex"
                            >
                                <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                                    <AvatarImage
                                        src={displayImage}
                                        alt={displayName}
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {displayInitial}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 bg-background dark:bg-themeBlack border-border dark:border-themeGray"
                            align="end"
                            forceMount
                        >
                            <div className="flex items-center justify-start gap-2 p-2">
                                <div className="flex flex-col space-y-1 leading-none">
                                    <p className="font-medium text-sm">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate w-40">
                                        {displayEmail}
                                    </p>
                                </div>
                            </div>
                            <DropdownMenuSeparator className="bg-border dark:bg-themeGray" />
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={dashboardLink} className="flex items-center">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>{isOwner ? "My Groups" : "Dashboard"}</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/account-settings" className="flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Account Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border dark:bg-themeGray" />
                            <DropdownMenuItem
                                className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : isLoaded && !isCheckingAuth ? (
                    <Link href="/sign-in" className="hidden sm:block">
                        <Button
                            variant="outline"
                            className="bg-primary/10 dark:bg-themeBlack text-foreground dark:text-white rounded-2xl flex gap-2 border-border dark:border-themeGray hover:bg-primary/20 dark:hover:bg-themeGray transition-colors"
                        >
                            <LogIn size={18} />
                            <span className="hidden md:inline">Login</span>
                        </Button>
                    </Link>
                ) : null}

                {/* Mobile Menu Sheet */}
                <GlassSheet
                    triggerClass="lg:hidden"
                    trigger={
                        <Button
                            variant="ghost"
                            className="hover:bg-primary/10 dark:hover:bg-transparent p-2"
                        >
                            <MenuIcon size={24} className="sm:w-7 sm:h-7" />
                        </Button>
                    }
                >
                    <div className="p-4 space-y-4">
                        <Menu orientation="mobile" />

                        {/* Mobile User Section */}
                        {isLoaded && !isCheckingAuth && isAuthenticated ? (
                            <div className="mt-4 space-y-3 pt-4 border-t border-border dark:border-themeGray">
                                <div className="flex items-center gap-3 px-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={displayImage}
                                            alt={displayName}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {displayInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {displayName}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                            {displayEmail}
                                        </span>
                                    </div>
                                </div>
                                <Link href={dashboardLink} className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                    >
                                        <LayoutDashboard size={18} />
                                        {isOwner ? "My Groups" : "Dashboard"}
                                    </Button>
                                </Link>
                                <Link href="/account-settings" className="block">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 rounded-xl"
                                    >
                                        <Settings size={18} />
                                        Account Settings
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 rounded-xl text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                    onClick={handleSignOut}
                                >
                                    <LogOut size={18} />
                                    Log out
                                </Button>
                            </div>
                        ) : isLoaded && !isCheckingAuth ? (
                            <Link href="/sign-in" className="block mt-4">
                                <Button
                                    variant="outline"
                                    className="w-full bg-primary/10 dark:bg-themeBlack text-foreground dark:text-white rounded-2xl flex gap-2 justify-center border-border dark:border-themeGray hover:bg-primary/20 dark:hover:bg-themeGray"
                                >
                                    <LogIn size={18} />
                                    Login
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </GlassSheet>
            </div>
        </div>
    )
}

export default LandingPageNavbar
