"use client"

import { FormGenerator } from "@/components/global/form-generator"
import { Button } from "@/components/ui/button"
import { NEXUS_CONSTANTS } from "@/constants"
import { useAuthSignIn } from "@/hooks/authentication"
import { Loader2 } from "lucide-react"

const SignInForm = () => {
    const { isPending, onAuthenticateUser, register, errors } = useAuthSignIn()

    return (
        <form
            className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8 md:mt-10 w-full"
            onSubmit={onAuthenticateUser}
        >
            {/* Dynamically render input fields */}
            {NEXUS_CONSTANTS.signInForm.map((field) => (
                <FormGenerator
                    {...field}
                    key={field.id}
                    register={register}
                    errors={errors}
                />
            ))}

            <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="rounded-2xl flex items-center justify-center gap-2 w-full mt-2
                bg-primary hover:bg-primary/90 transition-all shadow-lg"
            >
                {isPending ? (
                    <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Signing In...
                    </>
                ) : (
                    "Sign In with Email"
                )}
            </Button>
        </form>
    )
}

export default SignInForm
