import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';
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

    const { phone, name } = await req.json();

    // Validate phone number
    if (!phone || phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { razorpayCustomerId: true }
    });

    if (existingUser?.razorpayCustomerId) {
      return NextResponse.json({
        success: true,
        customerId: existingUser.razorpayCustomerId,
        message: 'Customer already exists'
      });
    }

    // Create Razorpay customer
    const customer = await razorpay.customers.create({
      name: name || `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      contact: phone,
      notes: {
        clerkId: user.id,
      },
    });

    // Save customer ID in database
    await prisma.user.update({
      where: { clerkId: user.id },
      data: { 
        razorpayCustomerId: customer.id,
        phone: phone,
      }
    });

    return NextResponse.json({
      success: true,
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}