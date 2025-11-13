import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ hasPaymentMethod: false });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { razorpayCustomerId: true, razorpayTokenId: true }
    });

    return NextResponse.json({
      hasPaymentMethod: !!(dbUser?.razorpayCustomerId && dbUser?.razorpayTokenId)
    });
  } catch (error) {
    return NextResponse.json({ hasPaymentMethod: false });
  }
}