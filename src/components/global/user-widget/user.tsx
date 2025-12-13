"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DropDown } from "../drop-down"
import Link from "next/link"

type UserWidgetProps = {
    image: string
    groupid: string
    userid?: string
}

type UserInfo = {
    name: string
    email: string
    image?: string
}

export const UserAvatar = ({ image, groupid, userid }: UserWidgetProps) => {
    const { signOut } = useClerk()
    const { user: clerkUser } = useUser()
    const router = useRouter()
    const [userInfo, setUserInfo] = useState<UserInfo>({ name: "", email: "" })

    // Fetch user info from database on mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            // First try to fetch from database for updated profile info
            try {
                const response = await fetch("/api/user/profile")
                const data = await response.json()
                if (data.status === 200 && data.data) {
                    setUserInfo({
                        name:
                            `${data.data.firstname || ""} ${data.data.lastname || ""}`.trim() ||
                            "User",
                        email: data.data.email || "",
                        image: data.data.image || "",
                    })
                    return
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error)
            }

            // Fall back to Clerk user if DB fetch fails
            if (clerkUser) {
                setUserInfo({
                    name:
                        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
                        "User",
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                })
                return
            }

            // Otherwise, check for owner session
            try {
                const response = await fetch("/api/owner/verify-session")
                const data = await response.json()
                if (data.valid && data.name) {
                    setUserInfo({
                        name: data.name,
                        email: data.email || "",
                    })
                }
            } catch (error) {
                console.error("Failed to fetch user info:", error)
            }
        }
        fetchUserInfo()
    }, [clerkUser])

    const onLogout = async () => {
        // Clear owner session cookies
        document.cookie =
            "owner_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie =
            "owner_pending_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

        // If Clerk user, use Clerk signOut, otherwise just redirect
        if (clerkUser) {
            try {
                await signOut({ redirectUrl: "/sign-in" })
            } catch (error) {
                console.error("Clerk signOut error:", error)
                router.push("/sign-in")
            }
        } else {
            // Owner session - just redirect after clearing cookies
            router.push("/sign-in")
        }
    }

    // Use database image if available, otherwise fall back to prop
    const displayImage = userInfo.image || image

    return (
        <DropDown
            title={userInfo.name || "User"}
            subtitle={userInfo.email}
            trigger={
                <Avatar className="cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={displayImage} alt="user" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {userInfo.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
            }
        >
            <Link href="/account-settings">
                <Button
                    variant="ghost"
                    className="flex gap-x-3 px-2 justify-start w-full"
                >
                    <Settings className="h-4 w-4" />
                    Account Settings
                </Button>
            </Link>
            <Button
                onClick={onLogout}
                variant="ghost"
                className="flex gap-x-3 px-2 justify-start w-full text-red-500 hover:text-red-500 hover:bg-red-500/10"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </Button>
        </DropDown>
    )
}
