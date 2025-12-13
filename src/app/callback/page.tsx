import { onSignUpUser } from "@/actions/auth"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function CallbackPage() {
    const user = await currentUser()

    if (!user) {
        console.log("❌ No user found in callback, redirecting to sign-in")
        redirect("/sign-in")
    }

    console.log("✅ User found in callback:", user.id)
    console.log("📧 Email addresses:", user.emailAddresses)

    // Get primary email from Clerk user
    const primaryEmail = user.emailAddresses?.find(
        (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses?.[0]?.emailAddress

    console.log("📧 Primary email:", primaryEmail)

    // Create user in database if they don't exist (for OAuth users)
    const result = await onSignUpUser({
        firstname: user.firstName || "",
        lastname: user.lastName || "",
        clerkId: user.id,
        image: user.imageUrl || "",
        email: primaryEmail || "",
    })

    console.log("📥 Database result:", result)

    // Redirect to explore page for learners
    redirect("/explore")
}
