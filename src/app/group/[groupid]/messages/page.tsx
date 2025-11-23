import { MessageSquare, Send, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface Props {
    params: { groupid: string }
}

const MessagesPage = ({ params }: Props) => {
    const groupid = params?.groupid

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                        Direct Messages
                    </h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                    Private conversations with group members.
                </p>
            </div>

            {/* Empty State */}
            <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md w-full border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 dark:bg-primary/20 w-fit">
                            <MessageSquare className="w-12 h-12 text-primary" />
                        </div>
                        <CardTitle className="text-foreground dark:text-themeTextWhite">
                            No Messages Yet
                        </CardTitle>
                        <CardDescription className="text-muted-foreground dark:text-themeTextGray">
                            Start a conversation with your group members. Messages are private
                            and only visible to the participants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p className="text-sm text-center text-muted-foreground dark:text-themeTextGray">
                                Tip: Use channels for group discussions
                            </p>
                            <div className="flex gap-2">
                                <Hash className="w-4 h-4 mt-1 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground dark:text-themeTextGray">
                                    Channels are great for topic-based conversations
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default MessagesPage
