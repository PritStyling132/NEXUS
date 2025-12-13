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
    Mail,
    Phone,
    User,
    X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const registerSchema = z.object({
    firstname: z.string().min(2, "First name must be at least 2 characters"),
    lastname: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
})

type RegisterFormData = z.infer<typeof registerSchema>

const OwnerRegistrationForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [cvUrl, setCvUrl] = useState<string>("")
    const [isUploadingCV, setIsUploadingCV] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
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
            <div className="text-center space-y-4 py-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold">Application Submitted!</h3>
                <p className="text-sm text-muted-foreground">
                    Thank you for applying. We will review your application and
                    get back to you within 24-48 hours.
                </p>
                <p className="text-xs text-muted-foreground">
                    A confirmation email has been sent to your email address.
                </p>
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsSuccess(false)
                        setCvFile(null)
                        setCvUrl("")
                        reset()
                    }}
                >
                    Submit Another Application
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="firstname" className="text-sm">
                        First Name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="firstname"
                            {...register("firstname")}
                            placeholder="John"
                            className="pl-9 h-10 bg-transparent border-themeGray"
                        />
                    </div>
                    {errors.firstname && (
                        <p className="text-xs text-red-500">
                            {errors.firstname.message}
                        </p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="lastname" className="text-sm">
                        Last Name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="lastname"
                            {...register("lastname")}
                            placeholder="Doe"
                            className="pl-9 h-10 bg-transparent border-themeGray"
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
            <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">
                    Email Address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john@example.com"
                        className="pl-9 h-10 bg-transparent border-themeGray"
                    />
                </div>
                {errors.email && (
                    <p className="text-xs text-red-500">
                        {errors.email.message}
                    </p>
                )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm">
                    Phone Number
                </Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground border-r pr-2 border-themeGray">
                        +91
                    </div>
                    <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="9876543210"
                        className="pl-[4.2rem] h-10 bg-transparent border-themeGray"
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
            <div className="space-y-1.5">
                <Label className="text-sm">
                    CV / Resume <span className="text-red-500">*</span>
                </Label>
                <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                        cvFile
                            ? "border-purple-400 bg-purple-500/10"
                            : "border-themeGray hover:border-purple-400"
                    }`}
                >
                    {cvFile ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-500/20 rounded flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium truncate max-w-[150px]">
                                        {cvFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(cvFile.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isUploadingCV && (
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                )}
                                {cvUrl && !isUploadingCV && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                <button
                                    type="button"
                                    onClick={removeCV}
                                    className="p-1 hover:bg-gray-700 rounded"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Click to upload CV
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PDF or Word (max 5MB)
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

            {/* Process Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[9px] font-bold">
                        1
                    </div>
                    Submit
                </span>
                <span className="w-3 h-px bg-themeGray" />
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[9px] font-bold">
                        2
                    </div>
                    Review
                </span>
                <span className="w-3 h-px bg-themeGray" />
                <span className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-[9px] font-bold">
                        3
                    </div>
                    Approved
                </span>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-2xl"
                disabled={isSubmitting || isUploadingCV || !cvUrl}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    "Submit Application"
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                Your application will be reviewed within 24-48 hours
            </p>
        </form>
    )
}

export default OwnerRegistrationForm
