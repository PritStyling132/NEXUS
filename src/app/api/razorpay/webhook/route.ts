import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log('Webhook event:', event.event);

    switch (event.event) {
      case 'subscription.charged':
        const chargedSub = event.payload.subscription.entity;
        const payment = event.payload.payment.entity;
        
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: chargedSub.id },
          data: {
            status: 'ACTIVE',
            lastPaymentDate: new Date(),
            lastPaymentStatus: 'success',
            failedPayments: 0,
            currentPeriodStart: new Date(chargedSub.current_start * 1000),
            currentPeriodEnd: new Date(chargedSub.current_end * 1000),
            nextBillingDate: new Date(chargedSub.current_end * 1000),
            razorpayPaymentId: payment.id,
          }
        });
        
        console.log('Subscription charged successfully:', chargedSub.id);
        break;

      case 'subscription.activated':
        const activatedSub = event.payload.subscription.entity;
        
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: activatedSub.id },
          data: {
            status: 'ACTIVE',
            subscriptionStartDate: new Date(),
          }
        });
        
        console.log('Subscription activated:', activatedSub.id);
        break;

      case 'subscription.cancelled':
        const cancelledSub = event.payload.subscription.entity;
        
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: cancelledSub.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          }
        });
        
        console.log('Subscription cancelled:', cancelledSub.id);
        break;

      case 'subscription.completed':
        const completedSub = event.payload.subscription.entity;
        
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: completedSub.id },
          data: {
            status: 'EXPIRED',
          }
        });
        
        console.log('Subscription completed:', completedSub.id);
        break;

      case 'payment.failed':
        const failedPayment = event.payload.payment.entity;
        
        const subscription = await prisma.subscription.findFirst({
          where: {
            razorpayCustomerId: failedPayment.customer_id,
            status: { in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] }
          }
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'PAST_DUE',
              lastPaymentStatus: 'failed',
              failedPayments: { increment: 1 },
              razorpayPaymentId: failedPayment.id,
            }
          });
        }
        
        console.log('Payment failed:', failedPayment.id);
        break;

      case 'subscription.paused':
        const pausedSub = event.payload.subscription.entity;
        
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: pausedSub.id },
          data: { status: 'PAUSED' }
        });
        
        console.log('Subscription paused:', pausedSub.id);
        break;

      case 'subscription.resumed':
        const resumedSub = event.payload.subscription.entity;
        
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: resumedSub.id },
          data: { status: 'ACTIVE' }
        });
        
        console.log('Subscription resumed:', resumedSub.id);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}