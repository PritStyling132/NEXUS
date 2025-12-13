"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

const OwnerSignInForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const { signOut, session } = useClerk()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true)

        try {
            // Clear any existing Clerk session before owner login
            if (session) {
                try {
                    await signOut()
                } catch (error) {
                    console.log("No active Clerk session to clear")
                }
            }

            const response = await fetch("/api/owner/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Login failed")
            }

            toast.success("Login successful!")

            // Small delay to ensure cookies are set, then redirect
            setTimeout(() => {
                // Check if first login - redirect to change password
                if (result.isFirstLogin) {
                    window.location.href = "/owner/change-password"
                } else if (result.firstGroupId) {
                    // Has group - go to dashboard
                    window.location.href = `/group/${result.firstGroupId}`
                } else {
                    // No group - go to group/create (handles payment + group creation)
                    window.location.href = "/group/create"
                }
            }, 100)
        } catch (error: any) {
            toast.error(error.message || "Login failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-1.5">
                <Label htmlFor="owner-email" className="text-sm">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="owner-email"
                        type="email"
                        {...register("email")}
                        placeholder="owner@example.com"
                        className="pl-9 h-10 bg-transparent border-themeGray"
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-red-500">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="owner-password" className="text-sm">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="owner-password"
                        type="password"
                        {...register("password")}
                        placeholder="Enter your password"
                        className="pl-9 h-10 bg-transparent border-themeGray"
                    />
                </div>
                {errors.password && (
                    <p className="text-xs text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <Button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-2xl"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In as Owner"
                )}
            </Button>
        </form>
    )
}

export default OwnerSignInForm
