"use client";
import { onSignUpUser } from "@/actions/auth";
import { SignUpSchema } from "@/components/forms/sign-up/schema";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SignInSchema } from "../../components/forms/sign-in/schema";

// ================================
// ✅ SIGN IN HOOK
// ================================

export const useAuthSignIn = () => {
  const { isLoaded, setActive, signIn } = useSignIn();
  const router = useRouter();

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  });

  const onClerkAuth = async (email: string, password: string) => {
    if (!isLoaded) {
      toast("Error", { description: "Oops! something went wrong" });
      return;
    }

    try {
      const authenticated = await signIn.create({
        identifier: email,
        password,
      });

      if (authenticated.status === "complete") {
        reset();
        
        
        await setActive({ 
          session: authenticated.createdSessionId,
        });
        
        toast("Success", { description: "Welcome back!" });
        
        
        setTimeout(() => {
          router.push("/group/create");
        }, 100);
      }
    } catch (error: any) {
      if (error.errors?.[0]?.code === "form_password_incorrect") {
        toast("Error", { description: "Incorrect email or password. Try again." });
      } else {
        toast("Error", { description: "Unexpected error occurred." });
      }
    }
  };

  const { mutate: InitiateLoginFlow, isPending } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      onClerkAuth(email, password),
  });

  const onAuthenticateUser = handleSubmit((values) => {
    InitiateLoginFlow({
      email: values.email,
      password: values.password,
    });
  });

  return { register, errors, isPending, onAuthenticateUser };
};


