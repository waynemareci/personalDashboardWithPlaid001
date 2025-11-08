import { plaidClient } from '@/lib/plaid';
import { connectToDatabase } from '@/lib/mongodb';
import Account from '@/models/Account';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { accountId, access_token, item_id } = await request.json();
    
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts.filter(
      acc => acc.type === 'credit' && acc.subtype === 'credit card'
    );

    let liabilitiesResponse = null;
    try {
      liabilitiesResponse = await plaidClient.liabilitiesGet({ access_token });
    } catch (error) {
      console.log('Liabilities not available:', error.message);
    }

    await connectToDatabase();
    const existingAccount = await Account.findById(accountId);
    
    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const matchedAccount = accounts.find(acc => 
      acc.mask === existingAccount.accountNumber || 
      (acc.official_name || acc.name).toLowerCase().includes(existingAccount.accountName.toLowerCase())
    );

    if (!matchedAccount) {
      return NextResponse.json({ 
        error: 'No matching account found',
        availableAccounts: accounts.map(a => ({
          name: a.official_name || a.name,
          mask: a.mask,
          id: a.account_id
        }))
      }, { status: 404 });
    }

    const liability = liabilitiesResponse?.data?.liabilities?.credit?.find(
      c => c.account_id === matchedAccount.account_id
    );

    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      {
        plaidAccessToken: access_token,
        plaidAccountId: matchedAccount.account_id,
        plaidItemId: item_id,
        creditLimit: liability?.credit_limit || matchedAccount.balances.limit || existingAccount.creditLimit,
        amountOwed: Math.abs(matchedAccount.balances.current || 0),
        minimumMonthlyPayment: liability?.minimum_payment_amount || existingAccount.minimumMonthlyPayment,
        interestRate: liability?.aprs?.[0]?.apr_percentage || existingAccount.interestRate,
      },
      { new: true }
    );

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Link error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
