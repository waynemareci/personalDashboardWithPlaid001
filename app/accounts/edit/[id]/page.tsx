"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Account } from "@/app/types";
import { loadAccounts, updateAccount } from "@/lib/dataSync";
import AccountForm from "@/components/AccountForm";
import PlaidLinkAccount from "@/components/PlaidLinkAccount";

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountData();
  }, [accountId]);

  const loadAccountData = async () => {
    const accounts = await loadAccounts();
    const found = accounts.find((acc) => acc._id === accountId || acc.id === accountId);

    if (found) {
      setAccount(found);
    } else {
      alert("Account not found");
      router.push("/accounts");
    }
    setLoading(false);
  };

  const handleSubmit = async (data: Partial<Account>) => {
    const result = await updateAccount(accountId, data);

    if (result) {
      router.push("/accounts?notification=updated");
    } else {
      alert("Failed to update account. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/accounts");
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 600, color: "#374151" }}>Loading account...</div>
        </div>
      </div>
    );
  }

  if (!account) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <header style={{ marginBottom: "2rem" }}>
          <a
            href="/accounts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1a1a")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
          >
            ← Back to Accounts
          </a>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              color: "#1a1a1a",
            }}
          >
            Edit Account
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.938rem" }}>
            Update {account.accountName} details
          </p>
          {account.plaidAccessToken && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.875rem", color: "#166534", marginBottom: "0.5rem", fontWeight: 500 }}>
                This account is linked to Plaid
              </div>
              <div style={{ fontSize: "0.813rem", color: "#15803d", marginBottom: "0.75rem" }}>
                Re-link to update with latest Plaid products and refresh connection
              </div>
              <PlaidLinkAccount 
                accountId={account._id || account.id} 
                onSuccess={loadAccountData}
                buttonLabel="Re-link Account"
              />
            </div>
          )}
        </header>

        <AccountForm account={account} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
