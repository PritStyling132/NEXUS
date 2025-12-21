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
    Rocket,
    Star,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

// Bento Grid Items
const bentoItems = [
    {
        title: "Community Groups",
        description: "Create and join communities around shared interests",
        icon: Users,
        className: "md:col-span-2 md:row-span-2",
        gradient: "from-violet-500/20 via-purple-500/20 to-fuchsia-500/20",
        iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
    {
        title: "Video Courses",
        description: "Learn from expert-created content",
        icon: Video,
        className: "md:col-span-1",
        gradient: "from-cyan-500/20 via-teal-500/20 to-emerald-500/20",
        iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600",
    },
    {
        title: "Live Discussions",
        description: "Engage in real-time conversations",
        icon: MessageSquare,
        className: "md:col-span-1",
        gradient: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
        iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    },
    {
        title: "Secure Platform",
        description: "Your data is protected with enterprise security",
        icon: Shield,
        className: "md:col-span-1",
        gradient: "from-rose-500/20 via-pink-500/20 to-fuchsia-500/20",
        iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
    },
    {
        title: "Fast & Modern",
        description: "Built with cutting-edge technology",
        icon: Zap,
        className: "md:col-span-1",
        gradient: "from-indigo-500/20 via-violet-500/20 to-purple-500/20",
        iconBg: "bg-gradient-to-br from-indigo-500 to-violet-600",
    },
]

// Features comparison
const features = [
    {
        title: "Community-First Approach",
        description:
            "Build and nurture meaningful connections with like-minded individuals.",
        icon: Heart,
        color: "from-pink-500 to-rose-500",
    },
    {
        title: "Creator Economy",
        description:
            "Monetize your expertise and build a sustainable income stream.",
        icon: Trophy,
        color: "from-amber-500 to-orange-500",
    },
    {
        title: "Global Reach",
        description:
            "Connect with learners and creators from around the world.",
        icon: Globe,
        color: "from-cyan-500 to-blue-500",
    },
    {
        title: "Rich Content",
        description:
            "Access courses, discussions, and resources curated by experts.",
        icon: BookOpen,
        color: "from-violet-500 to-purple-500",
    },
]

// Stats
const stats = [
    { value: "10K+", label: "Active Learners", icon: Users },
    { value: "500+", label: "Communities", icon: Globe },
    { value: "1000+", label: "Courses", icon: BookOpen },
    { value: "50+", label: "Countries", icon: Star },
]

// Slider images - Online Teaching & Learning
const sliderImages = [
    {
        src: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&h=400&fit=crop",
        alt: "Teacher conducting online class",
        category: "Technology",
    },
    {
        src: "https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=600&h=400&fit=crop",
        alt: "Student learning from laptop",
        category: "Education",
    },
    {
        src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
        alt: "Online video conference learning",
        category: "Business",
    },
    {
        src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop",
        alt: "Student studying with notes",
        category: "Academic",
    },
    {
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
        alt: "Group online collaboration",
        category: "Teamwork",
    },
    {
        src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop",
        alt: "Professor teaching students",
        category: "University",
    },
    {
        src: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&h=400&fit=crop",
        alt: "Creative design learning",
        category: "Design",
    },
    {
        src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&h=400&fit=crop",
        alt: "Student with headphones learning",
        category: "Self-paced",
    },
    {
        src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
        alt: "Team workshop session",
        category: "Workshop",
    },
    {
        src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
        alt: "Business training session",
        category: "Corporate",
    },
]

// FAQs
const faqs = [
    {
        question: "What is Nexus?",
        answer: "Nexus is a modern community platform that enables creators to build, grow, and monetize their communities while providing learners with access to quality content and connections.",
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

// Floating 3D shapes component
const FloatingShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
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
        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20

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

export default function Home() {
    const [openFaq, setOpenFaq] = useState<number | null>(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="flex flex-col relative">
            {/* Hero Section with 3D Effects */}
            <section className="px-4 sm:px-6 md:px-10 lg:px-12 pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 relative overflow-hidden grid-bg">
                <FloatingShapes />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center">
                        {/* Animated Badge */}
                        <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            <Badge
                                variant="outline"
                                className="mb-6 px-4 py-2 border-primary/30 glass animate-pulse-glow"
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold">
                                    The Future of Learning Communities
                                </span>
                            </Badge>
                        </div>

                        {/* 3D Animated Title */}
                        <div className={`perspective-container ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                            <div className="hero-3d">
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
                            </div>
                        </div>

                        <p className={`text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 leading-relaxed ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                            Nexus is a vibrant online platform that empowers
                            communities to collaborate, learn, and cultivate
                            meaningful relationships
                        </p>

                        {/* Futuristic Buttons */}
                        <div className={`flex flex-col sm:flex-row items-center gap-4 mt-8 ${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
                            <Link href="/sign-up">
                                <Button
                                    size="lg"
                                    className="rounded-xl text-base gap-2 px-8 btn-futuristic text-white border-0"
                                >
                                    <Rocket className="w-5 h-5" /> Get
                                    Started Free
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl text-base gap-2 px-8 glass hover:bg-primary/10 transition-all"
                                >
                                    <Play className="w-5 h-5" /> Explore
                                    Communities
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* 3D Dashboard Preview */}
                    <div className={`mt-16 relative ${mounted ? 'animate-scale-in stagger-4' : 'opacity-0'}`}>
                        <Card3D>
                            <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-2xl glass animate-pulse-glow">
                                <div className="aspect-video bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-cyan-500/10 flex items-center justify-center relative overflow-hidden">
                                    {/* Animated Grid */}
                                    <div className="absolute inset-0 grid-bg opacity-50" />

                                    {/* Morphing Shape */}
                                    <div className="absolute w-64 h-64 bg-gradient-to-br from-primary/20 to-cyan-500/20 morph-shape" />

                                    <div className="text-center p-8 relative z-10">
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-float-3d shadow-lg">
                                            <Layers className="w-12 h-12 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
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
                        </Card3D>
                    </div>
                </div>
            </section>

            {/* Bento Grid Section with 3D Cards */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
                            <Zap className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            Features
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
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
                                <Card3D key={index} className={item.className}>
                                    <Card
                                        className={`h-full bg-card/50 glass border-primary/10 overflow-hidden group hover:border-primary/30 transition-all duration-500`}
                                    >
                                        <CardContent
                                            className={`p-6 h-full bg-gradient-to-br ${item.gradient} flex flex-col justify-end min-h-[200px] relative overflow-hidden`}
                                        >
                                            {/* Animated background */}
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                <div className="absolute inset-0 shimmer" />
                                            </div>

                                            <div className={`w-14 h-14 rounded-xl ${item.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Card3D>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Image Slider Section - Online Learning */}
            <section className="py-16 sm:py-20 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-cyan-500/5" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 relative z-10">
                    <div className="text-center">
                        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
                            <Globe className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            Learning Worldwide
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Join{" "}
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                Thousands
                            </span>{" "}
                            of Learners
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Teachers and students from around the world are transforming education on Nexus
                        </p>
                    </div>
                </div>

                {/* Infinite Scrolling Slider */}
                <div className="relative">
                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                    {/* Slider Track */}
                    <div className="flex animate-scroll-left hover:pause-animation">
                        {/* First set of images */}
                        {sliderImages.map((image, index) => (
                            <div
                                key={`first-${index}`}
                                className="flex-shrink-0 px-3"
                            >
                                <div className="relative w-[300px] h-[200px] rounded-2xl overflow-hidden group">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-gradient-to-r from-primary to-cyan-500 text-white border-0 text-xs">
                                            {image.category}
                                        </Badge>
                                    </div>
                                    {/* Caption */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-sm font-medium">{image.alt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Second set of images for seamless loop */}
                        {sliderImages.map((image, index) => (
                            <div
                                key={`second-${index}`}
                                className="flex-shrink-0 px-3"
                            >
                                <div className="relative w-[300px] h-[200px] rounded-2xl overflow-hidden group">
                                    <img
                                        src={image.src}
                                        alt={image.alt}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-gradient-to-r from-primary to-cyan-500 text-white border-0 text-xs">
                                            {image.category}
                                        </Badge>
                                    </div>
                                    {/* Caption */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-sm font-medium">{image.alt}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section with Glassmorphism */}
            <section className="py-16 border-y border-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-cyan-500/5" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <Card3D key={index}>
                                    <div className="text-center p-6 rounded-2xl glass hover:shadow-lg transition-all">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-3">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {stat.label}
                                        </div>
                                    </div>
                                </Card3D>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section with Colorful Cards */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
                            <Star className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            Why Choose Us
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Why Choose{" "}
                            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                Nexus
                            </span>
                            ?
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of creators and learners who trust
                            Nexus
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <Card3D key={index}>
                                    <Card
                                        className="bg-card/50 glass border-primary/10 hover:border-primary/30 transition-all group overflow-hidden"
                                    >
                                        <CardContent className="p-6 relative">
                                            {/* Gradient overlay on hover */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Card3D>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
                            <Trophy className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            Comparison
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            What Makes Us{" "}
                            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                                Different
                            </span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            See why creators and learners choose Nexus over
                            other platforms
                        </p>
                    </div>

                    <div className="space-y-4">
                        {differences.map((diff, index) => (
                            <Card3D key={index}>
                                <Card
                                    className="bg-card/50 glass border-primary/10 hover:border-primary/30 transition-all"
                                >
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                            <div className="font-semibold text-lg bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                                                {diff.title}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                <span className="text-foreground font-medium">
                                                    {diff.ours}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {diff.others}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Card3D>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            FAQ
                        </Badge>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                            Frequently Asked{" "}
                            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                                Questions
                            </span>
                        </h2>
                        <p className="text-muted-foreground">
                            Everything you need to know about Nexus
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <Card
                                key={index}
                                className="bg-card/50 glass border-primary/10 overflow-hidden"
                            >
                                <button
                                    className="w-full p-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                                    onClick={() =>
                                        setOpenFaq(
                                            openFaq === index ? null : index,
                                        )
                                    }
                                >
                                    <span className="font-medium pr-4">
                                        {faq.question}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-5 h-5 text-primary" />
                                    </div>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40' : 'max-h-0'}`}>
                                    <div className="px-5 pb-5">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section with 3D Effects */}
            <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Card3D>
                        <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-cyan-500/10 border-primary/20 overflow-hidden glass relative">
                            {/* Animated background */}
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 animate-gradient" />
                            </div>

                            <CardContent className="p-8 sm:p-12 text-center relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-float-3d shadow-lg">
                                    <Rocket className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                                    Ready to Start Your{" "}
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                        Journey
                                    </span>
                                    ?
                                </h2>
                                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                    Join thousands of learners and creators building
                                    their future on Nexus. Get started for free
                                    today.
                                </p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <Link href="/sign-up?tab=learner">
                                        <Button
                                            size="lg"
                                            className="rounded-xl gap-2 btn-futuristic text-white border-0"
                                        >
                                            Join as Learner{" "}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Link href="/sign-up?tab=owner">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="rounded-xl glass hover:bg-primary/10"
                                        >
                                            Become an Owner
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
