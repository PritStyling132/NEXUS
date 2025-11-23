// import { GlassSheet } from "@/components/global/glass-sheet"
// import Search from "@/components/global/search"

// import { SideBar } from "@/components/global/sidebar"
// import { UserWidget } from "@/components/global/user-widget"
// import { Button } from "@/components/ui/button"
// import { CheckBadge } from "@/icons"
// import { currentUser } from "@clerk/nextjs/server"
// import { Menu } from "lucide-react"
// import Link from "next/link"

// type NavbarProps = {
//   groupid: string
//   userid: string
// }

// export const Navbar = async ({ groupid, userid }: NavbarProps) => {
//   const user = await currentUser()
//   return (
//     <div className="bg-[#1A1A1D] py-2 px-3 md:px-7 md:py-5 flex gap-5 justify-between md:justify-end items-center">
//       <GlassSheet trigger={<Menu className="md:hidden cursor-pointer" />}>
//         <SideBar groupid={groupid} userid={userid} mobile />
//       </GlassSheet>
//       <Search
//         searchType="POSTS"
//         className="rounded-full border-themeGray bg-black !opacity-100 px-3"
//         placeholder="Search..."
//       />
//       <Link href={/group/create} className="hidden md:inline">
//         <Button
//           variant="outline"
//           className="bg-themeBlack rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray"
//         >
//           <CheckBadge />
//           Create Group
//         </Button>
//       </Link>
//
//     </div>
//   )
// }

import GlassSheet from "@/components/global/glass-sheet"
import Search from "@/components/global/search"
import SideBar from "@/components/global/sidebar"
import { UserWidget } from "@/components/global/user-widget"
import { Button } from "@/components/ui/button"
import { currentUser } from "@clerk/nextjs/server"
import { BadgeCheck, Menu } from "lucide-react"
import Link from "next/link"

type NavbarProps = {
    groupid: string
    userid: string
}

export const Navbar = async ({ groupid, userid }: NavbarProps) => {
    const user = await currentUser()
    return (
        <div className="bg-background/95 dark:bg-[#1A1A1D] backdrop-blur-sm border-b border-border dark:border-[#28282D] py-3 px-4 md:px-7 md:py-5 flex gap-3 md:gap-5 justify-between md:justify-end items-center sticky top-0 z-40">
            <GlassSheet
                trigger={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-accent dark:hover:bg-transparent"
                    >
                        <Menu className="cursor-pointer w-5 h-5" />
                    </Button>
                }
                triggerClass=""
            >
                <SideBar groupid={groupid} userid={userid} mobile />
            </GlassSheet>
            <Search
                searchType="GROUPS"
                className="rounded-full border-border dark:border-themeGray bg-background dark:bg-black !opacity-100 px-3 flex-1 md:flex-initial"
                placeholder="Search groups..."
            />
            <Link href="/group/create" className="hidden lg:inline">
                <Button
                    variant="outline"
                    className="bg-background dark:bg-themeBlack rounded-2xl flex gap-2 border-border dark:border-themeGray hover:bg-accent dark:hover:bg-themeGray transition-colors"
                >
                    <BadgeCheck className="h-4 w-4" />
                    <span className="hidden xl:inline">Create Group</span>
                </Button>
            </Link>

            <UserWidget
                userid={userid}
                image={user?.imageUrl!}
                groupid={groupid}
            />
        </div>
    )
}
