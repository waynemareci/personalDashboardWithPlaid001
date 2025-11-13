import { plaidClient } from '@/lib/plaid';
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

const liabilitiesCache = new Map();

export async function POST(request) {
  try {
    const { accountId } = await request.json();
    
    await connectToDatabase();
    const account = await Account.findById(accountId);
    
    if (!account || !account.plaidAccessToken) {
      return NextResponse.json({ error: 'Account not linked to Plaid' }, { status: 404 });
    }

    const accountsResponse = await plaidClient.accountsGet({ 
      access_token: account.plaidAccessToken 
    });
    
    const plaidAccount = accountsResponse.data.accounts.find(
      acc => acc.account_id === account.plaidAccountId
    );

    if (!plaidAccount) {
      return NextResponse.json({ error: 'Plaid account not found' }, { status: 404 });
    }

    if (!liabilitiesCache.has(account.plaidAccessToken)) {
      try {
        const liabilitiesResponse = await plaidClient.liabilitiesGet({ 
          access_token: account.plaidAccessToken 
        });
        liabilitiesCache.set(account.plaidAccessToken, liabilitiesResponse.data.liabilities?.credit || []);
      } catch (error) {
        console.log('Liabilities not available:', error.message);
        liabilitiesCache.set(account.plaidAccessToken, []);
      }
    }

    const liability = liabilitiesCache.get(account.plaidAccessToken)?.find(
      c => c.account_id === account.plaidAccountId
    );

    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      {
        creditLimit: liability?.credit_limit || plaidAccount.balances.limit || account.creditLimit,
        amountOwed: Math.abs(plaidAccount.balances.current || 0),
        minimumMonthlyPayment: liability?.minimum_payment_amount || account.minimumMonthlyPayment,
        interestRate: liability?.aprs?.[0]?.apr_percentage || account.interestRate,
        nextPaymentDueDate: liability?.next_payment_due_date || account.nextPaymentDueDate,
      },
      { new: true }
    );

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
