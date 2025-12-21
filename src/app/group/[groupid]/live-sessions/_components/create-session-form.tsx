"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Radio, Calendar } from "lucide-react"
import { onCreateLiveSession } from "@/actions/live-sessions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Course = {
    id: string
    title: string
    thumbnail: string | null
}

type CreateSessionFormProps = {
    groupId: string
    courses: Course[]
    isInstant: boolean
    onSuccess: () => void
}

export default function CreateSessionForm({
    groupId,
    courses,
    isInstant,
    onSuccess,
}: CreateSessionFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        courseId: courses.length === 1 ? courses[0].id : "",
        title: "",
        description: "",
        scheduledDate: "",
        scheduledTime: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.courseId) {
            toast.error("Please select a course")
            return
        }

        if (!formData.title.trim()) {
            toast.error("Please enter a session title")
            return
        }

        let scheduledAt: Date | undefined
        if (!isInstant) {
            if (!formData.scheduledDate || !formData.scheduledTime) {
                toast.error("Please select a date and time")
                return
            }
            scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
            if (scheduledAt <= new Date()) {
                toast.error("Scheduled time must be in the future")
                return
            }
        }

        setIsLoading(true)

        try {
            const result = await onCreateLiveSession(
                formData.courseId,
                groupId,
                formData.title.trim(),
                formData.description.trim() || undefined,
                scheduledAt,
                isInstant,
            )

            if (result.status === 200) {
                toast.success(
                    isInstant
                        ? "Live session started! Redirecting..."
                        : "Session scheduled! Notifications sent to members."
                )
                onSuccess()

                // If instant, redirect to the session room
                if (isInstant && result.data?.id) {
                    setTimeout(() => {
                        router.push(`/group/${groupId}/live-sessions/${result.data.id}`)
                    }, 500)
                }
            } else {
                toast.error(result.message || "Failed to create session")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    // Get minimum date/time for scheduling (now + 5 minutes)
    const getMinDateTime = () => {
        const now = new Date()
        now.setMinutes(now.getMinutes() + 5)
        return {
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().slice(0, 5),
        }
    }

    const minDateTime = getMinDateTime()

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selection */}
            <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                    value={formData.courseId}
                    onValueChange={(value) =>
                        setFormData({ ...formData, courseId: value })
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                        {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    All members of your group will be notified about this session.
                </p>
            </div>

            {/* Session Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                    id="title"
                    placeholder={isInstant ? "e.g., Live Q&A Session" : "e.g., Weekly Discussion"}
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    maxLength={100}
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">
                    Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                    id="description"
                    placeholder="What will you discuss in this session?"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    maxLength={500}
                />
            </div>

            {/* Schedule Fields (only for scheduled sessions) */}
            {!isInstant && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            min={minDateTime.date}
                            value={formData.scheduledDate}
                            onChange={(e) =>
                                setFormData({ ...formData, scheduledDate: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                            id="time"
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) =>
                                setFormData({ ...formData, scheduledTime: e.target.value })
                            }
                        />
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className={`p-4 rounded-lg ${isInstant ? "bg-red-500/10 border border-red-500/20" : "bg-blue-500/10 border border-blue-500/20"}`}>
                {isInstant ? (
                    <div className="flex items-start gap-3">
                        <Radio className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-500">Going Live Immediately</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Your session will start as soon as you click the button below.
                                All group members will receive an instant notification.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-500">Scheduling for Later</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Members will receive an email with the scheduled time and a link to join.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className={`w-full ${isInstant ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isInstant ? "Starting Session..." : "Scheduling..."}
                    </>
                ) : isInstant ? (
                    <>
                        <Radio className="w-4 h-4 mr-2" />
                        Go Live Now
                    </>
                ) : (
                    <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Session
                    </>
                )}
            </Button>
        </form>
    )
}
