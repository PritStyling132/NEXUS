import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PRICE_PER_GROUP = 9900;
export const TRIAL_DAYS = 14;
export const PLAN_ID = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!;