import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    const customers = await Customer.find({
      month: month
    });

    const totalAmount = customers.reduce((sum, customer) => sum + customer.price, 0);
    const paidAmount = customers
      .filter((customer) => customer.paymentStatus === 'PAID' || customer.paymentStatus === 'COMPLETED')
      .reduce((sum, customer) => sum + customer.price, 0);

    const balanceData = {
      totalAmount,
      paidAmount,
      pendingAmount: totalAmount - paidAmount,
      customerCount: customers.length,
      paidCustomers: customers.filter(
        (customer) => customer.paymentStatus === 'PAID' || customer.paymentStatus === 'COMPLETED'
      ).length,
    };

    return NextResponse.json(balanceData);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching balance data' }, { status: 500 });
  }
}