import { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { SpreadsheetState, Currency, CURRENCIES } from '../types';
import { Wallet, TrendingUp, TrendingDown, Target, Terminal, Settings, Check, X, Zap, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVersion } from '../context/VersionContext';

import { Reminder } from '../types';

interface HomeProps {
  state: SpreadsheetState;
  onNavigate: (sheetId: string) => void;
  currency: Currency;
  patchNotes: string;
  onUpdatePatchNotes: (notes: string) => void;
  onImportState: (state: SpreadsheetState) => void;
  onAddReminder?: (subject: string, body: string, time: string) => void;
  onDeleteReminder?: (id: string) => void;
}

export default function Home({ 
  state, 
  onNavigate, 
  currency, 
  patchNotes, 
  onUpdatePatchNotes, 
  onImportState, 
  onAddReminder,
  onDeleteReminder,
}: HomeProps) {
  const { version } = useVersion();
  const { transactions, accounts, investments, goals } = state;
  const [isEditingPatch, setIsEditingPatch] = useState(false);
  const [localPatch, setLocalPatch] = useState(patchNotes);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Sync local patch when prop changes (e.g. from global sync)
  useEffect(() => {
    if (!isEditingPatch) {
      setLocalPatch(patchNotes);
    }
  }, [patchNotes, isEditingPatch]);

  const [hoveredNet, setHoveredNet] = useState<any>(null);
  const [hoveredMonthly, setHoveredMonthly] = useState<any>(null);
  const rate = CURRENCIES[currency].rate;
  const symbol = CURRENCIES[currency].symbol;

  const handlePatchSubmit = async () => {
    onUpdatePatchNotes(localPatch);
    setIsEditingPatch(false);
  };

  const summaryData = useMemo(() => {
    // Current Balances
    const cashBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
    const investmentsValue = (investments || []).reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);
    const totalNetWorth = cashBalance + investmentsValue;

    // Monthly Income vs Expenses
    const monthlyData: Record<string, { month: string; income: number; expenses: number; unix: number }> = {};
    
    // Balance over time (simplified)
    const trendData: { date: string; balance: number; unix: number }[] = [];
    
    const sorted = [...(transactions || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // To get realistic historical balances without calculating from the beginning of time,
    // we trace *backward* from the current total balance if we want actual net worth.
    // Or we just show the cumulative flow of transactions over the selected period.
    // Given the prompt "how much money he had in total at that time", we can start from current total
    // and subtract transactions going backward, then reverse.
    const reversed = [...sorted].reverse();
    let runner = totalNetWorth;
    const historyMap = new Map();
    // Record current date
    historyMap.set(new Date().toISOString().split('T')[0], runner);
    
    reversed.forEach(t => {
      // Because we are going backwards in time:
      // If transaction was income (+): balance before it was runner - t.amount
      // If transaction was expense (-): balance before it was runner + Object.abs(t.amount)
      runner -= t.amount;
      historyMap.set(t.date, runner);
    });

    Array.from(historyMap.entries())
      .map(([date, balance]) => ({ date, balance, unix: new Date(date).getTime() }))
      .sort((a, b) => a.unix - b.unix)
      .forEach(item => trendData.push(item));

    // Fill monthly data
    sorted.forEach(t => {
      const d = new Date(t.date);
      const monthKey = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0, unix: d.getTime() };
      }
      if (t.amount > 0) {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
    });

    const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.unix - b.unix);

    return {
      cashBalance,
      investmentsValue,
      totalNetWorth,
      monthlyChartData,
      trendData
    };
  }, [transactions, accounts, investments]);

  return (
    <div className="flex-1 bg-transparent px-4 md:px-8 py-6 pb-24 md:pb-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-extrabold font-display text-zinc-100 tracking-tight">
            Welcome <span className="gradient-text italic">Back</span> <span className="text-zinc-600 text-sm font-mono">v{version}</span>
          </h2>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Wealth Horizon Intelligence Layer</p>
        </div>
      </div>

      {/* System Update / Patch Notes */}
      <div className="group relative glass-card rounded-[2rem] p-6 border-white/5 overflow-hidden transition-all duration-500 hover:ring-1 hover:ring-pink-500/30">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Terminal className="h-24 w-24" />
        </div>
        
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em] italic">System Update</span>
            </div>
            
            <button 
              onClick={() => {
                setLocalPatch(patchNotes);
                setIsEditingPatch(!isEditingPatch);
              }}
              className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-zinc-100 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
              title="Edit notes"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {isEditingPatch ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={localPatch}
                onChange={(e) => setLocalPatch(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-pink-500/50 italic"
                rows={2}
                placeholder="Enter patch notes..."
              />
              <div className="flex items-center gap-2 self-end">
                <button 
                  onClick={() => setIsEditingPatch(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-500 hover:text-zinc-100 transition-all border border-transparent hover:bg-white/5"
                >
                  <X className="h-3 w-3" /> CANCEL
                </button>
                <button 
                  disabled={isBroadcasting}
                  onClick={handlePatchSubmit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white/10 text-zinc-100 hover:bg-white/20 transition-all text-[11px] font-black border border-white/10 active:scale-95 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" /> {isBroadcasting ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400 font-mono text-sm leading-relaxed max-w-2xl italic">
              {patchNotes}
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('accounts')}
          className="glass-card rounded-3xl p-6 flex flex-col gap-3 cursor-pointer group active:scale-95 transition-all duration-300 hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-pink-400 transition-colors">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Cash Assets</span>
          </div>
          <div className="text-2xl font-black font-mono text-zinc-100 mt-2">
            {symbol}{(summaryData.cashBalance * rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>
        
        <div 
          onClick={() => onNavigate('investments')}
          className="glass-card rounded-3xl p-6 flex flex-col gap-3 cursor-pointer group active:scale-95 transition-all duration-300 hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-start gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-pink-400 transition-colors">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Investments</span>
          </div>
          <div className="text-2xl font-black font-mono text-zinc-100 mt-2">
            {symbol}{(summaryData.investmentsValue * rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>

        <div 
          onClick={() => onNavigate('income')}
          className="glass-card rounded-3xl p-6 flex flex-col gap-3 cursor-pointer group active:scale-95 transition-all duration-300 hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Inflow</span>
          </div>
          <div className="text-sm font-bold text-zinc-400 mt-2 group-hover:text-emerald-400 flex items-center gap-2">
            Manage <span className="text-lg">&rarr;</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('expenses')}
          className="glass-card rounded-3xl p-6 flex flex-col gap-3 cursor-pointer group active:scale-95 transition-all duration-300 hover:bg-zinc-800/60"
        >
          <div className="flex items-center justify-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDown className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Outflow</span>
          </div>
          <div className="text-sm font-bold text-zinc-400 mt-2 group-hover:text-rose-400 flex items-center gap-2">
            Manage <span className="text-lg">&rarr;</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Net Worth Chart */}
        <div className="lg:col-span-3 glass-card rounded-3xl p-6 md:p-8 flex flex-col h-auto md:h-[350px] relative">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-4 md:gap-0">
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500 mb-2">
                {hoveredNet ? (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-pink-500 italic font-black">
                    Snapshot // {hoveredNet.date}
                  </motion.span>
                ) : (
                  "Total Net Worth"
                )}
              </h3>
              <div className="text-3xl md:text-4xl font-black font-mono text-zinc-100 tracking-tighter">
                {symbol}{( (hoveredNet ? hoveredNet.balance : summaryData.totalNetWorth) * rate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${summaryData.totalNetWorth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
               {hoveredNet ? 'SNAPSHOT' : 'TOTAL VALUE'}
            </div>
          </div>
          <div className="flex-1 min-h-[150px] -ms-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={summaryData.trendData}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload) setHoveredNet(e.activePayload[0].payload);
                }}
                onMouseLeave={() => setHoveredNet(null)}
              >
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-pink-500)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-pink-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={10} minTickGap={40} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} 
                  tickFormatter={(val) => `${symbol}${val < 1000 ? val : (val/1000).toFixed(1) + 'k'}`}
                  dx={-5}
                  domain={['auto', 'auto']} 
                />
                {hoveredNet && (
                  <ReferenceLine 
                    y={hoveredNet.netWorth} 
                    stroke="var(--color-pink-500)" 
                    strokeDasharray="3 3" 
                  />
                )}
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                  content={() => null} // Hidden because we use header sync
                  isAnimationActive={false}
                />
                <Area type="monotone" dataKey="balance" stroke="var(--color-pink-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col h-[350px] relative">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-500">
              {hoveredMonthly ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-pink-500 italic font-black">
                  Breakdown // {hoveredMonthly.month}
                </motion.span>
              ) : (
                "Monthly Cash Flow"
              )}
            </h3>
            {hoveredMonthly && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-mono font-black text-emerald-400">+{symbol}{(hoveredMonthly.income * rate).toLocaleString()}</span>
                <span className="text-[10px] font-mono font-black text-rose-400">-{symbol}{(hoveredMonthly.expenses * rate).toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-h-[150px] -ms-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={summaryData.monthlyChartData} 
                barGap={8}
                onMouseMove={(e: any) => {
                  if (e && e.activePayload) setHoveredMonthly(e.activePayload[0].payload);
                }}
                onMouseLeave={() => setHoveredMonthly(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}
                  tickFormatter={(val) => `${symbol}${val < 1000 ? val : (val/1000).toFixed(1) + 'k'}`}
                  dx={-5}
                />
                {hoveredMonthly && (
                  <>
                    {hoveredMonthly.income > 0 && <ReferenceLine y={hoveredMonthly.income} stroke="var(--color-pink-500)" strokeDasharray="3 3" />}
                    {hoveredMonthly.expenses > 0 && <ReferenceLine y={hoveredMonthly.expenses} stroke="var(--color-rose-500)" strokeDasharray="3 3" />}
                  </>
                )}
                <Tooltip
                  cursor={false}
                  content={() => null} // Hidden because we use header sync
                  isAnimationActive={false}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="var(--color-pink-500)" radius={[6, 6, 0, 0]} maxBarSize={20} />
                <Bar dataKey="expenses" name="Expenses" fill="var(--color-rose-500)" radius={[6, 6, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}
