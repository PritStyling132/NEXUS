"use client"
import { FormGenerator } from "@/components/global/form-generator"
import Loader from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { NEXUS_CONSTANTS } from "@/constants"
import { useAuthSignUp } from "@/hooks/authentication"
import dynamic from "next/dynamic"

type Props = {}

const OtpInput = dynamic(
    () =>
        import("@/components/global/otp-input").then(
            (component) => component.default,
        ),
    { ssr: false },
)

const SignUpForm = (props: Props) => {
    const {
        register,
        errors,
        verifying,
        creating,
        onGenerateCode,
        onInitiateUserRegistration,
        onResendCode,
        code,
        setCode,
        getValues,
    } = useAuthSignUp()

    return (
        <form
            onSubmit={onInitiateUserRegistration}
            className="flex flex-col gap-3 mt-10"
        >
            {verifying ? (
                <>
                    <div className="flex flex-col items-center mb-5 gap-4">
                        <p className="text-sm text-center text-muted-foreground">
                            Enter the 6-digit code sent to {getValues("email")}
                        </p>
                        <OtpInput otp={code} setOtp={setCode} />
                        <Button
                            type="button"
                            variant="link"
                            onClick={onResendCode}
                            className="text-sm"
                        >
                            Didn't receive code? Resend
                        </Button>
                    </div>
                </>
            ) : (
                NEXUS_CONSTANTS.signUpForm.map((field) => (
                    <FormGenerator
                        {...field}
                        key={field.id}
                        register={register}
                        errors={errors}
                    />
                ))
            )}

            {verifying ? (
                <Button
                    type="submit"
                    className="rounded-2xl"
                    disabled={creating || code.length !== 6}
                >
                    <Loader loading={creating}>Verify & Sign Up</Loader>
                </Button>
            ) : (
                <Button
                    type="button"
                    className="rounded-2xl"
                    onClick={onGenerateCode}
                    disabled={creating}
                >
                    <Loader loading={creating}>Generate Code</Loader>
                </Button>
            )}
        </form>
    )
}

export default SignUpForm
