"use client"

import GradientText from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Users, BookOpen, MessageSquare, BarChart3, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
    return (
        <div className="min-h-screen pt-8 sm:pt-10 md:pt-12 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <GradientText
                        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center"
                        element="H1"
                    >
                        Simple, Transparent Pricing
                    </GradientText>
                    <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                        Everything you need to build and grow your community on NeXuS
                    </p>
                </div>

                {/* Single Pricing Card */}
                <Card className="relative overflow-hidden bg-card dark:bg-themeBlack border-border dark:border-themeGray ring-2 ring-primary shadow-glow max-w-lg mx-auto">
                    <div className="absolute top-0 right-0">
                        <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                            14 Days Free Trial
                        </Badge>
                    </div>
                    <CardHeader className="pb-4 pt-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Crown className="w-6 h-6 text-purple-500" />
                            </div>
                            <CardTitle className="text-2xl">Owner Plan</CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground text-base">
                            Build and monetize your community with all features included
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl text-muted-foreground">₹</span>
                            <span className="text-5xl font-bold">4,999</span>
                            <span className="text-muted-foreground text-lg">/month</span>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                            <p className="text-green-600 dark:text-green-400 font-medium">
                                Start with 14 days free trial
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                No charge until trial ends. Cancel anytime.
                            </p>
                        </div>

                        <Link href="/sign-up?tab=owner" className="block">
                            <Button
                                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                                size="lg"
                            >
                                Apply to Become an Owner
                            </Button>
                        </Link>

                        <div className="space-y-4 pt-6 border-t border-border dark:border-themeGray">
                            <p className="text-sm font-semibold text-foreground">
                                Everything included:
                            </p>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1 rounded bg-purple-500/10">
                                        <Users className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-foreground">Create unlimited groups</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1 rounded bg-purple-500/10">
                                        <BookOpen className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-foreground">Unlimited courses & modules</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1 rounded bg-purple-500/10">
                                        <MessageSquare className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-foreground">Real-time messaging & channels</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1 rounded bg-purple-500/10">
                                        <BarChart3 className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-foreground">Analytics dashboard</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1 rounded bg-purple-500/10">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-foreground">Custom subscription pricing for members</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1 rounded bg-purple-500/10">
                                        <Shield className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="text-foreground">Dedicated support</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Learner Section */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold mb-4">Want to join as a Learner?</h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                        Joining groups as a learner is free! Group owners may set their own pricing for premium content.
                    </p>
                    <Link href="/sign-up?tab=learner">
                        <Button variant="outline" className="rounded-xl" size="lg">
                            Sign Up as Learner - Free
                        </Button>
                    </Link>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold mb-4">Have Questions?</h2>
                    <p className="text-muted-foreground mb-6">
                        Check out our About page or contact us directly
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/about">
                            <Button variant="outline" className="rounded-xl">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
