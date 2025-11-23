import SignUpForm from "@/components/forms/sign-up"
import { GoogleAuthButton } from "@/components/global/google_oauth_button"
import { Separator } from "@radix-ui/react-separator"
import Link from "next/link"

const SignupForm = () => {
    return (
        <div className="w-full space-y-4 sm:space-y-6">
            <div className="space-y-2">
                <h5 className="font-bold text-xl sm:text-2xl text-foreground dark:text-themeTextWhite">
                    Create Your Account
                </h5>
                <p className="text-sm sm:text-base text-muted-foreground dark:text-themeTextGray leading-relaxed">
                    Network with people from around the world, join groups,
                    create your own, watch courses and become the best version
                    of yourself.
                </p>
            </div>

            <SignUpForm />

            <div className="my-8 sm:my-10 w-full relative">
                <div className="bg-background dark:bg-black px-3 py-2 absolute text-muted-foreground dark:text-themeTextGray text-xs font-medium top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                    OR CONTINUE WITH
                </div>
                <Separator
                    orientation="horizontal"
                    className="bg-border dark:bg-themeGray h-[1px]"
                />
            </div>

            <GoogleAuthButton method="signup" />

            <p className="text-center text-sm sm:text-base text-muted-foreground dark:text-gray-400 mt-4">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="text-primary dark:text-blue-400 hover:underline font-semibold transition-colors"
                >
                    Sign In
                </Link>
            </p>
        </div>
    )
}

export default SignupForm
