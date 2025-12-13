import { onGetUserProfile } from "@/actions/auth"
import { onAuthenticatedUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AccountSettingsForm } from "./_components/account-settings-form"
import LandingPageNavbar from "@/app/(landing)/_components/navbar"
import { Footer } from "@/components/global/footer"

export default async function AccountSettingsPage() {
    const auth = await onAuthenticatedUser()

    if (auth.status !== 200) {
        // Check if this is an owner trying to access (has owner cookie but auth failed)
        const cookieStore = await cookies()
        const ownerSession = cookieStore.get("owner_session")?.value

        if (ownerSession) {
            // Owner session exists but auth failed - redirect to owner login
            redirect("/owner/login?redirect_url=/account-settings")
        }

        redirect("/sign-in?redirect_url=/account-settings")
    }

    const profileResult = await onGetUserProfile()

    if (profileResult.status !== 200 || !profileResult.data) {
        // Check if owner and redirect appropriately
        const cookieStore = await cookies()
        const ownerSession = cookieStore.get("owner_session")?.value

        if (ownerSession) {
            redirect("/owner/login")
        }
        redirect("/dashboard")
    }

    return (
        <>
            <LandingPageNavbar />
            <div className="container py-8 px-4 sm:px-6 max-w-2xl min-h-[calc(100vh-200px)]">
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
            <Footer />
        </>
    )
}
