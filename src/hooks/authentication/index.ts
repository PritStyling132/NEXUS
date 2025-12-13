"use client"
import { onSignUpUser } from "@/actions/auth"
import { SignUpSchema } from "@/components/forms/sign-up/schema"
import { SignInSchema } from "@/components/forms/sign-in/schema"
import { useSignIn, useSignUp } from "@clerk/nextjs"
import { OAuthStrategy } from "@clerk/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

// ================================
// ✅ SIGN IN HOOK
// ================================

export const useAuthSignIn = () => {
    const { isLoaded, setActive, signIn } = useSignIn()
    const router = useRouter()

    const {
        register,
        formState: { errors },
        reset,
        handleSubmit,
    } = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        mode: "onBlur",
    })

    // Helper function to clear any existing owner session before learner sign-in
    const clearOwnerSession = async () => {
        try {
            // Clear via API (server-side cookie deletion)
            await fetch("/api/owner/logout", { method: "POST" })
            // Also clear client-side cookies as backup
            document.cookie =
                "owner_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie =
                "owner_pending_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        } catch (error) {
            console.error("Failed to clear owner session:", error)
        }
    }

    const onClerkAuth = async (email: string, password: string) => {
        if (!isLoaded) {
            toast.error("Oops! something went wrong")
            return
        }

        try {
            // Clear any existing owner session before learner sign-in
            await clearOwnerSession()

            const authenticated = await signIn.create({
                identifier: email,
                password,
            })

            if (authenticated.status === "complete") {
                reset()

                await setActive({
                    session: authenticated.createdSessionId,
                })

                toast.success("Welcome back!")

                // Small delay to ensure session is set
                setTimeout(() => {
                    router.push("/explore")
                }, 100)
            }
        } catch (error: any) {
            console.error("Sign in error:", error)

            // Handle specific error codes
            const errorCode = error.errors?.[0]?.code

            if (errorCode === "form_password_incorrect") {
                toast.error("Incorrect password. Please try again.")
            } else if (errorCode === "form_identifier_not_found") {
                toast.error("Account not found. Please sign up first.")
            } else if (errorCode === "form_param_format_invalid") {
                toast.error("Invalid email format. Please check and try again.")
            } else {
                toast.error(
                    error.errors?.[0]?.message ||
                        "Sign in failed. Please try again.",
                )
            }
        }
    }

    const { mutate: InitiateLoginFlow, isPending } = useMutation({
        mutationFn: ({
            email,
            password,
        }: {
            email: string
            password: string
        }) => onClerkAuth(email, password),
    })

    const onAuthenticateUser = handleSubmit((values) => {
        InitiateLoginFlow({
            email: values.email,
            password: values.password,
        })
    })

    return { register, errors, isPending, onAuthenticateUser }
}

