import { GraduationCap, Plus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
    params: { groupid: string }
}

const CoursesPage = ({ params }: Props) => {
    const groupid = params?.groupid

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            Courses
                        </h3>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                        Educational content and learning materials for your group members.
                    </p>
                </div>
                <Button className="rounded-xl flex gap-2 bg-primary hover:bg-primary/90 shadow-lg">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Course</span>
                    <span className="sm:hidden">New</span>
                </Button>
            </div>

            {/* Empty State */}
            <div className="flex-1 flex items-center justify-center">
                <Card className="max-w-md w-full border-border dark:border-themeGray bg-card/50 dark:bg-themeGray/20">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 dark:bg-primary/20 w-fit">
                            <BookOpen className="w-12 h-12 text-primary" />
                        </div>
                        <CardTitle className="text-foreground dark:text-themeTextWhite">
                            No Courses Yet
                        </CardTitle>
                        <CardDescription className="text-muted-foreground dark:text-themeTextGray">
                            Start creating educational content for your group members.
                            Courses can include videos, documents, and quizzes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full rounded-xl bg-primary hover:bg-primary/90"
                            size="lg"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Course
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CoursesPage
