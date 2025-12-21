import { onAuthenticatedUser } from "@/actions/auth"
import { onGetLiveSession, onCanJoinLiveSession } from "@/actions/live-sessions"
import { redirect } from "next/navigation"
import SessionRoom from "./_components/session-room"

interface Props {
    params: Promise<{ groupid: string; sessionid: string }>
}

const LiveSessionRoomPage = async ({ params }: Props) => {
    const { groupid, sessionid } = await params
    const user = await onAuthenticatedUser()

    if (!user.id) {
        redirect("/sign-in")
    }

    // Check if user can join
    const canJoinResult = await onCanJoinLiveSession(sessionid)

    if (!canJoinResult.canJoin) {
        redirect(`/group/${groupid}/live-sessions`)
    }

    // Get session details
    const sessionResult = await onGetLiveSession(sessionid)

    if (sessionResult.status !== 200 || !sessionResult.data) {
        redirect(`/group/${groupid}/live-sessions`)
    }

    const session = sessionResult.data
    const isOwner = session.group.userId === user.id

    return (
        <SessionRoom
            session={session}
            groupId={groupid}
            userId={user.id}
            isOwner={isOwner}
            userName={`${user.username || "User"}`}
        />
    )
}

export default LiveSessionRoomPage
