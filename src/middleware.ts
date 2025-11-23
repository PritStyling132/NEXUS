import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/callback(.*)",
    "/",
    "/api/webhooks(.*)",
])

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth()
    const { pathname } = req.nextUrl

    // Allow public routes
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // Redirect to sign-in if not authenticated
    if (!userId) {
        const signInUrl = new URL("/sign-in", req.url)
        signInUrl.searchParams.set("redirect_url", pathname)
        return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
}
