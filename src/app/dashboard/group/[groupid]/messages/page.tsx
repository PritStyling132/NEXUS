import { onAuthenticatedUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import LearnerMessagesClient from "./learner-messages-client"

interface Props {
    params: Promise<{ groupid: string }>
}

const LearnerMessagesPage = async ({ params }: Props) => {
    const { groupid } = await params

    const user = await onAuthenticatedUser()
    if (user.status !== 200 || !user.id) {
        redirect("/sign-in")
    }

    // Get group owner information
    const group = await prisma.group.findUnique({
        where: { id: groupid },
        select: {
            owner: {
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    image: true,
                },
            },
        },
    })

    return (
        <LearnerMessagesClient
            groupid={groupid}
            currentUserId={user.id}
            groupOwner={group?.owner || null}
        />
    )
}

export default LearnerMessagesPage
