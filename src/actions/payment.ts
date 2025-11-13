'use server';

import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';
import { currentUser } from '@clerk/nextjs/server';

export const checkUserHasPaymentMethod = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, hasPaymentMethod: false };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { razorpayCustomerId: true, razorpayTokenId: true }
    });

    return { 
      success: true, 
      hasPaymentMethod: !!(dbUser?.razorpayCustomerId && dbUser?.razorpayTokenId)
    };
  } catch (error: any) {
    return { success: false, error: error.message, hasPaymentMethod: false };
  }
};

export const getSubscriptionStatus = async (groupId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const subscription = await prisma.subscription.findFirst({
      where: { groupId },
      select: {
        status: true,
        trialEndDate: true,
        nextBillingDate: true,
        price: true,
        currency: true,
      }
    });

    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    return { success: true, subscription };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const cancelGroupSubscription = async (groupId: string) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get subscription
    const subscription = await prisma.subscription.findFirst({
      where: { groupId },
      include: { user: true }
    });

    if (!subscription) {
      return { success: false, error: 'Subscription not found' };
    }

    if (subscription.user.clerkId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Cancel on Razorpay
    if (subscription.razorpaySubscriptionId) {
      // FIXED: Use boolean parameter
      await razorpay.subscriptions.cancel(
        subscription.razorpaySubscriptionId,
        false  // Cancel immediately
      );
    }

    // Update database
    await prisma.subscription.updateMany({
      where: { groupId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      }
    });

    return { success: true, message: 'Subscription cancelled' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};