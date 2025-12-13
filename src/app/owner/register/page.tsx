"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
    Upload,
    Loader2,
    CheckCircle,
    FileText,
    Briefcase,
    Mail,
    Phone,
    User,
    X,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/global/theme-toggle"

const registerSchema = z.object({
    firstname: z.string().min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function OwnerRegisterPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [cvUrl, setCvUrl] = useState<string>("")
    const [isUploadingCV, setIsUploadingCV] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    })

    const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        if (!allowedTypes.includes(file.type)) {
            toast.error("Please upload a PDF or Word document")
            return
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB")
            return
        }

        setCvFile(file)
        setIsUploadingCV(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/cloudinary/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to upload CV")
            }

            const data = await response.json()
            setCvUrl(data.url)
            toast.success("CV uploaded successfully")
        } catch (error) {
            toast.error("Failed to upload CV. Please try again.")
            setCvFile(null)
        } finally {
            setIsUploadingCV(false)
        }
    }

    const removeCV = () => {
        setCvFile(null)
        setCvUrl("")
    }

    const onSubmit = async (data: RegisterFormData) => {
        if (!cvUrl) {
            toast.error("Please upload your CV/Resume")
            return
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData()
            formData.append("firstname", data.firstname)
            formData.append("lastname", data.lastname)
            formData.append("email", data.email)
            formData.append("phone", data.phone)
            formData.append("cvUrl", cvUrl)
            formData.append("cvFileName", cvFile?.name || "cv")

            const response = await fetch("/api/owner/register", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit application")
            }

            setIsSuccess(true)
            toast.success("Application submitted successfully!")
        } catch (error: any) {
            toast.error(error.message || "Failed to submit application")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                {/* Header */}
                <header className="border-b">
                    <div className="container flex h-16 items-center justify-between px-4">
                        <Link href="/">
                            <h2 className="text-2xl font-bold">NeXuS.</h2>
                        </Link>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold">
                                    Application Submitted!
                                </h2>
                                <p className="text-muted-foreground">
                                    Thank you for applying. We will review your
                                    application and get back to you within 24-48
                                    hours.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    A confirmation email has been sent to your
                                    email address.
                                </p>
                                <Link href="/">
                                    <Button variant="outline" className="mt-4">
                                        Return to Home
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-purple-50/30 dark:from-purple-950/20 dark:via-background dark:to-purple-950/10 flex flex-col">
            {/* Header */}
            <header className="border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link href="/">
                        <h2 className="text-2xl font-bold">NeXuS.</h2>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/owner/login">
                            <Button
                                variant="ghost"
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                            >
                                Already approved? Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-lg">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                            <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex justify-center mb-3">
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-4 py-1.5 rounded-full">
                                Owner Registration
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">
                            Become a NeXuS Owner
                        </h1>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Build your community, create courses, and grow your
                            audience with NeXuS platform.
                        </p>
                    </div>

                    {/* Registration Card */}
                    <Card className="border-purple-200 dark:border-purple-900/50 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">
                                Application Form
                            </CardTitle>
                            <CardDescription>
                                Fill in your details to apply for owner access
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="firstname"
                                            className="text-sm font-medium"
                                        >
                                            First Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="firstname"
                                                {...register("firstname")}
                                                placeholder="John"
                                                className="pl-10 h-11 border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-500"
                                            />
                                        </div>
                                        {errors.firstname && (
                                            <p className="text-xs text-red-500">
                                                {errors.firstname.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="lastname"
                                            className="text-sm font-medium"
                                        >
                                            Last Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="lastname"
                                                {...register("lastname")}
                                                placeholder="Doe"
                                                className="pl-10 h-11 border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-500"
                                            />
                                        </div>
                                        {errors.lastname && (
                                            <p className="text-xs text-red-500">
                                                {errors.lastname.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-sm font-medium"
                                    >
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register("email")}
                                            placeholder="john@example.com"
                                            className="pl-10 h-11 border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-500"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                {/* Phone Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="phone"
                                        className="text-sm font-medium"
                                    >
                                        Phone Number
                                    </Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r pr-2 border-gray-200 dark:border-gray-700">
                                            +91
                                        </div>
                                        <Input
                                            id="phone"
                                            {...register("phone")}
                                            placeholder="9876543210"
                                            className="pl-[4.5rem] h-11 border-gray-200 dark:border-gray-800 focus:border-purple-500 focus:ring-purple-500"
                                            maxLength={10}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-xs text-red-500">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                {/* CV Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        CV / Resume{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div
                                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                                            cvFile
                                                ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20"
                                                : "border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
                                        }`}
                                    >
                                        {cvFile ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-medium truncate max-w-[180px]">
                                                            {cvFile.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(
                                                                cvFile.size /
                                                                1024 /
                                                                1024
                                                            ).toFixed(2)}{" "}
                                                            MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isUploadingCV && (
                                                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                                    )}
                                                    {cvUrl && !isUploadingCV && (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={removeCV}
                                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                                    >
                                                        <X className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                                                        <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            Click to upload your
                                                            CV
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            PDF or Word document
                                                            (max 5MB)
                                                        </p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleCVUpload}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                                    disabled={
                                        isSubmitting || isUploadingCV || !cvUrl
                                    }
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </Button>
                            </form>

                            {/* Process Info */}
                            <div className="mt-6 pt-6 border-t">
                                <p className="text-xs text-muted-foreground text-center mb-4">
                                    What happens next?
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                                            1
                                        </div>
                                        Submit
                                    </span>
                                    <span className="w-4 h-px bg-gray-300 dark:bg-gray-700" />
                                    <span className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                                            2
                                        </div>
                                        Review
                                    </span>
                                    <span className="w-4 h-px bg-gray-300 dark:bg-gray-700" />
                                    <span className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                                            3
                                        </div>
                                        Approved
                                    </span>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            {/* Footer Links */}
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Not looking to be an owner?
                                </p>
                                <div className="flex items-center justify-center gap-4 mt-2">
                                    <Link
                                        href="/sign-up"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        Learner Sign Up
                                    </Link>
                                    <span className="text-gray-300 dark:text-gray-700">
                                        |
                                    </span>
                                    <Link
                                        href="/sign-in"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                    >
                                        Learner Login
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        By submitting your application, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline hover:text-foreground"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline hover:text-foreground"
                        >
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
