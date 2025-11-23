"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { useClerk, useUser } from "@clerk/nextjs"
import { LogOut, Moon, Sun, Monitor } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export function UserMenu() {
    const { user } = useUser()
    const { signOut } = useClerk()
    const router = useRouter()
    const { theme, setTheme } = useTheme()

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success("Signed out successfully")
            router.push("/sign-in")
        } catch (error) {
            console.error("Sign out error:", error)
            toast.error("Failed to sign out")
        }
    }

    if (!user) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="p-0 rounded-full h-10 w-10 hover:opacity-80 transition-opacity"
                >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-lg">
                        {user.firstName?.[0] ||
                            user.emailAddresses[0].emailAddress[0].toUpperCase()}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.emailAddresses[0].emailAddress}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Theme Submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        {theme === "light" ? (
                            <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                        ) : theme === "dark" ? (
                            <Moon className="mr-2 h-4 w-4 text-blue-400" />
                        ) : (
                            <Monitor className="mr-2 h-4 w-4" />
                        )}
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4 text-yellow-500" />
                            <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4 text-blue-400" />
                            <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>System</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

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
