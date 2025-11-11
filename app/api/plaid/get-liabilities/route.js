import { plaidClient } from '@/lib/plaid';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { access_token } = await request.json();
    
    const response = await plaidClient.liabilitiesGet({ access_token });
    
    const creditCardAccounts = response.data.accounts?.filter(
      acc => acc.subtype === 'credit card'
    ) || [];
    
    console.log('=== CREDIT CARD ACCOUNTS ===');
    console.log(JSON.stringify(creditCardAccounts, null, 2));
    console.log('\n=== CREDIT CARD LIABILITIES ===');
    console.log(JSON.stringify(response.data.liabilities?.credit || [], null, 2));
    console.log('================================\n');
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Liabilities error:', error.response?.data || error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
