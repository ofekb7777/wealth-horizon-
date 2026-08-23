import {
  CapacitorSQLite, SQLiteConnection, SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Repository } from './Repository';
import { LATEST_VERSION, pendingMigrations } from './migrations';
import {
  Transaction, Account, Investment, Goal, Budget, Reminder,
  UserProfile, UserData,
} from './types';

const DB_NAME = 'wealth_horizon';

/**
 * מימוש ה-Repository מול SQLite מקומי.
 *
 * הכל על המכשיר. אין רשת, אין חשבון, אין הרשאות.
 *
 * שני הבדלים בין אנדרואיד לדפדפן שמטופלים כאן ולא בשאר האפליקציה:
 *  1. בדפדפן צריך לאתחל את רכיב ה-web של התוסף (`jeep-sqlite`) לפני הכל.
 *  2. בדפדפן המסד חי בזיכרון, ושמירה קבועה דורשת `saveToStore` מפורש
 *     אחרי כל כתיבה. באנדרואיד זה קובץ אמיתי והקריאה מיותרת.
 */
export class SqliteRepository implements Repository {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isWeb = Capacitor.getPlatform() === 'web';
  private opening: Promise<void> | null = null;

  // --- פתיחה ואתחול ---

  /**
   * פותח את המסד ומריץ מיגרציות. בטוח לקריאה חוזרת — הקריאה השנייה
   * מחכה לאותה פתיחה ולא פותחת מסד שני.
   */
  async open(): Promise<void> {
    if (this.db) return;
    if (this.opening) return this.opening;
    this.opening = this.doOpen();
    try {
      await this.opening;
    } finally {
      this.opening = null;
    }
  }

  private async doOpen(): Promise<void> {
    if (this.isWeb) {
      await this.initWebStore();
    }

    // consistency=false: לא בודקים מול רשימת חיבורים קיימת, כי רענון דף
    // בדפדפן משאיר חיבור "תקוע" מהטעינה הקודמת.
    const existing = (await this.sqlite.isConnection(DB_NAME, false)).result;
    this.db = existing
      ? await this.sqlite.retrieveConnection(DB_NAME, false)
      : await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', LATEST_VERSION, false);

    await this.db.open();
    await this.migrate();
  }

  /** טוען את רכיב ה-web של התוסף ומחבר אותו ל-IndexedDB. */
  private async initWebStore(): Promise<void> {
    const { defineCustomElements } = await import('jeep-sqlite/loader');
    defineCustomElements(window);

    if (!document.querySelector('jeep-sqlite')) {
      const el = document.createElement('jeep-sqlite');
      document.body.appendChild(el);
    }
    await customElements.whenDefined('jeep-sqlite');
    await this.sqlite.initWebStore();
  }

  /** מריץ את המיגרציות שעוד לא רצו, לפי `PRAGMA user_version`. */
  private async migrate(): Promise<void> {
    if (!this.db) return;
    const res = await this.db.query('PRAGMA user_version;');
    const current = (res.values?.[0] as any)?.user_version ?? 0;

    for (const migration of pendingMigrations(current)) {
      console.info(`[db] migrating to v${migration.version}: ${migration.description}`);
      await this.db.execute(migration.sql);
      await this.db.execute(`PRAGMA user_version = ${migration.version};`);
    }
    await this.persist();
  }

  /** בדפדפן — מוריד את המסד מהזיכרון ל-IndexedDB. באנדרואיד — no-op. */
  private async persist(): Promise<void> {
    if (this.isWeb && this.db) {
      await this.sqlite.saveToStore(DB_NAME);
    }
  }

  isReady(): boolean {
    return this.db !== null;
  }

  private require(): SQLiteDBConnection {
    if (!this.db) {
      throw new Error('SQLite database is not open. Call open() during app startup.');
    }
    return this.db;
  }

  // --- עזרי SQL גנריים ---

  private async select<T>(sql: string, values: any[] = []): Promise<T[]> {
    const res = await this.require().query(sql, values);
    return (res.values ?? []) as T[];
  }

