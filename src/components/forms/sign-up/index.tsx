"use client"
import { FormGenerator } from "@/components/global/form-generator"
import Loader from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { NEXUS_CONSTANTS } from "@/constants"
import { useAuthSignUp } from "@/hooks/authentication"
import { Mail } from "lucide-react"
import dynamic from "next/dynamic"

const OtpInput = dynamic(
    () =>
        import("@/components/global/otp-input").then(
            (component) => component.default,
        ),
    { ssr: false },
)

const SignUpForm = () => {
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
            className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8 md:mt-10 w-full"
        >
            <div id="clerk-captcha"></div>
            {verifying ? (
                <div className="flex flex-col items-center mb-5 gap-6 py-4">
                    <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-4">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg text-foreground dark:text-themeTextWhite">
                            Check Your Email
                        </h3>
                        <p className="text-sm text-muted-foreground dark:text-themeTextGray">
                            Enter the 6-digit code sent to
                        </p>
                        <p className="text-sm font-medium text-foreground dark:text-themeTextWhite">
                            {getValues("email")}
                        </p>
                    </div>
                    <OtpInput otp={code} setOtp={setCode} />
                    <Button
                        type="button"
                        variant="link"
                        onClick={onResendCode}
                        className="text-sm text-primary dark:text-blue-400 hover:underline"
                    >
                        Didn't receive code? Resend
                    </Button>
                </div>
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
                    size="lg"
                    className="rounded-2xl w-full mt-2 bg-primary hover:bg-primary/90 transition-all shadow-lg"
                    disabled={creating || code.length !== 6}
                >
                    <Loader loading={creating}>Verify & Sign Up</Loader>
                </Button>
            ) : (
                <Button
                    type="button"
                    size="lg"
                    className="rounded-2xl w-full mt-2 bg-primary hover:bg-primary/90 transition-all shadow-lg"
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
