import { plaidClient } from '@/lib/plaid';

export async function POST(request) {
  try {
    const { public_token } = await request.json();
    
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    
    return Response.json({ 
      access_token: response.data.access_token,
      item_id: response.data.item_id 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}