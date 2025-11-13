import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// ADD THIS FUNCTION to check payment before group creation
export const createGroupWithSubscription = async (groupData: any) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user has payment method
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        razorpayCustomerId: true, 
        razorpayTokenId: true 
      }
    });

    if (!dbUser?.razorpayCustomerId || !dbUser?.razorpayTokenId) {
      return { 
        success: false, 
        error: 'Payment method required',
        redirectTo: '/payment-setup'
      };
    }

    // Create the group first
    const group = await prisma.group.create({
      data: {
        ...groupData,
        userId: dbUser.id,
      }
    });

    // Then create subscription for the group
    const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/razorpay/create-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group.id }),
    });

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionData.success) {
      // Rollback: delete the group if subscription creation fails
      await prisma.group.delete({ where: { id: group.id } });
      return { success: false, error: subscriptionData.error };
    }

    return { 
      success: true, 
      group, 
      subscription: subscriptionData 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};