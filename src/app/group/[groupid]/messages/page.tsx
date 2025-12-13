import { onAuthenticatedUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import MessagesClient from "./messages-client"

interface Props {
    params: Promise<{ groupid: string }>
}

const MessagesPage = async ({ params }: Props) => {
    const { groupid } = await params

    const user = await onAuthenticatedUser()
    if (user.status !== 200 || !user.id) {
        redirect("/sign-in")
    }

    return <MessagesClient groupid={groupid} currentUserId={user.id} />
}

export default MessagesPage
