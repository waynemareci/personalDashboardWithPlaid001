'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useState, useEffect } from 'react';

export default function PlaidLinkAccount({ accountId, onSuccess }) {
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
        if (data.link_token) {
          setLinkToken(data.link_token);
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
      console.log('Plaid success:', metadata);
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
      
      if (syncData.error) {
        alert('Sync failed: ' + syncData.error);
      } else if (syncData.accounts && syncData.accounts.length > 0) {
        onSuccess();
      } else {
        alert('No credit cards found');
      }
    },
    onExit: (err, metadata) => {
      console.error('Plaid exit:', err, metadata);
      if (err) {
        alert(`Plaid error: ${err.error_message || err.display_message || 'Unknown error'}`);
      }
    },
  });

  if (!mounted) {
    return (
      <button 
        disabled
        style={{
          padding: '6px 12px',
          backgroundColor: '#ccc',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.813rem',
          cursor: 'not-allowed',
        }}
      >
        Link Account
      </button>
    );
  }

  return (
    <button 
      onClick={() => open()} 
      disabled={!ready}
      style={{
        padding: '6px 12px',
        backgroundColor: ready ? '#2563eb' : '#ccc',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.813rem',
        cursor: ready ? 'pointer' : 'not-allowed',
      }}
    >
      Link Account
    </button>
  );
}
