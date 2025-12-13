"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    onCreatePricingPlan,
    onGetOwnerPricingPlans,
    onUpdatePricingPlan,
    onDeletePricingPlan,
    onSetActivePlan,
    onGetActivePlanByGroup,
    onCheckMemberPayment,
} from "@/actions/pricing"
import { useRouter } from "next/navigation"

// Hook for managing owner's pricing plans
export const useOwnerPricingPlans = () => {
    const queryClient = useQueryClient()

    // Fetch all plans
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["owner-pricing-plans"],
        queryFn: () => onGetOwnerPricingPlans(),
    })

    // Create plan mutation
    const createMutation = useMutation({
        mutationFn: onCreatePricingPlan,
        onSuccess: (result) => {
            if (result.status === 200) {
                toast.success("Pricing plan created successfully")
                queryClient.invalidateQueries({
                    queryKey: ["owner-pricing-plans"],
                })
            } else {
                toast.error(result.message)
            }
        },
        onError: () => {
            toast.error("Failed to create pricing plan")
        },
    })

    // Update plan mutation
    const updateMutation = useMutation({
        mutationFn: ({ planId, data }: { planId: string; data: any }) =>
            onUpdatePricingPlan(planId, data),
        onSuccess: (result) => {
            if (result.status === 200) {
                toast.success("Plan updated successfully")
                queryClient.invalidateQueries({
                    queryKey: ["owner-pricing-plans"],
                })
            } else {
                toast.error(result.message)
            }
        },
        onError: () => {
            toast.error("Failed to update plan")
        },
    })

    // Delete plan mutation
    const deleteMutation = useMutation({
        mutationFn: onDeletePricingPlan,
        onSuccess: (result) => {
            if (result.status === 200) {
                toast.success("Plan deleted successfully")
                queryClient.invalidateQueries({
                    queryKey: ["owner-pricing-plans"],
                })
            } else {
                toast.error(result.message)
            }
        },
        onError: () => {
            toast.error("Failed to delete plan")
        },
    })

    // Set active plan mutation
    const setActiveMutation = useMutation({
        mutationFn: onSetActivePlan,
        onSuccess: (result) => {
            if (result.status === 200) {
                toast.success(result.message)
                queryClient.invalidateQueries({
                    queryKey: ["owner-pricing-plans"],
                })
            } else {
                toast.error(result.message)
            }
        },
        onError: () => {
            toast.error("Failed to set active plan")
        },
    })

    return {
        plans: data?.data || [],
        isLoading,
        refetch,
        createPlan: createMutation.mutate,
        isCreating: createMutation.isPending,
        updatePlan: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deletePlan: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        setActivePlan: setActiveMutation.mutate,
        isSettingActive: setActiveMutation.isPending,
    }
}

// Hook for member payment flow
export const useMemberPayment = (groupId: string) => {
    const router = useRouter()
    const queryClient = useQueryClient()

    // Check if payment is required for this group
    const { data: planData, isLoading: isPlanLoading } = useQuery({
        queryKey: ["active-plan", groupId],
        queryFn: () => onGetActivePlanByGroup(groupId),
        enabled: !!groupId,
    })

    // Check if user has already paid
    const { data: paymentData, isLoading: isPaymentLoading } = useQuery({
        queryKey: ["member-payment-check", groupId],
        queryFn: () => onCheckMemberPayment(groupId),
        enabled: !!groupId,
    })

    const activePlan = planData?.data
    const hasPaid = paymentData?.hasPaid || false
    const requiresPayment = !!activePlan && !hasPaid

    // Load Razorpay script
    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if ((window as any).Razorpay) {
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

    // Handle payment - requires phone number for Razorpay customer creation
    const initiatePayment = async (phone: string): Promise<boolean> => {
        // Validate phone
        if (!phone || phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number")
            return false
        }

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                toast.error("Failed to load payment gateway")
                return false
            }

            // Step 1: Create Razorpay customer first
            const customerRes = await fetch("/api/razorpay/create-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name: "" }),
            })

            const customerData = await customerRes.json()

            if (!customerData.success) {
                toast.error(customerData.error || "Failed to setup payment")
                return false
            }

            // Step 2: Create order with customer ID
            const orderRes = await fetch("/api/member-payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupId,
                    phone,
                    customerId: customerData.customerId,
                }),
            })

            const orderData = await orderRes.json()

            if (!orderData.success) {
                toast.error(orderData.error || "Failed to create order")
                return false
            }

            // Step 3: Open Razorpay checkout
            return new Promise((resolve) => {
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
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
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
                                queryClient.invalidateQueries({
                                    queryKey: ["member-payment-check", groupId],
                                })
                                router.push("/dashboard")
                                resolve(true)
                            } else {
                                toast.error(
                                    verifyData.error ||
                                        "Payment verification failed",
                                )
                                resolve(false)
                            }
                        } catch (error) {
                            toast.error("Payment verification failed")
                            resolve(false)
                        }
                    },
                    modal: {
                        ondismiss: () => {
                            toast.error("Payment cancelled")
                            resolve(false)
                        },
                    },
                    prefill: {
                        name: orderData.prefill?.name || "",
                        contact: phone,
                    },
                    theme: {
                        color: "#9333ea",
                    },
                }

                const razorpay = new (window as any).Razorpay(options)
                razorpay.open()
            })
        } catch (error) {
            console.error("Payment error:", error)
            toast.error("Failed to initiate payment")
            return false
        }
    }

    return {
        activePlan,
        hasPaid,
        requiresPayment,
        isLoading: isPlanLoading || isPaymentLoading,
        initiatePayment,
        priceDisplay: activePlan?.priceDisplay || 0,
    }
}
