"use client";

import { Account } from "@/app/types";
import {
  formatCurrency,
  calculateTotalUtilization,
  getUpcomingPayments,
} from "@/lib/accountUtils";
import PaymentCarousel from "./PaymentCarousel";

interface MetricCardsProps {
  accounts: Account[];
}

export default function MetricCards({ accounts }: MetricCardsProps) {
  const totalLimit = accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
  const totalOwed = accounts.reduce((sum, acc) => sum + (acc.amountOwed || 0), 0);
  const totalAvailable = totalLimit - totalOwed;
  const utilization = calculateTotalUtilization(accounts);

  const upcomingPayments = getUpcomingPayments(accounts);
  const totalMinimumPayment = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
      {/* Credit Overview Card */}
      <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", border: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem", fontWeight: 500 }}>
          Credit Overview
        </div>

        <div className="flex justify-between mb-4">
          <div>
            <h3 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem", color: "#dc2626" }}>
              {formatCurrency(totalOwed)}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Owed
            </p>
          </div>
          <div className="text-right">
            <h3 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.25rem", color: "#059669" }}>
              {formatCurrency(totalLimit)}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Credit Limit
            </p>
          </div>
        </div>

        {/* Visual Bar */}
        <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              background: "#dc2626",
              width: `${utilization}%`,
              transition: "width 0.3s",
            }}
          />
        </div>

        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.5rem" }}>
          {utilization}% total utilization across all accounts
        </p>
      </div>

      {/* Upcoming Payments Card */}
      <div style={{ background: "white", borderRadius: "8px", padding: "1.5rem", border: "1px solid #e5e7eb" }}>
        <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem", fontWeight: 500 }}>
          Upcoming Payments
        </div>

        <PaymentCarousel payments={upcomingPayments} />

        {/* Total */}
        <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: "0.813rem", color: "#6b7280" }}>Minimum payment next 30 days</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#3b82f6" }}>
            {formatCurrency(totalMinimumPayment)}
          </span>
        </div>
      </div>
    </div>
  );
}
