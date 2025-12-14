import { plaidClient } from '@/lib/plaid';
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await connectToDatabase();
    const accounts = await Account.find({ plaidAccessToken: { $exists: true, $ne: null } });
    
    const tokenMap = new Map();
    accounts.forEach(acc => {
      if (!tokenMap.has(acc.plaidAccessToken)) {
        tokenMap.set(acc.plaidAccessToken, []);
      }
      tokenMap.get(acc.plaidAccessToken).push(acc);
    });

    const liabilitiesCache = new Map();

    for (const [token, accs] of tokenMap.entries()) {
      try {
        const [accountsRes, liabilitiesRes] = await Promise.all([
          plaidClient.accountsGet({ access_token: token }),
          plaidClient.liabilitiesGet({ access_token: token }).catch(() => null)
        ]);

        liabilitiesCache.set(token, liabilitiesRes?.data?.liabilities?.credit || []);

        for (const acc of accs) {
          const plaidAccount = accountsRes.data.accounts.find(pa => pa.account_id === acc.plaidAccountId);
          if (!plaidAccount) continue;

          const liability = liabilitiesCache.get(token)?.find(c => c.account_id === acc.plaidAccountId);

          await Account.findByIdAndUpdate(acc._id, {
            creditLimit: liability?.credit_limit || plaidAccount.balances.limit || acc.creditLimit,
            amountOwed: plaidAccount.balances.current || 0,
            minimumMonthlyPayment: liability?.minimum_payment_amount || acc.minimumMonthlyPayment,
            interestRate: liability?.aprs?.[0]?.apr_percentage || acc.interestRate,
            nextPaymentDueDate: liability?.next_payment_due_date || acc.nextPaymentDueDate,
          });
        }
      } catch (error) {
        console.error(`Error refreshing token ${token.slice(-4)}:`, error.message);
      }
    }

    return NextResponse.json({ success: true, tokensProcessed: tokenMap.size });
  } catch (error) {
    console.error('Refresh all error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
