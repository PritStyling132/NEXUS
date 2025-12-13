import { onGetLearnerDashboardData } from "@/actions/groups"
import { onAuthenticatedUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { LearnerDashboard } from "./_components/dashboard"

export default async function DashboardPage() {
    const auth = await onAuthenticatedUser()

    if (auth.status !== 200) {
        redirect("/sign-in?redirect_url=/dashboard")
    }

    const dashboardData = await onGetLearnerDashboardData()

    return (
        <LearnerDashboard
            username={auth.username || "Learner"}
            dashboardData={dashboardData as any}
        />
    )
}
