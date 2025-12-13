"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PricingPlanSchema, PricingPlanFormData } from "./schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

type Props = {
    onSubmit: (data: PricingPlanFormData) => void
    isLoading?: boolean
    defaultValues?: Partial<PricingPlanFormData>
    submitLabel?: string
}

export const PricingPlanForm = ({
    onSubmit,
    isLoading = false,
    defaultValues,
    submitLabel = "Create Plan",
}: Props) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PricingPlanFormData>({
        resolver: zodResolver(PricingPlanSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            description: defaultValues?.description || "",
            price: defaultValues?.price || 0,
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">
                    Plan Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="name"
                    placeholder="e.g., Basic, Premium, Monthly Access"
                    {...register("name")}
                    disabled={isLoading}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Describe what members get with this plan..."
                    rows={3}
                    {...register("description")}
                    disabled={isLoading}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">
                    Price (₹) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                    </span>
                    <Input
                        id="price"
                        type="number"
                        step="1"
                        min="1"
                        placeholder="499"
                        className="pl-8"
                        {...register("price", { valueAsNumber: true })}
                        disabled={isLoading}
                    />
                </div>
                {errors.price && (
                    <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                    This is the one-time fee members pay to join your groups
                </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                    </>
                ) : (
                    submitLabel
                )}
            </Button>
        </form>
    )
}

export default PricingPlanForm
