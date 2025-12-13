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
import {
    Loader2,
    CreditCard,
    CheckCircle,
    ShieldCheck,
    IndianRupee,
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
                name: "NeXuS",
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
                    color: "#9333ea",
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

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && !isProcessing && onClose()}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Join {groupName}
                    </DialogTitle>
                    <DialogDescription>
                        Complete payment to become a member of this group
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Pricing Card */}
                    <Card className="border-primary/30 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {planName}
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                    <IndianRupee className="w-8 h-8 text-foreground" />
                                    <span className="text-4xl font-bold text-foreground">
                                        {price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    One-time payment
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Full access to all group content</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Access to courses and channels</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Direct messaging with group owner</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>
                                Lifetime membership - no recurring charges
                            </span>
                        </div>
                    </div>

                    {/* Phone Input - Required for Razorpay */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">
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
                            disabled={isProcessing}
                            className="h-10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Required for payment verification
                        </p>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>Secure payment powered by Razorpay</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Button
                        onClick={handlePayment}
                        disabled={isProcessing || phone.length !== 10}
                        className="w-full"
                        size="lg"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay ₹{price.toLocaleString()} & Join</>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full"
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MemberPaymentModal
