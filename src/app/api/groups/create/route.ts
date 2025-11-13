import { prisma } from '@/lib/prisma';
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

    const { name, category, description, privacy } = await req.json();

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      );
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
      return NextResponse.json({ 
        success: false, 
        error: 'Payment method required',
        redirectTo: '/payment-setup'
      }, { status: 400 });
    }

    // Create the group
    const group = await prisma.group.create({
      data: {
        name,
        category,
        description: description || null,
        privacy: privacy || 'PRIVATE',
        userId: dbUser.id,
      }
    });

    // Create subscription for the group
    const subscriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/razorpay/create-subscription`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId: group.id }),
    });

    const subscriptionData = await subscriptionResponse.json();

    if (!subscriptionData.success) {
      // Rollback: delete the group if subscription creation fails
      await prisma.group.delete({ where: { id: group.id } });
      return NextResponse.json(
        { success: false, error: subscriptionData.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      group, 
      subscription: subscriptionData 
    });
  } catch (error: any) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
