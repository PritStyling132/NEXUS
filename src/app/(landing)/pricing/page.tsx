"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Crown,
    Users,
    BookOpen,
    MessageSquare,
    BarChart3,
    Shield,
    Sparkles,
    Zap,
    Check,
    Rocket,
    Gift,
    Star,
    ArrowRight,
} from "lucide-react"
import Link from "next/link"

// Floating particles component
const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating particles */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={i}
                    className="particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 10}s`,
                        animationDuration: `${10 + Math.random() * 10}s`,
                    }}
                />
            ))}
        </div>
    )
}

// 3D Card Component
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const [transform, setTransform] = useState("")

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 30
        const rotateY = (centerX - x) / 30

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`)
    }

    const handleMouseLeave = () => {
        setTransform("")
    }

    return (
        <div
            className={`transition-all duration-300 ease-out ${className}`}
            style={{ transform }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    )
}

const features = [
    {
        icon: Users,
        title: "Create unlimited groups",
        description: "Build as many communities as you want",
    },
    {
        icon: BookOpen,
        title: "Unlimited courses & modules",
        description: "Create comprehensive learning paths",
    },
    {
        icon: MessageSquare,
        title: "Real-time messaging & channels",
        description: "Engage with your community instantly",
    },
    {
        icon: BarChart3,
        title: "Analytics dashboard",
        description: "Track growth and engagement metrics",
    },
    {
        icon: Sparkles,
        title: "Custom subscription pricing",
        description: "Set your own prices for members",
    },
    {
        icon: Shield,
        title: "Dedicated support",
        description: "Priority assistance when you need it",
    },
]

export default function PricingPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="min-h-screen relative">
            {/* Hero Section */}
            <section className="relative overflow-hidden grid-bg pt-8 sm:pt-10 md:pt-12 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
                <FloatingShapes />

                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-12 sm:mb-16">
                        {/* Animated Badge */}
                        <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            <Badge
                                variant="outline"
                                className="mb-6 px-4 py-2 border-primary/30 glass animate-pulse-glow"
                            >
                                <Zap className="w-4 h-4 mr-2 text-primary" />
                                <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
                                    Simple & Transparent
                                </span>
                            </Badge>
                        </div>

                        {/* 3D Animated Title */}
                        <div className={`perspective-container ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                            <div className="hero-3d">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                    Simple, Transparent Pricing
                                </h1>
                            </div>
                        </div>

                        <p className={`text-base sm:text-lg text-muted-foreground mt-6 max-w-2xl mx-auto ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                            Everything you need to build and grow your community on Nexus
                        </p>
                    </div>

                    {/* Pricing Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Learner Card */}
                        <div className={`${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
                            <Card3D>
                                <Card className="h-full glass border-primary/20 hover:border-primary/40 transition-all overflow-hidden">
                                    <CardHeader className="pb-4 pt-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">Learner</CardTitle>
                                                <CardDescription>Join communities for free</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Free</span>
                                            <span className="text-muted-foreground text-lg">forever</span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span>Join unlimited free groups</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span>Access free courses</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span>Participate in discussions</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                                <span>Connect with community</span>
                                            </div>
                                        </div>

                                        <Link href="/sign-up?tab=learner" className="block">
                                            <Button
                                                className="w-full rounded-xl glass border-primary/30 hover:bg-primary/10 transition-all"
                                                variant="outline"
                                                size="lg"
                                            >
                                                Get Started Free
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </Card3D>
                        </div>

                        {/* Owner Plan Card */}
                        <div className={`${mounted ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
                            <Card3D>
                                <Card className="h-full glass border-primary/30 hover:border-primary/50 transition-all overflow-hidden relative">
                                    {/* Popular Badge */}
                                    <div className="absolute top-0 right-0">
                                        <Badge className="rounded-none rounded-bl-xl bg-gradient-to-r from-primary to-cyan-500 text-white border-0 px-4 py-1.5">
                                            <Gift className="w-3.5 h-3.5 mr-1.5" />
                                            14 Days Free Trial
                                        </Badge>
                                    </div>

                                    <CardHeader className="pb-4 pt-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg animate-pulse-glow">
                                                <Crown className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl">Owner Plan</CardTitle>
                                                <CardDescription>Build & monetize your community</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl text-muted-foreground">₹</span>
                                            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">4,999</span>
                                            <span className="text-muted-foreground text-lg">/month</span>
                                        </div>

                                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                                            <p className="text-green-600 dark:text-green-400 font-medium text-sm">
                                                Start with 14 days free trial
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                No charge until trial ends
                                            </p>
                                        </div>

                                        <Link href="/sign-up?tab=owner" className="block">
                                            <Button
                                                className="w-full rounded-xl btn-futuristic text-white border-0"
                                                size="lg"
                                            >
                                                <Rocket className="w-4 h-4 mr-2" />
                                                Apply to Become an Owner
                                            </Button>
                                        </Link>

                                        <p className="text-xs text-center text-muted-foreground">
                                            Cancel anytime. No hidden fees.
                                        </p>
                                    </CardContent>
                                </Card>
                            </Card3D>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 glass">
                            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            Owner Benefits
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            Everything Included in{" "}
                            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                                Owner Plan
                            </span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            All the tools you need to build a thriving community
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Card3D>
                                        <Card className="h-full glass border-primary/10 hover:border-primary/30 transition-all">
                                            <CardContent className="p-6">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="font-semibold mb-1">{feature.title}</h3>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </CardContent>
                                        </Card>
                                    </Card3D>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <Card3D>
                        <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-cyan-500/10 border-primary/20 overflow-hidden glass relative">
                            {/* Animated background */}
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 animate-gradient" />
                            </div>

                            <CardContent className="p-8 sm:p-12 text-center relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-float-3d shadow-lg">
                                    <MessageSquare className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                                    Have{" "}
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                        Questions
                                    </span>
                                    ?
                                </h2>
                                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                    Learn more about Nexus and how it can help you build your community
                                </p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <Link href="/about">
                                        <Button
                                            size="lg"
                                            className="rounded-xl btn-futuristic text-white border-0"
                                        >
                                            Learn More
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                    <Link href="/explore">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="rounded-xl glass hover:bg-primary/10"
                                        >
                                            Explore Communities
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </Card3D>
                </div>
            </section>
        </div>
    )
}
