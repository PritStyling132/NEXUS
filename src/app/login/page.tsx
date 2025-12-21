import Link from "next/link"
import { Users, Briefcase, Shield } from "lucide-react"

export default function LoginChoicePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link href="/">
                        <h2 className="text-2xl font-bold">Nexus.</h2>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">
                            Welcome to Nexus
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Choose how you want to sign in
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Learner Login */}
                        <Link href="/sign-in" className="group">
                            <div className="border rounded-xl p-8 text-center hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">
                                    Learner
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                    Join groups, watch courses, and connect with
                                    communities
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium group-hover:bg-blue-700 transition-colors">
                                        Sign In as Learner
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Owner Login */}
                        <Link href="/owner/login" className="group">
                            <div className="border rounded-xl p-8 text-center hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">
                                    Owner
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                    Create and manage your own groups, courses,
                                    and communities
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium group-hover:bg-purple-700 transition-colors">
                                        Sign In as Owner
                                    </span>
                                </div>
                            </div>
                        </Link>

                        {/* Admin Login */}
                        <Link href="/admin/login" className="group">
                            <div className="border rounded-xl p-8 text-center hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">
                                    Admin
                                </h3>
                                <p className="text-muted-foreground text-sm mb-6 flex-grow">
                                    Platform administration and owner
                                    application management
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-medium group-hover:bg-red-700 transition-colors">
                                        Sign In as Admin
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Additional Links */}
                    <div className="mt-12 text-center space-y-4">
                        <p className="text-muted-foreground">New to Nexus?</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/sign-up"
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Create a Learner Account
                            </Link>
                            <span className="hidden sm:inline text-muted-foreground">
                                |
                            </span>
                            <Link
                                href="/owner/register"
                                className="text-purple-600 hover:underline font-medium"
                            >
                                Apply to Become an Owner
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
