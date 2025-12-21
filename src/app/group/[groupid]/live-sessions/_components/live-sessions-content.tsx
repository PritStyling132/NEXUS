"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Video,
    Plus,
    Calendar,
    Radio,
    Clock,
    Users,
    Play,
    Trash2,
    XCircle,
} from "lucide-react"
import { onGetGroupLiveSessions, onDeleteLiveSession, onCancelLiveSession } from "@/actions/live-sessions"
import CreateSessionForm from "./create-session-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Course = {
    id: string
    title: string
    thumbnail: string | null
}

type LiveSessionsContentProps = {
    groupId: string
    userId: string
    isOwner: boolean
    courses: Course[]
}

export default function LiveSessionsContent({
    groupId,
    userId,
    isOwner,
    courses,
}: LiveSessionsContentProps) {
    const router = useRouter()
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [filterCourse, setFilterCourse] = useState<string>("all")
    const [sessionMode, setSessionMode] = useState<"instant" | "scheduled">("instant")

    const { data: sessionsData, isLoading, refetch } = useQuery({
        queryKey: ["live-sessions", groupId],
        queryFn: async () => {
            const result = await onGetGroupLiveSessions(groupId)
            return result.status === 200 ? result.data : []
        },
    })

    const sessions = sessionsData || []
    const filteredSessions = filterCourse === "all"
        ? sessions
        : sessions.filter((s: any) => s.courseId === filterCourse)

    const liveSessions = filteredSessions.filter((s: any) => s.status === "LIVE")
    const scheduledSessions = filteredSessions.filter((s: any) => s.status === "SCHEDULED")
    const pastSessions = filteredSessions.filter((s: any) => s.status === "ENDED" || s.status === "CANCELLED")

    const handleSessionCreated = () => {
        setShowCreateDialog(false)
        refetch()
    }

    const handleJoinSession = (sessionId: string) => {
        router.push(`/group/${groupId}/live-sessions/${sessionId}`)
    }

    const handleDeleteSession = async (sessionId: string) => {
        const result = await onDeleteLiveSession(sessionId)
        if (result.status === 200) {
            toast.success("Session deleted")
            refetch()
        } else {
            toast.error(result.message || "Failed to delete session")
        }
    }

    const handleCancelSession = async (sessionId: string) => {
        const result = await onCancelLiveSession(sessionId)
        if (result.status === 200) {
            toast.success("Session cancelled")
            refetch()
        } else {
            toast.error(result.message || "Failed to cancel session")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "LIVE":
                return (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20 animate-pulse">
                        <Radio className="w-3 h-3 mr-1" />
                        LIVE
                    </Badge>
                )
            case "SCHEDULED":
                return (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Calendar className="w-3 h-3 mr-1" />
                        Scheduled
                    </Badge>
                )
            case "ENDED":
                return (
                    <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                        Ended
                    </Badge>
                )
            case "CANCELLED":
                return (
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        Cancelled
                    </Badge>
                )
            default:
                return null
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
    }

    const SessionCard = ({ session }: { session: any }) => (
        <Card
            className={cn(
                "group overflow-hidden border-border dark:border-themeGray transition-all duration-300 hover:shadow-lg",
                session.status === "LIVE" && "border-red-500/50 shadow-red-500/10 shadow-lg"
            )}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(session.status)}
                        </div>
                        <CardTitle className="text-lg line-clamp-1 text-foreground dark:text-themeTextWhite">
                            {session.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                            {session.description || "No description"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {/* Course info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Video className="w-4 h-4" />
                        <span className="truncate">{session.course?.title}</span>
                    </div>

                    {/* Time info */}
                    {session.scheduledAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(session.scheduledAt)}</span>
                        </div>
                    )}

                    {/* Creator */}
                    <div className="flex items-center gap-2 text-sm">
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={session.creator?.image} />
                            <AvatarFallback className="text-xs">
                                {session.creator?.firstname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                            {session.creator?.firstname} {session.creator?.lastname}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        {session.status === "LIVE" && (
                            <Button
                                onClick={() => handleJoinSession(session.id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Join Now
                            </Button>
                        )}
                        {session.status === "SCHEDULED" && (
                            <>
                                <Button
                                    onClick={() => handleJoinSession(session.id)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    View Details
                                </Button>
                                {isOwner && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10"
                                        onClick={() => handleCancelSession(session.id)}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                )}
                            </>
                        )}
                        {(session.status === "ENDED" || session.status === "CANCELLED") && isOwner && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => handleDeleteSession(session.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-purple-500/20">
                            <Video className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            Live Sessions
                        </h3>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        {sessions.length > 0
                            ? `${liveSessions.length} live now, ${scheduledSessions.length} scheduled`
                            : "Host live video discussions with your group members."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Course Filter */}
                    {courses.length > 0 && (
                        <Select value={filterCourse} onValueChange={setFilterCourse}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {isOwner && courses.length > 0 && (
                        <Dialog
                            open={showCreateDialog}
                            onOpenChange={setShowCreateDialog}
                        >
                            <DialogTrigger asChild>
                                <Button className="rounded-xl flex gap-2 bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white shadow-lg">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        Go Live
                                    </span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Create Live Session</DialogTitle>
                                    <DialogDescription>
                                        Start an instant session or schedule one for later.
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Mode Toggle */}
                                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                    <Button
                                        variant={sessionMode === "instant" ? "default" : "ghost"}
                                        className={cn(
                                            "flex-1",
                                            sessionMode === "instant" && "bg-red-500 hover:bg-red-600"
                                        )}
                                        onClick={() => setSessionMode("instant")}
                                    >
                                        <Radio className="w-4 h-4 mr-2" />
                                        Go Live Now
                                    </Button>
                                    <Button
                                        variant={sessionMode === "scheduled" ? "default" : "ghost"}
                                        className="flex-1"
                                        onClick={() => setSessionMode("scheduled")}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule
                                    </Button>
                                </div>

                                <CreateSessionForm
                                    groupId={groupId}
                                    courses={courses}
                                    isInstant={sessionMode === "instant"}
                                    onSuccess={handleSessionCreated}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader>
                                <div className="h-5 bg-muted animate-pulse rounded w-20" />
                                <div className="h-6 bg-muted animate-pulse rounded mt-2" />
                                <div className="h-4 bg-muted animate-pulse rounded w-2/3 mt-1" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Live Now Section */}
            {!isLoading && liveSessions.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-themeTextWhite">
                        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                        Live Now
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveSessions.map((session: any) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                </div>
            )}

            {/* Scheduled Section */}
            {!isLoading && scheduledSessions.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-themeTextWhite">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Upcoming
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scheduledSessions.map((session: any) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                </div>
            )}

            {/* Past Sessions */}
            {!isLoading && pastSessions.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2 text-foreground dark:text-themeTextWhite opacity-60">
                        <Clock className="w-5 h-5" />
                        Past Sessions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                        {pastSessions.slice(0, 6).map((session: any) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && sessions.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                    <Card className="max-w-md w-full border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-red-500/20 to-purple-500/20 w-fit">
                                <Video className="w-12 h-12 text-red-500" />
                            </div>
                            <CardTitle className="text-foreground dark:text-themeTextWhite">
                                No Live Sessions Yet
                            </CardTitle>
                            <CardDescription className="text-muted-foreground dark:text-themeTextGray">
                                {isOwner
                                    ? courses.length > 0
                                        ? "Start hosting live video discussions with your group members. Go live instantly or schedule a session for later."
                                        : "Create a course first to start hosting live sessions."
                                    : "No live sessions have been scheduled yet. Check back later!"}
                            </CardDescription>
                        </CardHeader>
                        {isOwner && courses.length > 0 && (
                            <CardContent>
                                <Dialog
                                    open={showCreateDialog}
                                    onOpenChange={setShowCreateDialog}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white"
                                            size="lg"
                                        >
                                            <Radio className="w-4 h-4 mr-2" />
                                            Start Your First Live Session
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>Create Live Session</DialogTitle>
                                            <DialogDescription>
                                                Start an instant session or schedule one for later.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                            <Button
                                                variant={sessionMode === "instant" ? "default" : "ghost"}
                                                className={cn(
                                                    "flex-1",
                                                    sessionMode === "instant" && "bg-red-500 hover:bg-red-600"
                                                )}
                                                onClick={() => setSessionMode("instant")}
                                            >
                                                <Radio className="w-4 h-4 mr-2" />
                                                Go Live Now
                                            </Button>
                                            <Button
                                                variant={sessionMode === "scheduled" ? "default" : "ghost"}
                                                className="flex-1"
                                                onClick={() => setSessionMode("scheduled")}
                                            >
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Schedule
                                            </Button>
                                        </div>
                                        <CreateSessionForm
                                            groupId={groupId}
                                            courses={courses}
                                            isInstant={sessionMode === "instant"}
                                            onSuccess={handleSessionCreated}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        )}
                        {isOwner && courses.length === 0 && (
                            <CardContent>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => router.push(`/group/${groupId}/courses`)}
                                >
                                    Create a Course First
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </div>
            )}
        </div>
    )
}
