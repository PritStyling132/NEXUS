import { z } from "zod"

export const SignUpSchema = z.object({
    firstname: z
        .string()
        .min(2, { message: "First name must be at least 2 characters long" })
        .max(50, { message: "First name cannot exceed 50 characters" })
        .refine((value) => /^[a-zA-Z\s'-]+$/.test(value ?? ""), {
            message:
                "First name can only contain letters, spaces, hyphens, and apostrophes",
        }),
    lastname: z
        .string()
        .min(2, { message: "Last name must be at least 2 characters long" })
        .max(50, { message: "Last name cannot exceed 50 characters" })
        .refine((value) => /^[a-zA-Z\s'-]+$/.test(value ?? ""), {
            message:
                "Last name can only contain letters, spaces, hyphens, and apostrophes",
        }),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(64, { message: "Password cannot exceed 64 characters" })
        .refine((value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""), {
            message: "Password can only contain letters, numbers, and _ . -",
        }),
})
