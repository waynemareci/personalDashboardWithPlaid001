import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';

export async function POST(request) {
  try {
    const { accountId } = await request.json();

    await connectToDatabase();
    const account = await Account.findById(accountId);

    if (!account || !account.plaidAccessToken) {
      return NextResponse.json({ error: 'Account not linked to Plaid' }, { status: 404 });
    }

    // Force Plaid to refresh data from the bank
    await plaidClient.transactionsRefresh({
      access_token: account.plaidAccessToken,
    });

    // Wait a moment for refresh to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Fetch updated data
    const liabilitiesResponse = await plaidClient.liabilitiesGet({
      access_token: account.plaidAccessToken,
    });

    const plaidAccount = liabilitiesResponse.data.accounts.find(
      acc => acc.account_id === account.plaidAccountId
    );

    const liability = liabilitiesResponse.data.liabilities?.credit?.find(
      lib => lib.account_id === account.plaidAccountId
    );

    // Update account with fresh data
    account.amountOwed = Math.abs(plaidAccount?.balances?.current || 0);
    account.creditLimit = liability?.credit_limit || plaidAccount?.balances?.limit || account.creditLimit;
    account.minimumMonthlyPayment = liability?.minimum_payment_amount || 0;
    account.nextPaymentDueDate = liability?.next_payment_due_date || account.nextPaymentDueDate;
    account.updatedAt = new Date();

    await account.save();

    return NextResponse.json({ 
      success: true,
      account: {
        accountName: account.accountName,
        amountOwed: account.amountOwed,
        creditLimit: account.creditLimit,
        minimumMonthlyPayment: account.minimumMonthlyPayment,
        nextPaymentDueDate: account.nextPaymentDueDate,
        updatedAt: account.updatedAt,
      }
    });

  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.response?.data || null
    }, { status: 500 });
  }
}
