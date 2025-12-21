import { onAuthenticatedUser } from "@/actions/auth"
import { prisma } from "@/lib/prisma"
import LiveSessionsContent from "./_components/live-sessions-content"
import { redirect } from "next/navigation"

interface Props {
    params: Promise<{ groupid: string }>
}

const LiveSessionsPage = async ({ params }: Props) => {
    const { groupid } = await params
    const user = await onAuthenticatedUser()

    if (!user.id) {
        redirect("/sign-in")
    }

    // Get group with courses
    const group = await prisma.group.findUnique({
        where: { id: groupid },
        select: {
            userId: true,
            name: true,
            courses: {
                select: {
                    id: true,
                    title: true,
                    thumbnail: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
    })

    if (!group) {
        redirect("/dashboard")
    }

    const isOwner = group.userId === user.id

    return (
        <LiveSessionsContent
            groupId={groupid}
            userId={user.id}
            isOwner={isOwner}
            courses={group.courses}
        />
    )
}

export default LiveSessionsPage
