"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Loader2,
    CreditCard,
    CheckCircle,
    ShieldCheck,
    IndianRupee,
    Sparkles,
    Users,
    BookOpen,
    MessageSquare,
    Crown,
    Zap,
    Lock,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

declare global {
    interface Window {
        Razorpay: any
    }
}

type Props = {
    isOpen: boolean
    onClose: () => void
    groupId: string
    groupName: string
    planName: string
    price: number // in rupees
}

export const MemberPaymentModal = ({
    isOpen,
    onClose,
    groupId,
    groupName,
    planName,
    price,
}: Props) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [phone, setPhone] = useState("")
    const router = useRouter()

    const loadRazorpayScript = (): Promise<boolean> => {
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

    const handlePayment = async () => {
        // Validate phone number
        if (!phone || phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number")
            return
        }

        try {
            setIsProcessing(true)

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                toast.error("Failed to load payment gateway. Please try again.")
                setIsProcessing(false)
                return
            }

            // Create member payment order (simple one-time payment - no customer needed)
            const orderRes = await fetch("/api/member-payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupId, phone }),
            })

            const orderData = await orderRes.json()

            if (!orderData.success) {
                toast.error(orderData.error || "Failed to create order")
                setIsProcessing(false)
                return
            }

            // Open Razorpay checkout
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Nexus",
                description: `Join ${orderData.groupName} - ${orderData.planName}`,
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    try {
                        // Verify payment
                        const verifyRes = await fetch(
                            "/api/member-payment/verify",
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
                                    groupId,
                                    planId: orderData.planId,
                                }),
                            },
                        )

                        const verifyData = await verifyRes.json()

                        if (verifyData.success) {
                            toast.success(
                                "Payment successful! Welcome to the group.",
                            )
                            onClose()
                            router.push("/dashboard")
                        } else {
                            toast.error(
                                verifyData.error ||
                                    "Payment verification failed",
                            )
                        }
                    } catch (error) {
                        toast.error(
                            "Payment verification failed. Please contact support.",
                        )
                    } finally {
                        setIsProcessing(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false)
                    },
                    escape: true,
                    backdropclose: false,
                },
                prefill: {
                    name: orderData.prefill?.name || "",
                    email: orderData.prefill?.email || "",
                    contact: `+91${phone}`,
                },
                theme: {
                    color: "#8b5cf6",
                },
                notes: {
                    groupId: groupId,
                },
            }

            const razorpayInstance = new window.Razorpay(options)

            // Handle payment failure
            razorpayInstance.on("payment.failed", function (response: any) {
                console.error("Payment failed:", response.error)
                toast.error(
                    response.error?.description ||
                        "Payment failed. Please try again.",
                )
                setIsProcessing(false)
            })

            onClose()

            setTimeout(() => {
                razorpayInstance.open()
            }, 100)
        } catch (error) {
            console.error("Payment error:", error)
            toast.error("Failed to initiate payment. Please try again.")
            setIsProcessing(false)
        }
    }

    const benefits = [
        { icon: Users, text: "Full access to all group content" },
        { icon: BookOpen, text: "Access to courses and modules" },
        { icon: MessageSquare, text: "Direct messaging with community" },
        { icon: Sparkles, text: "Lifetime membership - no recurring charges" },
    ]

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && !isProcessing && onClose()}
        >
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-primary/20 bg-background/95 backdrop-blur-xl">
                {/* Header with gradient background */}
                <div className="relative bg-gradient-to-br from-primary/20 via-purple-500/20 to-cyan-500/20 p-6 pb-8">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/30 to-transparent rounded-full blur-2xl" />

                    <DialogHeader className="relative z-10">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-xl">
                            Join{" "}
                            <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent font-bold">
                                {groupName}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Unlock exclusive access to this community
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-5">
                    {/* Pricing Card */}
                    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-cyan-500/10 overflow-hidden relative">
                        <div className="absolute top-2 right-2">
                            <Badge className="bg-gradient-to-r from-primary to-cyan-500 text-white border-0 text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                {planName}
                            </Badge>
                        </div>
                        <CardContent className="pt-8 pb-6">
                            <div className="text-center space-y-1">
                                <div className="flex items-center justify-center">
                                    <span className="text-2xl text-muted-foreground">₹</span>
                                    <span className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                                        {price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    One-time payment • Lifetime access
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Benefits */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">What you'll get:</p>
                        <div className="grid grid-cols-1 gap-2">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-sm">{benefit.text}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm flex items-center gap-2">
                            Phone Number
                            <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                                <span className="text-sm font-medium">+91</span>
                                <div className="w-px h-5 bg-border" />
                            </div>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                value={phone}
                                onChange={(e) =>
                                    setPhone(e.target.value.replace(/\D/g, ""))
                                }
                                disabled={isProcessing}
                                className="pl-16 h-12 text-base border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Required for payment verification
                        </p>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                Secure Payment
                            </p>
                            <p className="text-xs text-muted-foreground">
                                256-bit SSL encryption • Powered by Razorpay
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing || phone.length !== 10}
                            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary via-purple-500 to-cyan-500 hover:opacity-90 transition-opacity border-0 text-white shadow-lg"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Pay ₹{price.toLocaleString()} & Join
                                </>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="w-full h-10 rounded-xl text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MemberPaymentModal
