import { plaidClient } from '@/lib/plaid';
import { MongoClient } from 'mongodb';

export async function POST(request) {
  try {
    const { access_token, item_id } = await request.json();
    console.log('Syncing accounts with access_token:', access_token);
    
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    console.log('All accounts:', accountsResponse.data.accounts);
    
    let liabilitiesResponse = null;
    try {
      liabilitiesResponse = await plaidClient.liabilitiesGet({ access_token });
      console.log('Liabilities:', liabilitiesResponse.data.liabilities);
    } catch (error) {
      console.log('Liabilities not available:', error.message);
    }
    
    const accounts = accountsResponse.data.accounts.filter(
      acc => acc.type === 'credit'
    );
    
    console.log('Filtered credit cards:', accounts.length);
    accountsResponse.data.accounts.forEach(acc => {
      console.log(`Account: ${acc.name}, type: ${acc.type}, subtype: ${acc.subtype}`);
    });
    
    if (accounts.length === 0) {
      console.warn('No credit cards found. Check account types above.');
    }

    const creditCards = accounts.map(account => {
      const liability = liabilitiesResponse?.data?.liabilities?.credit?.find(
        c => c.account_id === account.account_id
      );

      return {
        plaidAccountId: account.account_id,
        plaidAccessToken: access_token,
        plaidItemId: item_id,
        accountName: account.official_name || account.name,
        accountNumber: account.mask,
        creditLimit: liability?.credit_limit || account.balances.limit || 0,
        amountOwed: Math.abs(account.balances.current || 0),
        minimumMonthlyPayment: liability?.minimum_payment_amount || 0,
        interestRate: liability?.aprs?.[0]?.apr_percentage || undefined,
        nextPaymentDueDate: liability?.next_payment_due_date || undefined,
      };
    });

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('accounts');

    const results = await Promise.all(
      creditCards.map(async (card) => {
        const existing = await collection.findOne({
          accountNumber: card.accountNumber
        });

        if (existing) {
          await collection.updateOne(
            { _id: existing._id },
            { 
              $set: {
                ...card,
                updatedAt: new Date().toISOString()
              }
            }
          );
          return { ...existing, ...card, matched: true };
        } else {
          const maxPosition = await collection.findOne({}, { sort: { position: -1 } });
          const newAccount = {
            ...card,
            id: `account-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            position: (maxPosition?.position || 0) + 1,
            userId: 'default-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await collection.insertOne(newAccount);
          return { ...newAccount, matched: false };
        }
      })
    );

    await client.close();
    
    console.log('Sync complete. Created/updated accounts:', results.length);

    return Response.json({ accounts: results });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}