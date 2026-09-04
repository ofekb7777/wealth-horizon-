import React, { useState, useMemo } from 'react';
import { useI18n } from '../context/LanguageContext';
import { Budget, SpreadsheetState, Currency, CURRENCIES, EXPENSE_CATEGORIES } from '../types';
import { Plus, Trash2, ChevronLeft, ChevronRight, AlertCircle, PieChart, TrendingDown, Check, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface BudgetsProps {
  state: SpreadsheetState;
  onUpdateBudget: (id: string, field: keyof Budget, value: any) => void;
  onAddBudget: (category: string, limit: number) => void;
  onDeleteBudget: (id: string) => void;
  currency: Currency;
}

export default function Budgets({
  state,
  onUpdateBudget,
  onAddBudget,
  onDeleteBudget,
  currency
}: BudgetsProps) {
  const { txt, categoryLabel, locale } = useI18n();
  const { transactions, budgets } = state;
  const symbol = CURRENCIES[currency].symbol;
  const rate = CURRENCIES[currency].rate;

  // Track the selected month for budgets view (defaults to today's month)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Budget entry Form inputs
  const [newCategoryType, setNewCategoryType] = useState<'existing' | 'custom'>('existing');
  const [selectedCategory, setSelectedCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [newLimitInput, setNewLimitInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Move month offset helpers
  const handlePrevMonth = () => {
    const [year, col] = selectedMonth.split('-').map(Number);
    let prevMonth = col - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, col] = selectedMonth.split('-').map(Number);
    let nextMonth = col + 1;
    let nextYear = year;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setSelectedMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  /*
   * שם החודש היה נעוץ ב-'he-IL', ולכן הופיע בעברית גם כשהאפליקציה
   * בסינית. הוא הולך עכשיו לפי השפה הפעילה.
   */
  const formattedMonthName = useMemo(() => {
    const [year, col] = selectedMonth.split('-').map(Number);
    const date = new Date(year, col - 1, 1);
    return date.toLocaleString(locale, { month: 'long', year: 'numeric' });
  }, [selectedMonth, locale]);

  // Retrieve unbudgeted expense categories
  const availablePresetCategories = useMemo(() => {
    const currentBudgeted = budgets.map(b => b.category.toLowerCase());
    return EXPENSE_CATEGORIES.filter(cat => !currentBudgeted.includes(cat.toLowerCase()));
  }, [budgets]);

  // Aggregate spending by category for the selected month
  const categorySpendingForSelectedMonth = useMemo(() => {
    const totals: { [category: string]: number } = {};
    
    // Filter transactions to expense transactions in the selected month
    const monthlyExpenses = transactions.filter(t => {
      // check if it is of type expense
      const isExpense = t.type ? t.type === 'expense' : t.amount < 0;
      if (!isExpense) return false;
      
      // check if date matches YYYY-MM
      return t.date.startsWith(selectedMonth);
    });

    monthlyExpenses.forEach(t => {
      const category = t.category;
      const amountUSD = Math.abs(t.amount); // t.amount is stored as base USD (negative for expenses)
      totals[category] = (totals[category] || 0) + amountUSD;
    });

    return totals;
  }, [transactions, selectedMonth]);

  // Combine budgets and actual spending calculated
  const budgetsWithSpending = useMemo(() => {
    return budgets.map(b => {
      const spentUSD = categorySpendingForSelectedMonth[b.category] || 0;
      const limitUSD = b.limit; // budget limit is stored in base USD
      
      // Values converted to display currency
      const spentDisplay = spentUSD * rate;
      const limitDisplay = limitUSD * rate;
      const remainingDisplay = limitDisplay - spentDisplay;
      
      const percent = limitUSD > 0 ? (spentUSD / limitUSD) * 100 : 0;
      const isExceeded = spentUSD > limitUSD;

      return {
        ...b,
        spentUSD,
        spentDisplay,
        limitDisplay,
        remainingDisplay,
        percent,
        isExceeded
      };
    });
  }, [budgets, categorySpendingForSelectedMonth, rate]);

  // Compute Total Metrics for the selected month
  const totalBudgetUSD = useMemo(() => budgets.reduce((sum, b) => sum + b.limit, 0), [budgets]);
  const totalSpentUSD = useMemo(() => {
    return budgetsWithSpending.reduce((sum, b) => sum + b.spentUSD, 0);
  }, [budgetsWithSpending]);

  const totalBudgetDisplay = totalBudgetUSD * rate;
  const totalSpentDisplay = totalSpentUSD * rate;
  const totalRemainingDisplay = totalBudgetDisplay - totalSpentDisplay;
  const isOverallBudgetExceeded = totalSpentUSD > totalBudgetUSD;

  // Number of categories exceeded
  const exceededCount = useMemo(() => budgetsWithSpending.filter(b => b.isExceeded).length, [budgetsWithSpending]);

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const finalCategory = newCategoryType === 'existing' 
      ? selectedCategory 
      : customCategoryName.trim();

    if (!finalCategory) {
      setFormError('Category name cannot be empty.');
      return;
    }

    // Check duplicate
    const exists = budgets.some(b => b.category.toLowerCase() === finalCategory.toLowerCase());
    if (exists) {
      setFormError(`A budget target for "${finalCategory}" already exists.`);
      return;
    }

    const limitInDisplayCurrency = parseFloat(newLimitInput);
    if (isNaN(limitInDisplayCurrency) || limitInDisplayCurrency <= 0) {
      setFormError('Please enter a valid limit greater than zero.');
      return;
    }

    // Convert display limit to standard USD base to match transactions storage
    const limitUSD = limitInDisplayCurrency / rate;

    onAddBudget(finalCategory, limitUSD);

    // Reset fields
    setCustomCategoryName('');
    setNewLimitInput('');
    if (newCategoryType === 'custom') {
      setNewCategoryType('existing');
    }
  };

  // Recharts Chart Data Source
  const chartData = useMemo(() => {
    return budgetsWithSpending.map(b => ({
      name: b.category,
      Limit: parseFloat(b.limitDisplay.toFixed(2)),
      Spent: parseFloat(b.spentDisplay.toFixed(2)),
    }));
  }, [budgetsWithSpending]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative">
      {/* Top sticky bar */}
      <div className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 shrink-0 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <PieChart className="h-5 w-5 text-pink-500 animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest text-zinc-100">{txt.budgets.subtitle}</span>
        </div>
        
        {/* Month selector */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="px-3 text-[10px] font-black text-zinc-100 uppercase tracking-widest whitespace-nowrap">
            {formattedMonthName}
          </span>
          
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 md:pb-8 pb-32">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* Top Quick Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Budget */}
            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-zinc-900/30">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">{txt.budgets.totalLimit}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl text-zinc-400">{symbol}</span>
                <span className="font-mono text-3xl font-black text-zinc-100">
                  {totalBudgetDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 font-medium uppercase mt-2">{txt.budgets.totalLimitHint}</p>
            </div>

            {/* Total Spent */}
            <div className={`glass-card rounded-3xl p-6 border ${isOverallBudgetExceeded ? 'border-rose-500/20 bg-rose-950/5' : 'border-white/5 bg-zinc-900/30'}`}>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">{txt.budgets.spent}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl text-zinc-400">{symbol}</span>
                <span className={`font-mono text-3xl font-black ${isOverallBudgetExceeded ? 'text-rose-400' : 'text-pink-500 italic'}`}>
                  {totalSpentDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {isOverallBudgetExceeded ? (
                <div className="flex items-center gap-1 mt-2 text-rose-400 text-[9px] font-bold uppercase tracking-wider animate-pulse">
                  <AlertCircle className="h-3 w-3" />
                  Over-budget
                </div>
              ) : (
                <p className="text-[9px] text-emerald-400 font-bold uppercase mt-2">{txt.budgets.excellent}</p>
              )}
            </div>

            {/* Remaining */}
            <div className={`glass-card rounded-3xl p-6 border ${totalRemainingDisplay < 0 ? 'border-rose-500/20 bg-rose-950/5' : 'border-white/5 bg-zinc-900/30'}`}>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">{txt.budgets.remaining}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl text-zinc-400">{symbol}</span>
                <span className={`font-mono text-3xl font-black ${totalRemainingDisplay < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {totalRemainingDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {totalRemainingDisplay < 0 ? (
                <p className="text-[9px] text-rose-500 font-bold uppercase mt-2">{txt.budgets.exceededBy} {symbol}{Math.abs(totalRemainingDisplay).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              ) : (
                <p className="text-[9px] text-emerald-400 font-bold uppercase mt-2">{txt.budgets.safetyMargin}</p>
              )}
            </div>

          </div>

          {/* Overall Warning Banner if any category exceeds limit */}
          {exceededCount > 0 && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-4 bg-rose-950/20 border border-rose-500/30 rounded-3xl p-5 shadow-inner"
            >
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                <AlertCircle className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">{txt.budgets.attention}</h4>
                <p className="text-[10px] text-zinc-400 font-medium mt-1">
                  You have exceeded the allocation in <span className="text-rose-300 font-bold">{exceededCount} {exceededCount === 1 ? 'category' : 'categories'}</span>. Review individual limits and adjust expenditure patterns below.
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Budget Lists */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">{txt.budgets.title}</h3>
                <span className="text-[10px] font-black text-zinc-500 uppercase">{budgets.length} {txt.budgets.targetsCount}</span>
              </div>

              <div className="space-y-4">
                {budgetsWithSpending.map((b) => {
                  const overBy = b.remainingDisplay < 0 ? Math.abs(b.remainingDisplay) : 0;
                  
                  return (
                    <motion.div
                      layout
                      key={b.id}
                      className={`glass-card rounded-[2rem] p-6 border relative group overflow-hidden transition-all duration-300 hover:bg-zinc-900/40 ${
                        b.isExceeded ? 'border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'border-white/5'
                      }`}
                    >
                      {/* Delete budget target limit */}
                      <button
                        onClick={() => onDeleteBudget(b.id)}
                        className="absolute top-4 end-4 text-zinc-600 hover:text-rose-400 p-2 rounded-full hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title={txt.budgets.deleteTarget}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="space-y-4">
                        {/* Title and Badge */}
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-xs font-black text-zinc-200 uppercase tracking-wider block">{categoryLabel(b.category)}</span>
                            <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest block">
                              {txt.budgets.spendingTarget}
                            </span>
                          </div>
                          
                          {/* Limit Edit / Display info */}
                          <div className="flex items-center gap-2 self-start me-8">
                            {b.isExceeded ? (
                              <span className="px-2.5 py-1 bg-rose-500/15 border border-rose-500/20 text-rose-400 text-[8px] font-bold uppercase rounded-full tracking-widest animate-pulse">
                                {txt.budgets.overBy} {symbol}{overBy.toFixed(0)}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase rounded-full tracking-widest">
                                {txt.budgets.underControl}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Limit Input Block */}
                        <div className="grid grid-cols-2 gap-4 items-center bg-zinc-800/10 border border-white/5 p-4 rounded-2xl">
                          <div className="space-y-0.5">
                            <span className="text-[8px] uppercase text-zinc-500 font-black tracking-widest">{txt.budgets.limit} ({symbol})</span>
                            <div className="flex items-center gap-1 select-none">
                              <span className="text-zinc-600 text-xs font-mono">{symbol}</span>
                              <input
                                type="number"
                                step="any"
                                value={Number((b.limit * rate).toFixed(2))}
                                onChange={(e) => {
                                  const displayValue = parseFloat(e.target.value) || 0;
                                  // Convert to storage base USD
                                  onUpdateBudget(b.id, 'limit', displayValue / rate);
                                }}
                                className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-xs font-mono font-bold text-zinc-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-0.5 text-end">
                            <span className="text-[8px] uppercase text-zinc-500 font-black tracking-widest block">{txt.budgets.spent}</span>
                            <span className="font-mono text-xs font-bold text-zinc-300 block">
                              {symbol}{b.spentDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar info */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-mono tracking-tighter text-zinc-500">
                            <span>{Math.min(b.percent, 100).toFixed(0)}% Utilized</span>
                            <span>
                              {symbol}{b.spentDisplay.toFixed(0)} / {symbol}{b.limitDisplay.toFixed(0)}
                            </span>
                          </div>

                          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(b.percent, 100)}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                b.isExceeded 
                                  ? 'bg-linear-to-r from-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                                  : 'bg-linear-to-r from-pink-500 to-orange-400'
                              }`}
                            />
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}

                {budgets.length === 0 && (
                  <div className="text-center py-16 glass-card rounded-[2rem] border-dashed border-white/10">
                    <TrendingDown className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                    <div className="text-zinc-600 text-xs font-black uppercase tracking-[0.2em] italic">{txt.budgets.empty}</div>
                    <p className="text-[9px] text-zinc-400 mt-1 max-w-sm mx-auto">{txt.budgets.emptyHint}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Right side: Registration Controller and Comparison charts */}
            <div className="space-y-8">
              
              {/* Registration Form */}
              <div className="glass-card rounded-[2rem] p-6 border border-white/5 bg-zinc-900/30 space-y-6">
                <div>
                  <h3 className="text-xs font-black text-zinc-200 uppercase tracking-widest">{txt.budgets.create}</h3>
                  <p className="text-[9px] text-zinc-500 mt-1">{txt.budgets.createHint}</p>
                </div>

                <form onSubmit={handleCreateBudget} className="space-y-4">
                  
                  {/* Category Category Select Type Toggle */}
                  <div className="flex bg-white/5 border border-white/15 p-1 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setNewCategoryType('existing')}
                      className={`flex-1 text-center py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        newCategoryType === 'existing' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {txt.budgets.presets}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategoryType('custom')}
                      className={`flex-1 text-center py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        newCategoryType === 'custom' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {txt.budgets.custom}
                    </button>
                  </div>

                  {newCategoryType === 'existing' ? (
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase font-black text-zinc-500 tracking-widest ps-1">{txt.common.category}</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 px-4 py-2.5 rounded-2xl outline-none font-black text-[10px] uppercase text-zinc-200 cursor-pointer [color-scheme:dark]"
                      >
                        {availablePresetCategories.length > 0 ? (
                          availablePresetCategories.map(cat => (
                            <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                          ))
                        ) : (
                          <option value="">{txt.budgets.allAllocated}</option>
                        )}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase font-black text-zinc-500 tracking-widest ps-1">{txt.budgets.customCategory}</label>
                      <input
                        type="text"
                        placeholder={txt.budgets.customPlaceholder}
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 text-zinc-200 px-4 py-2.5 rounded-2xl outline-none font-black text-[10px] uppercase placeholder-zinc-500 tracking-wider"
                      />
                    </div>
                  )}

                  {/* Limit input */}
                  <div className="space-y-2">
                    <label className="text-[8px] uppercase font-black text-zinc-500 tracking-widest ps-1">{txt.budgets.monthlyLimit} ({symbol})</label>
                    <div className="relative">
                      <span className="absolute start-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">{symbol}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="any"
                        value={newLimitInput}
                        onChange={(e) => setNewLimitInput(e.target.value)}
                        className="w-full bg-zinc-800 border border-white/10 text-zinc-200 ps-8 pe-4 py-2.5 rounded-2xl outline-none font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="text-[9px] text-rose-400 font-bold uppercase tracking-wide flex items-center gap-1 ps-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full relative py-3 bg-zinc-100 rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center font-black text-[10px] uppercase tracking-widest text-zinc-900"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 font-bold group-hover:text-zinc-900">{txt.budgets.setLimit}</span>
                  </button>

                </form>
              </div>

              {/* Budget vs Actual charts */}
              {budgets.length > 0 && (
                <div className="glass-card rounded-[2rem] p-6 border border-white/5 bg-zinc-900/30 space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">{txt.budgets.title}</h3>
                    <p className="text-[9px] text-zinc-500 mt-1">Real-time budget targets vs actual utilization.</p>
                  </div>

                  <div className="h-56 w-full select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis dataKey="name" stroke="#5d5d5d" fontSize={8} tickLine={false} />
                        <YAxis stroke="#5d5d5d" fontSize={8} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                          labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '10px' }}
                          itemStyle={{ fontSize: '10px' }}
                        />
                        <Bar dataKey="Limit" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
                          {budgetsWithSpending.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.isExceeded ? 'var(--color-rose-500)' : 'var(--color-pink-500)'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-[8px] font-black uppercase text-zinc-500 tracking-wider">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-zinc-700 rounded-sm" />
                      <span>{txt.budgets.limit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-pink-500 rounded-sm" />
                      <span>{txt.budgets.spent}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 bg-rose-400 rounded-sm" />
                      <span>{txt.budgets.overBudget}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
