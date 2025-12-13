"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { onJoinGroup } from "@/actions/groups"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ArrowRight, CheckCircle, IndianRupee } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { onGetActivePlanByGroup, onCheckMemberPayment } from "@/actions/pricing"
import { MemberPaymentModal } from "@/components/global/member-payment-modal"

type JoinButtonProps = {
    owner: boolean
    groupid: string
    groupName?: string
    isLoggedIn?: boolean
    isMember?: boolean
}

export const JoinButton = ({
    owner,
    groupid,
    groupName = "this group",
    isLoggedIn = false,
    isMember = false,
}: JoinButtonProps) => {
    const router = useRouter()
    const [isJoining, setIsJoining] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

    // Fetch active pricing plan for this group's owner
    const { data: planData, isLoading: isPlanLoading } = useQuery({
        queryKey: ["active-plan", groupid],
        queryFn: () => onGetActivePlanByGroup(groupid),
        enabled: !owner && !isMember, // Only fetch if not owner and not already member
    })

    // Check if user has already paid (only if logged in)
    const { data: paymentData, isLoading: isPaymentLoading } = useQuery({
        queryKey: ["member-payment-check", groupid],
        queryFn: () => onCheckMemberPayment(groupid),
        enabled: isLoggedIn && !owner && !isMember,
    })

    const activePlan = planData?.data
    const hasPaid = paymentData?.hasPaid || false
    const requiresPayment = !!activePlan && !hasPaid && !isMember

    const handleJoinClick = async () => {
        // If not logged in, redirect to sign-in page
        if (!isLoggedIn) {
            router.push(`/sign-in?redirect_url=/about/${groupid}`)
            return
        }

        // If payment is required and user hasn't paid, open payment modal
        if (requiresPayment) {
            setIsPaymentModalOpen(true)
            return
        }

        // Free join flow
        setIsJoining(true)
        try {
            const member = await onJoinGroup(groupid)
            if (member?.status === 200) {
                toast.success("Successfully joined the group!")
                router.push("/dashboard")
            } else {
                toast.error(member?.message || "Failed to join group. Please try again.")
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsJoining(false)
        }
    }

    // If user is the owner
    if (owner) {
        return (
            <Button disabled className="w-full p-10" variant="ghost">
                Owner
            </Button>
        )
    }

    // If user is already a member, show "Go to Dashboard"
    if (isMember && isLoggedIn) {
        return (
            <Link href="/dashboard" className="w-full">
                <Button className="w-full p-10" variant="ghost">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Already Joined - Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        )
    }

    // Loading state
    if (isPlanLoading || isPaymentLoading) {
        return (
            <Button disabled className="w-full p-10" variant="ghost">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
            </Button>
        )
    }

    // Determine button text based on pricing
    const getButtonText = () => {
        if (isJoining) {
            return (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                </>
            )
        }

        if (!isLoggedIn) {
            if (activePlan) {
                return (
                    <>
                        Sign in to Join - ₹{activePlan.priceDisplay?.toLocaleString()}
                    </>
                )
            }
            return "Sign in to Join - Free"
        }

        if (requiresPayment && activePlan) {
            return (
                <>
                    <IndianRupee className="mr-1 h-4 w-4" />
                    Join now - ₹{activePlan.priceDisplay?.toLocaleString()}
                </>
            )
        }

        return "Join now - Free"
    }

    return (
        <>
            <Button
                onClick={handleJoinClick}
                className="w-full p-10"
                variant="ghost"
                disabled={isJoining}
            >
                {getButtonText()}
            </Button>

            {/* Payment Modal */}
            {activePlan && (
                <MemberPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    groupId={groupid}
                    groupName={groupName}
                    planName={activePlan.name}
                    price={activePlan.priceDisplay}
                />
            )}
        </>
    )
}

export default JoinButton
