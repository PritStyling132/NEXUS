import { onAuthenticatedUser } from "@/actions/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CourseDetailContent from "./_components/course-detail-content"

interface Props {
    params: Promise<{ groupid: string; courseid: string }>
}

export default async function CourseDetailPage({ params }: Props) {
    const { groupid, courseid } = await params
    const user = await onAuthenticatedUser()

    if (!user.id) {
        redirect("/sign-in")
    }

    // Check if user is course owner
    const course = await prisma.course.findUnique({
        where: { id: courseid },
        select: {
            groupId: true,
            group: {
                select: { userId: true },
            },
        },
    })

    if (!course) {
        redirect(`/group/${groupid}/courses`)
    }

    const isOwner = course.group.userId === user.id

    return (
        <CourseDetailContent
            groupId={groupid}
            courseId={courseid}
            isOwner={isOwner}
        />
    )
}
