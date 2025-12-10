import { onAuthenticatedUser } from "@/actions/auth"
import { prisma } from "@/lib/prisma"
import CoursesContent from "./_components/courses-content"
import { redirect } from "next/navigation"

interface Props {
    params: Promise<{ groupid: string }>
}

const CoursesPage = async ({ params }: Props) => {
    const { groupid } = await params
    const user = await onAuthenticatedUser()

    if (!user.id) {
        redirect("/sign-in")
    }

    // Check if user is group owner
    const group = await prisma.group.findUnique({
        where: { id: groupid },
        select: { userId: true },
    })

    const isOwner = group?.userId === user.id

    return (
        <CoursesContent groupId={groupid} userId={user.id} isOwner={isOwner} />
    )
}

export default CoursesPage
