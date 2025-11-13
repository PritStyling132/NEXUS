import BackdropGradient from "@/components/global/backdrop-gradient";
import GradientText from "@/components/global/gradient-text";
import PaymentForm from '@/components/global/razorPay/payment-form';
import { NEXUS_CONSTANTS } from "@/constants";
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import GroupCreationForm from './group-creation-form';

export default async function CreateGroupPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user has payment method setup
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      razorpayCustomerId: true, 
      razorpayTokenId: true,
      trialEndsAt: true 
    }
  });

  const hasPaymentMethod = !!(dbUser?.razorpayCustomerId && dbUser?.razorpayTokenId);

  return (
    <div className="container h-screen grid grid-cols-1 lg:grid-cols-2 content-center gap-8">
      {/* Left Side - Information */}
      <div className="flex items-center">
        <BackdropGradient className="w-full h-full opacity-50">
          <div className="p-8">
            <h5 className="text-2xl font-bold text-themeTextWhite mb-4">
              NEXUS.
            </h5>

            <GradientText
              element="H2"
              className="text-4xl font-semibold py-1"
            >
              {hasPaymentMethod ? 'Create Your Group' : 'Get Started'}
            </GradientText>

            <p className="text-themeTextGray mt-4">
              Free for 14 days, then INR 99/month. Cancel anytime. All
              features. Unlimited everything. No hidden fees.
            </p>

            <div className="flex flex-col gap-3 mt-16 pl-5">
              {NEXUS_CONSTANTS.createGroupPlaceholder.map((placeholder) => (
                <div
                  className="flex gap-3 items-start"
                  key={placeholder.id}
                >
                  <div className="mt-1">
                    {placeholder.icon}
                  </div>
                  <p className="text-themeTextGray">
                    {placeholder.label}
                  </p>
                </div>
              ))}
            </div>

            {!hasPaymentMethod && (
              <div className="mt-8 p-4 bg-themeBlack/50 rounded-lg border border-themeGray">
                <p className="text-sm text-themeTextGray">
                  💳 <strong className="text-themeTextWhite">One-time setup:</strong> Add your payment method to start your free trial.
                  You won't be charged for 14 days.
                </p>
              </div>
            )}
          </div>
        </BackdropGradient>
      </div>

      {/* Right Side - Payment Form or Group Creation Form */}
      <div className="flex items-center justify-center">
        {hasPaymentMethod ? (
          <GroupCreationForm />
        ) : (
          <PaymentForm />
        )}
      </div>
    </div>
  );
}