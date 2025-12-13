import { z } from "zod"

export const PricingPlanSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Plan name must be at least 2 characters" })
        .max(50, { message: "Plan name must be less than 50 characters" }),
    description: z
        .string()
        .max(200, { message: "Description must be less than 200 characters" })
        .optional()
        .or(z.literal("").transform(() => undefined)),
    price: z
        .number({ invalid_type_error: "Price must be a number" })
        .min(1, { message: "Price must be at least ₹1" })
        .max(100000, { message: "Price must be less than ₹1,00,000" }),
})

export type PricingPlanFormData = z.infer<typeof PricingPlanSchema>
