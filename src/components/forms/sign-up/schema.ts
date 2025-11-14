import { z } from "zod"

export const SignUpSchema = z.object({
    firstname: z
        .string()
        .min(3, { message: "First name must be at least 2 characters long" }),
    lastname: z
        .string()
        .min(3, { message: "Last name must be at least 2 characters long" }),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(64, { message: "Password cannot exceed 64 characters" })
        .refine((value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""), {
            message: "Password can only contain letters, numbers, and _ . -",
        }),
})
