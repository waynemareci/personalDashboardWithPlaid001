import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId required' }, { status: 400 });
    }

    await connectToDatabase();
    const account = await Account.findById(accountId);

    if (!account || !account.plaidAccessToken) {
      return NextResponse.json({ error: 'Account not found or not linked to Plaid' }, { status: 404 });
    }

    // Fetch raw Plaid data
    const response = await plaidClient.liabilitiesGet({
      access_token: account.plaidAccessToken,
    });

    // Find the specific account in Plaid response
    const plaidAccount = response.data.accounts.find(
      acc => acc.account_id === account.plaidAccountId
    );

    const liability = response.data.liabilities?.credit?.find(
      lib => lib.account_id === account.plaidAccountId
    );

    return NextResponse.json({
      accountName: account.accountName,
      databaseValues: {
        amountOwed: account.amountOwed,
        creditLimit: account.creditLimit,
        minimumMonthlyPayment: account.minimumMonthlyPayment,
      },
      plaidRawData: {
        account: plaidAccount,
        liability: liability,
      },
      interpretation: {
        currentBalance: plaidAccount?.balances?.current,
        availableBalance: plaidAccount?.balances?.available,
        creditLimit: plaidAccount?.balances?.limit,
        isoCurrencyCode: plaidAccount?.balances?.iso_currency_code,
        lastPaymentAmount: liability?.last_payment_amount,
        lastStatementBalance: liability?.last_statement_balance,
        minimumPaymentAmount: liability?.minimum_payment_amount,
        nextPaymentDueDate: liability?.next_payment_due_date,
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.response?.data || error
    }, { status: 500 });
  }
}
