/**
 * טיפוסי שכבת הנתונים.
 *
 * המקור: firebase-blueprint.json. הישויות כאן חייבות לשרוד את המעבר ל-SQLite
 * בשלב 2 — אל תשנה אותן בלי לעדכן גם את הסכימה.
 *
 * `src/types.ts` מייצא מחדש את כל מה שכאן, כדי שהקומפוננטות הקיימות
 * ימשיכו לייבא מאותו מקום כמו קודם.
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

/** לא ב-blueprint, אבל קיים בקוד ובשימוש. צריך טבלה משלו ב-SQLite. */
export interface Reminder {
  id: string;
  subject: string;
  body: string;
  scheduledTime: string; // ISO string
  sent: boolean;
  recurrence?: 'monthly';
  dayOfMonth?: number;
}

/**
 * פרופיל המשתמש — העדפות ומצב UI. נשמר כמסמך יחיד.
 * כל השדות אופציונליים: שמירה היא תמיד עדכון חלקי (merge), לא דריסה.
 */
export interface UserProfile {
  activeSheetId?: string;
  notes?: string;
  patchNotes?: string;
}

/** כל הנתונים בקריאה אחת — מה ש-App.tsx טוען בעלייה. */
export interface UserData {
  profile: UserProfile;
  transactions: Transaction[];
  accounts: Account[];
  investments: Investment[];
  goals: Goal[];
  budgets: Budget[];
  reminders: Reminder[];
}
