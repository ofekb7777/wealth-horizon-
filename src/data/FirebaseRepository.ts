import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType, sanitizeData } from '../lib/firestore-utils';
import { Repository } from './Repository';
import {
  Transaction, Account, Investment, Goal, Budget, Reminder,
  UserProfile, UserData, AppUser,
} from './types';

/**
 * מימוש ה-Repository מול Firestore.
 *
 * **זה הקובץ היחיד בשכבת הנתונים שמייבא `firebase/firestore`.**
 * בשלב 2 הוא יימחק ובמקומו ייכנס `SqliteRepository`.
 *
 * המשתמש הנוכחי נלקח מ-`auth.currentUser` ולא מפרמטר — כך אף קריאה
 * באפליקציה לא צריכה להעביר `uid`, ולכן אף קריאה לא תצטרך להשתנות
 * כשעוברים ל-SQLite (שם אין משתמשים בכלל).
 */
type EntityName = 'transactions' | 'accounts' | 'investments' | 'goals' | 'budgets' | 'reminders';

const ENTITY_NAMES: EntityName[] = [
  'transactions', 'accounts', 'investments', 'goals', 'budgets', 'reminders',
];

export class FirebaseRepository implements Repository {
  isReady(): boolean {
    return !!db && !!auth?.currentUser;
  }

  /** ה-uid של המשתמש המחובר, או null. כל פעולה נעצרת בשקט אם אין. */
  private uid(): string | null {
    if (!db) return null;
    return auth?.currentUser?.uid ?? null;
  }

  private collectionPath(entity: EntityName, userId: string): string {
    return `users/${userId}/${entity}`;
  }

  private docPath(entity: EntityName, userId: string, id: string): string {
    return `${this.collectionPath(entity, userId)}/${id}`;
  }

  // --- פעולות גנריות, משותפות לכל 6 הישויות ---

