import { plaidClient } from '@/lib/plaid';
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await Account.find({ plaidAccessToken: { $exists: true, $ne: null } });
    
    const tokens = [...new Set(accounts.map(a => a.plaidAccessToken))];
    const results = [];

    for (const token of tokens) {
      try {
        const [accountsRes, liabilitiesRes] = await Promise.all([
          plaidClient.accountsGet({ access_token: token }),
          plaidClient.liabilitiesGet({ access_token: token }).catch(() => null)
        ]);

        results.push({
          token: token.slice(-4),
          accounts: accountsRes.data.accounts,
          liabilities: liabilitiesRes?.data?.liabilities
        });
      } catch (error) {
        results.push({ token: token.slice(-4), error: error.message });
      }
    }

    return NextResponse.json({ environment: process.env.PLAID_ENV, data: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
