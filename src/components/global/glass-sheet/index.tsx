import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type GlassSheetProps = {
    children: React.ReactNode
    trigger: React.ReactNode
    className?: string
    triggerClass?: string
}

const GlassSheet = ({
    children,
    trigger,
    className,
    triggerClass,
}: GlassSheetProps) => {
    return (
        <Sheet>
            <SheetTrigger className={cn(triggerClass)} asChild>
                {trigger}
            </SheetTrigger>
            <SheetContent
                className={cn(
                    "bg-background/95 dark:bg-themeGray/95 backdrop-blur-2xl",
                    "border-border dark:border-themeGray",
                    "transition-all duration-300",
                    className,
                )}
            >
                {children}
            </SheetContent>
        </Sheet>
    )
}

export default GlassSheet
