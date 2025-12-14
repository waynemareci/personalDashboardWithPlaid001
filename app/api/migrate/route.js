import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await Account.find({ paymentDueDate: { $exists: true, $ne: null } });
    
    console.log(`Found ${accounts.length} accounts with paymentDueDate`);
    
    let updated = 0;
    const results = [];
    for (const account of accounts) {
      const day = account.paymentDueDate;
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), day);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, day);
      
      const nextPaymentDueDate = currentMonth >= today 
        ? currentMonth.toISOString().split('T')[0]
        : nextMonth.toISOString().split('T')[0];
      
      console.log(`${account.accountName}: day=${day}, nextPaymentDueDate=${nextPaymentDueDate}`);
      
      await Account.findByIdAndUpdate(account._id, { nextPaymentDueDate });
      updated++;
      results.push({ name: account.accountName, nextPaymentDueDate });
    }
    
    return NextResponse.json({ success: true, updated, results });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
