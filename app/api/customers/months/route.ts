import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { format, addMonths, subMonths } from 'date-fns';

export async function GET() {
  try {
    await dbConnect();
    
    // Aggregate to get unique months from the database
    const months = await Customer.aggregate([
      // Project only the month field
      { $project: { month: 1 } },
      // Group by month to get unique values
      { $group: { _id: "$month" } },
      // Sort by month in descending order (newest first)
      { $sort: { _id: -1 } },
      // Reshape the output
      { $project: { month: "$_id", _id: 0 } }
    ]);
    
    // Extract just the month values and sort them
    const uniqueMonths = months.map(item => item.month).sort();
    
    return NextResponse.json(uniqueMonths);
  } catch (error) {
    console.error('Error fetching months:', error);
    return NextResponse.json({ error: 'Error fetching available months' }, { status: 500 });
  }
}