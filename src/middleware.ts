import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Public routes - no authentication required
const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/callback(.*)",
    "/",
    "/explore(.*)",
    "/pricing(.*)",
    "/about(.*)",
    "/marketing(.*)",
    "/api/webhooks(.*)",
    "/api/groups/explore(.*)",
    "/api/cloudinary/(.*)",
    "/api/user/profile(.*)",
    "/api/notifications(.*)",
])

// Admin routes - only admin can access
const isAdminRoute = createRouteMatcher([
    "/admin(.*)",
])

// Admin API routes - only admin can access
const isAdminApiRoute = createRouteMatcher([
    "/api/admin/(.*)",
])

// Owner auth routes - public for authentication
const isOwnerAuthRoute = createRouteMatcher([
    "/owner/login(.*)",
    "/owner/register(.*)",
    "/owner/change-password(.*)",
    "/api/owner/login(.*)",
    "/api/owner/register(.*)",
    "/api/owner/verify-session(.*)",
    "/api/owner/change-password(.*)",
])

// Owner routes - only owners can access
const isOwnerRoute = createRouteMatcher([
    "/owner/(.*)",
    "/group/create(.*)",
    "/group/(.*)",
])

// Owner API routes
const isOwnerApiRoute = createRouteMatcher([
    "/api/owner/(.*)",
    "/api/razorpay/(.*)",
    "/api/groups/(.*)",
])

// Learner routes - only learners (Clerk users) can access
const isLearnerRoute = createRouteMatcher([
    "/dashboard(.*)",
])

// Learner API routes - Clerk users can access these
const isLearnerApiRoute = createRouteMatcher([
    "/api/member-payment/(.*)",
])

// Account settings route - accessible by both Clerk users and owners
const isAccountSettingsRoute = createRouteMatcher([
    "/account-settings(.*)",
])

export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl

    // Get session cookies FIRST before any Clerk auth checks
    const adminSession = req.cookies.get("admin_session")?.value
    const ownerSession = req.cookies.get("owner_session")?.value
    const ownerPendingId = req.cookies.get("owner_pending_id")?.value

    // Account settings - accessible by both Clerk users and owners
    // IMPORTANT: Check this FIRST to allow owners to access without Clerk interference
    if (isAccountSettingsRoute(req)) {
        // If owner session exists, allow immediately without calling Clerk auth
        if (ownerSession) {
            return NextResponse.next()
        }
        // Otherwise check Clerk auth
        const { userId } = await auth()
        if (userId) {
            return NextResponse.next()
        }
        // Not authenticated - redirect to owner login if there's a pending owner
        if (ownerPendingId) {
            return NextResponse.redirect(new URL("/owner/login?redirect_url=/account-settings", req.url))
        }
        const signInUrl = new URL("/sign-in", req.url)
        signInUrl.searchParams.set("redirect_url", pathname)
        return NextResponse.redirect(signInUrl)
    }

    // Now get Clerk userId for other routes
    const { userId } = await auth()

    // Allow public routes
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // Allow owner auth routes (login, register, etc.)
    if (isOwnerAuthRoute(req)) {
        return NextResponse.next()
    }

    // Admin routes protection
    if (isAdminRoute(req) || isAdminApiRoute(req)) {
        if (!adminSession) {
            // Redirect to admin login if not admin
            if (isAdminApiRoute(req)) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }
            return NextResponse.redirect(new URL("/admin/login", req.url))
        }
        return NextResponse.next()
    }

    // Owner routes protection
    if (isOwnerRoute(req)) {
        // Allow if owner session exists
        if (ownerSession || ownerPendingId) {
            return NextResponse.next()
        }
        // Redirect to owner login
        const loginUrl = new URL("/owner/login", req.url)
        loginUrl.searchParams.set("redirect_url", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Learner API routes protection - Clerk users only
    if (isLearnerApiRoute(req)) {
        if (userId) {
            return NextResponse.next()
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Owner API routes protection
    if (isOwnerApiRoute(req)) {
        // Allow if owner session exists
        if (ownerSession || ownerPendingId) {
            return NextResponse.next()
        }
        // Also allow Clerk users for razorpay APIs (needed for member payments)
        if (userId && pathname.startsWith("/api/razorpay/")) {
            return NextResponse.next()
        }
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Learner routes protection - must be Clerk authenticated
    if (isLearnerRoute(req)) {
        if (!userId) {
            const signInUrl = new URL("/sign-in", req.url)
            signInUrl.searchParams.set("redirect_url", pathname)
            return NextResponse.redirect(signInUrl)
        }
        return NextResponse.next()
    }

    // Default: require authentication (Clerk user or owner session)
    if (!userId && !ownerSession) {
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
