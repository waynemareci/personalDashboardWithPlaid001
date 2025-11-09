import { plaidClient } from '@/lib/plaid';

export async function POST() {
  try {
    console.log('Creating link token with:', {
      clientId: process.env.PLAID_CLIENT_ID,
      hasSecret: !!process.env.PLAID_SECRET,
      env: process.env.PLAID_ENV,
    });
    
    const config = {
      user: { client_user_id: 'user-id' },
      client_name: 'Personal Dashboard',
      products: ['liabilities'],
      country_codes: ['US'],
      language: 'en',
    };
    
    const response = await plaidClient.linkTokenCreate(config);
    
    return Response.json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Plaid link token error:', error.response?.data || error);
    return Response.json({ 
      error: error.message,
      details: error.response?.data 
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ 
    env: process.env.PLAID_ENV,
    hasClientId: !!process.env.PLAID_CLIENT_ID,
    hasSecret: !!process.env.PLAID_SECRET 
  });
}