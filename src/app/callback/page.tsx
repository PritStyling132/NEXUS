import { onSignUpUser } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function CallbackPage() {
    try {
        const user = await currentUser()

        if (!user) {
            redirect("/sign-in")
        }

        // Create user in database if they don't exist (for OAuth users)
        await onSignUpUser({
            firstname: user.firstName || "",
            lastname: user.lastName || "",
            clerkId: user.id,
            image: user.imageUrl || "",
        })

        // Redirect to group creation
        redirect("/group/create")
    } catch (error) {
        console.error("Callback error:", error)
        redirect("/sign-in")
    }
}
