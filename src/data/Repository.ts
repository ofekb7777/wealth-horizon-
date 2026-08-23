import {
  Transaction, Account, Investment, Goal, Budget, Reminder,
  UserProfile, UserData,
} from './types';

/**
 * ה-Repository — החוזה של שכבת הנתונים.
 *
 * "interface" = רשימת פונקציות שכל מימוש חייב לספק. הקוד באפליקציה מדבר
 * רק מול החוזה הזה, ולא יודע מי מממש אותו בפועל.
 *
 * כרגע יש מימוש אחד (`FirebaseRepository`). בשלב 2 ייכנס `SqliteRepository`
 * שמממש בדיוק את אותו חוזה — ואז ההחלפה היא שורה אחת ב-`src/data/index.ts`.
 *
 * שני כללים שמחייבים כל מימוש:
 *
 * 1. **אין `userId` באף חתימה.** המימוש יודע לבד מי המשתמש הנוכחי.
 *    ב-SQLite אין בכלל משתמשים, ולכן פרמטר כזה היה הופך את ההחלפה למסובכת.
 *
 * 2. **כתיבה היא תמיד upsert** — "צור אם לא קיים, עדכן אם קיים".
 *    `addX` ו-`updateX` הן אותה פעולה, ושתיהן בטוחות לקריאה כפולה עם
 *    אותו מזהה. זה מה שמגן עלינו מהכתיבות הכפולות של React StrictMode
 *    (מלכודת #2 ב-CLAUDE.md).
 */
export interface Repository {
  /** האם המסד פתוח ומוכן לשימוש. */
  isReady(): boolean;

  // --- פרופיל ---

  /** טוען את כל נתוני המשתמש בקריאה אחת. `null` אם אין נתונים. */
  fetchUserData(): Promise<UserData | null>;

  getUserProfile(): Promise<UserProfile | null>;

  /** עדכון חלקי — שדות שלא נשלחו נשארים כפי שהם. */
  saveUserProfile(profile: UserProfile): Promise<void>;

  // --- תנועות ---
  getTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: Transaction): Promise<void>;
  updateTransaction(transaction: Transaction): Promise<void>;
  deleteTransaction(id: string): Promise<void>;

  // --- חשבונות ---
  getAccounts(): Promise<Account[]>;
  addAccount(account: Account): Promise<void>;
  updateAccount(account: Account): Promise<void>;
  deleteAccount(id: string): Promise<void>;

  // --- השקעות ---
  getInvestments(): Promise<Investment[]>;
  addInvestment(investment: Investment): Promise<void>;
  updateInvestment(investment: Investment): Promise<void>;
  deleteInvestment(id: string): Promise<void>;

  // --- יעדים ---
  getGoals(): Promise<Goal[]>;
  addGoal(goal: Goal): Promise<void>;
  updateGoal(goal: Goal): Promise<void>;
  deleteGoal(id: string): Promise<void>;

  // --- תקציבים ---
  getBudgets(): Promise<Budget[]>;
  addBudget(budget: Budget): Promise<void>;
  updateBudget(budget: Budget): Promise<void>;
  deleteBudget(id: string): Promise<void>;

  // --- תזכורות ---
  getReminders(): Promise<Reminder[]>;
  addReminder(reminder: Reminder): Promise<void>;
  updateReminder(reminder: Reminder): Promise<void>;
  deleteReminder(id: string): Promise<void>;

  // --- פעולות מרובות ---

  /** שמירת רשימה שלמה בבת אחת (ייבוא Excel, ייבוא JSON). */
  saveTransactions(transactions: Transaction[]): Promise<void>;
  saveAccounts(accounts: Account[]): Promise<void>;
  saveInvestments(investments: Investment[]): Promise<void>;
  saveGoals(goals: Goal[]): Promise<void>;
  saveBudgets(budgets: Budget[]): Promise<void>;

  /** מוחק את כל נתוני המשתמש — 5 הישויות. הפרופיל לא נמחק. */
  clearAllData(): Promise<void>;
}
