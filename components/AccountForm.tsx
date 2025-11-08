"use client";

import { useState } from "react";
import { Account } from "@/app/types";
import PlaidLink from "./PlaidLink";

interface AccountFormProps {
  account?: Account;
  onSubmit: (data: Partial<Account>) => Promise<void>;
  onCancel: () => void;
}

export default function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState({
    accountName: account?.accountName || "",
    accountNumber: account?.accountNumber || "",
    paymentDueDate: account?.paymentDueDate?.toString() || "",
    creditLimit: account?.creditLimit?.toString() || "",
    amountOwed: account?.amountOwed?.toString() || "",
    minimumMonthlyPayment: account?.minimumMonthlyPayment?.toString() || "",
    interestRate: account?.interestRate?.toString() || "",
    rateExpiration: account?.rateExpiration || "",
    rewards: account?.rewards?.toString() || "",
    lastUsed: account?.lastUsed?.toString() || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validation for required fields
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === "accountName" && !value.trim()) {
      newErrors.accountName = "Account name is required";
    } else if (name === "accountName") {
      delete newErrors.accountName;
    }

    if (name === "creditLimit") {
      if (!value.trim()) {
        newErrors.creditLimit = "Credit limit is required";
      } else if (parseFloat(value) <= 0) {
        newErrors.creditLimit = "Credit limit must be greater than 0";
      } else {
        delete newErrors.creditLimit;
      }
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "accountName" || name === "creditLimit") {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: Record<string, string> = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.creditLimit.trim()) {
      newErrors.creditLimit = "Credit limit is required";
    } else if (parseFloat(formData.creditLimit) <= 0) {
      newErrors.creditLimit = "Credit limit must be greater than 0";
    }

    // Complex validation
    if (formData.paymentDueDate) {
      const day = parseInt(formData.paymentDueDate);
      if (day < 1 || day > 31) {
        newErrors.paymentDueDate = "Payment due date must be between 1 and 31";
      }
    }

    if (formData.lastUsed) {
      const month = parseInt(formData.lastUsed);
      if (month < 1 || month > 12) {
        newErrors.lastUsed = "Last used must be between 1 and 12";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submitData: Partial<Account> = {
      accountName: formData.accountName,
      accountNumber: formData.accountNumber || undefined,
      paymentDueDate: formData.paymentDueDate ? parseInt(formData.paymentDueDate) : undefined,
      creditLimit: parseFloat(formData.creditLimit),
      amountOwed: formData.amountOwed ? parseFloat(formData.amountOwed) : 0,
      minimumMonthlyPayment: formData.minimumMonthlyPayment
        ? parseFloat(formData.minimumMonthlyPayment)
        : 0,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
      rateExpiration: formData.rateExpiration || undefined,
      rewards: formData.rewards ? parseFloat(formData.rewards) : undefined,
      lastUsed: formData.lastUsed ? parseInt(formData.lastUsed) : undefined,
    };

    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaidSuccess = (syncData: { accounts?: Array<Partial<Account>> }) => {
    if (syncData.accounts && syncData.accounts.length > 0) {
      const firstAccount = syncData.accounts[0];
      setFormData({
        accountName: firstAccount.accountName || "",
        accountNumber: firstAccount.accountNumber || "",
        paymentDueDate: "",
        creditLimit: firstAccount.creditLimit?.toString() || "",
        amountOwed: firstAccount.amountOwed?.toString() || "",
        minimumMonthlyPayment: firstAccount.minimumMonthlyPayment?.toString() || "",
        interestRate: firstAccount.interestRate?.toString() || "",
        rateExpiration: "",
        rewards: "",
        lastUsed: "",
      });
    }
  };

  return (
    <>
      <style jsx>{`
        .form-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <form onSubmit={handleSubmit}>
        {/* Plaid Connection */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              marginBottom: "1.25rem",
              paddingBottom: "0.75rem",
              borderBottom: "2px solid #f3f4f6",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              Connect Bank Account
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Link your credit card for automatic data sync
            </p>
          </div>
          <PlaidLink onSuccess={handlePlaidSuccess} />
        </div>

        {/* Account Information */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            marginBottom: "1.25rem",
            paddingBottom: "0.75rem",
            borderBottom: "2px solid #f3f4f6",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Account Information
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Basic identification details for this account
          </p>
        </div>

        <div className="form-grid">
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="accountName"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Account Name <span style={{ color: "#dc2626", marginLeft: "0.25rem" }}>*</span>
            </label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                padding: "0.625rem 0.875rem",
                border: errors.accountName ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                if (!errors.accountName) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target && !errors.accountName) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target && !errors.accountName) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="e.g., Chase Sapphire Reserve"
              required
            />
            {errors.accountName && (
              <span style={{ fontSize: "0.813rem", color: "#dc2626", marginTop: "0.375rem" }}>
                {errors.accountName}
              </span>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="accountNumber"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              style={{
                padding: "0.625rem 0.875rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="Last 4 digits (optional)"
            />
            <span style={{ fontSize: "0.813rem", color: "#6b7280", marginTop: "0.375rem" }}>
              For your reference only
            </span>
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="paymentDueDate"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Payment Due Date (Day of Month)
            </label>
            <input
              type="number"
              id="paymentDueDate"
              name="paymentDueDate"
              value={formData.paymentDueDate}
              onChange={handleChange}
              min="1"
              max="31"
              step="1"
              style={{
                padding: "0.625rem 0.875rem",
                border: errors.paymentDueDate ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                if (!errors.paymentDueDate) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target && !errors.paymentDueDate) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target && !errors.paymentDueDate) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="1-31"
            />
            {errors.paymentDueDate && (
              <span style={{ fontSize: "0.813rem", color: "#dc2626", marginTop: "0.375rem" }}>
                {errors.paymentDueDate}
              </span>
            )}
            {!errors.paymentDueDate && (
              <span style={{ fontSize: "0.813rem", color: "#6b7280", marginTop: "0.375rem" }}>
                Day of month when payment is due (e.g., 15 for the 15th)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Financial Details */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            marginBottom: "1.25rem",
            paddingBottom: "0.75rem",
            borderBottom: "2px solid #f3f4f6",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Financial Details
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Credit limits, balances, and payment information
          </p>
        </div>

        <div className="form-grid">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="creditLimit"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Credit Limit <span style={{ color: "#dc2626", marginLeft: "0.25rem" }}>*</span>
            </label>
            <input
              type="number"
              id="creditLimit"
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
              onBlur={handleBlur}
              step="0.01"
              min="0"
              style={{
                padding: "0.625rem 0.875rem",
                border: errors.creditLimit ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                if (!errors.creditLimit) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target && !errors.creditLimit) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target && !errors.creditLimit) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="0.00"
              required
            />
            {errors.creditLimit && (
              <span style={{ fontSize: "0.813rem", color: "#dc2626", marginTop: "0.375rem" }}>
                {errors.creditLimit}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="amountOwed"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Amount Owed
            </label>
            <input
              type="number"
              id="amountOwed"
              name="amountOwed"
              value={formData.amountOwed}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={{
                padding: "0.625rem 0.875rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="0.00"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="minimumMonthlyPayment"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Minimum Monthly Payment
            </label>
            <input
              type="number"
              id="minimumMonthlyPayment"
              name="minimumMonthlyPayment"
              value={formData.minimumMonthlyPayment}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={{
                padding: "0.625rem 0.875rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="0.00"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="interestRate"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Interest Rate (%)
            </label>
            <input
              type="number"
              id="interestRate"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="100"
              style={{
                padding: "0.625rem 0.875rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="0.00"
            />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="rateExpiration"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Rate Expiration Date
            </label>
            <input
              type="date"
              id="rateExpiration"
              name="rateExpiration"
              value={formData.rateExpiration}
              onChange={handleChange}
              style={{
                padding: "0.625rem 0.875rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
            />
            <span style={{ fontSize: "0.813rem", color: "#6b7280", marginTop: "0.375rem" }}>
              When does this interest rate expire?
            </span>
          </div>
        </div>
      </div>

      {/* Optional Information */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            marginBottom: "1.25rem",
            paddingBottom: "0.75rem",
            borderBottom: "2px solid #f3f4f6",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Additional Information
            <span
              style={{
                display: "inline-block",
                padding: "0.125rem 0.5rem",
                background: "#f3f4f6",
                color: "#6b7280",
                fontSize: "0.75rem",
                borderRadius: "4px",
                marginLeft: "0.5rem",
                fontWeight: 500,
              }}
            >
              OPTIONAL
            </span>
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Track rewards and usage patterns
          </p>
        </div>

        <div className="form-grid">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="rewards"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Rewards Balance
            </label>
            <input
              type="number"
              id="rewards"
              name="rewards"
              value={formData.rewards}
              onChange={handleChange}
              step="0.01"
              min="0"
              style={{
                padding: "0.625rem 0.875rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="0.00"
            />
            <span style={{ fontSize: "0.813rem", color: "#6b7280", marginTop: "0.375rem" }}>
              Cash back or points value
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="lastUsed"
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                marginBottom: "0.5rem",
                color: "#374151",
              }}
            >
              Last Used (Month 1-12)
            </label>
            <input
              type="number"
              id="lastUsed"
              name="lastUsed"
              value={formData.lastUsed}
              onChange={handleChange}
              min="1"
              max="12"
              step="1"
              style={{
                padding: "0.625rem 0.875rem",
                border: errors.lastUsed ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.938rem",
                transition: "all 0.2s",
                background: "white",
              }}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.outline = "none";
                (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlurCapture={(e) => {
                if (!errors.lastUsed) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target && !errors.lastUsed) {
                  (e.target as HTMLInputElement).style.borderColor = "#9ca3af";
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target && !errors.lastUsed) {
                  (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                }
              }}
              placeholder="1-12"
            />
            {errors.lastUsed && (
              <span style={{ fontSize: "0.813rem", color: "#dc2626", marginTop: "0.375rem" }}>
                {errors.lastUsed}
              </span>
            )}
            {!errors.lastUsed && (
              <span style={{ fontSize: "0.813rem", color: "#6b7280", marginTop: "0.375rem" }}>
                Track account activity
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            fontSize: "0.938rem",
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            border: "1px solid #d1d5db",
            background: "white",
            color: "#6b7280",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#9ca3af";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            fontSize: "0.938rem",
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            border: "none",
            background: isSubmitting ? "#9ca3af" : "#1a1a1a",
            color: "white",
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#000000";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#1a1a1a";
            }
          }}
        >
          {isSubmitting ? "Saving..." : account ? "Update Account" : "Save Account"}
        </button>
      </div>
      </form>
    </>
  );
}
