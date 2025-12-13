"use client"

import { useState } from "react"
import {
    CreditCard,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    IndianRupee,
    Users,
    AlertCircle,
} from "lucide-react"
import { useOwnerPricingPlans } from "@/hooks/pricing"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PricingPlanForm } from "@/components/forms/pricing-plan"
import { PricingPlanFormData } from "@/components/forms/pricing-plan/schema"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Loader from "@/components/global/loader"

interface Props {
    params: Promise<{ groupid: string }>
}

const SubscriptionsPage = ({ params }: Props) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)

    const {
        plans,
        isLoading,
        createPlan,
        isCreating,
        updatePlan,
        isUpdating,
        deletePlan,
        isDeleting,
        setActivePlan,
        isSettingActive,
    } = useOwnerPricingPlans()

    const handleCreatePlan = (data: PricingPlanFormData) => {
        createPlan(
            {
                name: data.name,
                description: data.description,
                price: data.price,
                isActive: plans.length === 0, // Make first plan active by default
            },
            {
                onSuccess: () => {
                    setIsCreateDialogOpen(false)
                },
            },
        )
    }

    const handleUpdatePlan = (data: PricingPlanFormData) => {
        if (!editingPlan) return
        updatePlan(
            {
                planId: editingPlan.id,
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                },
            },
            {
                onSuccess: () => {
                    setEditingPlan(null)
                },
            },
        )
    }

    const handleDeletePlan = () => {
        if (!deletingPlanId) return
        deletePlan(deletingPlanId, {
            onSuccess: () => {
                setDeletingPlanId(null)
            },
        })
    }

    const handleSetActivePlan = (planId: string, isActive: boolean) => {
        setActivePlan(isActive ? planId : null)
    }

    const activePlan = plans.find((p: any) => p.isActive)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader loading>Loading pricing plans...</Loader>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 md:py-10 overflow-auto bg-background dark:bg-[#101011]">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-themeTextWhite">
                            Subscription Pricing
                        </h3>
                    </div>

                    <Dialog
                        open={isCreateDialogOpen}
                        onOpenChange={setIsCreateDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Pricing Plan</DialogTitle>
                                <DialogDescription>
                                    Create a new pricing plan for your groups.
                                    Members will need to pay this amount to
                                    join.
                                </DialogDescription>
                            </DialogHeader>
                            <PricingPlanForm
                                onSubmit={handleCreatePlan}
                                isLoading={isCreating}
                                submitLabel="Create Plan"
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                    Set up pricing plans for new members joining your groups.
                    Only one plan can be active at a time.
                </p>
            </div>

            {/* Active Plan Info */}
            {activePlan && (
                <Card className="border-primary/50 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20">
                                <Check className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground">
                                    Active Plan: {activePlan.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    New members will pay ₹
                                    {(activePlan.price / 100).toLocaleString()}{" "}
                                    to join your groups
                                </p>
                            </div>
                            <Badge
                                variant="default"
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Active
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Active Plan Warning */}
            {plans.length > 0 && !activePlan && (
                <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-500/20">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-foreground">
                                    No Active Plan
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Your groups are currently free to join.
                                    Activate a plan to start charging members.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plans Grid */}
            {plans.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <IndianRupee className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">
                            No Pricing Plans Yet
                        </h4>
                        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                            Create your first pricing plan to start charging
                            members who want to join your groups. Until then,
                            your groups are free to join.
                        </p>
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Plan
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan: any) => (
                        <Card
                            key={plan.id}
                            className={`relative transition-all ${
                                plan.isActive
                                    ? "border-primary shadow-lg shadow-primary/10"
                                    : "hover:border-primary/30"
                            }`}
                        >
                            {plan.isActive && (
                                <div className="absolute -top-3 left-4">
                                    <Badge className="bg-primary">Active</Badge>
                                </div>
                            )}
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {plan.description ||
                                                "No description"}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-foreground">
                                        ₹{(plan.price / 100).toLocaleString()}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        one-time
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>
                                        {plan._count?.memberPayments || 0}{" "}
                                        members paid
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id={`active-${plan.id}`}
                                            checked={plan.isActive}
                                            onCheckedChange={(checked) =>
                                                handleSetActivePlan(
                                                    plan.id,
                                                    checked,
                                                )
                                            }
                                            disabled={isSettingActive}
                                        />
                                        <Label
                                            htmlFor={`active-${plan.id}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {plan.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </Label>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingPlan(plan)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() =>
                                                setDeletingPlanId(plan.id)
                                            }
                                            disabled={
                                                plan._count?.memberPayments > 0
                                            }
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog
                open={!!editingPlan}
                onOpenChange={(open) => !open && setEditingPlan(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Pricing Plan</DialogTitle>
                        <DialogDescription>
                            Update the details of your pricing plan.
                        </DialogDescription>
                    </DialogHeader>
                    {editingPlan && (
                        <PricingPlanForm
                            onSubmit={handleUpdatePlan}
                            isLoading={isUpdating}
                            defaultValues={{
                                name: editingPlan.name,
                                description: editingPlan.description || "",
                                price: editingPlan.price / 100, // Convert from paise to rupees
                            }}
                            submitLabel="Update Plan"
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={!!deletingPlanId}
                onOpenChange={(open) => !open && setDeletingPlanId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete Pricing Plan?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the pricing plan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePlan}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Info Section */}
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        <strong className="text-foreground">
                            1. Create Plans:
                        </strong>{" "}
                        Set up one or more pricing plans with different prices.
                    </p>
                    <p>
                        <strong className="text-foreground">
                            2. Activate One:
                        </strong>{" "}
                        Only one plan can be active at a time. The active plan
                        determines what new members pay.
                    </p>
                    <p>
                        <strong className="text-foreground">
                            3. Members Pay:
                        </strong>{" "}
                        When someone tries to join any of your groups, they'll
                        be prompted to pay the active plan price.
                    </p>
                    <p>
                        <strong className="text-foreground">
                            4. Existing Members:
                        </strong>{" "}
                        Members who already joined before you set up pricing
                        don't need to pay.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default SubscriptionsPage
