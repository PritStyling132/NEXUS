import { ThemeToggle } from "@/components/global/theme-toggle"
import { UserMenu } from "@/components/global/user-menu"
import { Footer } from "@/components/global/footer"
import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
                    <Link href="/dashboard">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                            Nexus.
                        </h2>
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
