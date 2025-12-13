import { redirect } from "next/navigation"

export default function OwnerLoginPage() {
    redirect("/sign-in?tab=owner")
}
