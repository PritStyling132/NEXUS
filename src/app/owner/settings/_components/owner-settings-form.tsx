"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { onUpdateUserProfile } from "@/actions/auth"
import { uploadFile } from "@/lib/cloudinary"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Props = {
    initialData: {
        firstname: string
        lastname: string
        email: string
        image: string
    }
}

export function OwnerSettingsForm({ initialData }: Props) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [firstname, setFirstname] = useState(initialData.firstname)
    const [lastname, setLastname] = useState(initialData.lastname)
    const [image, setImage] = useState(initialData.image)
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const handleImageClick = () => {
        fileInputRef.current?.click()
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB")
            return
        }

        setIsUploading(true)
        try {
            const url = await uploadFile(file)
            setImage(url)
            toast.success("Image uploaded successfully")
        } catch (error) {
            toast.error("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!firstname.trim() || !lastname.trim()) {
            toast.error("First name and last name are required")
            return
        }

        setIsSaving(true)
        try {
            const result = await onUpdateUserProfile({
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                image: image || undefined,
            })

            if (result.status === 200) {
                toast.success("Profile updated successfully")
                router.refresh()
            } else {
                toast.error(result.message || "Failed to update profile")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges =
        firstname !== initialData.firstname ||
        lastname !== initialData.lastname ||
        image !== initialData.image

    return (
        <form onSubmit={handleSubmit}>
            <Card className="border-border">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="rounded-lg">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your profile photo and personal details
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-24 h-24 border-4 border-border">
                                <AvatarImage src={image} alt="Profile" />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                                    {firstname?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                                onClick={handleImageClick}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Click the camera icon to change your photo
                        </p>
                    </div>

                    {/* Name Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstname">First Name</Label>
                            <Input
                                id="firstname"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                placeholder="Enter your first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input
                                id="lastname"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                                placeholder="Enter your last name"
                            />
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            value={initialData.email}
                            disabled
                            className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email address cannot be changed
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={!hasChanges || isSaving || isUploading}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
