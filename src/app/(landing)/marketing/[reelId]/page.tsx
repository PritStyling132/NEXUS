import { redirect } from "next/navigation"

// This page redirects to the main marketing page with the reel ID as a query param
// This allows sharing direct links to specific reels

export default function SharedReelPage({
    params,
}: {
    params: { reelId: string }
}) {
    redirect(`/marketing?reel=${params.reelId}`)
}
