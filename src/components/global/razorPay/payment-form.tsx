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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function PaymentForm() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [phone, setPhone] = useState("")
    const [name, setName] = useState("")

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
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

            // Load Razorpay script
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

            // Step 1: Create Razorpay customer
            const customerRes = await fetch("/api/razorpay/create-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name }),
            })

            const customerData = await customerRes.json()

            if (!customerData.success) {
                throw new Error(
                    customerData.error || "Failed to create customer",
                )
            }

            // Step 2: Create order for ₹1
            const orderRes = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId: customerData.customerId }),
            })

            const orderData = await orderRes.json()

            if (!orderData.success) {
                throw new Error(orderData.error || "Failed to create order")
            }

            // Step 3: Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "NeXuS",
                description: "Card Verification (Refundable ₹1)",
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        // Step 4: Save token
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
                                }),
                            },
                        )

                        const tokenData = await tokenRes.json()

                        if (tokenData.success) {
                            toast({
                                title: "Success! 🎉",
                                description:
                                    "Payment method added. ₹1 will be refunded shortly.",
                            })

                            // Redirect to group creation
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

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Add Payment Method</CardTitle>
                <CardDescription>
                    We'll charge ₹1 to verify your card (refunded immediately)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="9876543210"
                            maxLength={10}
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value.replace(/\D/g, ""))
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
                            <p>🔒 Secure payment powered by Razorpay</p>
                            <p>
                                💰 ₹1 verification charge (refunded immediately)
                            </p>
                            <p>
                                ✨ 14-day free trial starts after adding payment
                            </p>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
