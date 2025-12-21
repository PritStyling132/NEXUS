import { redirect } from "next/navigation"

// This page redirects to the main marketing page with the reel ID as a query param
// This allows sharing direct links to specific reels

export default async function SharedReelPage({
    params,
}: {
    params: Promise<{ reelId: string }>
}) {
    const { reelId } = await params
    redirect(`/marketing?reel=${reelId}`)
}
