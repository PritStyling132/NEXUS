"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    ArrowLeft,
    Radio,
    Calendar,
    Clock,
    Video,
    Play,
    Square,
    Loader2,
} from "lucide-react"
import JitsiMeet from "@/components/global/jitsi-meet"
import { onStartLiveSession, onEndLiveSession } from "@/actions/live-sessions"
import { toast } from "sonner"

type Session = {
    id: string
    title: string
    description: string | null
    status: string
    roomUrl: string
    scheduledAt: Date | string | null
    startedAt: Date | string | null
    endedAt: Date | string | null
    course: {
        id: string
        title: string
        thumbnail: string | null
    }
    group: {
        id: string
        name: string
        userId: string
    }
    creator: {
        id: string
        firstname: string
        lastname: string
        image: string | null
    }
}

type SessionRoomProps = {
    session: Session
    groupId: string
    userId: string
    isOwner: boolean
    userName: string
}

export default function SessionRoom({
    session,
    groupId,
    userId,
    isOwner,
    userName,
}: SessionRoomProps) {
    const router = useRouter()
    const [currentStatus, setCurrentStatus] = useState(session.status)
    const [isLoading, setIsLoading] = useState(false)
    const [hasJoined, setHasJoined] = useState(false)

    const handleBack = () => {
        router.push(`/group/${groupId}/live-sessions`)
    }

    const handleStartSession = async () => {
        setIsLoading(true)
        const result = await onStartLiveSession(session.id)
        if (result.status === 200) {
            setCurrentStatus("LIVE")
            toast.success("Session started!")
        } else {
            toast.error(result.message || "Failed to start session")
        }
        setIsLoading(false)
    }

    const handleEndSession = async () => {
        setIsLoading(true)
        const result = await onEndLiveSession(session.id)
        if (result.status === 200) {
            setCurrentStatus("ENDED")
            toast.success("Session ended")
            router.push(`/group/${groupId}/live-sessions`)
        } else {
            toast.error(result.message || "Failed to end session")
        }
        setIsLoading(false)
    }

    const handleLeaveSession = () => {
        setHasJoined(false)
        router.push(`/group/${groupId}/live-sessions`)
    }

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
    }

    // Extract room name from URL
    const roomName = session.roomUrl.replace("https://meet.jit.si/", "")

    // If session is LIVE and user wants to join
    if (currentStatus === "LIVE" && hasJoined) {
        return (
            <div className="flex flex-col w-full h-full bg-black">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-red-500 text-white animate-pulse">
                            <Radio className="w-3 h-3 mr-1" />
                            LIVE
                        </Badge>
                        <span className="text-white font-medium">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Square className="w-4 h-4 mr-2" />
                                        End Session
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>End Live Session?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will end the session for all participants. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleEndSession}
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            End Session
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-gray-800"
                            onClick={handleLeaveSession}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Leave
                        </Button>
                    </div>
                </div>

                {/* Jitsi Meet */}
                <div className="flex-1">
                    <JitsiMeet
                        roomName={roomName}
                        displayName={userName}
                        isOwner={isOwner}
                        onLeave={handleLeaveSession}
                    />
                </div>
            </div>
        )
    }

    // Session details / waiting room
    return (
        <div className="flex flex-col w-full h-full gap-6 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="w-fit"
                onClick={handleBack}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Live Sessions
            </Button>

            <div className="max-w-3xl mx-auto w-full">
                <Card className="overflow-hidden border-border dark:border-themeGray">
                    {/* Status Banner */}
                    <div
                        className={`px-6 py-4 ${
                            currentStatus === "LIVE"
                                ? "bg-gradient-to-r from-red-500/20 to-red-600/20"
                                : currentStatus === "SCHEDULED"
                                ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20"
                                : "bg-gradient-to-r from-gray-500/20 to-gray-600/20"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {currentStatus === "LIVE" ? (
                                    <Badge className="bg-red-500 text-white animate-pulse">
                                        <Radio className="w-3 h-3 mr-1" />
                                        LIVE NOW
                                    </Badge>
                                ) : currentStatus === "SCHEDULED" ? (
                                    <Badge className="bg-blue-500 text-white">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        SCHEDULED
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {currentStatus}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <CardHeader>
                        <CardTitle className="text-2xl">{session.title}</CardTitle>
                        {session.description && (
                            <CardDescription className="text-base mt-2">
                                {session.description}
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Session Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Video className="w-5 h-5" />
                                <span>Course: <strong className="text-foreground">{session.course.title}</strong></span>
                            </div>

                            {session.scheduledAt && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Clock className="w-5 h-5" />
                                    <span>{formatDate(session.scheduledAt)}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-muted-foreground">
                                <span>Hosted by:</span>
                                <span className="text-foreground font-medium">
                                    {session.creator.firstname} {session.creator.lastname}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t">
                            {currentStatus === "LIVE" && (
                                <Button
                                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                                    size="lg"
                                    onClick={() => setHasJoined(true)}
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Join Live Session
                                </Button>
                            )}

                            {currentStatus === "SCHEDULED" && isOwner && (
                                <Button
                                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                                    size="lg"
                                    onClick={handleStartSession}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Radio className="w-5 h-5 mr-2" />
                                            Start Session Now
                                        </>
                                    )}
                                </Button>
                            )}

                            {currentStatus === "SCHEDULED" && !isOwner && (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">
                                        This session hasn't started yet. Please check back at the scheduled time.
                                    </p>
                                    {session.scheduledAt && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Scheduled for: {formatDate(session.scheduledAt)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {(currentStatus === "ENDED" || currentStatus === "CANCELLED") && (
                                <div className="text-center py-4">
                                    <p className="text-muted-foreground">
                                        This session has {currentStatus === "ENDED" ? "ended" : "been cancelled"}.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
