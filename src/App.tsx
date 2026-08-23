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
import Login from './components/Login.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { useTheme, ThemeProvider } from './context/ThemeContext.tsx';
import { VersionProvider } from './context/VersionContext.tsx';
import { firestoreService } from './services/firestoreService.ts';
import { sendGmail } from './services/gmailService.ts';
import { Globe, Loader2, LogOut, MessageSquare, X, Send, Check, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminConsole from './components/AdminConsole.tsx';
import { SpecialBackgroundEffect } from './components/SpecialBackgroundEffect.tsx';
import Settings from './components/Settings.tsx';

import InstallModal from './components/InstallModal.tsx';

const INITIAL_SHEETS: Sheet[] = [
  { id: '0', name: 'Home', icon: 'home', type: 'home' },
  { id: '3', name: 'Accounts', icon: 'wallet', type: 'accounts' },
  { id: '5', name: 'Analytics', icon: 'dashboard', type: 'dashboard' },
  { id: '1', name: 'Income', icon: 'trending-up', type: 'income' },
  { id: '2', name: 'Expenses', icon: 'trending-down', type: 'expenses' },
  { id: '6', name: 'Budgets', icon: 'pie-chart', type: 'budget' },
  { id: '4', name: 'Investments', icon: 'investments', type: 'investments' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_ACCOUNTS: Account[] = [];

const INITIAL_INVESTMENTS: Investment[] = [];

const INITIAL_GOALS: Goal[] = [];

export default function App() {
  const { user, loading: authLoading, signOut, isAdmin, accessToken, signIn } = useAuth();
  const { theme, setTheme, bgEffect, setBgEffect, monoStyle, setMonoStyle } = useTheme();
  
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
    patchNotes: 'Wealth Horizon Terminal initialized. Secure uplink established.',
  });
  // ... (the entire App contents remain here)
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [portalTab, setPortalTab] = useState<'admin' | 'settings'>('settings');
  const [showSettingsPortal, setShowSettingsPortal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const checkStandalone = () => {
      const isWindowStandalone = window.matchMedia('(display-mode: standalone)').matches;
      // @ts-ignore
      const isIOSStandalone = window.navigator.standalone === true;
      const standalone = isWindowStandalone || isIOSStandalone;
      setIsStandalone(standalone);
      
      if (!standalone && !sessionStorage.getItem('installPromptShown')) {
        setTimeout(() => {
          setShowInstallModal(true);
          sessionStorage.setItem('installPromptShown', 'true');
        }, 1500);
      }
    };
    checkStandalone();
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);
    return () => mediaQuery.removeEventListener('change', checkStandalone);
  }, []);
  const [globalUpdate, setGlobalUpdate] = useState<{message: string, version: number}>({
    message: 'System Online. Welcome to your financial command center.',
    version: 9
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{message: string, id: string} | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim() || !user) return;
    setIsSubmittingFeedback(true);
    try {
      await firestoreService.submitFeedback(user.uid, user.email || 'unknown', feedbackText);
      setFeedbackText('');
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setShowFeedbackModal(false);
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const sheets: Sheet[] = INITIAL_SHEETS;

  useEffect(() => {
    if (isAdmin && user && !user.emailVerified) {
      console.warn("ADMIN SECURITY WARNING: Your email is NOT verified in Firebase.");
    }
  }, [user, isAdmin]);

  // Load Data from Firestore on Login
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setDataLoading(true);
        try {
          const remoteData = await firestoreService.fetchUserData(user.uid);

          if (remoteData) {
            setState(prev => ({
              ...prev,
              ...remoteData,
              transactions: remoteData.transactions.length > 0 ? remoteData.transactions : prev.transactions,
              accounts: remoteData.accounts.length > 0 ? remoteData.accounts : prev.accounts,
              investments: remoteData.investments.length > 0 ? remoteData.investments : prev.investments,
              goals: remoteData.goals.length > 0 ? remoteData.goals : prev.goals,
              budgets: remoteData.budgets && remoteData.budgets.length > 0 ? remoteData.budgets : prev.budgets,
              patchNotes: remoteData.patchNotes || prev.patchNotes
            }));
          }
        } catch (e) {
          console.error("Failed to sync from Firestore", e);
        } finally {
          setDataLoading(false);
        }
      };
      loadData();

      // Real-time listener for global system updates
      const unsubscribeGlobal = firestoreService.subscribeToGlobalUpdate((update) => {
        if (update) {
          setGlobalUpdate(update);
          setState(prev => ({
            ...prev,
            patchNotes: update.message
          }));
        }
      });

      const unsubscribeAlerts = firestoreService.subscribeToGlobalAlert((alert) => {
        if (alert) {
          setActiveAlert(alert);
          const seenAlerts = JSON.parse(localStorage.getItem('seen_alerts') || '[]');
          if (!seenAlerts.includes(alert.id)) {
            setShowAlertModal(true);
            seenAlerts.push(alert.id);
            localStorage.setItem('seen_alerts', JSON.stringify(seenAlerts));
          }
        }
      });

      return () => {
        unsubscribeGlobal();
        unsubscribeAlerts();
      };
    }
  }, [user]);

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

  // Simulate small real-time fluctuations for UI "liveliness"
  useEffect(() => {
    const simulatePriceMovement = () => {
      setState(prev => {
        let changed = false;
        const updatedInvestments = prev.investments.map(inv => {
          if (inv.currentPrice === 0) return inv;
          // Tiny random variation +/- 0.1% for visual movement
          const change = 1 + (Math.random() * 0.002 - 0.001);
          const newPrice = Number((inv.currentPrice * change).toFixed(2));
          
          if (newPrice !== inv.currentPrice) {
            changed = true;
            return { ...inv, currentPrice: newPrice };
          }
          return inv;
        });

        if (changed) {
          return { ...prev, investments: updatedInvestments };
        }
        return prev;
      });
    };

    const interval = setInterval(simulatePriceMovement, 3000);
    return () => clearInterval(interval);
  }, []);

  // Background fetch for REAL market data
  useEffect(() => {
    const updateRealPrices = async () => {
      const tickers = state.investments
        .map(inv => inv.ticker)
        .filter(Boolean)
        .join(',');
      
      if (!tickers) return;

      try {
        console.log(`[Sync] 30s Pulse Triggered: ${tickers}`);
        const res = await fetch(`/api/prices?tickers=${encodeURIComponent(tickers)}`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`[Sync] Server returned error (${res.status}):`, errorText.substring(0, 100));
          return;
        }

        const data = await res.json();
        
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

  // Process scheduled reminders
  useEffect(() => {
    const processReminders = async () => {
      if (!user || !user.email) return;
      const reminders = state.reminders || [];
      const now = new Date();
      
      const pendingReminders = reminders.filter(r => !r.sent && new Date(r.scheduledTime) <= now);
      
      if (pendingReminders.length === 0) return;

      if (!accessToken) {
        console.warn("Reminders are due, but no Gmail access token is available.");
        return;
      }

      const updatedReminders = [...reminders];
      let changed = false;

      for (const reminder of pendingReminders) {
        try {
          await sendGmail(accessToken, user.email, reminder.subject, reminder.body || 'This is your scheduled reminder from Wealth Horizon.');
          
          // Update local state
          const index = updatedReminders.findIndex(r => r.id === reminder.id);
          if (index !== -1) {
            if (reminder.recurrence === 'monthly' && reminder.dayOfMonth) {
               const currentDate = new Date();
               let nextMonth = currentDate.getMonth() + 1;
               let nextYear = currentDate.getFullYear();
               if (nextMonth > 11) {
                 nextMonth = 0;
                 nextYear++;
               }
               const originalDate = new Date(reminder.scheduledTime);
               const nextDate = new Date(nextYear, nextMonth, reminder.dayOfMonth, originalDate.getHours(), originalDate.getMinutes());
               updatedReminders[index] = { ...updatedReminders[index], scheduledTime: nextDate.toISOString() };
            } else {
               updatedReminders[index] = { ...updatedReminders[index], sent: true };
            }
            changed = true;
            firestoreService.updateReminder(user.uid, updatedReminders[index]);
          }
          console.log(`Reminder sent: ${reminder.subject}`);
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}`, error);
        }
      }

      if (changed) {
        setState(prev => ({ ...prev, reminders: updatedReminders }));
      }
    };

    const interval = setInterval(processReminders, 10000);
    processReminders(); // check immediately

    return () => clearInterval(interval);
  }, [state.reminders, accessToken, user]);

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
      if (user) {
        firestoreService.updateTransaction(user.uid, updatedTransaction);
        // Also sync profile for consistency if needed, but here mostly accounts bit
        nextAccounts.forEach(acc => firestoreService.updateAccount(user.uid, acc));
      }

      return {
        ...prev,
        accounts: nextAccounts,
        transactions: prev.transactions.map(t => t.id === id ? updatedTransaction : t),
      };
    });
  }, [user]);

  const handleAddTransaction = useCallback((type: 'income' | 'expense') => {
    setState(prev => {
      const bankAcc = prev.accounts.find(a => a.id === 'bank-1') || prev.accounts[0];
      
      const newTransaction: Transaction = { 
        id: Math.random().toString(36).substr(2, 9), 
        date: new Date().toISOString().split('T')[0], 
        description: '', 
        category: type === 'income' ? 'Salary' : 'Food', 
        amount: 0, 
        type,
        accountId: bankAcc?.id
      };
      
      if (user) firestoreService.updateTransaction(user.uid, newTransaction);

      return {
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
      };
    });
  }, [user]);

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

      if (user) {
        firestoreService.deleteTransaction(user.uid, id);
        nextAccounts.forEach(acc => firestoreService.updateAccount(user.uid, acc));
      }

      return {
        ...prev,
        accounts: nextAccounts,
        transactions: prev.transactions.filter(t => t.id !== id)
      };
    });
  }, [user]);

  // --- Accounts ---
  const handleUpdateAccount = useCallback((id: string, field: keyof Account, value: any) => {
    setState(prev => {
      const updatedAccounts = prev.accounts.map(t => t.id === id ? { ...t, [field]: value } : t);
      if (user) {
        const acc = updatedAccounts.find(a => a.id === id);
        if (acc) firestoreService.updateAccount(user.uid, acc);
      }
      return { ...prev, accounts: updatedAccounts };
    });
  }, [user]);

  const handleAddAccount = useCallback(() => {
    setState(prev => {
      const newAccount: Account = { id: Math.random().toString(36).substr(2, 9), name: '', type: 'Bank', balance: 0 };
      if (user) firestoreService.updateAccount(user.uid, newAccount);
      return { ...prev, accounts: [...prev.accounts, newAccount] };
    });
  }, [user]);

  const handleDeleteAccount = useCallback((id: string) => {
    setState(prev => {
      if (user) firestoreService.deleteAccount(user.uid, id);
      return { ...prev, accounts: prev.accounts.filter(t => t.id !== id) };
    });
  }, [user]);

  // --- Investments ---
  const handleUpdateInvestment = useCallback((id: string, field: keyof Investment, value: any) => {
    setState(prev => {
      const updatedInvestments = prev.investments.map(t => t.id === id ? { ...t, [field]: value } : t);
      if (user) {
        const inv = updatedInvestments.find(i => i.id === id);
        if (inv) firestoreService.updateInvestment(user.uid, inv);
      }
      return { ...prev, investments: updatedInvestments };
    });
  }, [user]);

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
      try {
        const res = await fetch(`/api/prices?tickers=${ticker}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data[ticker]) currentPrice = data[ticker];
      } catch (e: any) {
        if (String(e).includes('Failed to fetch') || e?.message === 'Failed to fetch' || e?.message?.includes('Failed to fetch') || e?.name === 'TypeError') {
          console.warn("Pricing engine offline. Could not fetch initial price for", ticker);
        } else {
          console.error("Failed to fetch price for new investment", e);
        }
      }
    }

    setState(prev => {
      const newInvestment: Investment = { 
        id: Math.random().toString(36).substr(2, 9), 
        ticker: ticker || '', 
        name: name || '',
        exchange: exchange || '',
        shares: 0, 
        avgPrice: 0, 
        currentPrice: currentPrice || 0 
      };
      if (user) firestoreService.updateInvestment(user.uid, newInvestment);
      return { ...prev, investments: [...prev.investments, newInvestment] };
    });
  }, [user]);

  const handleDeleteInvestment = useCallback((id: string) => {
    setState(prev => {
      if (user) firestoreService.deleteInvestment(user.uid, id);
      return { ...prev, investments: prev.investments.filter(t => t.id !== id) };
    });
  }, [user]);

const handleUpdateGoal = useCallback((id: string, field: keyof Goal, value: any) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(t => t.id === id ? { ...t, [field]: value } : t);
      if (user) {
        const goal = updatedGoals.find(g => g.id === id);
        if (goal) firestoreService.updateGoal(user.uid, goal);
      }
      return { ...prev, goals: updatedGoals };
    });
  }, [user]);

  const handleAddGoal = useCallback(() => {
    setState(prev => {
      const newGoal: Goal = { id: Math.random().toString(36).substr(2, 9), name: '', targetAmount: 0, currentAmount: 0, category: 'Savings' };
      if (user) firestoreService.updateGoal(user.uid, newGoal);
      return { ...prev, goals: [...prev.goals, newGoal] };
    });
  }, [user]);

  const handleDeleteGoal = useCallback((id: string) => {
    setState(prev => {
      if (user) firestoreService.deleteGoal(user.uid, id);
      return { ...prev, goals: prev.goals.filter(t => t.id !== id) };
    });
  }, [user]);

  const handleUpdateBudget = useCallback((id: string, field: keyof Budget, value: any) => {
    setState(prev => {
      const updatedBudgets = prev.budgets.map(b => b.id === id ? { ...b, [field]: value } : b);
      if (user) {
        const budget = updatedBudgets.find(b => b.id === id);
        if (budget) firestoreService.updateBudget(user.uid, budget);
      }
      return { ...prev, budgets: updatedBudgets };
    });
  }, [user]);

  const handleAddBudget = useCallback((category: string, limit: number) => {
    setState(prev => {
      const newBudget: Budget = {
        id: Math.random().toString(36).substr(2, 9),
        category,
        limit
      };
      if (user) firestoreService.updateBudget(user.uid, newBudget);
      return { ...prev, budgets: [...prev.budgets, newBudget] };
    });
  }, [user]);

  const handleDeleteBudget = useCallback((id: string) => {
    setState(prev => {
      if (user) firestoreService.deleteBudget(user.uid, id);
      return { ...prev, budgets: prev.budgets.filter(b => b.id !== id) };
    });
  }, [user]);

  const handleAddReminder = useCallback((subject: string, body: string, scheduledTime: string, recurrence?: 'monthly', dayOfMonth?: number) => {
    setState(prev => {
      const newReminder = {
        id: Math.random().toString(36).substr(2, 9),
        subject,
        body,
        scheduledTime,
        sent: false,
        recurrence,
        dayOfMonth
      };
      if (user) firestoreService.updateReminder(user.uid, newReminder);
      return { ...prev, reminders: [...(prev.reminders || []), newReminder] };
    });
  }, [user]);

  const handleDeleteReminder = useCallback((id: string) => {
    setState(prev => {
      if (user) firestoreService.deleteReminder(user.uid, id);
      return { ...prev, reminders: (prev.reminders || []).filter(r => r.id !== id) };
    });
  }, [user]);

  const handleUpdateNotes = useCallback((notes: string) => {
    setState(prev => {
      if (user) firestoreService.saveUserProfile(user.uid, { notes });
      return { ...prev, notes };
    });
  }, [user]);

  const handleUpdatePatchNotes = useCallback((patchNotes: string) => {
    setState(prev => {
      if (user) {
        firestoreService.saveUserProfile(user.uid, { patchNotes });
      }
      return { ...prev, patchNotes };
    });
  }, [user]);

  const handleBroadcastUpdate = useCallback(async (message: string) => {
    console.log("App.tsx: handleBroadcastUpdate triggered with message:", message);
    if (!isAdmin) {
      console.warn("App.tsx: Broadcast attempted but user is not admin.");
      return;
    }
    try {
      const nextVersion = globalUpdate.version + 1;
      console.log(`App.tsx: Broadcasting version v1.${nextVersion}...`);
      await firestoreService.saveGlobalSystemUpdate(message, nextVersion);
      console.log("App.tsx: Global update saved to Firestore.");
      
      const versionedMsg = message;
      setGlobalUpdate({ message, version: nextVersion });
      setState(s => ({ ...s, patchNotes: versionedMsg }));
      
      if (user) {
        await firestoreService.saveUserProfile(user.uid, { patchNotes: versionedMsg });
        console.log("App.tsx: User profile patch notes updated.");
      }
    } catch (error: any) {
      console.error("App.tsx: Broadcast failed:", error);
      alert(`Broadcast failed: ${error.message || error}`);
    }
  }, [isAdmin, globalUpdate.version, user]);

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

      if (user) {
        newTransactions.forEach(t => firestoreService.updateTransaction(user.uid, t));
        nextAccounts.forEach(acc => firestoreService.updateAccount(user.uid, acc));
      }

      return {
        ...prev,
        accounts: nextAccounts,
        transactions: [...newTransactions, ...prev.transactions],
      };
    });
  }, [user]);

  const handleImportState = useCallback((imported: SpreadsheetState) => {
    setState(prev => {
      if (user) {
        // Bulk save
        firestoreService.saveUserProfile(user.uid, { 
          notes: imported.notes, 
          patchNotes: imported.patchNotes, 
          activeSheetId: prev.activeSheetId 
        });
        imported.transactions.forEach(t => firestoreService.updateTransaction(user.uid, t));
        imported.accounts.forEach(a => firestoreService.updateAccount(user.uid, a));
        imported.investments.forEach(i => firestoreService.updateInvestment(user.uid, i));
        imported.goals.forEach(g => firestoreService.updateGoal(user.uid, g));
      }
      return {
        ...prev,
        ...imported,
        activeSheetId: prev.activeSheetId // Keep current view
      };
    });
  }, [user]);

  const navigateToSheet = useCallback((type: string) => {
    const sheet = INITIAL_SHEETS.find(s => s.type === type);
    if (sheet) {
      setState(prev => ({ ...prev, activeSheetId: sheet.id }));
      if (user) firestoreService.saveUserProfile(user.uid, { activeSheetId: sheet.id });
    }
  }, [user]);

  const mainScrollRef = useRef<HTMLElement>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Install prompt captured');
      
      if (!sessionStorage.getItem('installPromptShown')) {
        setShowInstallModal(true);
        sessionStorage.setItem('installPromptShown', 'true');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    console.log("Install button clicked, deferredPrompt:", deferredPrompt);
    if (!deferredPrompt) {
      setShowInstallModal(true);
      return;
    }
    console.log("Calling deferredPrompt.prompt()");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("Prompt outcome:", outcome);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-4">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        <p className="horizon-title text-xs text-zinc-500 tracking-[0.2em] opacity-50">Initializing Wealth Engine...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className={`flex h-[100dvh] w-screen bg-zinc-950 overflow-hidden text-zinc-200 mesh-gradient relative`}>
      <SpecialBackgroundEffect theme={theme} effect={bgEffect} />
      <Sidebar
          sheets={sheets}
          activeSheetId={state.activeSheetId}
          onSelectSheet={(id) => {
            setState(prev => ({ ...prev, activeSheetId: id }));
            if (user) firestoreService.saveUserProfile(user.uid, { activeSheetId: id });
          }}
          user={user}
          onLogout={signOut}
          currency={currency}
          isAdmin={isAdmin}
          onShowAdmin={() => {
            setPortalTab(isAdmin ? 'admin' : 'settings');
            setShowAdminPortal(true);
          }}
          onShowSettings={() => {
            setPortalTab('settings');
            setShowAdminPortal(true);
          }}
          onInstall={handleInstallApp}
        />

      <div className="flex flex-col flex-1 min-w-0">
        <MobileTopBar 
          title={activeSheet ? activeSheet.name : "Wealth Horizon"}
        />

        <div className="hidden md:flex h-16 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 items-center justify-between px-8 shrink-0 z-10 relative">
          <div className="flex items-center gap-3">
            <h1 className="horizon-title text-xl text-zinc-100 border-l-2 border-pink-500 pl-4">
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
                onBroadcastUpdate={handleBroadcastUpdate}
                onImportState={handleImportState}
                onNavigate={navigateToSheet} 
                isAdmin={isAdmin}
                onInstall={handleInstallApp}
                showInstallButton={true}
                onAddReminder={handleAddReminder}
                onDeleteReminder={handleDeleteReminder}
                accessToken={accessToken}
                onRequiresAuth={signIn}
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
            if (user) firestoreService.saveUserProfile(user.uid, { activeSheetId: id });
          }}
          isAdmin={isAdmin}
          onShowAdmin={() => {
            setPortalTab(isAdmin ? 'admin' : 'settings');
            setShowAdminPortal(true);
          }}
        />
      </div>

      <AnimatePresence>
        {showInstallModal && (
          <InstallModal onClose={() => setShowInstallModal(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPortal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdminPortal(false)}
              className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-7xl h-full max-h-[90vh] glass-card rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col bg-zinc-900/50"
            >
              {/* Header Tab Switcher (Visible only if Admin) */}
              {isAdmin ? (
                <div className="flex items-center gap-6 px-12 pt-8 border-b border-white/5 shrink-0 relative">
                  <button
                    onClick={() => setPortalTab('admin')}
                    className={`text-xs font-black uppercase tracking-[0.2em] pb-4 border-b-2 transition-all cursor-pointer ${
                      portalTab === 'admin' ? 'border-pink-500 text-pink-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    System Control
                  </button>
                  <button
                    onClick={() => setPortalTab('settings')}
                    className={`text-xs font-black uppercase tracking-[0.2em] pb-4 border-b-2 transition-all cursor-pointer ${
                      portalTab === 'settings' ? 'border-pink-500 text-pink-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    User Preferences
                  </button>
                </div>
              ) : (
                <div className="px-12 pt-8 border-b border-white/5 pb-4 shrink-0">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Settings Console</h2>
                </div>
              )}

              <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                <button 
                  onClick={() => setShowAdminPortal(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all pointer-events-auto"
                >
                  <LogOut className="h-5 w-5 rotate-180" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full px-4 md:px-12 pt-12 pb-32 relative z-0">
                {portalTab === 'admin' && isAdmin ? (
                  <AdminConsole currency={currency as any} globalUpdate={globalUpdate} />
                ) : (
                  <Settings
                    theme={theme}
                    onSetTheme={setTheme}
                    bgEffect={bgEffect}
                    onSetBgEffect={setBgEffect}
                    monoStyle={monoStyle}
                    onSetMonoStyle={setMonoStyle}
                    currency={currency}
                    onSetCurrency={setCurrency}
                    user={user}
                    isAdmin={isAdmin}
                    state={state}
                    onImportState={handleImportState}
                    onResetData={async () => {
                      const defaultAccounts: Account[] = [
                        { id: 'bank-1', name: 'Main Checking', type: 'Bank', balance: 0 },
                        { id: 'inv-1', name: 'Investment Account', type: 'Investment', balance: 0 }
                      ];
                      
                      if (user) {
                        try {
                          await firestoreService.saveUserProfile(user.uid, { 
                            notes: '', 
                            patchNotes: state.patchNotes 
                          });

                          const deletePromises: Promise<any>[] = [];
                          state.transactions.forEach(t => {
                            deletePromises.push(firestoreService.deleteTransaction(user.uid, t.id));
                          });
                          state.budgets.forEach(b => {
                            deletePromises.push(firestoreService.deleteBudget(user.uid, b.id));
                          });
                          state.goals.forEach(g => {
                            deletePromises.push(firestoreService.deleteGoal(user.uid, g.id));
                          });
                          state.accounts.forEach(a => {
                            deletePromises.push(firestoreService.deleteAccount(user.uid, a.id));
                          });
                          state.investments.forEach(i => {
                            deletePromises.push(firestoreService.deleteInvestment(user.uid, i.id));
                          });
                          
                          await Promise.all(deletePromises);

                          const accountPromises = defaultAccounts.map(a => 
                            firestoreService.updateAccount(user.uid, a)
                          );
                          await Promise.all(accountPromises);
                        } catch (err) {
                          console.error("Error clearing cloud data:", err);
                        }
                      }

                      setState(prev => {
                        const newState = {
                          ...prev,
                          transactions: [],
                          accounts: defaultAccounts,
                          investments: [],
                          budgets: [],
                          goals: [],
                          notes: '',
                          patchNotes: prev.patchNotes
                        };
                        localStorage.setItem('financial_state', JSON.stringify(newState));
                        return newState;
                      });
                    }}
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global In-App Feedback Button */}
      <button 
        onClick={() => setShowFeedbackModal(!showFeedbackModal)}
        className="fixed bottom-24 md:bottom-8 right-6 z-[60] p-4 bg-pink-600/90 text-white rounded-full shadow-lg shadow-pink-500/50 hover:bg-pink-500 transition-all active:scale-95 border border-white/10 glass-card"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-[140px] md:bottom-24 right-6 w-80 sm:w-96 glass-card rounded-[2rem] p-6 border-white/10 shadow-2xl z-[60] bg-zinc-900/90 backdrop-blur-3xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
              <h3 className="text-zinc-100 font-extrabold text-sm uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-pink-400" />
                Submit Feedback
              </h3>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {feedbackSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-emerald-400 animate-in fade-in zoom-in duration-300">
                <div className="bg-emerald-500/10 p-3 rounded-full mb-3">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="font-extrabold uppercase tracking-widest text-[10px]">Feedback Received</p>
                <p className="text-zinc-500 text-[10px] mt-1 text-center font-mono">Thank you! Our devs have been notified.</p>
              </div>
            ) : (
             <>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Report bugs or suggest features..."
                className="w-full h-32 bg-zinc-950/50 border border-white/5 rounded-2xl p-4 text-zinc-300 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/30 focus:ring-1 focus:ring-pink-500/30 transition-all resize-none"
              />

              <button 
                onClick={handleFeedbackSubmit}
                disabled={isSubmittingFeedback || !feedbackText.trim()}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-md shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingFeedback ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" /> 
                    Send to Dev Team
                  </>
                )}
              </button>
             </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAlertModal && activeAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md"
            onClick={() => setShowAlertModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-black border border-violet-500/30 rounded-3xl p-8 w-full max-w-lg shadow-2xl shadow-violet-500/20 flex flex-col items-center text-center space-y-6 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
              <div className="h-16 w-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-2 border border-violet-500/30">
                <Globe className="h-8 w-8 text-violet-400" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mix-blend-screen relative z-10">Global Alert</h2>
              <div className="text-zinc-300 font-medium relative z-10 leading-relaxed whitespace-pre-wrap">
                {activeAlert.message}
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="w-full mt-4 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-violet-900/40 relative z-10"
              >
                Acknowledge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
