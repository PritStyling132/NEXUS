"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Video, VideoOff, Mic, MicOff, PhoneOff, Maximize2, Minimize2 } from "lucide-react"

interface JitsiMeetProps {
    roomName: string
    displayName: string
    onLeave?: () => void
    isOwner?: boolean
}

export default function JitsiMeet({
    roomName,
    displayName,
    onLeave,
    isOwner = false,
}: JitsiMeetProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Build Jitsi URL with configuration
    const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false&config.disableDeepLinking=true`

    useEffect(() => {
        const handleLoad = () => {
            setIsLoading(false)
        }

        const iframe = iframeRef.current
        if (iframe) {
            iframe.addEventListener("load", handleLoad)
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener("load", handleLoad)
            }
        }
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [])

    return (
        <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-black rounded-xl overflow-hidden">
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black z-10">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-white text-lg font-medium">Connecting to meeting room...</p>
                        <p className="text-white/60 text-sm mt-2">Please allow camera and microphone access</p>
                    </div>
                </div>
            )}

            {/* Jitsi iframe */}
            <iframe
                ref={iframeRef}
                src={jitsiUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
                className="w-full h-full border-0"
                style={{ minHeight: "500px" }}
            />

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-black/60 backdrop-blur-sm rounded-full">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-white hover:bg-white/20"
                    onClick={toggleFullscreen}
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-5 h-5" />
                    ) : (
                        <Maximize2 className="w-5 h-5" />
                    )}
                </Button>

                {onLeave && (
                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full bg-red-500 hover:bg-red-600"
                        onClick={onLeave}
                    >
                        <PhoneOff className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Owner Badge */}
            {isOwner && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary/90 text-white text-sm font-medium rounded-full">
                    Host
                </div>
            )}
        </div>
    )
}