  private async list<T>(entity: EntityName): Promise<T[]> {
    const userId = this.uid();
    if (!userId) return [];
    const path = this.collectionPath(entity, userId);
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(d => d.data() as T);
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return [];
    }
  }

  /** upsert — יוצר אם לא קיים, דורס אם קיים. בטוח לקריאה כפולה. */
  private async save<T extends { id: string }>(entity: EntityName, item: T): Promise<void> {
    const userId = this.uid();
    if (!userId) return;
    const path = this.docPath(entity, userId, item.id);
    try {
      await setDoc(doc(db, path), sanitizeData(item));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  private async saveMany<T extends { id: string }>(entity: EntityName, items: T[]): Promise<void> {
    const userId = this.uid();
    if (!userId || items.length === 0) return;
    const path = this.collectionPath(entity, userId);
    try {
      // Firestore מגביל ל-500 פעולות ל-batch. מפצלים כדי שייבוא גדול לא ייכשל.
      for (let i = 0; i < items.length; i += 400) {
        const batch = writeBatch(db);
        for (const item of items.slice(i, i + 400)) {
          batch.set(doc(db, this.docPath(entity, userId, item.id)), sanitizeData(item));
        }
        await batch.commit();
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  private async remove(entity: EntityName, id: string): Promise<void> {
    const userId = this.uid();
    if (!userId) return;
    const path = this.docPath(entity, userId, id);
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }

  // --- משתמש ופרופיל ---

  async syncUser(user: AppUser): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'users', user.uid), sanitizeData({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      }), { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
  }

  async fetchUserData(): Promise<UserData | null> {
    const userId = this.uid();
    if (!userId) return null;
    const userPath = `users/${userId}`;
    try {
      const [userDoc, ...entityDocs] = await Promise.all([
        getDoc(doc(db, userPath)),
        ...ENTITY_NAMES.map(name => getDocs(collection(db, this.collectionPath(name, userId)))),
      ]);

      const data = userDoc.data() || {};
      const [transactions, accounts, investments, goals, budgets, reminders] =
        entityDocs.map(snap => snap.docs.map(d => d.data()));

      return {
        profile: {
          activeSheetId: data.activeSheetId || '0',
          notes: data.notes || '',
          patchNotes: data.patchNotes || '',
          theme: data.theme,
          bgEffect: data.bgEffect,
          monoStyle: data.monoStyle,
        },
        transactions: transactions as Transaction[],
        accounts: accounts as Account[],
        investments: investments as Investment[],
        goals: goals as Goal[],
        budgets: budgets as Budget[],
        reminders: reminders as Reminder[],
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, userPath);
      return null;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const userId = this.uid();
    if (!userId) return null;
    const path = `users/${userId}`;
    try {
      const snap = await getDoc(doc(db, path));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        activeSheetId: data.activeSheetId,
        notes: data.notes,
        patchNotes: data.patchNotes,
        theme: data.theme,
        bgEffect: data.bgEffect,
        monoStyle: data.monoStyle,
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const userId = this.uid();
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      // merge:true + sanitizeData מסיר undefined — שדות שלא נשלחו לא נדרסים.
      await setDoc(doc(db, path), sanitizeData(profile), { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }

  // --- תנועות ---
  getTransactions() { return this.list<Transaction>('transactions'); }
  addTransaction(t: Transaction) { return this.save('transactions', t); }
  updateTransaction(t: Transaction) { return this.save('transactions', t); }
  deleteTransaction(id: string) { return this.remove('transactions', id); }

  // --- חשבונות ---
  getAccounts() { return this.list<Account>('accounts'); }
  addAccount(a: Account) { return this.save('accounts', a); }
  updateAccount(a: Account) { return this.save('accounts', a); }
  deleteAccount(id: string) { return this.remove('accounts', id); }

  // --- השקעות ---
  getInvestments() { return this.list<Investment>('investments'); }
  addInvestment(i: Investment) { return this.save('investments', i); }
  updateInvestment(i: Investment) { return this.save('investments', i); }
  deleteInvestment(id: string) { return this.remove('investments', id); }

  // --- יעדים ---
  getGoals() { return this.list<Goal>('goals'); }
  addGoal(g: Goal) { return this.save('goals', g); }
  updateGoal(g: Goal) { return this.save('goals', g); }
  deleteGoal(id: string) { return this.remove('goals', id); }

  // --- תקציבים ---
  getBudgets() { return this.list<Budget>('budgets'); }
  addBudget(b: Budget) { return this.save('budgets', b); }
  updateBudget(b: Budget) { return this.save('budgets', b); }
  deleteBudget(id: string) { return this.remove('budgets', id); }

  // --- תזכורות ---
  getReminders() { return this.list<Reminder>('reminders'); }
  addReminder(r: Reminder) { return this.save('reminders', r); }
  updateReminder(r: Reminder) { return this.save('reminders', r); }
  deleteReminder(id: string) { return this.remove('reminders', id); }

  // --- פעולות מרובות ---
  saveTransactions(items: Transaction[]) { return this.saveMany('transactions', items); }
  saveAccounts(items: Account[]) { return this.saveMany('accounts', items); }
  saveInvestments(items: Investment[]) { return this.saveMany('investments', items); }
  saveGoals(items: Goal[]) { return this.saveMany('goals', items); }
  saveBudgets(items: Budget[]) { return this.saveMany('budgets', items); }

  async clearAllData(): Promise<void> {
    const userId = this.uid();
    if (!userId) return;
    const entities: EntityName[] = ['transactions', 'accounts', 'investments', 'goals', 'budgets'];
    for (const entity of entities) {
      const path = this.collectionPath(entity, userId);
      try {
        const snapshot = await getDocs(collection(db, path));
        for (let i = 0; i < snapshot.docs.length; i += 400) {
          const batch = writeBatch(db);
          for (const d of snapshot.docs.slice(i, i + 400)) batch.delete(d.ref);
          await batch.commit();
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, path);
      }
    }
  }
}
