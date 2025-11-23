import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import React from "react"

type Props = {
    children: React.ReactNode
    className?: string
}

const GlassCard = ({ children, className }: Props) => {
    return (
        <Card
            className={cn(
                "rounded-2xl border bg-card/50 dark:bg-themeGray/40 backdrop-blur-xl bg-clip-padding",
                "border-border/50 dark:border-themeGray shadow-lg",
                "transition-all duration-300",
                className,
            )}
        >
            {children}
        </Card>
    )
}
export default GlassCard
