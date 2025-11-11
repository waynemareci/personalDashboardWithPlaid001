// app/api/accounts/migrate/route.js
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { accounts } = await request.json();
    console.log('Migrating', accounts.length, 'accounts');
    
    await connectToDatabase();
    console.log('Connected to database');
    
    // Clear existing accounts for this user
    await Account.deleteMany({ userId: 'default-user' });
    console.log('Cleared existing accounts');
    
    // Insert all accounts (remove _id to let MongoDB generate new ones)
    const result = await Account.insertMany(
      accounts.map(account => {
        const { _id, ...accountData } = account;
        return {
          ...accountData,
          userId: 'default-user'
        };
      })
    );
    console.log('Inserted', result.length, 'accounts');
    
    return NextResponse.json({ success: true, count: result.length });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
