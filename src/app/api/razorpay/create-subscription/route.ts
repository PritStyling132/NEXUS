import { prisma } from '@/lib/prisma';
import { PLAN_ID, razorpay, TRIAL_DAYS } from '@/lib/razorpay';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { groupId } = await req.json();

    // Get user's Razorpay customer ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { razorpayCustomerId: true, razorpayTokenId: true, id: true }
    });

    if (!dbUser?.razorpayCustomerId || !dbUser?.razorpayTokenId) {
      return NextResponse.json(
        { success: false, error: 'Payment method not added' },
        { status: 400 }
      );
    }

    // Check if group exists and belongs to user
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { userId: true }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    if (group.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to create subscription for this group' },
        { status: 403 }
      );
    }

    // Check if subscription already exists for this group
    const existingSubscription = await prisma.subscription.findUnique({
      where: { groupId: groupId }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { success: false, error: 'Subscription already exists for this group' },
        { status: 400 }
      );
    }

    // Calculate trial end (start billing after 14 days)
    const trialEndTimestamp = Math.floor(
      Date.now() / 1000 + TRIAL_DAYS * 24 * 60 * 60
    );
    const trialEndDate = new Date(trialEndTimestamp * 1000);
    const nextBillingDate = new Date(trialEndTimestamp * 1000);

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: PLAN_ID,
      customer_id: dbUser.razorpayCustomerId,
      quantity: 1,
      total_count: 120, // 10 years
      start_at: trialEndTimestamp,
      customer_notify: 1,
      notes: {
        groupId: groupId,
        clerkId: user.id,
      },
    });

    // Save subscription in database
    await prisma.subscription.create({
      data: {
        userId: dbUser.id,
        groupId: groupId,
        status: 'TRIAL',
        trialStartDate: new Date(),
        trialEndDate: trialEndDate,
        subscriptionStartDate: trialEndDate,
        nextBillingDate: nextBillingDate,
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: PLAN_ID,
        razorpayCustomerId: dbUser.razorpayCustomerId,
        price: 9900,
        currency: 'INR',
      }
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      trialEndDate: trialEndDate.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}