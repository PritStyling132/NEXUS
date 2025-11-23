"use client"

import GlassSheet from "@/components/global/glass-sheet"
import { ThemeToggle } from "@/components/global/theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, MenuIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import Menu from "./menu"

type Props = {}

const LandingPageNavbar: React.FC<Props> = () => {
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

            {/* Right Controls (Theme Toggle + Login + Mobile Menu) */}
            <div className="flex gap-2 items-center">
                {/* Theme Toggle - visible on all screens */}
                <ThemeToggle />

                {/* Login Button - hidden on very small screens */}
                <Link href="/sign-in" className="hidden sm:block">
                    <Button
                        variant="outline"
                        className="bg-primary/10 dark:bg-themeBlack text-foreground dark:text-white rounded-2xl flex gap-2 border-border dark:border-themeGray hover:bg-primary/20 dark:hover:bg-themeGray transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="hidden md:inline">Login</span>
                    </Button>
                </Link>

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
                        {/* Mobile Login Button */}
                        <Link href="/sign-in" className="block sm:hidden mt-4">
                            <Button
                                variant="outline"
                                className="w-full bg-primary/10 dark:bg-themeBlack text-foreground dark:text-white rounded-2xl flex gap-2 justify-center border-border dark:border-themeGray hover:bg-primary/20 dark:hover:bg-themeGray"
                            >
                                <LogOut size={18} />
                                Login
                            </Button>
                        </Link>
                    </div>
                </GlassSheet>
            </div>
        </div>
    )
}

export default LandingPageNavbar