// ================================
// ✅ SIGN UP HOOK
// ================================
export const useAuthSignUp = () => {
    const { isLoaded, setActive, signUp } = useSignUp()
    const router = useRouter()

    const [creating, setCreating] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [code, setCode] = useState("")

    const {
        register,
        formState: { errors },
        reset,
        getValues,
        handleSubmit,
    } = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        mode: "onBlur",
    })

    // Helper function to clear any existing owner session
    const clearOwnerSession = async () => {
        try {
            await fetch("/api/owner/logout", { method: "POST" })
            document.cookie =
                "owner_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie =
                "owner_pending_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        } catch (error) {
            console.error("Failed to clear owner session:", error)
        }
    }

    // Step 1️⃣: Create account and send email verification
    const onGenerateCode = async () => {
        if (!isLoaded) {
            toast.error("Clerk not initialized properly")
            return
        }

        const email = getValues("email")
        const password = getValues("password")
        const firstname = getValues("firstname")
        const lastname = getValues("lastname")

        if (!email || !password || !firstname || !lastname) {
            toast.error("All fields are required")
            return
        }

        try {
            setCreating(true)

            // Clear any existing owner session before learner sign-up
            await clearOwnerSession()

            await signUp.create({
                emailAddress: email,
                password,
                firstName: firstname,
                lastName: lastname,
            })

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            })
            setVerifying(true)

            toast.success("Verification code sent! Check your email.")
        } catch (error: any) {
            console.error("Signup Error:", error)

            const errorCode = error.errors?.[0]?.code

            if (errorCode === "form_identifier_exists") {
                toast.error(
                    "This email is already registered. Please sign in instead.",
                )
            } else if (errorCode === "form_password_pwned") {
                toast.error(
                    "This password is too common. Please use a stronger password.",
                )
            } else if (errorCode === "form_password_length_too_short") {
                toast.error("Password must be at least 8 characters long.")
            } else {
                toast.error(
                    error.errors?.[0]?.message ||
                        "Something went wrong during signup.",
                )
            }
        } finally {
            setCreating(false)
        }
    }

    // Step 2️⃣: Verify code and create user in database
    const onInitiateUserRegistration = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }

        if (!isLoaded) {
            toast.error("Clerk not initialized properly")
            return
        }

        if (!code || code.length !== 6) {
            toast.error("Please enter a valid 6-digit code")
            return
        }

        const values = getValues()

        try {
            setCreating(true)

            console.log("🔄 Step 1: Attempting OTP verification...")

            // ✅ STEP 1: Verify the OTP code with Clerk
            const completeSignUp = await signUp.attemptEmailAddressVerification(
                {
                    code,
                },
            )

            console.log("✅ Verification Status:", completeSignUp.status)

            // ✅ STEP 2: Check if verification was successful
            if (completeSignUp.status !== "complete") {
                toast.error(
                    "Verification incomplete. Please check your code and try again.",
                )
                return
            }

            // ✅ STEP 3: Check if user was created in Clerk
            if (!signUp.createdUserId) {
                toast.error("User creation failed. Please try again.")
                return
            }

            console.log("✅ User ID:", signUp.createdUserId)
            console.log("🔄 Setting active session...")

            // ✅ STEP 4: Set the active session
            await setActive({ session: completeSignUp.createdSessionId })

            console.log("✅ Session activated")
            console.log("🔄 Creating user in database...")

            // ✅ STEP 5: Create user in database
            const user = await onSignUpUser({
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                clerkId: signUp.createdUserId,
                image: "",
            })

            console.log("📥 Database response:", user)

            reset()

            // ✅ STEP 6: Handle database creation result
            if (user.status === 200) {
                console.log("✅ User created successfully")
                toast.success(user.message || "Account created successfully!")

                setVerifying(false)
                setCode("")

                // Redirect after successful creation
                setTimeout(() => {
                    router.push("/explore")
                }, 100)
            } else {
                toast.error(
                    user.message ||
                        "Failed to create user profile. Please contact support.",
                )
            }
        } catch (error: any) {
            console.error("❌ Verification Error:", error)

            const errorCode = error.errors?.[0]?.code

            if (errorCode === "form_code_incorrect") {
                toast.error(
                    "Invalid verification code. Please check and try again.",
                )
            } else if (errorCode === "verification_expired") {
                toast.error(
                    "Verification code expired. Please request a new code.",
                )
                setVerifying(false)
                setCode("")
            } else {
                toast.error(
                    `Verification failed: ${error.message || "Unknown error"}`,
                )
            }
        } finally {
            setCreating(false)
        }
    }

    const onResendCode = async () => {
        if (!isLoaded || !signUp) {
            toast.error("Please wait...")
            return
        }

        try {
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            })
            setCode("")
            toast.success("New verification code sent to your email.")
        } catch (error: any) {
            console.error("Resend Error:", error)
            toast.error("Failed to resend code. Please try again.")
        }
    }

    return {
        register,
        errors,
        onGenerateCode,
        onInitiateUserRegistration,
        onResendCode,
        verifying,
        creating,
        code,
        setCode,
        getValues,
    }
}

export const useGoogleAuth = () => {
    const { signIn, isLoaded: LoadedSignIn } = useSignIn()
    const { signUp, isLoaded: LoadedSignUp } = useSignUp()

    // Helper function to clear any existing owner session
    const clearOwnerSession = async () => {
        try {
            await fetch("/api/owner/logout", { method: "POST" })
            document.cookie =
                "owner_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
            document.cookie =
                "owner_pending_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        } catch (error) {
            console.error("Failed to clear owner session:", error)
        }
    }

    const signInWith = async (strategy: OAuthStrategy) => {
        if (!LoadedSignIn) return
        try {
            // Clear owner session before Google sign-in
            await clearOwnerSession()
            return signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/callback",
                redirectUrlComplete: "/callback",
            })
        } catch (error) {
            console.error(error)
            toast.error("Failed to sign in with Google")
        }
    }

    const signUpWith = async (strategy: OAuthStrategy) => {
        if (!LoadedSignUp) return
        try {
            // Clear owner session before Google sign-up
            await clearOwnerSession()
            return signUp.authenticateWithRedirect({
                strategy,
                redirectUrl: "/callback",
                redirectUrlComplete: "/callback",
            })
        } catch (error) {
            console.error(error)
            toast.error("Failed to sign up with Google")
        }
    }

    return { signUpWith, signInWith }
}
