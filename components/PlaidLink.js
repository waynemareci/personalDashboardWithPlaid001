'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useState, useEffect } from 'react';

export default function PlaidLink({ onSuccess }) {
  const [linkToken, setLinkToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        console.log('Link token response:', data);
        if (data.link_token) {
          setLinkToken(data.link_token);
        } else {
          console.error('No link token received:', data);
        }
      } catch (error) {
        console.error('Error creating link token:', error);
      }
    };
    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      const exchangeResponse = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });
      const { access_token, item_id } = await exchangeResponse.json();
      
      const syncResponse = await fetch('/api/plaid/sync-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token, item_id }),
      });
      const syncData = await syncResponse.json();
      
      onSuccess(syncData);
    },
  });

  if (!mounted) {
    return (
      <button 
        disabled
        style={{
          padding: '10px 20px',
          backgroundColor: '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'not-allowed',
        }}
      >
        Connect Bank Account
      </button>
    );
  }

  return (
    <div>
      <button 
        onClick={() => open()} 
        disabled={!ready}
        style={{
          padding: '10px 20px',
          backgroundColor: ready ? '#000' : '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: ready ? 'pointer' : 'not-allowed',
        }}
      >
        Connect Bank Account
      </button>
      {!ready && <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Loading Plaid...</p>}
    </div>
  );
}