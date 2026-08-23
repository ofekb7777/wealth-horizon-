/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type?: 'income' | 'expense';
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'Bank' | 'Investment' | 'Pension' | 'Cash';
  balance: number;
}

export interface Investment {
  id: string;
  ticker: string;
  name?: string;
  exchange?: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface Sheet {
  id: string;
  name: string;
  icon: string;
  type: 'home' | 'income' | 'expenses' | 'dashboard' | 'accounts' | 'investments' | 'playground' | 'budget' | 'settings';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface Reminder {
  id: string;
  subject: string;
  body: string;
  scheduledTime: string; // ISO string
  sent: boolean;
  recurrence?: 'monthly';
  dayOfMonth?: number;
}

export interface SpreadsheetState {
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  goals: Goal[];
  budgets: Budget[];
  reminders?: Reminder[];
  activeSheetId: string;
  notes: string;
  patchNotes: string;
  lastSynced?: string;
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Dividends',
  'Yield',
  'Interests',
  'Business',
  'Asset Sale',
  'Other Income'
];

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Transport',
  'Food',
  'Subscriptions',
  'Entertainment',
  'Health',
  'Shopping',
  'Investment Purchase',
  'Taxes',
  'Other Expense'
];

export const ACCOUNT_TYPES = ['Bank', 'Investment', 'Pension', 'Cash'] as const;

export type Currency = 'USD' | 'EUR' | 'GBP' | 'ILS';

export const CURRENCIES: { [key in Currency]: { symbol: string, rate: number } } = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.93 },
  GBP: { symbol: '£', rate: 0.8 },
  ILS: { symbol: '₪', rate: 3.7 },
};
