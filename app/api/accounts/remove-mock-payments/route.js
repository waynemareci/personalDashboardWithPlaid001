import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    await connectToDatabase();
    
    const result = await Account.updateMany(
      {},
      { $unset: { nextPaymentDueDate: "" } }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Removed nextPaymentDueDate from ${result.modifiedCount} accounts` 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
