import { PRICE_PER_GROUP, razorpay } from '@/lib/razorpay';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const plan = await razorpay.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'Group Subscription',
        description: 'Monthly subscription per group - ₹99/month after 14-day trial',
        amount: PRICE_PER_GROUP,
        currency: 'INR',
      },
    });

    return NextResponse.json({
      success: true,
      planId: plan.id,
      message: 'Plan created! Add this to .env as NEXT_PUBLIC_RAZORPAY_PLAN_ID',
    });
  } catch (error: any) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}