  private async write(sql: string, values: any[] = []): Promise<void> {
    await this.require().run(sql, values, false);
    await this.persist();
  }

  /**
   * upsert של רשומה אחת. `INSERT OR REPLACE` נותן בדיוק את הסמנטיקה
   * שה-Repository מבטיח: צור אם לא קיים, דרוס אם קיים, ובטוח לקריאה כפולה.
   */
  private upsertSql(table: string, columns: string[]): string {
    const cols = columns.map(c => `"${c}"`).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    return `INSERT OR REPLACE INTO ${table} (${cols}) VALUES (${placeholders});`;
  }

  private async upsert(table: string, columns: string[], row: any): Promise<void> {
    await this.write(this.upsertSql(table, columns), columns.map(c => row[c] ?? null));
  }

  /** upsert של רשימה שלמה בטרנזקציה אחת — ייבוא של אלפי שורות בפעולה אחת. */
  private async upsertMany(table: string, columns: string[], rows: any[]): Promise<void> {
    if (rows.length === 0) return;
    const statements = rows.map(row => ({
      statement: this.upsertSql(table, columns),
      values: columns.map(c => row[c] ?? null),
    }));
    await this.require().executeSet(statements, false);
    await this.persist();
  }

  private async removeById(table: string, id: string): Promise<void> {
    await this.write(`DELETE FROM ${table} WHERE id = ?;`, [id]);
  }

  // --- מיפוי שדות ---

  private static readonly TRANSACTION_COLS = ['id', 'date', 'description', 'category', 'amount', 'type', 'accountId'];
  private static readonly ACCOUNT_COLS = ['id', 'name', 'type', 'balance'];
  private static readonly INVESTMENT_COLS = ['id', 'ticker', 'name', 'exchange', 'shares', 'avgPrice', 'currentPrice'];
  private static readonly GOAL_COLS = ['id', 'name', 'targetAmount', 'currentAmount', 'deadline', 'category'];
  private static readonly BUDGET_COLS = ['id', 'category', 'limit'];
  private static readonly REMINDER_COLS = ['id', 'subject', 'body', 'scheduledTime', 'sent', 'recurrence', 'dayOfMonth'];

  /** SQLite לא מכיר boolean — ממירים לפני כתיבה ואחרי קריאה. */
  private static reminderToRow(r: Reminder): any {
    return { ...r, sent: r.sent ? 1 : 0 };
  }

  private static rowToReminder(row: any): Reminder {
    return { ...row, sent: !!row.sent } as Reminder;
  }

  // --- פרופיל ונתונים ---

  async fetchUserData(): Promise<UserData> {
    const [profile, transactions, accounts, investments, goals, budgets, reminders] = await Promise.all([
      this.getUserProfile(),
      this.getTransactions(),
      this.getAccounts(),
      this.getInvestments(),
      this.getGoals(),
      this.getBudgets(),
      this.getReminders(),
    ]);
    return {
      profile: profile ?? {},
      transactions, accounts, investments, goals, budgets, reminders,
    };
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const rows = await this.select<any>('SELECT * FROM user_profile WHERE id = 1;');
    if (rows.length === 0) return null;
    const { id, ...profile } = rows[0];
    // עמודות ריקות חוזרות כ-null; החוזה מבטיח undefined לשדה שלא נקבע.
    return Object.fromEntries(
      Object.entries(profile).filter(([, v]) => v !== null),
    ) as UserProfile;
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const entries = Object.entries(profile).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return;
    // עדכון חלקי: רק העמודות שנשלחו נכתבות, השאר לא נדרסות.
    const assignments = entries.map(([k]) => `"${k}" = ?`).join(', ');
    await this.write(
      `UPDATE user_profile SET ${assignments} WHERE id = 1;`,
      entries.map(([, v]) => v),
    );
  }

