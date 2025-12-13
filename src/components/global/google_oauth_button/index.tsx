"use client"

import Loader from "@/components/global/loader"
import { Button } from "@/components/ui/button"
import { useGoogleAuth } from "@/hooks/authentication"
import { FcGoogle } from "react-icons/fc"

type GoogleAuthButtonProps = {
    method: "signup" | "signin"
}

export const GoogleAuthButton = ({ method }: GoogleAuthButtonProps) => {
    const { signUpWith, signInWith } = useGoogleAuth()

    const handleClick =
        method === "signin"
            ? () => signInWith("oauth_google")
            : () => signUpWith("oauth_google")

    return (
        <Button
            onClick={handleClick}
            variant="outline"
            className="w-full rounded-2xl flex items-center justify-center gap-3 bg-card dark:bg-themeBlack border border-border dark:border-themeGray text-foreground dark:text-white hover:bg-muted dark:hover:bg-themeGray/50 transition-colors"
        >
            <Loader loading={false}>
                <div className="flex items-center">
                    <FcGoogle className="w-5 h-5 mr-3" />
                    Continue with Google
                </div>
            </Loader>
        </Button>
    )
}
