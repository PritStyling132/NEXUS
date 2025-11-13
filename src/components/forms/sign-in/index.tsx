'use client'

import { FormGenerator } from '@/components/global/form-generator'
import { Button } from '@/components/ui/button'
import { NEXUS_CONSTANTS } from '@/constants'
import { useAuthSignIn } from '@/hooks/authentication'
import { Loader2 } from 'lucide-react'

type Props = {}

const SignInForm = (props:Props) => {
  const { isPending, onAuthenticateUser, register, errors } = useAuthSignIn()

  return (
    <form
      
      className="flex flex-col gap-4 mt-10"
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
  className="rounded-2xl flex items-center justify-center gap-2"
>
  {isPending ? (
    <>
      <Loader2 className="animate-spin w-4 h-4" />
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
