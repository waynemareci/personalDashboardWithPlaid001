"use client";

import { useRouter } from "next/navigation";
import { Account } from "@/app/types";
import { createAccount } from "@/lib/dataSync";
import AccountForm from "@/components/AccountForm";

export default function NewAccountPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Account>) => {
    const result = await createAccount(data);

    if (result) {
      // Show success notification and redirect
      router.push("/accounts?notification=created");
    } else {
      alert("Failed to create account. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/accounts");
  };

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
            Add New Account
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.938rem" }}>
            Enter your credit account details
          </p>
        </header>

        <AccountForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