// ================================
// ✅ SIGN UP HOOK
// ================================
export const useAuthSignUp = () => {
  const { isLoaded, setActive, signUp } = useSignUp();
  const router = useRouter();

  const [creating, setCreating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");

  const {
    register,
    formState: { errors },
    reset,
    getValues,
    handleSubmit,
  } = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    mode: "onBlur",
  });

  // Step 1️⃣: Create account and send email verification
  const onGenerateCode = async () => {
    if (!isLoaded) {
      toast("Error", { description: "Clerk not initialized properly" });
      return;
    }

    const email = getValues("email");
    const password = getValues("password");
    const firstname = getValues("firstname");
    const lastname = getValues("lastname");

    if (!email || !password || !firstname || !lastname) {
      toast("Error", { description: "All fields are required" });
      return;
    }

    try {
      setCreating(true);

      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstname,
        lastName: lastname,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);

      toast("Verification Sent", {
        description: "Check your email for the verification code.",
      });
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast("Error", {
        description:
          error.errors?.[0]?.message || "Something went wrong during signup.",
      });
    } finally {
      setCreating(false);
    }
  };

  // Step 2️⃣: Verify code FIRST, then register user in database
  // const onInitiateUserRegistration = handleSubmit(async (values) => {
  //   if (!isLoaded) {
  //     toast("Error", { description: "Clerk not initialized properly" });
  //     return;
  //   }

  //   if (!code || code.length !== 6) {
  //     toast("Error", { description: "Please enter a valid 6-digit code" });
  //     return;
  //   }

  //   try {
  //     setCreating(true);

  //     // ✅ STEP 1: Verify the OTP code with Clerk FIRST
  //     const completeSignUp = await signUp.attemptEmailAddressVerification({
  //       code,
  //     });

  //     // ✅ STEP 2: Check if verification was successful
  //     if (completeSignUp.status !== "complete") {
  //       toast("Error", {
  //         description: "Verification incomplete. Please check your code and try again.",
  //       });
  //       return;
  //     }

  //     // ✅ STEP 3: Check if user was created in Clerk
  //     if (!signUp.createdUserId) {
  //       toast("Error", {
  //         description: "User creation failed. Please try again.",
  //       });
  //       return;
  //     }

  //     // ✅ STEP 4: Set the active session BEFORE creating user in database
  //     await setActive({ session: completeSignUp.createdSessionId });

  //     // ✅ STEP 5: Now create user in YOUR database
  //     const user = await onSignUpUser({
  //       firstname: values.firstname,
  //       lastname: values.lastname,
  //       clerkId: signUp.createdUserId,
  //       image: completeSignUp.createdUserId ? "" : "",
  //     });

  //     reset();

  //     // ✅ STEP 6: Handle database creation result
  //     if (user.status === 200) {
  //       toast("Success", { description: user.message });
  //       router.push("/group/create");
  //     } else {
  //       toast("Error", { 
  //         description: user.message || "Failed to create user profile. Please contact support." 
  //       });
  //     }

  //     setVerifying(false);
  //     setCode("");

  //   } catch (error: any) {
  //     console.error("Verification Error:", error);
  //     if (error.errors?.[0]?.code === "form_code_incorrect") {
  //       toast("Error", { description: "Invalid verification code. Please check and try again." });
  //     } else if (error.errors?.[0]?.code === "verification_expired") {
  //       toast("Error", { description: "Verification code expired. Please request a new code." });
  //       setVerifying(false);
  //       setCode("");
  //     } else {
  //       toast("Error", { description: "Verification failed. Please try again." });
  //     }
  //   } finally {
  //     setCreating(false);
  //   }
  // });
  const onInitiateUserRegistration = handleSubmit(async (values) => {
    if (!isLoaded) {
      toast("Error", { description: "Clerk not initialized properly" });
      return;
    }

    if (!code || code.length !== 6) {
      toast("Error", { description: "Please enter a valid 6-digit code" });
      return;
    }

    try {
      setCreating(true);

      console.log("🔄 Step 1: Attempting OTP verification...");

      // ✅ STEP 1: Verify the OTP code with Clerk FIRST
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("✅ Step 1 Complete - Verification Status:", completeSignUp.status);
      console.log("📋 Complete SignUp Object:", completeSignUp);

      // ✅ STEP 2: Check if verification was successful
      if (completeSignUp.status !== "complete") {
        console.error("❌ Verification status not complete:", completeSignUp.status);
        toast("Error", {
          description: "Verification incomplete. Please check your code and try again.",
        });
        return;
      }

      console.log("🔄 Step 2: Checking user creation...");

      // ✅ STEP 3: Check if user was created in Clerk
      if (!signUp.createdUserId) {
        console.error("❌ No createdUserId found");
        toast("Error", {
          description: "User creation failed. Please try again.",
        });
        return;
      }

      console.log("✅ Step 2 Complete - User ID:", signUp.createdUserId);
      console.log("🔄 Step 3: Setting active session...");

      
      await setActive({ session: completeSignUp.createdSessionId });

      console.log("✅ Step 3 Complete - Session activated");
      console.log("🔄 Step 4: Creating user in database...");
      console.log("📤 Sending data:", {
        firstname: values.firstname,
        lastname: values.lastname,
        clerkId: signUp.createdUserId,
        image: "",
      });

      // ✅ STEP 5: Now create user in YOUR database
      const user = await onSignUpUser({
        firstname: values.firstname,
        lastname: values.lastname,
        clerkId: signUp.createdUserId,
        image: "",
      });

      console.log("📥 Database response:", user);

      reset();

      // ✅ STEP 6: Handle database creation result
      if (user.status === 200) {
        console.log("✅ Step 4 Complete - User created successfully");
        toast("Success", { description: user.message });
        console.log("🔄 Step 5: Redirecting to /group/create...");
        router.push("/group/create");
      } else {
        console.error("❌ Database creation failed:", user);
        toast("Error", {
          description: user.message || "Failed to create user profile. Please contact support."
        });
      }

      setVerifying(false);
      setCode("");

    } catch (error: any) {
      console.error("❌ FULL ERROR OBJECT:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error errors array:", error.errors);

      // Better error messages
      if (error.errors?.[0]?.code === "form_code_incorrect") {
        toast("Error", { description: "Invalid verification code. Please check and try again." });
      } else if (error.errors?.[0]?.code === "verification_expired") {
        toast("Error", { description: "Verification code expired. Please request a new code." });
        setVerifying(false);
        setCode("");
      } else {
        toast("Error", { description: `Verification failed: ${error.message || "Unknown error"}` });
      }
    } finally {
      setCreating(false);
    }
  });

  // ✅ NEW: Function to resend code
  const onResendCode = async () => {
    if (!isLoaded || !signUp) {
      toast("Error", { description: "Please wait..." });
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      toast("Success", { description: "New verification code sent to your email." });
    } catch (error: any) {
      console.error("Resend Error:", error);
      toast("Error", { description: "Failed to resend code. Please try again." });
    }
  };

  return {
    register,
    errors,
    onGenerateCode,
    onInitiateUserRegistration,
    onResendCode,
    verifying,
    creating,
    code,
    setCode,
    getValues,
  };
};

export const useGoogleAuth = () => {
  const { signIn, isLoaded: LoadedSignIn } = useSignIn()
  const { signUp, isLoaded: LoadedSignUp } = useSignUp()

  const signInWith = (strategy: OAuthStrategy) => {
    if (!LoadedSignIn) return
    try {
      return signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/callback",
        redirectUrlComplete: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/group/create",
      })
    } catch (error) {
      console.error(error)
    }
  }

  const signUpWith = (strategy: OAuthStrategy) => {
    if (!LoadedSignUp) return
    try {
      return signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/callback",
        redirectUrlComplete: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/group/create",
      })
    } catch (error) {
      console.error(error)
    }

  }
  return { signUpWith, signInWith }
};
