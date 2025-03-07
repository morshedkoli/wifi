import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CustomerHistory from '@/models/CustomerHistory';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const histories = await CustomerHistory.find({ customerId: params.id })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(histories);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer history' },
      { status: 500 }
    );
  }
}