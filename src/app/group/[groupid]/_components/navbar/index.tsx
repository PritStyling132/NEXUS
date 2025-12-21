import GlassSheet from "@/components/global/glass-sheet"
import Search from "@/components/global/search"
import SideBar from "@/components/global/sidebar"
import { UserWidget } from "@/components/global/user-widget"
import { Button } from "@/components/ui/button"
import { currentUser } from "@clerk/nextjs/server"
import { Menu, Home, Plus } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/global/theme-toggle"

type NavbarProps = {
    groupid: string
    userid: string
}

export const Navbar = async ({ groupid, userid }: NavbarProps) => {
    const user = await currentUser()
    return (
        <div className="bg-background/80 dark:bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-border/50 dark:border-white/[0.05] py-3 px-4 md:px-7 md:py-4 flex gap-3 md:gap-5 items-center sticky top-0 z-40">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

            {/* Left side - Mobile menu and Home button */}
            <div className="relative flex items-center gap-2">
                <GlassSheet
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-xl hover:bg-accent/50 dark:hover:bg-white/[0.05] transition-colors"
                        >
                            <Menu className="cursor-pointer w-5 h-5" />
                        </Button>
                    }
                    triggerClass=""
                >
                    <SideBar groupid={groupid} userid={userid} mobile />
                </GlassSheet>

                {/* Home button to go back to group home - Left side */}
                <Link href={`/group/${groupid}`}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 dark:hover:from-primary/20 dark:hover:to-purple-500/20 transition-all duration-300 group"
                        title="Go to Group Home"
                    >
                        <Home className="h-5 w-5 group-hover:text-primary transition-colors" />
                    </Button>
                </Link>
            </div>

            {/* Center - Search */}
            <div className="relative flex-1 flex justify-center">
                <Search
                    searchType="GROUPS"
                    className="rounded-xl border-border/50 dark:border-white/[0.05] bg-muted/50 dark:bg-white/[0.02] !opacity-100 px-4 w-full max-w-md focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300"
                    placeholder="Search groups..."
                />
            </div>

            {/* Right side - Create Group, Theme toggle and User widget */}
            <div className="relative flex items-center gap-2">
                <Link href="/group/create" className="hidden md:inline group">
                    <Button
                        size="sm"
                        className="relative gap-2 rounded-xl bg-gradient-to-r from-primary via-purple-500 to-cyan-500 hover:opacity-90 text-white border-0 shadow-lg shadow-primary/25 px-4 transition-all duration-300 overflow-hidden"
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Plus className="h-4 w-4 relative" />
                        <span className="relative">Create Group</span>
                    </Button>
                </Link>
                <ThemeToggle />
                <UserWidget
                    userid={userid}
                    image={user?.imageUrl!}
                    groupid={groupid}
                />
            </div>
        </div>
    )
}
