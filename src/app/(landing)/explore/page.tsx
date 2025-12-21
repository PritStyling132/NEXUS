"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Code2,
    Briefcase,
    GraduationCap,
    Music,
    Heart,
    Coffee,
    Grid3x3,
    Plus,
    Sparkles,
    Compass,
    Globe,
    Rocket,
} from "lucide-react"
import GroupCard from "./_components/group-card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

const CATEGORIES = [
    { name: "All", icon: Grid3x3 },
    { name: "Technology", icon: Code2 },
    { name: "Business", icon: Briefcase },
    { name: "Education", icon: GraduationCap },
    { name: "Entertainment", icon: Music },
    { name: "Health & Fitness", icon: Heart },
    { name: "Lifestyle", icon: Coffee },
    { name: "Other", icon: Grid3x3 },
]

type Group = {
    id: string
    userId: string
    thumbnail: string | null
    name: string
    category: string
    description: string | null
    privacy: "PUBLIC" | "PRIVATE"
    _count: {
        members: number
    }
}

type PaginationInfo = {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
}

// Floating 3D shapes component
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
        const rotateX = (y - centerY) / 25
        const rotateY = (centerX - x) / 25

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

export default function ExplorePage() {
    const { isSignedIn } = useUser()
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 12,
        totalCount: 0,
        totalPages: 0,
        hasMore: false,
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Fetch groups
    const fetchGroups = useCallback(
        async (page: number = 1) => {
            try {
                setLoading(true)
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: "12",
                    search: debouncedSearch,
                    category: selectedCategory,
                })

                const response = await fetch(`/api/groups/explore?${params}`)
                const data = await response.json()

                if (data.success) {
                    setGroups(data.groups)
                    setPagination(data.pagination)
                }
            } catch (error) {
                console.error("Error fetching groups:", error)
            } finally {
                setLoading(false)
            }
        },
        [debouncedSearch, selectedCategory],
    )

    // Fetch groups when search or category changes
    useEffect(() => {
        fetchGroups(1)
    }, [fetchGroups])

    // Handle page change
    const handlePageChange = (newPage: number) => {
        fetchGroups(newPage)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="min-h-screen bg-background relative">
            {/* Hero Section with 3D Effects */}
            <section className="relative overflow-hidden grid-bg py-16">
                <FloatingShapes />

                <div className="w-full relative z-10">
                    {/* Header Section - Centered */}
                    <div className="max-w-4xl mx-auto text-center mb-8 px-4">
                        {/* Animated Badge */}
                        <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                            <Badge
                                variant="outline"
                                className="mb-6 px-4 py-2 border-primary/30 glass animate-pulse-glow"
                            >
                                <Compass className="w-4 h-4 mr-2 text-primary animate-spin" style={{ animationDuration: '3s' }} />
                                <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
                                    Discover Amazing Communities
                                </span>
                            </Badge>
                        </div>

                        {/* 3D Animated Title */}
                        <div className={`perspective-container ${mounted ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
                            <div className="hero-3d">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                    Explore Communities
                                </h1>
                            </div>
                        </div>

                        <p className={`text-lg text-muted-foreground mb-8 max-w-2xl mx-auto ${mounted ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
                            Discover and join amazing communities around the world. Find your tribe and start learning together.
                        </p>

                        {/* Create Your Own Group CTA - Only show for non-logged-in users */}
                        {!isSignedIn && (
                            <div className={`${mounted ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
                                <Link href="/sign-in?redirect_url=/group/create">
                                    <Button
                                        size="lg"
                                        className="btn-futuristic text-white border-0 rounded-xl gap-2 px-8"
                                    >
                                        <Rocket className="w-5 h-5" />
                                        Create Your Own Group
                                        <Sparkles className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Search Bar - Centered with Glass Effect */}
                    <div className={`max-w-2xl mx-auto mb-12 px-4 ${mounted ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
                        <Card3D>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                                    <Search className="text-white h-5 w-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Search groups by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-16 h-14 text-base glass border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl shadow-lg"
                                />
                            </div>
                        </Card3D>
                    </div>

                    {/* Category Filter - Infinite Horizontal Scroll Animation */}
                    <div className="mb-12 overflow-hidden">
                        <div className="relative">
                            {/* Gradient Overlays */}
                            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                            {/* Scrolling Categories */}
                            <div className="flex animate-scroll-left hover:pause-animation">
                                {/* First set */}
                                {CATEGORIES.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <div
                                            key={`first-${category.name}`}
                                            className="flex-shrink-0 px-2"
                                        >
                                            <Badge
                                                variant={
                                                    selectedCategory ===
                                                    category.name
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={cn(
                                                    "cursor-pointer px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-110 flex items-center gap-2",
                                                    selectedCategory ===
                                                        category.name
                                                        ? "bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg scale-110 border-0"
                                                        : "glass border-primary/20 hover:border-primary/50",
                                                )}
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        category.name,
                                                    )
                                                }
                                            >
                                                <Icon className="h-4 w-4" />
                                                {category.name}
                                            </Badge>
                                        </div>
                                    )
                                })}
                                {/* Duplicate set for infinite scroll effect */}
                                {CATEGORIES.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <div
                                            key={`second-${category.name}`}
                                            className="flex-shrink-0 px-2"
                                        >
                                            <Badge
                                                variant={
                                                    selectedCategory ===
                                                    category.name
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={cn(
                                                    "cursor-pointer px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-110 flex items-center gap-2",
                                                    selectedCategory ===
                                                        category.name
                                                        ? "bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg scale-110 border-0"
                                                        : "glass border-primary/20 hover:border-primary/50",
                                                )}
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        category.name,
                                                    )
                                                }
                                            >
                                                <Icon className="h-4 w-4" />
                                                {category.name}
                                            </Badge>
                                        </div>
                                    )
                                })}
                                {/* Third set for seamless loop */}
                                {CATEGORIES.map((category) => {
                                    const Icon = category.icon
                                    return (
                                        <div
                                            key={`third-${category.name}`}
                                            className="flex-shrink-0 px-2"
                                        >
                                            <Badge
                                                variant={
                                                    selectedCategory ===
                                                    category.name
                                                        ? "default"
                                                        : "outline"
                                                }
                                                className={cn(
                                                    "cursor-pointer px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-110 flex items-center gap-2",
                                                    selectedCategory ===
                                                        category.name
                                                        ? "bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg scale-110 border-0"
                                                        : "glass border-primary/20 hover:border-primary/50",
                                                )}
                                                onClick={() =>
                                                    setSelectedCategory(
                                                        category.name,
                                                    )
                                                }
                                            >
                                                <Icon className="h-4 w-4" />
                                                {category.name}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-12 relative">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Results Count */}
                    <div className="mb-8 text-center">
                        <Badge variant="outline" className="px-4 py-2 border-primary/30 glass">
                            <Globe className="w-4 h-4 mr-2 text-primary" />
                            <span className="text-muted-foreground">
                                {loading
                                    ? "Searching..."
                                    : `Found ${pagination.totalCount} community${pagination.totalCount !== 1 ? "s" : ""}`}
                            </span>
                        </Badge>
                    </div>

                    {/* Groups Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Card3D>
                                <Card className="p-12 text-center glass border-primary/20">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-float-3d">
                                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                                    </div>
                                    <p className="text-muted-foreground">
                                        Discovering amazing communities...
                                    </p>
                                </Card>
                            </Card3D>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="flex justify-center">
                            <Card3D>
                                <Card className="p-12 text-center max-w-md glass border-primary/20">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                                        No groups found
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                        Try adjusting your search or filters to find
                                        what you're looking for.
                                    </p>
                                    {!isSignedIn && (
                                        <Link href="/sign-in?redirect_url=/group/create">
                                            <Button className="btn-futuristic text-white border-0 rounded-xl gap-2">
                                                <Plus className="h-4 w-4" />
                                                Create the First One
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </Card>
                            </Card3D>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                {groups.map((group, index) => (
                                    <div
                                        key={group.id}
                                        className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <Card3D>
                                            <GroupCard
                                                id={group.id}
                                                userId={group.userId}
                                                thumbnail={group.thumbnail}
                                                name={group.name}
                                                category={group.category}
                                                description={group.description}
                                                privacy={group.privacy}
                                            />
                                        </Card3D>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.page - 1,
                                            )
                                        }
                                        disabled={pagination.page === 1}
                                        className="glass border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex gap-1">
                                        {Array.from(
                                            { length: pagination.totalPages },
                                            (_, i) => i + 1,
                                        )
                                            .filter(
                                                (pageNum) =>
                                                    pageNum === 1 ||
                                                    pageNum ===
                                                        pagination.totalPages ||
                                                    Math.abs(
                                                        pageNum -
                                                            pagination.page,
                                                    ) <= 1,
                                            )
                                            .map((pageNum, index, array) => (
                                                <>
                                                    {index > 0 &&
                                                        pageNum -
                                                            array[index - 1] >
                                                            1 && (
                                                            <span
                                                                key={`ellipsis-${pageNum}`}
                                                                className="px-3 py-2 text-muted-foreground"
                                                            >
                                                                ...
                                                            </span>
                                                        )}
                                                    <Button
                                                        key={pageNum}
                                                        variant={
                                                            pagination.page ===
                                                            pageNum
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNum,
                                                            )
                                                        }
                                                        className={cn(
                                                            "min-w-[40px]",
                                                            pagination.page === pageNum
                                                                ? "bg-gradient-to-r from-primary to-cyan-500 text-white border-0"
                                                                : "glass border-primary/20 hover:border-primary/50"
                                                        )}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                </>
                                            ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            handlePageChange(
                                                pagination.page + 1,
                                            )
                                        }
                                        disabled={!pagination.hasMore}
                                        className="glass border-primary/20 hover:border-primary/50 hover:bg-primary/10"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}
