import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import CustomerHistory from '@/models/CustomerHistory';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = params;

    // Create update object based on what fields are provided in the request
    const updateObj = {};
    
    // Only update days if it's provided in the request
    if (body.days !== undefined) {
      (updateObj as any).days = body.days;
    }
    
    // Only update paymentStatus if it's provided in the request
    if (body.paymentStatus !== undefined) {
      (updateObj as any).paymentStatus = body.paymentStatus;
    }
    
    // Get the customer before update to compare changes
    const oldCustomer = await Customer.findById(id);
    if (!oldCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Track changes
const changes: { field: string; oldValue: any; newValue: any }[] = [];
    Object.keys(updateObj).forEach(field => {
      if (oldCustomer[field] !== (updateObj as any)[field]) {
        changes.push({
          field,
          oldValue: oldCustomer[field],
          newValue: (updateObj as any)[field]
        });
      }
    });

    // Update customer
    const customer = await Customer.findByIdAndUpdate(
      id,
      updateObj,
      { new: true }
    );

    // Record history if there are changes
    if (changes.length > 0) {
      await CustomerHistory.create({
        customerId: id,
        changes
      });
    }

    // Check if customer should be moved to completed
    if (customer?.paymentStatus === 'PAID' && customer.days >= 30) {
      await Customer.findByIdAndUpdate(id, { paymentStatus: 'COMPLETED' });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating customer' }, { status: 500 });
  }
}