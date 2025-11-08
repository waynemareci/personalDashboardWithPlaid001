# Plaid Account Linking Guide

## Overview
This guide explains how to link your manually-entered accounts to live Plaid data using production credentials.

## What Was Added

### 1. Database Schema Updates
- Added `plaidAccessToken`, `plaidAccountId`, and `plaidItemId` fields to Account model
- These fields store the connection to Plaid for each account

### 2. New API Endpoints

#### `/api/accounts/link` (POST)
Links an existing account to Plaid:
```javascript
{
  accountId: "account-id",
  access_token: "access-token-from-plaid",
  item_id: "item-id-from-plaid"
}
```

#### `/api/accounts/refresh` (POST)
Refreshes data for a linked account:
```javascript
{
  accountId: "account-id"
}
```

### 3. New Component: PlaidLinkAccount
A button component that:
- Opens Plaid Link for bank authentication
- Matches the selected bank account to your manually-entered account
- Stores the connection tokens
- Updates account with live data

### 4. UI Updates
- Added "Link Account" button in the expanded account details
- Shows "✓ Linked to Plaid" status for connected accounts
- Automatically refreshes account list after linking

## How to Use

### Step 1: View Your Accounts
1. Go to `/accounts` page
2. Click "Details ▼" on any account to expand it

### Step 2: Link an Account
1. In the expanded details, click "Link Account" button
2. Plaid Link will open
3. Select your bank and log in with real credentials
4. Select the account you want to link
5. The system will automatically match and update your account with live data

### Step 3: Verify Connection
- After linking, you'll see "✓ Linked to Plaid" instead of the Link button
- Account balances and details will be updated with real data from your bank

## What Gets Updated

When you link an account, these fields are automatically updated with live data:
- Credit Limit
- Amount Owed (current balance)
- Minimum Monthly Payment
- Interest Rate (APR)

## Manual vs Live Data

- **Before Linking**: Account uses manually-entered data
- **After Linking**: Account pulls live data from your bank via Plaid
- **Manual fields preserved**: Account name, payment due date, rewards, etc.

## Refreshing Data

To refresh data for linked accounts, you can:
1. Call the `/api/accounts/refresh` endpoint with the account ID
2. Or re-link the account (it will update existing connection)

## Production Environment

Make sure your `.env.local` has:
```env
PLAID_ENV=production
NEXT_PUBLIC_PLAID_ENV=production
PLAID_SECRET=<your-production-secret>
```

## Troubleshooting

### "No matching account found" error
The system tries to match by:
1. Account number (last 4 digits)
2. Account name

If no match is found, you'll see available accounts to help you identify the right one.

### Account not updating
- Verify the account has `plaidAccessToken` stored
- Check that your production credentials are correct
- Try refreshing the account data

## Security Notes

- Access tokens are stored securely in MongoDB
- Never expose tokens in client-side code
- Production credentials only work with real bank data
- Sandbox credentials won't work in production environment
