import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    await connectToDatabase();
    
    const today = new Date();
    const accounts = await Account.find({}).limit(10);
    
    const updates = accounts.map((account, index) => {
      const daysAhead = (index + 1) * 3; // 3, 6, 9, 12, 15, 18, 21, 24, 27, 30 days
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysAhead);
      
      return Account.findByIdAndUpdate(
        account._id,
        {
          minimumMonthlyPayment: 50 + (index * 25), // $50, $75, $100, etc.
          nextPaymentDueDate: dueDate.toISOString().split('T')[0],
        },
        { new: true }
      );
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({ 
      success: true, 
      message: `Added mock payment dates to ${accounts.length} accounts` 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
