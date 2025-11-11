"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Account } from "@/app/types";
import { loadAccounts, deleteAccount, makePayment } from "@/lib/dataSync";
import { migrateToMongoDB } from "@/lib/migrationUtils";
import MetricCards from "@/components/MetricCards";
import AccountTableCompact from "@/components/AccountTableCompact";
import AccountTableDetailed from "@/components/AccountTableDetailed";

function AccountsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") || "compact";
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("position");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const isDetailedView = viewParam === "detailed";

  useEffect(() => {
    loadAccountsData();
  }, []);

  const loadAccountsData = async () => {
    setLoading(true);
    const data = await loadAccounts();
    setAccounts(data);
    
    // Fetch liabilities for each linked account
    for (const account of data) {
      if (account.plaidAccessToken) {
        try {
          const response = await fetch('/api/plaid/get-liabilities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: account.plaidAccessToken }),
          });
          await response.json();
        } catch (error) {
          console.error('Error fetching liabilities:', error);
        }
      }
    }
    
    setLoading(false);
  };

  const handleViewToggle = (view: "compact" | "detailed") => {
    router.push(`/accounts?view=${view}`);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortColumn) {
      case "accountName":
        aValue = a.accountName.toLowerCase();
        bValue = b.accountName.toLowerCase();
        break;
      case "accountNumber":
        aValue = a.accountNumber || "";
        bValue = b.accountNumber || "";
        break;
      case "creditLimit":
        aValue = a.creditLimit || 0;
        bValue = b.creditLimit || 0;
        break;
      case "amountOwed":
        aValue = a.amountOwed || 0;
        bValue = b.amountOwed || 0;
        break;
      case "available":
        aValue = (a.creditLimit || 0) - (a.amountOwed || 0);
        bValue = (b.creditLimit || 0) - (b.amountOwed || 0);
        break;
      case "minimumMonthlyPayment":
        aValue = a.minimumMonthlyPayment || 0;
        bValue = b.minimumMonthlyPayment || 0;
        break;
      case "interestRate":
        aValue = a.interestRate || 0;
        bValue = b.interestRate || 0;
        break;
      case "utilization":
        aValue = a.creditLimit ? ((a.amountOwed || 0) / a.creditLimit) * 100 : 0;
        bValue = b.creditLimit ? ((b.amountOwed || 0) / b.creditLimit) * 100 : 0;
        break;
      case "rewards":
        aValue = a.rewards || 0;
        bValue = b.rewards || 0;
        break;
      case "lastUsed":
        aValue = a.lastUsed || "";
        bValue = b.lastUsed || "";
        break;
      case "position":
      default:
        aValue = a.position || 0;
        bValue = b.position || 0;
        break;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleAddNew = () => {
    router.push("/accounts/new");
  };

  const handleEdit = (account: Account) => {
    router.push(`/accounts/edit/${account._id || account.id}`);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAccount(id);
    if (success) {
      showNotification("Account deleted successfully");
      await loadAccountsData();
    } else {
      alert("Failed to delete account");
    }
  };

  const handleMakePayment = async (id: string, amount: number) => {
    const result = await makePayment(id, amount);
    if (result) {
      showNotification(`Payment of $${amount.toFixed(2)} processed successfully`);
      await loadAccountsData();
    } else {
      alert("Failed to process payment");
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMigrate = async () => {
    const confirmed = window.confirm(
      "This will migrate all accounts from localStorage to MongoDB, replacing any existing data. Continue?"
    );
    if (!confirmed) return;

    const result = await migrateToMongoDB();
    if (result.success) {
      showNotification(`Successfully migrated ${result.count} account(s) to MongoDB`);
      await loadAccountsData();
    } else {
      alert(`Migration failed: ${result.error}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Account Name",
      "Account Number",
      "Credit Limit",
      "Amount Owed",
      "Available",
      "Minimum Payment",
      "Interest Rate",
      "Rate Expiration",
      "Utilization",
      "Rewards",
      "Last Used",
    ].join(",");

    const rows = accounts.map((account) => {
      const available = (account.creditLimit || 0) - (account.amountOwed || 0);
      const utilization = account.creditLimit
        ? Math.round(((account.amountOwed || 0) / account.creditLimit) * 100)
        : 0;

      return [
        `"${account.accountName}"`,
        `"${account.accountNumber || ""}"`,
        account.creditLimit,
        account.amountOwed || 0,
        available,
        account.minimumMonthlyPayment || 0,
        account.interestRate || 0,
        account.rateExpiration || "",
        utilization,
        account.rewards || 0,
        account.lastUsed || "",
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `accounts-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Financial Accounts
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              onClick={handleAddNew}
              className="print:hidden"
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #1a1a1a",
                background: "#1a1a1a",
                color: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#333333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1a1a1a";
              }}
            >
              + Create New Account
            </button>
            <button
              onClick={handlePrint}
              className="print:hidden"
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                background: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.background = "white";
              }}
            >
              Print Report
            </button>
            <button
              onClick={handleExportCSV}
              className="print:hidden"
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #d1d5db",
                background: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af";
                e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d1d5db";
                e.currentTarget.style.background = "white";
              }}
            >
              Export CSV
            </button>
            <button
              onClick={handleMigrate}
              className="px-4 py-2 bg-orange-50 rounded-md text-sm cursor-pointer transition-all print:hidden"
              style={{ border: "1px solid #fed7aa", color: "#c2410c" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#fb923c";
                e.currentTarget.style.background = "#ffedd5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#fed7aa";
                e.currentTarget.style.background = "#fff7ed";
              }}
            >
              Migrate to MongoDB
            </button>
          </div>
        </header>

        {/* Metric Cards */}
        <MetricCards accounts={accounts} />

        {/* Table Section */}
        <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>All Accounts</h2>
            <div className="print:hidden" style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleViewToggle("compact")}
                style={{
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.813rem",
                  border: isDetailedView ? "1px solid #e5e7eb" : "1px solid #1a1a1a",
                  background: isDetailedView ? "white" : "#1a1a1a",
                  color: isDetailedView ? "#1a1a1a" : "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Compact
              </button>
              <button
                onClick={() => handleViewToggle("detailed")}
                style={{
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.813rem",
                  border: !isDetailedView ? "1px solid #e5e7eb" : "1px solid #1a1a1a",
                  background: !isDetailedView ? "white" : "#1a1a1a",
                  color: !isDetailedView ? "#1a1a1a" : "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Detailed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {accounts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No accounts added yet. Add your first account to get started.
              </div>
            ) : isDetailedView ? (
              <AccountTableDetailed
                accounts={sortedAccounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMakePayment={handleMakePayment}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            ) : (
              <AccountTableCompact
                accounts={sortedAccounts}
                onEdit={handleEdit}
                onSort={handleSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onAccountLinked={loadAccountsData}
              />
            )}
          </div>
        </div>

        {/* Success Notification */}
        {notification && (
          <div className="fixed top-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-slideIn print:hidden">
            ✓ {notification}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease;
        }
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountsPageContent />
    </Suspense>
  );
}
