"use client";

import { useState, Fragment } from "react";
import { Account } from "@/app/types";
import PlaidLinkAccount from "@/components/PlaidLinkAccount";
import {
  formatCurrency,
  calculateUtilization,
  getUtilizationCategory,
  formatMonth,
  isRateExpiringSoon,
  calculateAvailableCredit,
} from "@/lib/accountUtils";

interface AccountTableCompactProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onAccountLinked?: () => void;
}

export default function AccountTableCompact({
  accounts,
  onEdit,
  onSort,
  sortColumn,
  sortDirection,
  onAccountLinked,
}: AccountTableCompactProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (accountId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  const totalLimit = accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
  const totalOwed = accounts.reduce((sum, acc) => sum + (acc.amountOwed || 0), 0);
  const totalUtilization = totalLimit > 0 ? Math.round((totalOwed / totalLimit) * 100) : 0;

  return (
    <table className="min-w-full" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f9fafb" }}>
          <th
            onClick={() => onSort("accountName")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Account Name{getSortIndicator("accountName")}
          </th>
          <th
            onClick={() => onSort("creditLimit")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Credit Limit{getSortIndicator("creditLimit")}
          </th>
          <th
            onClick={() => onSort("amountOwed")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Amount Owed{getSortIndicator("amountOwed")}
          </th>
          <th
            onClick={() => onSort("interestRate")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Interest Rate{getSortIndicator("interestRate")}
          </th>
          <th
            onClick={() => onSort("lastUsed")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Last Used{getSortIndicator("lastUsed")}
          </th>
          <th
            onClick={() => onSort("utilization")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Utilization{getSortIndicator("utilization")}
          </th>
          <th style={{ padding: "0.75rem 1.5rem" }}></th>
        </tr>
      </thead>
        <tbody>
          {accounts.map((account) => {
            const utilization = calculateUtilization(account);
            const utilizationCategory = getUtilizationCategory(utilization);
            const isExpanded = expandedRows.has(account.id);

            return (
              <Fragment key={account.id}>
                <tr
                  style={{ borderTop: "1px solid #f3f4f6", transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem", fontWeight: 600 }}>
                    {account.accountName}
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
                    {formatCurrency(account.creditLimit)}
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
                    {formatCurrency(account.amountOwed || 0)}
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
                    <div className="flex flex-col" style={{ gap: "0.125rem" }}>
                      <span style={{ fontWeight: 500 }}>
                        {account.interestRate ? `${account.interestRate}%` : "—"}
                      </span>
                      {account.rateExpiration && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: isRateExpiringSoon(account.rateExpiration) ? "#dc2626" : "#6b7280",
                            fontWeight: isRateExpiringSoon(account.rateExpiration) ? 500 : 400,
                          }}
                        >
                          exp. {new Date(account.rateExpiration).toLocaleDateString("en-US", {
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
                    {account.lastUsed ? (
                      <span
                        className="inline-block rounded"
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "#e0e7ff",
                          color: "#3730a3",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {formatMonth(account.lastUsed)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
                    <span
                      className="inline-block rounded"
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background:
                          utilizationCategory === "low"
                            ? "#d1fae5"
                            : utilizationCategory === "medium"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          utilizationCategory === "low"
                            ? "#065f46"
                            : utilizationCategory === "medium"
                            ? "#92400e"
                            : "#991b1b",
                      }}
                    >
                      {utilization}%
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
                    <button
                      onClick={() => toggleRow(account.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        textDecoration: "underline",
                      }}
                    >
                      {isExpanded ? "Details ▲" : "Details ▼"}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr
                    style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}
                  >
                    <td colSpan={7} style={{ padding: "1rem 1.5rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                        <div style={{ fontSize: "0.875rem" }}>
                          <div style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                            Account Number
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            {account.accountNumber || "—"}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.875rem" }}>
                          <div style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                            Available Credit
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            {formatCurrency(calculateAvailableCredit(account))}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.875rem" }}>
                          <div style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                            Minimum Payment
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            {formatCurrency(account.minimumMonthlyPayment || 0)}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.875rem" }}>
                          <div style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                            Rewards
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            {account.rewards ? formatCurrency(account.rewards) : "—"}
                          </div>
                        </div>
                        <div style={{ fontSize: "0.875rem" }}>
                          <div style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                            Payment Preference
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            {account.paymentPreference === "full" ? "Pay In Full" : "Make Minimum Payment"}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {account.plaidAccessToken ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <span style={{ fontSize: "0.813rem", color: "#059669", fontWeight: 500 }}>
                              ✓ Linked to Plaid
                            </span>
                            {account.updatedAt && (
                              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                Last synced: {new Date(account.updatedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <PlaidLinkAccount 
                            accountId={account._id || account.id} 
                            onSuccess={() => onAccountLinked?.()} 
                          />
                        )}
                        <button
                          onClick={() => onEdit(account)}
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #d1d5db",
                            background: "white",
                            borderRadius: "4px",
                            fontSize: "0.813rem",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {/* Totals Row */}
          <tr style={{ background: "#f9fafb", fontWeight: 600 }}>
            <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>Totals</td>
            <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>{formatCurrency(totalLimit)}</td>
            <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>{formatCurrency(totalOwed)}</td>
            <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>—</td>
            <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>—</td>
            <td style={{ padding: "1rem 1.5rem", fontSize: "0.938rem" }}>
              <span
                className="inline-block rounded"
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background:
                    getUtilizationCategory(totalUtilization) === "low"
                      ? "#d1fae5"
                      : getUtilizationCategory(totalUtilization) === "medium"
                      ? "#fef3c7"
                      : "#fee2e2",
                  color:
                    getUtilizationCategory(totalUtilization) === "low"
                      ? "#065f46"
                      : getUtilizationCategory(totalUtilization) === "medium"
                      ? "#92400e"
                      : "#991b1b",
                }}
              >
                {totalUtilization}%
              </span>
            </td>
            <td style={{ padding: "1rem 1.5rem" }}></td>
          </tr>
        </tbody>
      </table>
  );
}
