"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

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
import { useToast } from "@/components/ui/use-toast"
import { ThemeToggle } from "@/components/global/theme-toggle"

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function OwnerPaymentSetupPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [isVerifying, setIsVerifying] = useState(true)
    const [phone, setPhone] = useState("")
    const [name, setName] = useState("")
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const verifySession = async () => {
            try {
                const response = await fetch("/api/owner/verify-session")
                const data = await response.json()

                if (!response.ok || !data.valid) {
                    router.push("/owner/login")
                    return
                }

                if (data.type === "first_login") {
                    router.push("/owner/change-password")
                    return
                }

                if (data.hasPaymentMethod) {
                    router.push("/group/create")
                    return
                }

                setUserId(data.userId)
                setName(data.name || "")
            } catch {
                router.push("/owner/login")
            } finally {
                setIsVerifying(false)
            }
        }
        verifySession()
    }, [router])

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true)
                return
            }
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!phone || phone.length !== 10) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter a valid 10-digit phone number",
                variant: "destructive",
            })
            return
        }

        if (!name || name.trim().length < 2) {
            toast({
                title: "Invalid Name",
                description: "Please enter your full name",
                variant: "destructive",
            })
            return
        }

        try {
            setLoading(true)

            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                toast({
                    title: "Error",
                    description:
                        "Failed to load payment gateway. Please try again.",
                    variant: "destructive",
                })
                return
            }

            // Create Razorpay customer for owner
            const customerRes = await fetch("/api/razorpay/create-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name, ownerUserId: userId }),
            })

            const customerData = await customerRes.json()

            if (!customerData.success) {
                throw new Error(
                    customerData.error || "Failed to create customer",
                )
            }

            // Create order for ₹1
            const orderRes = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId: customerData.customerId }),
            })

            const orderData = await orderRes.json()

            if (!orderData.success) {
                throw new Error(orderData.error || "Failed to create order")
            }

            // Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "NeXuS",
                description: "Card Verification (Refundable ₹1)",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const tokenRes = await fetch(
                            "/api/razorpay/save-token",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,
                                    razorpay_order_id:
                                        response.razorpay_order_id,
                                    razorpay_signature:
                                        response.razorpay_signature,
                                    customerId: customerData.customerId,
                                    ownerUserId: userId,
                                }),
                            },
                        )

                        const tokenData = await tokenRes.json()

                        if (tokenData.success) {
                            toast({
                                title: "Success!",
                                description:
                                    "Payment method added. ₹1 will be refunded shortly.",
                            })
                            setTimeout(() => {
                                router.push("/group/create")
                            }, 1000)
                        } else {
                            throw new Error(
                                tokenData.error ||
                                    "Failed to save payment method",
                            )
                        }
                    } catch (error: any) {
                        toast({
                            title: "Error",
                            description:
                                error.message ||
                                "Failed to save payment method",
                            variant: "destructive",
                        })
                    } finally {
                        setLoading(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                        toast({
                            title: "Payment Cancelled",
                            description: "You cancelled the payment process",
                            variant: "destructive",
                        })
                    },
                },
                prefill: {
                    name: name,
                    contact: phone,
                },
                theme: {
                    color: "#3b82f6",
                },
            }

            const razorpay = new window.Razorpay(options)
            razorpay.open()
        } catch (error: any) {
            console.error("Payment error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to process payment",
                variant: "destructive",
            })
            setLoading(false)
        }
    }

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                    <h2 className="text-2xl font-bold">NeXuS.</h2>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 container grid lg:grid-cols-2 gap-8 py-12 px-4">
                {/* Left Side - Information */}
                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Setup Payment Method
                        </h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            Add your payment method to start your free trial
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 items-start p-4 bg-muted rounded-lg">
                            <span className="text-2xl">💳</span>
                            <div>
                                <h3 className="font-semibold">
                                    ₹1 Verification
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    We charge ₹1 to verify your card. This is
                                    refunded immediately.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-4 bg-muted rounded-lg">
                            <span className="text-2xl">✨</span>
                            <div>
                                <h3 className="font-semibold">
                                    14-Day Free Trial
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    After verification, enjoy all features free
                                    for 14 days.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-4 bg-muted rounded-lg">
                            <span className="text-2xl">📅</span>
                            <div>
                                <h3 className="font-semibold">
                                    ₹4,999/month After Trial
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                    Cancel anytime before trial ends to avoid
                                    charges.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Add Payment Method</CardTitle>
                            <CardDescription>
                                We'll charge ₹1 to verify your card (refunded
                                immediately)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone Number{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        disabled={loading}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Required for Razorpay verification
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
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </span>
                                        ) : (
                                            "Add Payment Method"
                                        )}
                                    </Button>

                                    <div className="text-xs text-center text-muted-foreground space-y-1">
                                        <p>
                                            🔒 Secure payment powered by
                                            Razorpay
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
