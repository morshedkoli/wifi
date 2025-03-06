import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Check if customer with same phone and month already exists
    const existingCustomer = await Customer.findOne({
      phone: body.phone,
      month: body.month
    });
    
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists for this month' },
        { status: 400 }
      );
    }
    
    const customer = await Customer.create(body);
    return NextResponse.json(customer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error creating customer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    const [year, monthNum] = month?.split('-') || [];
    const start = startOfMonth(new Date(parseInt(year), parseInt(monthNum) - 1));
    const end = endOfMonth(new Date(parseInt(year), parseInt(monthNum) - 1));

    const customers = await Customer.find({
      month: month,
      ...(status === 'completed'
        ? {
            paymentStatus: 'COMPLETED',
          }
        : {
            paymentStatus: {
              $in: ['PENDING', 'PAID'],
            },
          }),
    }).sort({ createdAt: -1 });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 });
  }
}