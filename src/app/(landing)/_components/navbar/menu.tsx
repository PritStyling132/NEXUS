"use client"

import { Card, CardContent } from "@/components/ui/card"
import { NEXUS_CONSTANTS } from "@/constants"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

type Props = {
    orientation: "mobile" | "desktop"
}

const Menu: React.FC<Props> = ({ orientation }) => {
    const pathname = usePathname()

    // Check if current path matches menu item
    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/"
        }
        return pathname.startsWith(path)
    }

    switch (orientation) {
        case "desktop":
            return (
                <Card className="bg-muted/50 dark:bg-themeGray border-border dark:border-themeGray bg-clip-padding backdrop-filter backdrop-blur-2xl bg-opacity-60 p-1 lg:flex hidden rounded-xl">
                    <CardContent className="p-0 flex gap-2">
                        {NEXUS_CONSTANTS.landingPageMenu.map((menuItem) => (
                            <Link
                                href={menuItem.path}
                                key={menuItem.id}
                                className={cn(
                                    "rounded-xl flex gap-2 px-4 py-2 items-center transition-colors duration-200 text-sm font-medium",
                                    isActive(menuItem.path)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800/50",
                                )}
                            >
                                {isActive(menuItem.path) && menuItem.icon}
                                {menuItem.label}
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            )

        case "mobile":
            return (
                <div className="flex flex-col gap-2">
                    {NEXUS_CONSTANTS.landingPageMenu.map((menuItem) => (
                        <Link
                            href={menuItem.path}
                            key={menuItem.id}
                            className={cn(
                                "rounded-xl flex gap-3 px-4 py-3 items-center transition-colors duration-200 text-sm font-medium",
                                isActive(menuItem.path)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-zinc-800/50",
                            )}
                        >
                            {menuItem.icon}
                            {menuItem.label}
                        </Link>
                    ))}
                </div>
            )

        default:
            return <></>
    }
}

export default Menu
