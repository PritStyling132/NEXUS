import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

type GlassModalProps = {
    trigger: JSX.Element // The element that opens the modal
    children: React.ReactNode // The content inside the modal body
    title: string // The title of the modal
    description: string // The description/subtitle of the modal
}

export const GlassModal = ({
    trigger,
    children,
    title,
    description,
}: GlassModalProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className="bg-clip-padding backdrop-filter 
                   backdrop-blur-safari backdrop-blur-3xl bg-opacity-20 border border-themeGray"
                // The original image uses Tailwind CSS classes for the glass effect:
                // backdrop-filter backdrop-blur-3xl bg-opacity-20 border border-themeGray
                // The additional class 'backdrop-blur-safari' is likely a custom utility class
                // to handle specific browser issues (like Safari's backdrop-filter support).
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
                {/* Note: The image shows the description tag twice: 
            <DialogDescription>{description}</DialogDescription> inside the header,
            and then {children} is followed by another unclosed <DialogDescription> tag. 
            I've corrected this to place {children} after the header, and assuming the 
            second tag was a mistake or cutoff, I've omitted it to maintain valid JSX structure.
            The visual code suggests:
            </DialogHeader>
            {children}
            </DialogContent> */}
            </DialogContent>
        </Dialog>
    )
}
