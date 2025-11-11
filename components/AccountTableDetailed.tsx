"use client";

import { Account } from "@/app/types";
import {
  formatCurrency,
  calculateUtilization,
  getUtilizationCategory,
  formatMonth,
  isRateExpiringSoon,
  calculateAvailableCredit,
} from "@/lib/accountUtils";

interface AccountTableDetailedProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onMakePayment: (id: string, amount: number) => void;
  onSort: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
}

export default function AccountTableDetailed({
  accounts,
  onEdit,
  onDelete,
  onMakePayment,
  onSort,
  sortColumn,
  sortDirection,
}: AccountTableDetailedProps) {
  const handlePaymentClick = (account: Account) => {
    if (!account.amountOwed || account.amountOwed <= 0) return;

    const amount = window.prompt("Payment Amount:");
    if (amount) {
      const paymentAmount = parseFloat(amount);
      if (paymentAmount > 0) {
        onMakePayment(account.id, paymentAmount);
      }
    }
  };

  const getSortIndicator = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  const totalLimit = accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
  const totalOwed = accounts.reduce((sum, acc) => sum + (acc.amountOwed || 0), 0);
  const totalAvailable = totalLimit - totalOwed;
  const totalMinPayment = accounts.reduce(
    (sum, acc) => sum + (acc.minimumMonthlyPayment || 0),
    0
  );
  const totalRewards = accounts.reduce((sum, acc) => sum + (acc.rewards || 0), 0);
  const totalUtilization = totalLimit > 0 ? Math.round((totalOwed / totalLimit) * 100) : 0;

  return (
    <table className="min-w-full" style={{ minWidth: "1400px", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f9fafb" }}>
          <th
            onClick={() => onSort("accountName")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1rem",
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
            onClick={() => onSort("accountNumber")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Account #{getSortIndicator("accountNumber")}
          </th>
          <th
            onClick={() => onSort("creditLimit")}
            className="text-right uppercase"
            style={{
              padding: "0.75rem 1rem",
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
            className="text-right uppercase"
            style={{
              padding: "0.75rem 1rem",
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
            onClick={() => onSort("available")}
            className="text-right uppercase"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Available{getSortIndicator("available")}
          </th>
          <th
            onClick={() => onSort("minimumMonthlyPayment")}
            className="text-right uppercase"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Min. Payment{getSortIndicator("minimumMonthlyPayment")}
          </th>
          <th
            onClick={() => onSort("interestRate")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1rem",
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
            onClick={() => onSort("utilization")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Utilization{getSortIndicator("utilization")}
          </th>
          <th
            onClick={() => onSort("rewards")}
            className="text-right uppercase"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Rewards{getSortIndicator("rewards")}
          </th>
          <th
            onClick={() => onSort("lastUsed")}
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1rem",
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
            className="text-left uppercase"
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.813rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.05em",
            }}
          >
            Actions
          </th>
        </tr>
      </thead>
        <tbody>
          {accounts.map((account, index) => {
            const utilization = calculateUtilization(account);
            const utilizationCategory = getUtilizationCategory(utilization);

            return (
              <tr
                key={account.id}
                style={{ borderTop: "1px solid #f3f4f6", transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "1rem", fontSize: "0.938rem", fontWeight: 600 }}>
                  {account.accountName}
                </td>
                <td style={{ padding: "1rem", fontSize: "0.875rem", fontFamily: "monospace", color: "#6b7280" }}>
                  {account.accountNumber || "—"}
                </td>
                <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
                  {formatCurrency(account.creditLimit)}
                </td>
                <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
                  {formatCurrency(account.amountOwed || 0)}
                </td>
                <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
                  {formatCurrency(calculateAvailableCredit(account))}
                </td>
                <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
                  {formatCurrency(account.minimumMonthlyPayment || 0)}
                </td>
                <td style={{ padding: "1rem", fontSize: "0.938rem" }}>
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
                <td style={{ padding: "1rem", fontSize: "0.938rem" }}>
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
                <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
                  {account.rewards ? formatCurrency(account.rewards) : "—"}
                </td>
                <td style={{ padding: "1rem", fontSize: "0.938rem" }}>
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
                <td style={{ padding: "1rem", fontSize: "0.938rem" }}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(account)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem" }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handlePaymentClick(account)}
                      disabled={!account.amountOwed || account.amountOwed <= 0}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: !account.amountOwed || account.amountOwed <= 0 ? "not-allowed" : "pointer",
                        opacity: !account.amountOwed || account.amountOwed <= 0 ? 0.3 : 1,
                        fontSize: "1.125rem",
                      }}
                      title="Make Payment"
                    >
                      💳
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${account.accountName}?`)) {
                          onDelete(account._id || account.id);
                        }
                      }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.125rem" }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {/* Totals Row */}
          <tr style={{ background: "#f9fafb", fontWeight: 600 }}>
            <td style={{ padding: "1rem", fontSize: "0.938rem" }} colSpan={2}>
              Total
            </td>
            <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
              {formatCurrency(totalLimit)}
            </td>
            <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
              {formatCurrency(totalOwed)}
            </td>
            <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
              {formatCurrency(totalAvailable)}
            </td>
            <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
              {formatCurrency(totalMinPayment)}
            </td>
            <td style={{ padding: "1rem", fontSize: "0.938rem" }}>—</td>
            <td style={{ padding: "1rem", fontSize: "0.938rem" }}>
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
            <td className="text-right" style={{ padding: "1rem", fontSize: "0.938rem" }}>
              {formatCurrency(totalRewards)}
            </td>
            <td style={{ padding: "1rem", fontSize: "0.938rem" }}>—</td>
            <td style={{ padding: "1rem", fontSize: "0.938rem" }}>—</td>
          </tr>
        </tbody>
      </table>
  );
}
