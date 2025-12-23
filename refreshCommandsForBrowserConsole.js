

/*
/api/accounts/refresh-all
Purpose: Refresh ALL Plaid-linked accounts in your database

How it works:

Queries MongoDB for all accounts with plaidAccessToken

Groups them by unique access token (one token per bank/Item)

Calls transactionsRefresh for each token

Fetches fresh data from Plaid

Updates ALL accounts in the database

When to use: When you want to refresh everything at once

/api/plaid/sync-accounts
Purpose: Sync accounts for ONE specific Plaid Item (one bank connection)

How it works:

Takes a specific access_token and item_id as input

Calls transactionsRefresh for ONLY that token

Fetches data for ONLY accounts under that Item

Updates ONLY those accounts in the database

When to use:

When linking a new account (called automatically after Plaid Link)

When you want to refresh only one bank's accounts (like Chase)

Why the difference in the commands?
First command (refresh-all):

No parameters needed

Automatically finds and refreshes everything

Simple but refreshes ALL banks

Second command (sync-accounts):

Requires access_token and item_id parameters

Only refreshes the specified bank

More targeted, saves API costs

Since Chase accounts share one Plaid Item (one bank connection = one access token), using sync-accounts with Chase's token only refreshes Chase accounts, not Bank of America, Citi, etc.


*/

// refresh all accounts
fetch('/api/accounts/refresh-all', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Refresh complete:', data));

// refresh only Chase accounts
// Step 1: Find Chase accounts and get their access token
fetch('/api/accounts')
  .then(r => r.json())
  .then(accounts => {
    const chaseAccounts = accounts.filter(acc => 
      acc.accountName.toLowerCase().includes('chase')
    );
    
    if (chaseAccounts.length === 0) {
      console.log('No Chase accounts found');
      return;
    }
    
    console.log('Found Chase accounts:', chaseAccounts.map(a => a.accountName));
    
    // All Chase accounts share the same access token (same Plaid Item)
    const accessToken = chaseAccounts[0].plaidAccessToken;
    
    if (!accessToken) {
      console.log('Chase accounts not linked to Plaid');
      return;
    }
    
    // Step 2: Refresh using that specific token
    return fetch('/api/plaid/sync-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        access_token: accessToken,
        item_id: chaseAccounts[0].plaidItemId
      })
    });
  })
  .then(r => r?.json())
  .then(data => console.log('Chase refresh complete:', data));
