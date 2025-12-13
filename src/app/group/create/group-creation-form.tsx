"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const CATEGORIES = [
    "Technology",
    "Business",
    "Education",
    "Entertainment",
    "Health & Fitness",
    "Lifestyle",
    "Other",
]

export default function GroupCreationForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        privacy: "PRIVATE" as "PUBLIC" | "PRIVATE",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.category) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        try {
            setLoading(true)

            // Call API route instead of server action
            const response = await fetch("/api/groups/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Success! 🎉",
                    description:
                        "Your group has been created and your 14-day trial has started!",
                })

                // Redirect to the new group
                router.push(`/group/${result.group.id}`)
            } else if (result.redirectTo) {
                toast({
                    title: "Payment Required",
                    description: "Please add a payment method first",
                    variant: "destructive",
                })
                router.push(result.redirectTo)
            } else {
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create group",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create Your Group</CardTitle>
                <CardDescription>
                    Set up your community. Your 14-day free trial starts now!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Group Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="My Awesome Group"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                            disabled={loading}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Tell us about your group..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            disabled={loading}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="privacy">Privacy</Label>
                        <Select
                            value={formData.privacy}
                            onValueChange={(value: "PUBLIC" | "PRIVATE") =>
                                setFormData({ ...formData, privacy: value })
                            }
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRIVATE">Private</SelectItem>
                                <SelectItem value="PUBLIC">Public</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {formData.privacy === "PRIVATE"
                                ? "Only invited members can join"
                                : "Anyone can discover and join your group"}
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 /> Creating Group...
                                </span>
                            ) : (
                                "Create Group"
                            )}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            disabled={loading}
                            onClick={async () => {
                                try {
                                    setLoading(true)
                                    const response = await fetch(
                                        "/api/owner/skip-group-creation",
                                        {
                                            method: "POST",
                                        },
                                    )
                                    const data = await response.json()
                                    if (response.ok) {
                                        toast({
                                            title: "Skipped",
                                            description:
                                                "You can create a group later from your dashboard",
                                        })
                                        // Redirect to the appropriate dashboard based on user type
                                        // If redirectUrl is provided by API, use that, otherwise go to owner dashboard
                                        router.push(
                                            data.redirectUrl ||
                                                "/owner/dashboard",
                                        )
                                    }
                                } catch (error) {
                                    toast({
                                        title: "Error",
                                        description:
                                            "Failed to skip. Please try again.",
                                        variant: "destructive",
                                    })
                                } finally {
                                    setLoading(false)
                                }
                            }}
                        >
                            Skip for now
                        </Button>

                        <div className="text-xs text-center text-muted-foreground">
                            <p>
                                ✨ 14-day free trial • ₹4,999/month after trial
                            </p>
                            <p className="mt-1">
                                You can cancel anytime from your settings
                            </p>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
