"use client"

import GradientText from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    BadgePlus,
    Play,
    Users,
    BookOpen,
    Video,
    MessageSquare,
    Shield,
    Zap,
    Globe,
    Heart,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Sparkles,
    Trophy,
    Target,
    Layers,
    CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Bento Grid Items
const bentoItems = [
    {
        title: "Community Groups",
        description: "Create and join communities around shared interests",
        icon: Users,
        className: "md:col-span-2 md:row-span-2",
        gradient: "from-blue-500/20 to-purple-500/20",
    },
    {
        title: "Video Courses",
        description: "Learn from expert-created content",
        icon: Video,
        className: "md:col-span-1",
        gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
        title: "Live Discussions",
        description: "Engage in real-time conversations",
        icon: MessageSquare,
        className: "md:col-span-1",
        gradient: "from-orange-500/20 to-yellow-500/20",
    },
    {
        title: "Secure Platform",
        description: "Your data is protected with enterprise security",
        icon: Shield,
        className: "md:col-span-1",
        gradient: "from-red-500/20 to-pink-500/20",
    },
    {
        title: "Fast & Modern",
        description: "Built with cutting-edge technology",
        icon: Zap,
        className: "md:col-span-1",
        gradient: "from-violet-500/20 to-indigo-500/20",
    },
]

// Features comparison
const features = [
    {
        title: "Community-First Approach",
        description:
            "Build and nurture meaningful connections with like-minded individuals.",
        icon: Heart,
    },
    {
        title: "Creator Economy",
        description:
            "Monetize your expertise and build a sustainable income stream.",
        icon: Trophy,
    },
    {
        title: "Global Reach",
        description:
            "Connect with learners and creators from around the world.",
        icon: Globe,
    },
    {
        title: "Rich Content",
        description:
            "Access courses, discussions, and resources curated by experts.",
        icon: BookOpen,
    },
]

// Stats
const stats = [
    { value: "10K+", label: "Active Learners" },
    { value: "500+", label: "Communities" },
    { value: "1000+", label: "Courses" },
    { value: "50+", label: "Countries" },
]

// FAQs
const faqs = [
    {
        question: "What is NeXuS?",
        answer: "NeXuS is a modern community platform that enables creators to build, grow, and monetize their communities while providing learners with access to quality content and connections.",
    },
    {
        question: "How do I get started?",
        answer: "Simply sign up as a learner for free and start exploring communities. You can join up to 3 communities on the free plan and access free courses.",
    },
    {
        question: "Can I become an Owner?",
        answer: "Yes! You can apply to become an Owner by clicking 'Apply to become an owner' on our sign-up page. Our team will review your application within 24-48 hours.",
    },
    {
        question: "Is there a free plan?",
        answer: "Yes! Learners can join up to 3 communities for free and access free courses. Upgrade to Pro for unlimited access and premium features.",
    },
    {
        question: "How does monetization work for Owners?",
        answer: "Owners can charge for membership, courses, and exclusive content. We handle payments through Razorpay with competitive revenue sharing.",
    },
]

// Differences from other platforms
const differences = [
    {
        title: "Community-Centric",
        ours: "Built around communities first, not just courses",
        others: "Primarily course-focused platforms",
    },
    {
        title: "Creator Freedom",
        ours: "Full control over pricing and content",
        others: "Platform-controlled pricing and restrictions",
    },
    {
        title: "Revenue Share",
        ours: "Competitive rates with transparent pricing",
        others: "High platform fees and hidden charges",
    },
    {
        title: "Customization",
        ours: "Custom branding and domain support",
        others: "Limited to platform templates",
    },
]

export default function Home() {
    const [openFaq, setOpenFaq] = useState<number | null>(0)

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="px-4 sm:px-6 md:px-10 lg:px-12 pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <Badge
                            variant="outline"
                            className="mb-6 px-4 py-1.5 border-primary/30"
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            The Future of Learning Communities
                        </Badge>
                        <GradientText
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight font-bold"
                            element="H1"
                        >
                            Bringing Communities
                        </GradientText>
                        <GradientText
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight font-bold"
                            element="H1"
                        >
                            Together
                        </GradientText>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 leading-relaxed">
                            NeXuS is a vibrant online platform that empowers
                            communities to collaborate, learn, and cultivate
                            meaningful relationships
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                            <Link href="/sign-up">
                                <Button
                                    size="lg"
                                    className="rounded-xl text-base gap-2 shadow-lg hover:shadow-xl transition-all px-8"
                                >
                                    <BadgePlus className="w-5 h-5" /> Get
                                    Started Free
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl text-base gap-2 px-8"
                                >
                                    <Play className="w-5 h-5" /> Explore
                                    Communities
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="mt-16 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="rounded-2xl overflow-hidden border border-border dark:border-themeGray shadow-2xl bg-card dark:bg-themeBlack">
                            <div className="aspect-video bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 flex items-center justify-center">
                                <div className="text-center p-8">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <Layers className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        Platform Preview
                                    </h3>
                                    <p className="text-muted-foreground text-sm max-w-md">
                                        Experience our intuitive dashboard,
                                        course builder, and community management
                                        tools
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-y border-border dark:border-themeGray bg-muted/30 dark:bg-themeBlack/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bento Grid Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            A complete platform for building, growing, and
                            monetizing your community
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {bentoItems.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <Card
                                    key={index}
                                    className={`${item.className} bg-card dark:bg-themeBlack border-border dark:border-themeGray overflow-hidden group hover:border-primary/50 transition-all duration-300`}
                                >
                                    <CardContent
                                        className={`p-6 h-full bg-gradient-to-br ${item.gradient} flex flex-col justify-end min-h-[200px]`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-background/80 dark:bg-themeBlack/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-themeBlack/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Why Choose NeXuS?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of creators and learners who trust
                            NeXuS
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <Card
                                    key={index}
                                    className="bg-card dark:bg-themeBlack border-border dark:border-themeGray hover:border-primary/50 transition-all group"
                                >
                                    <CardContent className="p-6">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                            <Icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            What Makes Us Different
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            See why creators and learners choose NeXuS over
                            other platforms
                        </p>
                    </div>

                    <div className="space-y-4">
                        {differences.map((diff, index) => (
                            <Card
                                key={index}
                                className="bg-card dark:bg-themeBlack border-border dark:border-themeGray"
                            >
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div className="font-semibold text-lg">
                                            {diff.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-foreground">
                                                {diff.ours}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {diff.others}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-themeBlack/50">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Everything you need to know about NeXuS
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <Card
                                key={index}
                                className="bg-card dark:bg-themeBlack border-border dark:border-themeGray overflow-hidden"
                            >
                                <button
                                    className="w-full p-5 flex items-center justify-between text-left hover:bg-muted/50 dark:hover:bg-themeGray/30 transition-colors"
                                    onClick={() =>
                                        setOpenFaq(
                                            openFaq === index ? null : index,
                                        )
                                    }
                                >
                                    <span className="font-medium pr-4">
                                        {faq.question}
                                    </span>
                                    {openFaq === index ? (
                                        <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-5">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20 overflow-hidden">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                Join thousands of learners and creators building
                                their future on NeXuS. Get started for free
                                today.
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <Link href="/sign-up?tab=learner">
                                    <Button
                                        size="lg"
                                        className="rounded-xl gap-2"
                                    >
                                        Join as Learner{" "}
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="/sign-up?tab=owner">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-xl"
                                    >
                                        Become an Owner
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
