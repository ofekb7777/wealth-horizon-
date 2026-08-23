import {
  collection, doc, getDocs, setDoc, onSnapshot, query, orderBy, limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType, sanitizeData } from '../lib/firestore-utils';
import { Account, Investment } from './types';

/**
 * פיצ'רים שהם ענן במהותם — הודעות מערכת גלובליות, התראות, משוב ופאנל אדמין.
 *
 * הם **לא** חלק מה-Repository בכוונה: ל-SQLite מקומי אין מה לממש כאן,
 * ואין טעם להכריח אותו לספק פונקציות ריקות. הקובץ הזה נמחק בשלב 2
 * יחד עם Firebase, ואיתו גם `AdminConsole.tsx`.
 */

export interface GlobalUpdate { message: string; version: number; }
export interface GlobalAlert { message: string; id: string; }

export interface AdminUserSummary {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  netWorth: number;
  accountCount: number;
  investmentCount: number;
  transactionCount: number;
  lastActive: string;
  lastLogin: string | null;
}

const noop = () => {};

export const cloudService = {
  async saveGlobalSystemUpdate(message: string, version: number): Promise<void> {
    if (!db) return;
    const path = 'system_updates/current';
    try {
      await setDoc(doc(db, path), sanitizeData({
        message, version, updatedAt: new Date().toISOString(),
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  subscribeToGlobalUpdate(callback: (update: GlobalUpdate | null) => void): () => void {
    if (!db) return noop;
    const path = 'system_updates/current';
    return onSnapshot(doc(db, path), (snap) => {
      if (!snap.exists()) return callback(null);
      const data = snap.data();
      callback({ message: data.message, version: data.version || 1 });
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },

  async saveGlobalAlert(message: string): Promise<void> {
    if (!db) return;
    const path = 'system_alerts/current';
    try {
      await setDoc(doc(db, path), sanitizeData({
        message, id: Date.now().toString(), timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  subscribeToGlobalAlert(callback: (alert: GlobalAlert | null) => void): () => void {
    if (!db) return noop;
    const path = 'system_alerts/current';
    return onSnapshot(doc(db, path), (snap) => {
      if (!snap.exists()) return callback(null);
      const data = snap.data();
      callback({ message: data.message, id: data.id });
    }, (error) => handleFirestoreError(error, OperationType.GET, path));
  },

  async submitFeedback(userId: string, userEmail: string, feedback: string): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(collection(db, 'feedback')), sanitizeData({
        userId, userEmail, feedback, createdAt: new Date().toISOString(),
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'feedback');
    }
  },

  subscribeToFeedback(callback: (feedback: any[]) => void): () => void {
    if (!db) return noop;
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'feedback'));
  },

  async fetchAllUsersData(): Promise<AdminUserSummary[]> {
    if (!db) return [];
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      return await Promise.all(usersSnap.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const [accDocs, invDocs, transDocs] = await Promise.all([
          getDocs(collection(db, `users/${userId}/accounts`)),
          getDocs(collection(db, `users/${userId}/investments`)),
          getDocs(collection(db, `users/${userId}/transactions`)),
        ]);

        const accounts = accDocs.docs.map(d => d.data() as Account);
        const investments = invDocs.docs.map(d => d.data() as Investment);
        const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);
        const totalInvested = investments.reduce((sum, i) => sum + (i.shares * i.currentPrice), 0);
        const data = userDoc.data();

        return {
          id: userId,
          email: data.email || 'Unknown',
          displayName: data.displayName || 'Anonymous',
          photoURL: data.photoURL || '',
          netWorth: totalCash + totalInvested,
          accountCount: accounts.length,
          investmentCount: investments.length,
          transactionCount: transDocs.docs.length,
          lastActive: data.updatedAt || 'Unknown',
          lastLogin: data.lastLogin || null,
        };
      }));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'users');
      return [];
    }
  },
};

