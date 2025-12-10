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
} from "lucide-react"
import GroupCard from "./_components/group-card"
import { cn } from "@/lib/utils"
import Link from "next/link"

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

export default function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 12,
        totalCount: 0,
        totalPages: 0,
        hasMore: false,
    })

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
        <div className="min-h-screen bg-background">
            <div className="w-full py-12">
                {/* Header Section - Centered */}
                <div className="max-w-4xl mx-auto text-center mb-8 px-4">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-themeAccent to-themeAccent2 bg-clip-text text-transparent">
                        Explore Communities
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                        Discover and join amazing communities around the world
                    </p>

                    {/* Create Your Own Group CTA */}
                    <Link href="/sign-in?redirect_url=/group/create">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-primary to-themeAccent2 hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create Your Own Group
                            <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Search Bar - Centered */}
                <div className="max-w-2xl mx-auto mb-12 px-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Search groups by name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 text-base bg-card border-2 border-border focus:ring-2 focus:ring-primary rounded-xl shadow-sm"
                        />
                    </div>
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
                                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                                    : "bg-card hover:bg-muted border-border hover:border-primary/50",
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
                                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                                    : "bg-card hover:bg-muted border-border hover:border-primary/50",
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
                                                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                                    : "bg-card hover:bg-muted border-border hover:border-primary/50",
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

                {/* Results Section */}
                <div className="max-w-7xl mx-auto px-4">
                    {/* Results Count */}
                    <div className="mb-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            {loading
                                ? "Loading..."
                                : `Found ${pagination.totalCount} group${pagination.totalCount !== 1 ? "s" : ""}`}
                        </p>
                    </div>

                    {/* Groups Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Loading groups...
                                </p>
                            </div>
                        </div>
                    ) : groups.length === 0 ? (
                        <Card className="p-12 text-center max-w-md mx-auto">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">
                                No groups found
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search or filters to find
                                what you're looking for.
                            </p>
                            <Link href="/sign-in?redirect_url=/group/create">
                                <Button variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create the First One
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {groups.map((group) => (
                                    <GroupCard
                                        key={group.id}
                                        id={group.id}
                                        userId={group.userId}
                                        thumbnail={group.thumbnail}
                                        name={group.name}
                                        category={group.category}
                                        description={group.description}
                                        privacy={group.privacy}
                                    />
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
                                                        className="min-w-[40px]"
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
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
