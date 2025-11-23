import { Layers } from "lucide-react"

interface Props {
    params: Promise<{ groupid: string }>
}

const AffiliatesPage = async ({ params }: Props) => {
    const { groupid } = await params

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                        Affiliates
                    </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                    Manage your affiliate program and track referrals.
                </p>
            </div>

            {/* Content */}
            <div className="flex-1">
                {/* Add your affiliates content here */}
            </div>
        </div>
    )
}

export default AffiliatesPage
