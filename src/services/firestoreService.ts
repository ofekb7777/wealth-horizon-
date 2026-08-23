import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Transaction, Account, Investment, Goal, Budget, SpreadsheetState, Reminder } from '../types';
import { handleFirestoreError, OperationType, sanitizeData } from '../lib/firestore-utils';

export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore Client is offline. Please check your network or configuration.");
    }
    throw error;
  }
}

const getPaths = (userId: string) => ({
  user: `users/${userId}`,
  transactions: `users/${userId}/transactions`,
  accounts: `users/${userId}/accounts`,
  investments: `users/${userId}/investments`,
  goals: `users/${userId}/goals`,
  budgets: `users/${userId}/budgets`,
  reminders: `users/${userId}/reminders`,
});

export const firestoreService = {
  async syncUser(user: any) {
    if (!db) return;
    try {
      await setDoc(doc(db, 'users', user.uid), sanitizeData({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      }), { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
  },

  async saveUserProfile(userId: string, data: Partial<SpreadsheetState>) {
    if (!db) return;
    const path = getPaths(userId).user;
    try {
      await setDoc(doc(db, path), sanitizeData({
        activeSheetId: data.activeSheetId,
        notes: data.notes,
        patchNotes: data.patchNotes,
      }), { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async fetchUserData(userId: string) {
    if (!db) return null;
    const paths = getPaths(userId);
    try {
      const [userDoc, transDocs, accDocs, invDocs, goalDocs, budgetDocs, reminderDocs] = await Promise.all([
        getDoc(doc(db, paths.user)),
        getDocs(collection(db, paths.transactions)),
        getDocs(collection(db, paths.accounts)),
        getDocs(collection(db, paths.investments)),
        getDocs(collection(db, paths.goals)),
        getDocs(collection(db, paths.budgets)),
        getDocs(collection(db, paths.reminders)),
      ]);

      const userData = userDoc.data() || {};
      
      return {
        activeSheetId: userData.activeSheetId || '0',
        notes: userData.notes || '',
        patchNotes: userData.patchNotes || '',
        transactions: transDocs.docs.map(d => d.data() as Transaction),
        accounts: accDocs.docs.map(d => d.data() as Account),
        investments: invDocs.docs.map(d => d.data() as Investment),
        goals: goalDocs.docs.map(d => d.data() as Goal),
        budgets: budgetDocs.docs.map(d => d.data() as Budget),
        reminders: reminderDocs.docs.map(d => d.data() as Reminder),
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, paths.user);
      return null;
    }
  },

  async updateTransaction(userId: string, transaction: Transaction) {
    if (!db) return;
    const path = `${getPaths(userId).transactions}/${transaction.id}`;
    try {
      await setDoc(doc(db, path), sanitizeData(transaction));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteTransaction(userId: string, transactionId: string) {
    if (!db) return;
    const path = `${getPaths(userId).transactions}/${transactionId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },
  
  async updateAccount(userId: string, account: Account) {
    if (!db) return;
    const path = `${getPaths(userId).accounts}/${account.id}`;
    try {
      await setDoc(doc(db, path), sanitizeData(account));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteAccount(userId: string, accountId: string) {
    if (!db) return;
    const path = `${getPaths(userId).accounts}/${accountId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async updateInvestment(userId: string, investment: Investment) {
    if (!db) return;
    const path = `${getPaths(userId).investments}/${investment.id}`;
    try {
      await setDoc(doc(db, path), sanitizeData(investment));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteInvestment(userId: string, investmentId: string) {
    if (!db) return;
    const path = `${getPaths(userId).investments}/${investmentId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async updateGoal(userId: string, goal: Goal) {
    if (!db) return;
    const path = `${getPaths(userId).goals}/${goal.id}`;
    try {
      await setDoc(doc(db, path), sanitizeData(goal));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteGoal(userId: string, goalId: string) {
    if (!db) return;
    const path = `${getPaths(userId).goals}/${goalId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async updateBudget(userId: string, budget: Budget) {
    if (!db) return;
    const path = `${getPaths(userId).budgets}/${budget.id}`;
    try {
      await setDoc(doc(db, path), sanitizeData(budget));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteBudget(userId: string, budgetId: string) {
    if (!db) return;
    const path = `${getPaths(userId).budgets}/${budgetId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async updateReminder(userId: string, reminder: Reminder) {
    if (!db) return;
    const path = `${getPaths(userId).reminders}/${reminder.id}`;
    try {
      await setDoc(doc(db, path), sanitizeData(reminder));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deleteReminder(userId: string, reminderId: string) {
    if (!db) return;
    const path = `${getPaths(userId).reminders}/${reminderId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async getGlobalSystemUpdate() {
    if (!db) return null;
    const path = 'system_updates/current';
    try {
      const docSnap = await getDoc(doc(db, path));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { message: data.message, version: data.version || 1 };
      }
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return null;
    }
  },

  async saveGlobalSystemUpdate(message: string, version: number) {
    if (!db) return;
    const path = 'system_updates/current';
    try {
      await setDoc(doc(db, path), sanitizeData({ 
        message, 
        version,
        updatedAt: new Date().toISOString() 
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  subscribeToGlobalUpdate(callback: (update: {message: string, version: number} | null) => void) {
    if (!db) return () => {};
    const path = 'system_updates/current';
    return onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({ message: data.message, version: data.version || 1 });
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async saveGlobalAlert(message: string) {
    if (!db) return;
    const path = 'system_alerts/current';
    try {
      const alertId = Date.now().toString();
      await setDoc(doc(db, path), sanitizeData({ 
        message, 
        id: alertId,
        timestamp: new Date().toISOString() 
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  subscribeToGlobalAlert(callback: (alert: {message: string, id: string} | null) => void) {
    if (!db) return () => {};
    const path = 'system_alerts/current';
    return onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({ message: data.message, id: data.id });
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async fetchAllUsersData() {
    if (!db) return [];
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = await Promise.all(usersSnap.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const paths = getPaths(userId);
        
        // Fetch subcollections to get a summary
        const [accDocs, invDocs, transDocs] = await Promise.all([
          getDocs(collection(db, paths.accounts)),
          getDocs(collection(db, paths.investments)),
          getDocs(collection(db, paths.transactions))
        ]);

        const accounts = accDocs.docs.map(d => d.data() as Account);
        const investments = invDocs.docs.map(d => d.data() as Investment);
        
        const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);
        const totalInvested = investments.reduce((sum, i) => sum + (i.shares * i.currentPrice), 0);
        
        return {
          id: userId,
          email: userDoc.data().email || 'Unknown',
          displayName: userDoc.data().displayName || 'Anonymous',
          photoURL: userDoc.data().photoURL || '',
          netWorth: totalCash + totalInvested,
          accountCount: accounts.length,
          investmentCount: investments.length,
          transactionCount: transDocs.docs.length,
          lastActive: userDoc.data().updatedAt || 'Unknown',
          lastLogin: userDoc.data().lastLogin || null
        };
      }));
      return usersData;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'users');
      return [];
    }
  },

  async seedEdgeCases(userId: string) {
    if (!db) return;
    const paths = getPaths(userId);
    try {
      const batch = writeBatch(db);
      
      const newAccRef = doc(collection(db, paths.accounts));
      batch.set(newAccRef, sanitizeData({
        id: newAccRef.id,
        name: 'Vortex Void Edge (0 Balance)',
        type: 'Cash',
        balance: 0,
        createdAt: new Date().toISOString()
      }));

      const extremeAccRef = doc(collection(db, paths.accounts));
      batch.set(extremeAccRef, sanitizeData({
        id: extremeAccRef.id,
        name: 'Quantum Hyper-Ledger Node with an excessively long name that might break UI bounds and create wrap issues in flex containers',
        type: 'Investment',
        balance: 999999999.99,
        createdAt: new Date().toISOString()
      }));

      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, paths.accounts);
    }
  },

  async submitFeedback(userId: string, userEmail: string, feedback: string) {
    if (!db) return;
    try {
      const feedbackRef = doc(collection(db, 'feedback'));
      await setDoc(feedbackRef, sanitizeData({
        userId,
        userEmail,
        feedback,
        createdAt: new Date().toISOString()
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'feedback');
    }
  },

  subscribeToFeedback(callback: (feedback: any[]) => void) {
    if (!db) return () => {};
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'feedback');
    });
  },

  async fetchAllFeedback() {
    if (!db) return [];
    try {
      const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'feedback');
      return [];
    }
  }
};
