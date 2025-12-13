"use client"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type DropDownProps = {
    title: string
    subtitle?: string
    trigger: JSX.Element
    children: React.ReactNode
    ref?: React.RefObject<HTMLButtonElement>
}

export const DropDown = ({
    trigger,
    title,
    subtitle,
    children,
    ref,
}: DropDownProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild ref={ref}>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="rounded-2xl w-56 items-start bg-card dark:bg-themeBlack border-border dark:border-themeGray bg-clip-padding backdrop-blur-xl p-4">
                <div className="pl-3">
                    <h4 className="text-sm font-medium text-foreground dark:text-white">
                        {title}
                    </h4>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground dark:text-themeTextGray mt-0.5 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
                <Separator className="bg-border dark:bg-themeGray my-3" />
                {children}
            </PopoverContent>
        </Popover>
    )
}
