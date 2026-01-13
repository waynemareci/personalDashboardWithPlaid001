export interface Account {
  _id?: string;
  id: string;
  accountName: string;
  accountNumber?: string;
  creditLimit: number;
  amountOwed?: number;
  minimumMonthlyPayment?: number;
  interestRate?: number;
  rateExpiration?: string;
  paymentDueDate?: number;
  rewards?: number;
  lastUsed?: number;
  statementCycleDay?: number;
  paymentPreference?: 'full' | 'minimum';
  position: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  plaidAccessToken?: string;
  plaidAccountId?: string;
  plaidItemId?: string;
  nextPaymentDueDate?: string;
  lastStatementBalance?: number;
}

export interface SummaryTotals {
  creditLimit: number;
  amountOwed: number;
  amountAvailable: number;
  minimumMonthlyPayment: number;
}