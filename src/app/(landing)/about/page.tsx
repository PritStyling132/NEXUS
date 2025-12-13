"use client"

import BackdropGradient from "@/components/global/backdrop-gradient"
import GradientText from "@/components/global/gradient-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    BookOpen,
    Globe,
    Shield,
    Zap,
    Heart,
    Target,
    Award,
    ArrowRight,
    CheckCircle2,
} from "lucide-react"
import Link from "next/link"

const features = [
    {
        icon: Users,
        title: "Community-First",
        description:
            "Build and join thriving communities of like-minded learners and creators.",
    },
    {
        icon: BookOpen,
        title: "Rich Content",
        description:
            "Access courses, discussions, and resources curated by industry experts.",
    },
    {
        icon: Globe,
        title: "Global Reach",
        description:
            "Connect with people from around the world and expand your network.",
    },
    {
        icon: Shield,
        title: "Secure Platform",
        description:
            "Your data and payments are protected with enterprise-grade security.",
    },
    {
        icon: Zap,
        title: "Fast & Modern",
        description:
            "Built with cutting-edge technology for a seamless user experience.",
    },
    {
        icon: Heart,
        title: "Creator-Friendly",
        description:
            "Monetize your expertise and build a sustainable income stream.",
    },
]

const stats = [
    { value: "10K+", label: "Active Learners" },
    { value: "500+", label: "Communities" },
    { value: "1000+", label: "Courses" },
    { value: "50+", label: "Countries" },
]

const comparisons = [
    {
        feature: "Community Building",
        nexus: true,
        others: "Limited",
    },
    {
        feature: "Course Creation",
        nexus: true,
        others: "Basic",
    },
    {
        feature: "Monetization",
        nexus: true,
        others: "Platform fees",
    },
    {
        feature: "Custom Branding",
        nexus: true,
        others: "No",
    },
    {
        feature: "Analytics Dashboard",
        nexus: true,
        others: "Basic",
    },
    {
        feature: "API Access",
        nexus: true,
        others: "No",
    },
]

const faqs = [
    {
        question: "What is NeXuS?",
        answer: "NeXuS is a modern community platform that enables creators to build, grow, and monetize their communities while providing learners with access to quality content and connections.",
    },
    {
        question: "How do I become an Owner?",
        answer: "You can apply to become an Owner by clicking 'Apply to become an owner' on our sign-up page. Our team will review your application within 24-48 hours.",
    },
    {
        question: "Is there a free plan?",
        answer: "Yes! Learners can join up to 3 communities for free and access free courses. Upgrade to Pro for unlimited access.",
    },
    {
        question: "How does monetization work?",
        answer: "Owners can charge for membership, courses, and exclusive content. We handle payments through Razorpay with competitive revenue sharing.",
    },
    {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel anytime from your account settings. Your access continues until the end of your billing period.",
    },
]

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <BackdropGradient className="w-10/12 h-full opacity-40 flex flex-col items-center mx-auto">
                        <Badge
                            variant="outline"
                            className="mb-4 px-4 py-1 border-primary/30"
                        >
                            About NeXuS
                        </Badge>
                        <GradientText
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
                            element="H1"
                        >
                            Empowering Communities
                        </GradientText>
                        <GradientText
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
                            element="H1"
                        >
                            to Learn & Grow Together
                        </GradientText>
                        <p className="text-lg sm:text-xl text-muted-foreground mt-6 max-w-3xl mx-auto leading-relaxed">
                            NeXuS is a vibrant online community platform that
                            empowers people to connect, learn, and cultivate
                            meaningful relationships through shared knowledge
                            and experiences.
                        </p>
                        <div className="flex gap-4 mt-8 flex-wrap justify-center">
                            <Link href="/sign-up">
                                <Button size="lg" className="rounded-xl gap-2">
                                    Get Started{" "}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-xl"
                                >
                                    Explore Communities
                                </Button>
                            </Link>
                        </div>
                    </BackdropGradient>
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

            {/* Features Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            Why Choose NeXuS?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to build, grow, and monetize
                            your community
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <Card
                                    key={index}
                                    className="bg-card dark:bg-themeBlack border-border dark:border-themeGray hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
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
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-themeBlack/50">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            NeXuS vs Other Platforms
                        </h2>
                        <p className="text-muted-foreground">
                            See why creators and learners choose NeXuS
                        </p>
                    </div>
                    <Card className="bg-card dark:bg-themeBlack border-border dark:border-themeGray overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border dark:border-themeGray">
                                        <th className="text-left p-4 font-medium">
                                            Feature
                                        </th>
                                        <th className="text-center p-4 font-medium text-primary">
                                            NeXuS
                                        </th>
                                        <th className="text-center p-4 font-medium text-muted-foreground">
                                            Others
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisons.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-border dark:border-themeGray last:border-0"
                                        >
                                            <td className="p-4 text-sm">
                                                {item.feature}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.nexus === true ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        {item.nexus}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center text-sm text-muted-foreground">
                                                {item.others}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Everything you need to know about NeXuS
                        </p>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <Card
                                key={index}
                                className="bg-card dark:bg-themeBlack border-border dark:border-themeGray"
                            >
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-2">
                                        {faq.question}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {faq.answer}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
                <div className="max-w-3xl mx-auto text-center">
                    <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Join thousands of learners and creators building their
                        future on NeXuS
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/sign-up?tab=learner">
                            <Button size="lg" className="rounded-xl">
                                Join as Learner
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
                </div>
            </section>
        </div>
    )
}
