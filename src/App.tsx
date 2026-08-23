import { useState, useCallback, useEffect, useRef } from 'react';
import { Transaction, Account, Investment, Sheet, SpreadsheetState, Currency, CURRENCIES, Goal, Budget } from './types.ts';
import MobileTopBar from './components/MobileTopBar.tsx';
import BottomNav from './components/BottomNav.tsx';
import Spreadsheet from './components/Spreadsheet.tsx';
import Accounts from './components/Accounts.tsx';
import Investments from './components/Investments.tsx';
import Budgets from './components/Budgets.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Home from './components/Home.tsx';

import { useTheme, ThemeProvider } from './context/ThemeContext.tsx';
import { VersionProvider } from './context/VersionContext.tsx';
import { repository, initDatabase, wipeEverything } from './data';
import { fetchPrices } from './services/marketData.ts';
import { initStatusBar, hideSplashScreen, onAndroidBack } from './native';
import { txt } from './i18n/he';
import { AlertTriangle, Loader2, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpecialBackgroundEffect } from './components/SpecialBackgroundEffect.tsx';
import Settings from './components/Settings.tsx';


const INITIAL_SHEETS: Sheet[] = [
  { id: '0', name: txt.screens.home, icon: 'home', type: 'home' },
  { id: '3', name: txt.screens.accounts, icon: 'wallet', type: 'accounts' },
  { id: '5', name: txt.screens.analytics, icon: 'dashboard', type: 'dashboard' },
  { id: '1', name: txt.screens.income, icon: 'trending-up', type: 'income' },
  { id: '2', name: txt.screens.expenses, icon: 'trending-down', type: 'expenses' },
  { id: '6', name: txt.screens.budgets, icon: 'pie-chart', type: 'budget' },
  { id: '4', name: txt.screens.investments, icon: 'investments', type: 'investments' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_ACCOUNTS: Account[] = [];

const INITIAL_INVESTMENTS: Investment[] = [];

const INITIAL_GOALS: Goal[] = [];

export default function App() {
  const { theme, setTheme, bgEffect, setBgEffect, monoStyle, setMonoStyle } = useTheme();

  // מצב פתיחת מסד הנתונים. עד שהוא פתוח אין מה להציג — כל הנתונים בו.
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('currency_preference') as Currency) || 'USD';
  });
  const [state, setState] = useState<SpreadsheetState>({
    transactions: INITIAL_TRANSACTIONS,
    accounts: INITIAL_ACCOUNTS,
    investments: INITIAL_INVESTMENTS,
    goals: INITIAL_GOALS,
    budgets: [],
    activeSheetId: '0',
    notes: '',
    patchNotes: 'ברוך הבא. כל הנתונים שלך נשמרים על המכשיר הזה בלבד.',
  });
  // ... (the entire App contents remain here)
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const sheets: Sheet[] = INITIAL_SHEETS;

  // פותח את מסד הנתונים פעם אחת בעלייה. עד שזה מסתיים מוצג מסך טעינה.
  useEffect(() => {
    initStatusBar();
    initDatabase()
      .then(() => setDbReady(true))
      .catch((e: unknown) => {
        console.error('Failed to open the local database', e);
        setDbError(e instanceof Error ? e.message : String(e));
      })
      // מסך הפתיחה יורד בין אם הצלחנו ובין אם לא — אחרת מסך השגיאה
      // היה מוסתר מאחוריו והמשתמש היה רואה לוגו תקוע.
      .finally(hideSplashScreen);
  }, []);

  // טעינת כל הנתונים מהמסד המקומי, פעם אחת אחרי שהוא נפתח.
  useEffect(() => {
    if (!dbReady) return;
    const loadData = async () => {
      setDataLoading(true);
      try {
        const remoteData = await repository.fetchUserData();

        if (remoteData) {
          setState(prev => ({
            ...prev,
            activeSheetId: remoteData.profile.activeSheetId || prev.activeSheetId,
            notes: remoteData.profile.notes ?? prev.notes,
            reminders: remoteData.reminders,
            transactions: remoteData.transactions.length > 0 ? remoteData.transactions : prev.transactions,
            accounts: remoteData.accounts.length > 0 ? remoteData.accounts : prev.accounts,
            investments: remoteData.investments.length > 0 ? remoteData.investments : prev.investments,
            goals: remoteData.goals.length > 0 ? remoteData.goals : prev.goals,
            budgets: remoteData.budgets.length > 0 ? remoteData.budgets : prev.budgets,
            patchNotes: remoteData.profile.patchNotes || prev.patchNotes
          }));
        }
      } catch (e) {
        console.error("Failed to load data from the local database", e);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [dbReady]);

  useEffect(() => {
    if (theme === 'mono') {
      document.body.className = `theme-mono-${monoStyle || 'dark'}`;
    } else {
      document.body.className = `theme-${theme}`;
    }
  }, [theme, monoStyle]);

  // Save state to localStorage as backup
  useEffect(() => {
    localStorage.setItem('financial_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('currency_preference', currency);
  }, [currency]);

  const formatValue = (val: number) => {
    const rate = CURRENCIES[currency].rate;
    const symbol = CURRENCIES[currency].symbol;
    return `${symbol}${(val * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const activeSheet = sheets.find(s => s.id === state.activeSheetId);

  // משיכת מחירים אמיתיים ברקע. אין כאן שום סימולציה: מה שמוצג הוא
  // המחיר האחרון שנמשך בפועל, ובלי רשת — האחרון שנשמר.
  useEffect(() => {
    const updateRealPrices = async () => {
      const tickers = state.investments
        .map(inv => inv.ticker)
        .filter(Boolean)
        .join(',');
      
      if (!tickers) return;

      try {
        // נכשל בשקט ומחזיר מחירים מוטמנים כשאין רשת.
        const data = await fetchPrices(tickers.split(','));

        if (data && typeof data === 'object') {
          setState(prev => {
            let hasChange = false;
            const nextInvestments = prev.investments.map(inv => {
              if (data[inv.ticker] !== undefined && data[inv.ticker] !== inv.currentPrice) {
                hasChange = true;
                return { ...inv, currentPrice: data[inv.ticker] };
              }
              return inv;
            });
            
            return hasChange ? { ...prev, investments: nextInvestments, lastSynced: new Date().toLocaleTimeString() } : prev;
          });
        }
      } catch (err: any) {
        if (String(err).includes('Failed to fetch') || err?.message === 'Failed to fetch' || err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
          console.warn('[Sync] Pricing engine offline or restarting. Will retry...');
        } else {
          console.error('[Sync] Pricing engine connection failed:', err);
        }
      }
    };

    updateRealPrices();
    const interval = setInterval(updateRealPrices, 15000); // 15s High Precision Pulse
    return () => clearInterval(interval);
  }, [state.investments.length]); 

  /*
   * תזכורות שהגיע זמנן.
   *
   * עד שלב 2 התזכורות נשלחו במייל דרך Gmail. זה נשען על טוקן Google
   * שהגיע מההתחברות — וההתחברות ירדה יחד עם Firebase. לכן כאן נשארה
   * רק ניהול המצב: תזכורת חד-פעמית מסומנת כטופלה כשעובר זמנה, ותזכורת
   * חודשית מתגלגלת לחודש הבא. הרשימה עצמה מוצגת במסך הבית.
   *
   * התראה אמיתית על המסך תיכנס בשלב 4, כהתראת אנדרואיד מקומית.
   */
  useEffect(() => {
    const processReminders = () => {
      const reminders = state.reminders || [];
      const now = new Date();
      const due = reminders.filter(r => !r.sent && new Date(r.scheduledTime) <= now);
      if (due.length === 0) return;

      const updatedReminders = [...reminders];

      for (const reminder of due) {
        const index = updatedReminders.findIndex(r => r.id === reminder.id);
        if (index === -1) continue;

        if (reminder.recurrence === 'monthly' && reminder.dayOfMonth) {
          const originalDate = new Date(reminder.scheduledTime);
          const next = new Date(originalDate);
          // מתקדם חודש אחד קדימה מהמועד שנקבע, ולא מ"עכשיו", כדי
          // שתזכורת שלא נפתחה כמה חודשים לא תדלג על החודשים שחלפו.
          next.setMonth(next.getMonth() + 1);
          next.setDate(reminder.dayOfMonth);
          updatedReminders[index] = { ...updatedReminders[index], scheduledTime: next.toISOString() };
        } else {
          updatedReminders[index] = { ...updatedReminders[index], sent: true };
        }
        repository.updateReminder(updatedReminders[index]);
      }

      setState(prev => ({ ...prev, reminders: updatedReminders }));
    };

    const interval = setInterval(processReminders, 60000);
    processReminders(); // בדיקה מיידית בעלייה

    return () => clearInterval(interval);
  }, [state.reminders]);

  /*
   * כתיבות ל-Repository מול setState
   * --------------------------------
   * setState חייב להיות טהור — פונקציית העדכון רצה פעמיים ב-StrictMode.
   * לכן ברוב ההנדלרים הכתיבה הוצאה החוצה, אחרי קריאת setState.
   *
   * בהנדלרים שמחשבים יתרות חשבון מתוך `prev` (עריכת תנועה, מחיקת תנועה,
   * ושני הייבואים) הכתיבה נשארה בפנים בכוונה: קריאה מ-`prev` היא הדרך
   * הנכונה לחשב מצב נגזר, ומעבר ל-`state` היה מסכן חישוב יתרות שגוי
   * בלחיצות מהירות. הנזק מקריאה כפולה מנוטרל בכך שכל כתיבה היא upsert
   * (ראה Repository.ts) — אותו מזהה, אותו תוכן, אותה תוצאה.
   */

  // --- Transactions ---
  const handleUpdateTransaction = useCallback((id: string, field: keyof Transaction, value: any) => {
    setState(prev => {
      const transaction = prev.transactions.find(t => t.id === id);
      if (!transaction) return prev;

      let nextAccounts = prev.accounts;
      let finalValue = value;
      let finalAccountId = transaction.accountId;

      // Special Logic: Dividends go to Investment Account
      if (field === 'category' && value === 'Dividends') {
        const invAcc = prev.accounts.find(a => a.id === 'inv-1');
        if (invAcc && transaction.accountId !== invAcc.id) {
          // Move existing balance if amount exists
          if (transaction.accountId) {
             nextAccounts = nextAccounts.map(acc => {
              if (acc.id === transaction.accountId) return { ...acc, balance: acc.balance - transaction.amount };
              if (acc.id === invAcc.id) return { ...acc, balance: acc.balance + transaction.amount };
              return acc;
            });
            finalAccountId = invAcc.id;
          }
        }
      }

      // If amount or account changes, update account balances
      if (field === 'amount' || field === 'accountId') {
        const amountDiff = field === 'amount' ? (value - transaction.amount) : 0;
        
        if (field === 'accountId') {
          // Subtract old transaction amount from old account, add to new account
          nextAccounts = nextAccounts.map(acc => {
            if (acc.id === transaction.accountId) return { ...acc, balance: acc.balance - transaction.amount };
            if (acc.id === value) return { ...acc, balance: acc.balance + transaction.amount };
            return acc;
          });
          finalAccountId = value;
        } else if (field === 'amount' && finalAccountId) {
          nextAccounts = nextAccounts.map(acc => {
            if (acc.id === finalAccountId) return { ...acc, balance: acc.balance + amountDiff };
            return acc;
          });
        }
      }

      const updatedTransaction = { ...transaction, [field]: finalValue, accountId: finalAccountId };
      
      // Async sync
      repository.updateTransaction(updatedTransaction);
      // Also sync profile for consistency if needed, but here mostly accounts bit
      nextAccounts.forEach(acc => repository.updateAccount(acc));

      return {
        ...prev,
        accounts: nextAccounts,
        transactions: prev.transactions.map(t => t.id === id ? updatedTransaction : t),
      };
    });
  }, []);

  const handleAddTransaction = useCallback((type: 'income' | 'expense') => {
    const bankAcc = state.accounts.find(a => a.id === 'bank-1') || state.accounts[0];

    const newTransaction: Transaction = { 
      id: Math.random().toString(36).substr(2, 9), 
      date: new Date().toISOString().split('T')[0], 
      description: '', 
      category: type === 'income' ? 'Salary' : 'Food', 
      amount: 0, 
      type,
      accountId: bankAcc?.id
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));
    repository.addTransaction(newTransaction);
  }, [state.accounts]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setState(prev => {
      const transaction = prev.transactions.find(t => t.id === id);
      if (!transaction) return prev;

      let nextAccounts = prev.accounts;
      if (transaction.accountId) {
        nextAccounts = nextAccounts.map(acc => {
          if (acc.id === transaction.accountId) return { ...acc, balance: acc.balance - transaction.amount };
          return acc;
        });
      }

      repository.deleteTransaction(id);
      nextAccounts.forEach(acc => repository.updateAccount(acc));

      return {
        ...prev,
        accounts: nextAccounts,
        transactions: prev.transactions.filter(t => t.id !== id)
      };
    });
  }, []);

  // --- Accounts ---
  const handleUpdateAccount = useCallback((id: string, field: keyof Account, value: any) => {
    setState(prev => {
      const updatedAccounts = prev.accounts.map(t => t.id === id ? { ...t, [field]: value } : t);
      const acc = updatedAccounts.find(a => a.id === id);
      if (acc) repository.updateAccount(acc);
      return { ...prev, accounts: updatedAccounts };
    });
  }, []);

  const handleAddAccount = useCallback(() => {
    const newAccount: Account = { id: Math.random().toString(36).substr(2, 9), name: '', type: 'Bank', balance: 0 };
    setState(prev => ({ ...prev, accounts: [...prev.accounts, newAccount] }));
    repository.addAccount(newAccount);
  }, []);

  const handleDeleteAccount = useCallback((id: string) => {
    setState(prev => ({ ...prev, accounts: prev.accounts.filter(t => t.id !== id) }));
    repository.deleteAccount(id);
  }, []);

  // --- Investments ---
  const handleUpdateInvestment = useCallback((id: string, field: keyof Investment, value: any) => {
    setState(prev => {
      const updatedInvestments = prev.investments.map(t => t.id === id ? { ...t, [field]: value } : t);
      const inv = updatedInvestments.find(i => i.id === id);
      if (inv) repository.updateInvestment(inv);
      return { ...prev, investments: updatedInvestments };
    });
  }, []);

  const handleAddInvestment = useCallback(async (tickerData?: string | { ticker: string, name?: string, exchange?: string }) => {
    let ticker = '';
    let name = '';
    let exchange = '';
    
    if (typeof tickerData === 'string') {
      ticker = tickerData;
    } else if (tickerData) {
      ticker = tickerData.ticker;
      name = tickerData.name || '';
      exchange = tickerData.exchange || '';
    }

    let currentPrice = 0;
    if (ticker) {
      const data = await fetchPrices([ticker]);
      currentPrice = data[ticker] ?? 0;
    }

    const newInvestment: Investment = { 
      id: Math.random().toString(36).substr(2, 9), 
      ticker: ticker || '', 
      name: name || '',
      exchange: exchange || '',
      shares: 0, 
      avgPrice: 0, 
      currentPrice: currentPrice || 0 
    };
    setState(prev => ({ ...prev, investments: [...prev.investments, newInvestment] }));
    repository.addInvestment(newInvestment);
  }, []);

  const handleDeleteInvestment = useCallback((id: string) => {
    setState(prev => ({ ...prev, investments: prev.investments.filter(t => t.id !== id) }));
    repository.deleteInvestment(id);
  }, []);

const handleUpdateGoal = useCallback((id: string, field: keyof Goal, value: any) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(t => t.id === id ? { ...t, [field]: value } : t);
      const goal = updatedGoals.find(g => g.id === id);
      if (goal) repository.updateGoal(goal);
      return { ...prev, goals: updatedGoals };
    });
  }, []);

  const handleAddGoal = useCallback(() => {
    const newGoal: Goal = { id: Math.random().toString(36).substr(2, 9), name: '', targetAmount: 0, currentAmount: 0, category: 'Savings' };
    setState(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
    repository.addGoal(newGoal);
  }, []);

  const handleDeleteGoal = useCallback((id: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(t => t.id !== id) }));
    repository.deleteGoal(id);
  }, []);

  const handleUpdateBudget = useCallback((id: string, field: keyof Budget, value: any) => {
    setState(prev => {
      const updatedBudgets = prev.budgets.map(b => b.id === id ? { ...b, [field]: value } : b);
      const budget = updatedBudgets.find(b => b.id === id);
      if (budget) repository.updateBudget(budget);
      return { ...prev, budgets: updatedBudgets };
    });
  }, []);

  const handleAddBudget = useCallback((category: string, limit: number) => {
    const newBudget: Budget = {
      id: Math.random().toString(36).substr(2, 9),
      category,
      limit
    };
    setState(prev => ({ ...prev, budgets: [...prev.budgets, newBudget] }));
    repository.addBudget(newBudget);
  }, []);

  const handleDeleteBudget = useCallback((id: string) => {
    setState(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
    repository.deleteBudget(id);
  }, []);

  const handleAddReminder = useCallback((subject: string, body: string, scheduledTime: string, recurrence?: 'monthly', dayOfMonth?: number) => {
    const newReminder = {
      id: Math.random().toString(36).substr(2, 9),
      subject,
      body,
      scheduledTime,
      sent: false,
      recurrence,
      dayOfMonth
    };
    setState(prev => ({ ...prev, reminders: [...(prev.reminders || []), newReminder] }));
    repository.addReminder(newReminder);
  }, []);

  const handleDeleteReminder = useCallback((id: string) => {
    setState(prev => ({ ...prev, reminders: (prev.reminders || []).filter(r => r.id !== id) }));
    repository.deleteReminder(id);
  }, []);

  const handleUpdateNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, notes }));
    repository.saveUserProfile({ notes });
  }, []);

  const handleUpdatePatchNotes = useCallback((patchNotes: string) => {
    setState(prev => ({ ...prev, patchNotes }));
    repository.saveUserProfile({ patchNotes });
  }, []);

  const handleImportTransactions = useCallback((newTransactions: Transaction[]) => {
    setState(prev => {
      let nextAccounts = prev.accounts;
      
      // Update account balances for imported transactions
      newTransactions.forEach(t => {
        if (t.accountId) {
          nextAccounts = nextAccounts.map(acc => {
            if (acc.id === t.accountId) return { ...acc, balance: acc.balance + t.amount };
            return acc;
          });
        } else if (prev.accounts.length > 0) {
          // If no accountId, default to first account
          const defaultAccId = prev.accounts[0].id;
          t.accountId = defaultAccId;
          nextAccounts = nextAccounts.map(acc => {
            if (acc.id === defaultAccId) return { ...acc, balance: acc.balance + t.amount };
            return acc;
          });
        }
      });

      repository.saveTransactions(newTransactions);
      repository.saveAccounts(nextAccounts);

      return {
        ...prev,
        accounts: nextAccounts,
        transactions: [...newTransactions, ...prev.transactions],
      };
    });
  }, []);

  const handleImportState = useCallback((imported: SpreadsheetState) => {
    setState(prev => {
      // Bulk save
      repository.saveUserProfile({ 
        notes: imported.notes, 
        patchNotes: imported.patchNotes, 
        activeSheetId: prev.activeSheetId 
      });
      repository.saveTransactions(imported.transactions);
      repository.saveAccounts(imported.accounts);
      repository.saveInvestments(imported.investments);
      repository.saveGoals(imported.goals);
      repository.saveBudgets(imported.budgets || []);
      return {
        ...prev,
        ...imported,
        activeSheetId: prev.activeSheetId // Keep current view
      };
    });
  }, []);

  const navigateToSheet = useCallback((type: string) => {
    const sheet = INITIAL_SHEETS.find(s => s.type === type);
    if (sheet) {
      setState(prev => ({ ...prev, activeSheetId: sheet.id }));
      repository.saveUserProfile({ activeSheetId: sheet.id });
    }
  }, []);

  /*
   * כפתור "חזור" של אנדרואיד.
   *
   * ברירת המחדל של WebView היא לסגור את האפליקציה בלחיצה אחת, וזה
   * מרגיש שבור. במקום זה: סוגר מודל פתוח, אחרת חוזר למסך הבית, ורק
   * מהבית מעביר את האפליקציה לרקע (לא סוגר אותה).
   *
   * ה-ref קיים כי המאזין נרשם פעם אחת, ובלעדיו הוא היה רואה לנצח
   * את המצב מהרינדור הראשון.
   */
  const backStateRef = useRef({ activeSheetId: state.activeSheetId, showSettingsModal });
  backStateRef.current = { activeSheetId: state.activeSheetId, showSettingsModal };

  useEffect(() => {
    return onAndroidBack(() => {
      const current = backStateRef.current;

      if (current.showSettingsModal) {
        setShowSettingsModal(false);
        return true;
      }
      if (current.activeSheetId !== '0') {
        setState(prev => ({ ...prev, activeSheetId: '0' }));
        repository.saveUserProfile({ activeSheetId: '0' });
        return true;
      }
      return false; // מהבית — לרקע
    });
  }, []);

  const mainScrollRef = useRef<HTMLElement>(null);

  if (dbError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-4 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <p className="horizon-title text-sm text-zinc-300 tracking-[0.2em]">{txt.boot.failedTitle}</p>
        <p className="text-xs text-zinc-500 font-mono max-w-md break-words" dir="ltr">{dbError}</p>
        <p className="text-[10px] text-zinc-600 max-w-md">{txt.boot.failedHint}</p>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-4">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        <p className="horizon-title text-xs text-zinc-500 tracking-[0.2em] opacity-50">{txt.boot.opening}</p>
      </div>
    );
  }

  return (
    <div className={`flex h-[100dvh] w-screen bg-zinc-950 overflow-hidden text-zinc-200 mesh-gradient relative`}>
      <SpecialBackgroundEffect theme={theme} effect={bgEffect} />
      <Sidebar
          sheets={sheets}
          activeSheetId={state.activeSheetId}
          onSelectSheet={(id) => {
            setState(prev => ({ ...prev, activeSheetId: id }));
            repository.saveUserProfile({ activeSheetId: id });
          }}
          currency={currency}
          onShowSettings={() => setShowSettingsModal(true)}
        />

      <div className="flex flex-col flex-1 min-w-0">
        <MobileTopBar 
          title={activeSheet ? activeSheet.name : "Wealth Horizon"}
        />

        <div className="hidden md:flex h-16 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 items-center justify-between px-8 shrink-0 z-10 relative">
          <div className="flex items-center gap-3">
            <h1 className="horizon-title text-xl text-zinc-100 border-s-2 border-pink-500 ps-4">
              {activeSheet ? activeSheet.name : "Wealth Horizon"}
            </h1>
            <div className="h-1 w-8 rounded-full bg-gradient-to-r from-pink-500/40 to-transparent" />
          </div>
        </div>

        <main 
          ref={mainScrollRef}
          className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden relative md:pb-0 pb-16 hide-scrollbar"
        >
          <div className="flex flex-col min-h-full">
            {activeSheet?.type === 'home' && (
              <Home 
                state={state} 
                currency={currency} 
                patchNotes={state.patchNotes}
                onUpdatePatchNotes={handleUpdatePatchNotes}
                onImportState={handleImportState}
                onNavigate={navigateToSheet} 
                      onAddReminder={handleAddReminder}
                onDeleteReminder={handleDeleteReminder}
              />
            )}

          {activeSheet?.type === 'income' && (
            <Spreadsheet
              viewType="income"
              transactions={state.transactions.filter(t => t.type ? t.type === 'income' : t.amount >= 0)}
              accounts={state.accounts}
              budgets={state.budgets}
              onUpdateTransaction={handleUpdateTransaction}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onImportTransactions={handleImportTransactions}
              currency={currency}
            />
          )}

          {activeSheet?.type === 'expenses' && (
            <Spreadsheet
              viewType="expense"
              transactions={state.transactions.filter(t => t.type ? t.type === 'expense' : t.amount < 0)}
              accounts={state.accounts}
              budgets={state.budgets}
              onUpdateTransaction={handleUpdateTransaction}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onImportTransactions={handleImportTransactions}
              currency={currency}
            />
          )}

          {activeSheet?.type === 'accounts' && (
            <Accounts
              accounts={state.accounts}
              onUpdateAccount={handleUpdateAccount}
              onAddAccount={handleAddAccount}
              onDeleteAccount={handleDeleteAccount}
              currency={currency}
            />
          )}

          {activeSheet?.type === 'budget' && (
            <Budgets
              state={state}
              onUpdateBudget={handleUpdateBudget}
              onAddBudget={handleAddBudget}
              onDeleteBudget={handleDeleteBudget}
              currency={currency}
            />
          )}

          {activeSheet?.type === 'investments' && (
            <Investments
              investments={state.investments}
              lastSynced={state.lastSynced}
              onUpdateInvestment={handleUpdateInvestment}
              onAddInvestment={handleAddInvestment}
              onDeleteInvestment={handleDeleteInvestment}
              currency={currency}
            />
          )}

          {activeSheet?.type === 'dashboard' && (
            <Dashboard 
              state={state}
              onUpdateGoal={handleUpdateGoal}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              onNavigate={navigateToSheet}
              currency={currency}
            />
          )}
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav
          sheets={sheets}
          activeSheetId={state.activeSheetId}
          onSelectSheet={(id) => {
            setState(prev => ({ ...prev, activeSheetId: id }));
            repository.saveUserProfile({ activeSheetId: id });
          }}
          onShowSettings={() => setShowSettingsModal(true)}
        />
      </div>

      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-7xl h-full max-h-[90vh] glass-card rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col bg-zinc-900/50"
            >
              <div className="px-12 pt-8 border-b border-white/5 pb-4 shrink-0">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">{txt.settings.title}</h2>
              </div>

              <div className="absolute top-6 end-6 z-10 flex items-center gap-2">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                >
                  <LogOut className="h-5 w-5 rotate-180" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full px-4 md:px-12 pt-12 pb-32 relative z-0">
                <Settings
                    theme={theme}
                    onSetTheme={setTheme}
                    bgEffect={bgEffect}
                    onSetBgEffect={setBgEffect}
                    monoStyle={monoStyle}
                    onSetMonoStyle={setMonoStyle}
                    currency={currency}
                    onSetCurrency={setCurrency}
                    state={state}
                    onImportState={handleImportState}
                    onAddReminder={handleAddReminder}
                    onDeleteReminder={handleDeleteReminder}
                    onResetData={async () => {
                      const defaultAccounts: Account[] = [
                        { id: 'bank-1', name: 'עובר ושב', type: 'Bank', balance: 0 },
                        { id: 'inv-1', name: 'חשבון השקעות', type: 'Investment', balance: 0 }
                      ];
                      
                      try {
                        // מוחק הכל — כולל תזכורות והפרופיל — ואז כותב
                        // מחדש את חשבונות ברירת המחדל.
                        await wipeEverything();
                        await repository.saveAccounts(defaultAccounts);
                        await repository.saveUserProfile({
                          notes: '',
                          patchNotes: state.patchNotes,
                        });
                      } catch (err) {
                        console.error("Error clearing local data:", err);
                      }

                      setState(prev => {
                        const newState = {
                          ...prev,
                          transactions: [],
                          accounts: defaultAccounts,
                          investments: [],
                          budgets: [],
                          goals: [],
                          reminders: [],
                          notes: '',
                          patchNotes: prev.patchNotes
                        };
                        localStorage.setItem('financial_state', JSON.stringify(newState));
                        return newState;
                      });
                    }}
                  />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}