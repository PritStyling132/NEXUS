import { onAuthenticatedUser } from "@/actions/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import LearnerCourseContent from "./_components/learner-course-content"

interface Props {
    params: Promise<{ groupid: string; courseid: string }>
}

export default async function LearnerCourseDetailPage({ params }: Props) {
    const { groupid, courseid } = await params
    const user = await onAuthenticatedUser()

    if (!user.id) {
        redirect("/sign-in")
    }

    // Get the course with group info
    const course = await prisma.course.findUnique({
        where: { id: courseid },
        select: {
            id: true,
            groupId: true,
            published: true,
            group: {
                select: {
                    userId: true,
                    name: true,
                },
            },
        },
    })

    if (!course) {
        redirect(`/dashboard/group/${groupid}`)
    }

    // Check if the course is published (learners can only see published courses)
    if (!course.published) {
        redirect(`/dashboard/group/${groupid}`)
    }

    // Check if user is a member of this group
    const membership = await prisma.members.findFirst({
        where: {
            userId: user.id,
            groupId: groupid,
        },
    })

    // If not a member, check if they're the owner
    const isOwner = course.group.userId === user.id

    if (!membership && !isOwner) {
        redirect(`/dashboard/group/${groupid}`)
    }

    return (
        <LearnerCourseContent
            groupId={groupid}
            courseId={courseid}
            groupName={course.group.name}
        />
    )
}
