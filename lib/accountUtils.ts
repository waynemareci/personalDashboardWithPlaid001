import { Account } from '@/app/types';

export interface UpcomingPayment {
  accountId: string;
  accountName: string;
  amount: number;
  dueDate: Date;
  dayOfWeek: string;
  formattedDate: string;
}

/**
 * Calculate the next payment due date for an account based on statement cycle day
 * Only returns dates within the next 30 days
 */
export function calculateNextPaymentDate(
  statementCycleDay: number | undefined,
  currentDate: Date = new Date()
): Date | null {
  if (!statementCycleDay || statementCycleDay < 1 || statementCycleDay > 31) {
    return null;
  }

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  // Try current month first
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), statementCycleDay);

  // If the day doesn't exist in current month (e.g., Feb 31), use last day of month
  if (currentMonth.getDate() !== statementCycleDay) {
    currentMonth.setDate(0); // Sets to last day of previous month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  if (currentMonth >= today) {
    const daysUntilDue = Math.floor((currentMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 30) {
      return currentMonth;
    }
  }

  // Try next month
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, statementCycleDay);

  // Handle months with fewer days
  if (nextMonth.getDate() !== statementCycleDay) {
    nextMonth.setDate(0);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
  }

  const daysUntilDue = Math.floor((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDue <= 30) {
    return nextMonth;
  }

  return null;
}

/**
 * Format a date to "Day, Mon DD" format (e.g., "Mon, Dec 15")
 */
export function formatPaymentDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dayOfWeek = days[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();

  return `${dayOfWeek}, ${month} ${day}`;
}

/**
 * Get upcoming payments for all accounts within next 30 days
 */
export function getUpcomingPayments(accounts: Account[]): UpcomingPayment[] {
  const payments: UpcomingPayment[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const account of accounts) {
    let dueDate: Date | null = null;

    // Prioritize Plaid's next_payment_due_date
    if (account.nextPaymentDueDate) {
      dueDate = new Date(account.nextPaymentDueDate);
    } else {
      // Fallback to calculated date from statement cycle
      dueDate = calculateNextPaymentDate(account.statementCycleDay);
    }

    // Only include if has minimum payment and is within next 30 days
    if (dueDate && dueDate >= today && dueDate <= thirtyDaysFromNow && account.minimumMonthlyPayment && account.minimumMonthlyPayment > 0) {
      payments.push({
        accountId: account.id,
        accountName: account.accountName,
        amount: account.minimumMonthlyPayment,
        dueDate,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dueDate.getDay()],
        formattedDate: formatPaymentDate(dueDate),
      });
    }
  }

  // Sort by due date
  payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return payments;
}

/**
 * Calculate total utilization percentage
 */
export function calculateTotalUtilization(accounts: Account[]): number {
  const totalLimit = accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
  const totalOwed = accounts.reduce((sum, acc) => sum + (acc.amountOwed || 0), 0);

  if (totalLimit === 0) return 0;
  return Math.round((totalOwed / totalLimit) * 100);
}

/**
 * Calculate utilization for a single account
 */
export function calculateUtilization(account: Account): number {
  if (!account.creditLimit || account.creditLimit === 0) return 0;
  const owed = account.amountOwed || 0;
  return Math.round((owed / account.creditLimit) * 100);
}

/**
 * Get utilization category for styling
 */
export function getUtilizationCategory(utilization: number): 'low' | 'medium' | 'high' {
  if (utilization < 30) return 'low';
  if (utilization < 70) return 'medium';
  return 'high';
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format month number (1-12) to month name
 */
export function formatMonth(monthNumber: number | undefined): string {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthNumber - 1]} (${monthNumber})`;
}

/**
 * Check if rate is expiring soon (within 60 days)
 */
export function isRateExpiringSoon(rateExpiration: string | undefined): boolean {
  if (!rateExpiration) return false;

  const expiryDate = new Date(rateExpiration);
  const today = new Date();
  const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return daysUntilExpiry >= 0 && daysUntilExpiry <= 60;
}

/**
 * Calculate available credit
 */
export function calculateAvailableCredit(account: Account): number {
  return (account.creditLimit || 0) - (account.amountOwed || 0);
}