  // --- תנועות ---
  getTransactions() {
    return this.select<Transaction>('SELECT * FROM transactions ORDER BY date DESC;');
  }
  addTransaction(t: Transaction) { return this.upsert('transactions', SqliteRepository.TRANSACTION_COLS, t); }
  updateTransaction(t: Transaction) { return this.addTransaction(t); }
  deleteTransaction(id: string) { return this.removeById('transactions', id); }
  saveTransactions(items: Transaction[]) { return this.upsertMany('transactions', SqliteRepository.TRANSACTION_COLS, items); }

  // --- חשבונות ---
  getAccounts() { return this.select<Account>('SELECT * FROM accounts;'); }
  addAccount(a: Account) { return this.upsert('accounts', SqliteRepository.ACCOUNT_COLS, a); }
  updateAccount(a: Account) { return this.addAccount(a); }
  deleteAccount(id: string) { return this.removeById('accounts', id); }
  saveAccounts(items: Account[]) { return this.upsertMany('accounts', SqliteRepository.ACCOUNT_COLS, items); }

  // --- השקעות ---
  getInvestments() { return this.select<Investment>('SELECT * FROM investments;'); }
  addInvestment(i: Investment) { return this.upsert('investments', SqliteRepository.INVESTMENT_COLS, i); }
  updateInvestment(i: Investment) { return this.addInvestment(i); }
  deleteInvestment(id: string) { return this.removeById('investments', id); }
  saveInvestments(items: Investment[]) { return this.upsertMany('investments', SqliteRepository.INVESTMENT_COLS, items); }

  // --- יעדים ---
  getGoals() { return this.select<Goal>('SELECT * FROM goals;'); }
  addGoal(g: Goal) { return this.upsert('goals', SqliteRepository.GOAL_COLS, g); }
  updateGoal(g: Goal) { return this.addGoal(g); }
  deleteGoal(id: string) { return this.removeById('goals', id); }
  saveGoals(items: Goal[]) { return this.upsertMany('goals', SqliteRepository.GOAL_COLS, items); }

  // --- תקציבים ---
  getBudgets() { return this.select<Budget>('SELECT * FROM budgets;'); }
  addBudget(b: Budget) { return this.upsert('budgets', SqliteRepository.BUDGET_COLS, b); }
  updateBudget(b: Budget) { return this.addBudget(b); }
  deleteBudget(id: string) { return this.removeById('budgets', id); }
  saveBudgets(items: Budget[]) { return this.upsertMany('budgets', SqliteRepository.BUDGET_COLS, items); }

  // --- תזכורות ---
  async getReminders(): Promise<Reminder[]> {
    const rows = await this.select<any>('SELECT * FROM reminders;');
    return rows.map(SqliteRepository.rowToReminder);
  }
  addReminder(r: Reminder) {
    return this.upsert('reminders', SqliteRepository.REMINDER_COLS, SqliteRepository.reminderToRow(r));
  }
  updateReminder(r: Reminder) { return this.addReminder(r); }
  deleteReminder(id: string) { return this.removeById('reminders', id); }

  // --- מחיקה מלאה ---

  async clearAllData(): Promise<void> {
    const db = this.require();
    // הפרופיל שורד בכוונה — ערכת נושא והעדפות הן לא "נתונים פיננסיים".
    await db.execute(`
      DELETE FROM transactions;
      DELETE FROM accounts;
      DELETE FROM investments;
      DELETE FROM goals;
      DELETE FROM budgets;
    `);
    await this.persist();
  }

  /** מוחק גם תזכורות ומאפס את הפרופיל. משמש את כפתור "מחק הכל" בהגדרות. */
  async wipeEverything(): Promise<void> {
    const db = this.require();
    await db.execute(`
      DELETE FROM transactions;
      DELETE FROM accounts;
      DELETE FROM investments;
      DELETE FROM goals;
      DELETE FROM budgets;
      DELETE FROM reminders;
      UPDATE user_profile
         SET activeSheetId = NULL, notes = NULL, patchNotes = NULL
       WHERE id = 1;
    `);
    await this.persist();
  }
}
