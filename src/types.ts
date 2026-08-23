/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * טיפוסי הישויות עברו ל-`src/data/types.ts` (שכבת הנתונים) בשלב 1.
 * הם מיוצאים מחדש מכאן כדי שקומפוננטות קיימות ימשיכו לייבא מאותו מקום.
 */
export type {
  Transaction, Account, Investment, Goal, Budget, Reminder, UserProfile, AppUser,
} from './data/types';

import type {
  Transaction, Account, Investment, Goal, Budget, Reminder,
} from './data/types';

/** הגדרת מסך — UI בלבד, לא נשמר במסד. */
export interface Sheet {
  id: string;
  name: string;
  icon: string;
  type: 'home' | 'income' | 'expenses' | 'dashboard' | 'accounts' | 'investments' | 'playground' | 'budget' | 'settings';
}

/** ה-state הגלובלי של האפליקציה, כפי ש-App.tsx מחזיק אותו. */
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
