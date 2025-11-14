// import { useGoogleAuth } from "@/hooks/authentication"
// import { Loader } from "lucide-react"
// import { Button } from "react-day-picker"

// type GoogleAuthButtonProps = {
//   method: "signup" | "signin"
// }

// export const GoogleAuthButton = ({ method }: GoogleAuthButtonProps) => {
//   const { signUpWith, signInWith } = useGoogleAuth()
//   return (
//     <Button
//       {...(method === "signin"
//         ? {
//             onClick: () => signInWith("oauth_google"),
//           }
//         : {
//             onClick: () => signUpWith("oauth_google"),
//           })}
//       className="w-full rounded-2xl flex gap-3 bg-themeBlack border-themeGray"

//     >
//       <Loader loading= {false}>
//         <Google/>
//         Google
//       </Loader>
//     </Button>
//   )
// }

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
            className="w-full rounded-2xl flex items-center justify-center gap-3 bg-themeBlack border border-themeGray text-white"
        >
            <Loader loading={false}>
                <div className="flex items-center">
                    <FcGoogle className="w-5 h-5 mr-3" />
                    Google
                </div>
            </Loader>
        </Button>
    )
}
