import { SpreadsheetState, Currency, CURRENCIES } from '../types';

/**
 * ה-snapshot של הווידג'ט.
 *
 * הווידג'ט של אנדרואיד רץ בתהליך נפרד מהאפליקציה ואין לו גישה ל-SQLite.
 * במקום לפתוח משם מסד נתונים — איטי ומסובך — האפליקציה כותבת אחרי כל
 * שינוי אובייקט זעיר ל-SharedPreferences, והווידג'ט רק קורא אותו.
 *
 * לכן: **שומרים כאן רק מה שמוצג בפועל.** לא כל ה-state.
 */
export interface WidgetSnapshot {
  /** שווי נקי: מזומן בחשבונות + שווי ההשקעות. */
  balance: number;
  /** סך ההוצאות מתחילת החודש הנוכחי (מספר חיובי). */
  monthlySpend: number;
  /** סכום כל תקרות התקציב. 0 = לא הוגדרו תקציבים. */
  monthlyBudget: number;
  /** סימן המטבע להצגה, למשל ‎₪‎. */
  currencySymbol: string;
  /** חותמת זמן ISO — הווידג'ט גוזר ממנה "עודכן לפני X". */
  lastUpdated: string;
  /** שלוש התנועות האחרונות בלבד. */
  recentTransactions: {
    description: string;
    amount: number;
    date: string;
  }[];
}

/** תחילת החודש הנוכחי, בחצות מקומית. */
function startOfMonth(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * בונה את ה-snapshot מתוך ה-state. פונקציה טהורה — קלה לבדיקה,
 * ואפשר לקרוא לה בבטחה מכל מקום.
 *
 * הסכומים מומרים למטבע התצוגה, כדי שהווידג'ט לא יצטרך לדעת על שערים.
 */
export function buildSnapshot(state: SpreadsheetState, currency: Currency): WidgetSnapshot {
  const rate = CURRENCIES[currency].rate;
  const symbol = CURRENCIES[currency].symbol;

  const cash = (state.accounts || []).reduce((sum, a) => sum + a.balance, 0);
  const investments = (state.investments || [])
    .reduce((sum, i) => sum + i.shares * i.currentPrice, 0);

  const monthStart = startOfMonth();
  const transactions = state.transactions || [];

  // הוצאה מזוהה לפי type, ובהיעדרו לפי סכום שלילי — כמו בשאר האפליקציה.
  const isExpense = (t: { type?: string; amount: number }) =>
    t.type ? t.type === 'expense' : t.amount < 0;

  const monthlySpend = transactions
    .filter(t => isExpense(t) && new Date(t.date) >= monthStart)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyBudget = (state.budgets || []).reduce((sum, b) => sum + b.limit, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(t => ({
      description: t.description || '—',
      amount: t.amount * rate,
      date: t.date,
    }));

  return {
    balance: (cash + investments) * rate,
    monthlySpend: monthlySpend * rate,
    monthlyBudget: monthlyBudget * rate,
    currencySymbol: symbol,
    lastUpdated: new Date().toISOString(),
    recentTransactions,
  };
}
