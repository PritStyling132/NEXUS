import { onGetUserProfile } from "@/actions/auth"
import { onAuthenticatedUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { AccountSettingsForm } from "./_components/account-settings-form"

export default async function SettingsPage() {
    const auth = await onAuthenticatedUser()

    if (auth.status !== 200) {
        redirect("/sign-in?redirect_url=/dashboard/settings")
    }

    const profileResult = await onGetUserProfile()

    if (profileResult.status !== 200 || !profileResult.data) {
        redirect("/dashboard")
    }

    return (
        <div className="container py-8 px-4 sm:px-6 max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                    Account Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your profile information
                </p>
            </div>

            <AccountSettingsForm
                initialData={{
                    firstname: profileResult.data.firstname,
                    lastname: profileResult.data.lastname,
                    email: profileResult.data.email || "",
                    image: profileResult.data.image || "",
                }}
            />
        </div>
    )
}
