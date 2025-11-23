"use client"

import { Bell } from "lucide-react"
import GlassSheet from "../glass-sheet"

export const Notification = () => {
    return (
        <GlassSheet
            trigger={
                <span className="cursor-pointer">
                    <Bell className="h-5 w-5" />
                </span>
            }
            triggerClass=""
        >
            <div>yo</div>
        </GlassSheet>
    )
}
