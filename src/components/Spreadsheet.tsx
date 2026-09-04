import { Plus, Trash2, FileUp } from 'lucide-react';
import React, { useState } from 'react';
import { useI18n } from '../context/LanguageContext';
import ImportDialog from './ImportDialog';
import { Transaction, Account, Budget, INCOME_CATEGORIES, EXPENSE_CATEGORIES, Currency, CURRENCIES } from '../types';

interface SpreadsheetProps {
  viewType: 'income' | 'expense';
  transactions: Transaction[];
  accounts: Account[];
  budgets?: Budget[];
  onUpdateTransaction: (id: string, field: keyof Transaction, value: any) => void;
  onAddTransaction: (type: 'income' | 'expense') => void;
  onDeleteTransaction: (id: string) => void;
  onImportTransactions: (newTransactions: Transaction[]) => void;
  /**
   * כל התנועות, לא רק אלה שמוצגות במסך הזה.
   * זיהוי כפילויות חייב לבדוק מול הכנסות והוצאות גם יחד.
   */
  allTransactions: Transaction[];
  currency: Currency;
}

export default function Spreadsheet({
  viewType,
  transactions,
  accounts,
  budgets = [],
  onUpdateTransaction,
  onAddTransaction,
  onDeleteTransaction,
  onImportTransactions,
  allTransactions,
  currency
}: SpreadsheetProps) {
  const { txt, categoryLabel } = useI18n();
  const symbol = CURRENCIES[currency].symbol;
  const rate = CURRENCIES[currency].rate;
  const [showImport, setShowImport] = useState(false);

  const customCategories = budgets
    .map(b => b.category)
    .filter(cat => !EXPENSE_CATEGORIES.includes(cat));
  const expenseCategories = [...EXPENSE_CATEGORIES, ...customCategories];


  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative">
      {/* Toolbar */}
      <div className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 shrink-0 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => onAddTransaction(viewType)}
          className="group relative flex items-center gap-3 px-6 py-2.5 bg-zinc-100 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-4 w-4 text-zinc-900 relative z-10 transition-colors" />
          <span className="text-[10px] font-black text-zinc-900 relative z-10 uppercase tracking-widest whitespace-nowrap">{viewType === 'income' ? txt.ledger.addIncome : txt.ledger.addExpense}</span>
        </button>


        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] hidden md:block">
            {viewType === 'income' ? txt.ledger.incomeTitle : txt.ledger.expensesTitle}
          </div>
          
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-zinc-300 transition-all bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-50"
          >
            <FileUp className="h-4 w-4" />
            {txt.ledger.importExcel}
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-8 py-8 md:pb-8 pb-32">
        <div className="max-w-[1600px] mx-auto space-y-6">
        {transactions.map((t) => (
          <div key={t.id} className="glass-card rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-2xl relative group overflow-hidden transition-all duration-300 hover:bg-zinc-900/60">
            <button
               onClick={() => onDeleteTransaction(t.id)}
               className="absolute top-6 end-6 text-zinc-600 hover:text-rose-400 p-2 rounded-full hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
               title={txt.ledger.deleteRow}
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.3em]">{txt.common.description}</span>
                <input
                  type="text"
                  value={t.description}
                  onChange={(e) => onUpdateTransaction(t.id, 'description', e.target.value)}
                  className="w-full bg-transparent outline-none font-display font-black text-2xl text-zinc-100 focus:text-white placeholder:text-zinc-700 transition-all"
                  placeholder={txt.ledger.descriptionPlaceholder}
                />
              </div>
              
              <div className="flex flex-col gap-2 p-6 rounded-3xl bg-zinc-800/30 border border-white/5">
                <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.3em]">{txt.common.amount}</span>
                <div className="flex items-center">
                  <span className={`font-mono text-2xl me-2 ${viewType === 'income' ? 'text-pink-500 italic' : 'text-rose-400'}`}>{symbol}</span>
                  <div className="relative w-full min-w-0">
                    <input
                      type="number"
                      id={`trans-input-${t.id}`}
                      value={t.amount === 0 ? '' : Number(Math.abs(t.amount * rate).toFixed(2)).toString()}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          onUpdateTransaction(t.id, 'amount', 0);
                          return;
                        }
                        const val = Math.abs(parseFloat(e.target.value) || 0);
                        onUpdateTransaction(t.id, 'amount', (viewType === 'expense' ? -val : val) / rate);
                      }}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      className={`w-full bg-transparent outline-none font-mono text-3xl md:text-4xl font-extrabold transition-all border-none focus:ring-0 peer ${
                        viewType === 'income' ? 'text-pink-500 italic' : 'text-rose-400'
                      } ${t.amount !== 0 ? 'opacity-0 focus:opacity-100' : 'opacity-100'}`}
                      placeholder="0.00"
                    />
                    {t.amount !== 0 && (
                      <div className={`absolute inset-0 pointer-events-none font-mono text-3xl md:text-4xl font-extrabold flex items-center peer-focus:hidden truncate ${
                        viewType === 'income' ? 'text-pink-500 italic' : 'text-rose-400'
                      }`}>
                        {Math.abs(t.amount * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.2em] ms-1">{txt.common.date}</span>
                  <input
                    type="date"
                    value={t.date}
                    onChange={(e) => onUpdateTransaction(t.id, 'date', e.target.value)}
                    className="bg-zinc-800 border border-white/5 text-zinc-200 px-4 py-2 rounded-2xl outline-none font-black text-[10px] uppercase transition-all focus:border-pink-500/30 w-full [color-scheme:dark]"
                  />
                </div>
                
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.2em] ms-1">{txt.common.category}</span>
                  <div className="relative">
                    <select
                      value={t.category}
                      onChange={(e) => onUpdateTransaction(t.id, 'category', e.target.value)}
                      className="w-full bg-zinc-800 border border-white/5 px-4 py-2 rounded-2xl outline-none font-black text-[10px] uppercase text-zinc-200 appearance-none transition-all cursor-pointer focus:border-pink-500/30 pe-10"
                    >
                      {(viewType === 'income' ? INCOME_CATEGORIES : expenseCategories).map(cat => (
                        <option className="bg-zinc-900 text-zinc-100" key={cat} value={cat}>{categoryLabel(cat)}</option>
                      ))}
                    </select>
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 font-black">&darr;</div>
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.2em] ms-1">{txt.ledger.sourceAccount}</span>
                  <div className="relative">
                    <select
                      value={t.accountId || ''}
                      onChange={(e) => onUpdateTransaction(t.id, 'accountId', e.target.value)}
                      className="w-full bg-zinc-800 border border-white/5 px-4 py-2 rounded-2xl outline-none font-black text-[10px] uppercase text-zinc-200 appearance-none transition-all cursor-pointer focus:border-pink-500/30 pe-10"
                    >
                      <option className="bg-zinc-900 text-zinc-100" value="">{txt.common.unassigned}</option>
                      {accounts.map(acc => (
                        <option className="bg-zinc-900 text-zinc-100" key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 font-black">&darr;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-white/10">
            <div className="text-zinc-600 text-xs font-black uppercase tracking-[0.3em] italic">{txt.ledger.noRecords}</div>
            <button 
              onClick={() => onAddTransaction(viewType)}
              className="mt-4 text-pink-500 text-[10px] font-black uppercase tracking-widest hover:underline italic"
            >
              {txt.ledger.addFirst} &darr;
            </button>
          </div>
        )}
        </div>
      </div>

      {showImport && (
        <ImportDialog
          accounts={accounts}
          existingTransactions={allTransactions}
          currency={currency}
          onImport={onImportTransactions}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
