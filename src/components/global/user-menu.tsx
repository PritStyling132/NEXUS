"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useClerk, useUser } from "@clerk/nextjs"
import { LogOut, Settings, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import Link from "next/link"

type UserProfile = {
    firstname: string
    lastname: string
    email: string
    image?: string
}

export function UserMenu() {
    const { user } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    // Fetch user profile from database to get updated name
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch("/api/user/profile")
                const data = await response.json()
                if (data.status === 200 && data.data) {
                    setUserProfile({
                        firstname: data.data.firstname || "",
                        lastname: data.data.lastname || "",
                        email: data.data.email || "",
                        image: data.data.image || "",
                    })
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error)
            }
        }

        if (user) {
            fetchUserProfile()
        }
    }, [user])

    const handleSignOut = async () => {
        try {
            if (user) {
                await signOut()
            }
            toast.success("Signed out successfully")
            router.push("/sign-in")
        } catch (error) {
            console.error("Sign out error:", error)
            router.push("/sign-in")
        }
    }

    // Use database profile if available, otherwise fall back to Clerk user
    const displayName = userProfile
        ? `${userProfile.firstname} ${userProfile.lastname}`.trim()
        : user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
          : ""

    const displayEmail = userProfile?.email || user?.emailAddresses[0]?.emailAddress || ""

    const displayInitial = userProfile?.firstname?.[0]?.toUpperCase() ||
        user?.firstName?.[0] ||
        user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase() ||
        "U"

    // Get profile image - prefer DB image, then Clerk image
    const displayImage = userProfile?.image || user?.imageUrl || ""

    // If no user, don't render
    if (!user) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="p-0 rounded-full h-10 w-10 hover:opacity-80 transition-opacity"
                >
                    <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                        <AvatarImage src={displayImage} alt={displayName} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                            {displayInitial}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {displayName || "User"}
                        </p>
                        {displayEmail && (
                            <p className="text-xs leading-none text-muted-foreground">
                                {displayEmail}
                            </p>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Dashboard */}
                <Link href="/dashboard">
                    <DropdownMenuItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </DropdownMenuItem>
                </Link>

                {/* Account Settings */}
                <Link href="/account-settings">
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Account Settings</span>
                    </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
