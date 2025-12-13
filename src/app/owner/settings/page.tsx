import { onGetUserProfile } from "@/actions/auth"
import { onAuthenticatedUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { OwnerSettingsForm } from "./_components/owner-settings-form"

export default async function OwnerSettingsPage() {
    const auth = await onAuthenticatedUser()

    if (auth.status !== 200) {
        redirect("/owner/login")
    }

    const profileResult = await onGetUserProfile()

    if (profileResult.status !== 200 || !profileResult.data) {
        redirect("/owner/login")
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container py-8 px-4 sm:px-6 max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Account Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your profile information
                    </p>
                </div>

                <OwnerSettingsForm
                    initialData={{
                        firstname: profileResult.data.firstname,
                        lastname: profileResult.data.lastname,
                        email: profileResult.data.email || "",
                        image: profileResult.data.image || "",
                    }}
                />
            </div>
        </div>
    )
}
