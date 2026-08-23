import { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  Brush,
  ReferenceLine
} from 'recharts';
import { SpreadsheetState, Goal, Currency, CURRENCIES } from '../types';
import { Plus, Trash2, Cpu, Goal as GoalIcon, BarChart3, Lightbulb, Loader2, TrendingUp, TrendingDown, Activity, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  state: SpreadsheetState;
  onUpdateGoal: (id: string, field: keyof Goal, value: any) => void;
  onAddGoal: () => void;
  onDeleteGoal: (id: string) => void;
  onNavigate: (type: string) => void;
  currency: Currency;
}

const COLORS = [
  'var(--color-cyan-400)', // Cyan
  'var(--color-emerald-500)', // Emerald
  'var(--color-purple-500)', // Purple
  'var(--color-pink-500)', // Pink
  'var(--color-indigo-500)', // Indigo
  'var(--color-amber-500)', // Amber
  'var(--color-teal-500)', // Teal
  'var(--color-rose-400)', // Rose
];

export default function Dashboard({ state, onUpdateGoal, onAddGoal, onDeleteGoal, onNavigate, currency }: DashboardProps) {
  const { transactions, accounts, investments, goals } = state;
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'advisor'>('overview');
  const [timeframe, setTimeframe] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');
  const [hoveredTrend, setHoveredTrend] = useState<any>(null);
  const [hoveredAllocation, setHoveredAllocation] = useState<any>(null);
  const [hoveredMomentum, setHoveredMomentum] = useState<any>(null);
  const [hoveredExpense, setHoveredExpense] = useState<any>(null);
  const [aiTips, setAiTips] = useState<{ title: string; suggestion: string; category: string }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const rate = CURRENCIES[currency].rate;
  const symbol = CURRENCIES[currency].symbol;

  useEffect(() => {
    const fetchTips = async () => {
      setLoadingAi(true);
      try {
        const jsonStr = await getFinancialInsights(state);
        const tips = JSON.parse(jsonStr);
        setAiTips(tips);
      } catch (err) {
        console.error("AI Tips Error:", err);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchTips();
  }, [transactions?.length, accounts?.length, investments?.length, goals?.length]);

  const summaryData = useMemo(() => {
    const categories: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    const now = new Date();
    const filteredTransactions = (transactions || []).filter(t => {
      if (timeframe === 'all') return true;
      const tDate = new Date(t.date);
      const diffMonths = (now.getFullYear() - tDate.getFullYear()) * 12 + (now.getMonth() - tDate.getMonth());
      
      if (timeframe === '1m') return diffMonths < 1;
      if (timeframe === '3m') return diffMonths < 3;
      if (timeframe === '6m') return diffMonths < 6;
      if (timeframe === '1y') return diffMonths < 12;
      return true;
    });

    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const trendData: any[] = [];
    const groupedByDate: Record<string, number> = {};

    sorted.forEach(t => {
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        totalExpenses += Math.abs(t.amount);
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
      }
      cumulative += t.amount;
      groupedByDate[t.date] = cumulative;
    });

    Object.entries(groupedByDate).forEach(([date, balance]) => {
      trendData.push({ date, balance });
    });

    const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    const cashBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
    const investmentsValue = (investments || []).reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);
    const totalNetWorth = cashBalance + investmentsValue;

    const assetAllocation = [
      { name: 'Cash & Accounts', value: Math.max(0, cashBalance) },
      { name: 'Investments', value: investmentsValue }
    ].filter(item => item.value > 0);

    const investmentPerformance = (investments || []).map(inv => {
      const profit = (inv.currentPrice - inv.avgPrice) * inv.shares;
      const growth = inv.avgPrice > 0 ? ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100 : 0;
      return {
        ticker: inv.ticker,
        profit,
        growth
      };
    });

    return {
      totalIncome,
      totalExpenses,
      pieData,
      trendData,
      totalNetWorth,
      assetAllocation,
      investmentPerformance,
      barData: [
        { name: 'Income', amount: totalIncome },
        { name: 'Expenses', amount: totalExpenses },
      ]
    };
  }, [transactions, accounts, investments, timeframe]);

  return (
    <div className="flex-1 bg-transparent px-4 md:px-8 py-6 md:pb-8 pb-24">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl font-extrabold font-display text-zinc-100 tracking-tight">
                Terminal <span className="gradient-text italic">Analytics</span>
              </h2>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.2em]">System Status: Active // Multi-Core</p>
            </div>
            
              <div className="hidden xl:flex items-center gap-6 glass-card px-6 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-pink-500 animate-pulse" />
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none italic">Live Protocol</span>
              </div>
              <div className="flex gap-6 border-s border-white/5 ps-6">
                {(investments || []).slice(0, 3).map(inv => (
                   <div 
                      key={inv.id} 
                      className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity"
                      onClick={() => onNavigate('investments')}
                    >
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">{inv.ticker}</span>
                      <span className="text-[11px] font-black font-mono text-zinc-100 whitespace-nowrap">
                        {symbol}{inv.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                   </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5 text-[10px] font-black overflow-x-auto hide-scrollbar shrink-0">
              {[
                { id: '1m', label: '1 month' },
                { id: '3m', label: '3 months' },
                { id: '6m', label: '6 months' },
                { id: '1y', label: '1 year' },
                { id: 'all', label: 'MAX' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id as any)}
                  className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap uppercase tracking-widest ${timeframe === tf.id ? 'bg-zinc-800 text-pink-500 shadow-xl border border-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            
            <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5 backdrop-blur-md overflow-x-auto hide-scrollbar w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 flex-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-pink-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 flex-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'goals' ? 'bg-pink-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <GoalIcon className="h-4 w-4" />
              Objectives
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 flex-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'advisor' ? 'bg-pink-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              <Cpu className="h-4 w-4" />
              Advisor
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Global Matrix Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400 mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-[0.3em]">Capital Velocity</span>
                  </div>
                  <div className="p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl h-auto md:h-[240px] flex flex-col justify-center relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 blur-[80px] rounded-full -me-20 -mt-20 group-hover:bg-pink-500/20 transition-all duration-700" />
                     <div className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500 mb-2 md:mb-4">Cumulative Liquidity</div>
                     <div className="text-4xl md:text-6xl font-black text-zinc-100 font-mono tracking-tighter mb-4 md:mb-8 leading-none italic">
                       {summaryData.totalNetWorth > 0 ? '+' : ''}{symbol}{(summaryData.totalNetWorth * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </div>
                     <div className="flex gap-4 items-center">
                        <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <div className="h-full bg-linear-to-r from-pink-500 to-orange-400 w-3/4 animate-pulse-slow" />
                        </div>
                        <span className="text-[10px] font-black font-mono text-pink-500 tracking-widest whitespace-nowrap italic">STATUS: OPTIMIZED</span>
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-3 text-zinc-400 mb-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-[0.3em]">Neural Delta</span>
                  </div>
                  <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-zinc-900/40 backdrop-blur-3xl h-auto md:h-[240px] flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full" />
                    <div className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-3">Retained Capital</div>
                    <div className="text-2xl md:text-4xl font-black text-zinc-100 font-mono tracking-widest">
                      {summaryData.totalIncome > summaryData.totalExpenses ? '+' : ''}{symbol}{((summaryData.totalIncome - summaryData.totalExpenses) * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-8 flex gap-1 items-end justify-between h-12">
                      {[15, 25, 45, 30, 20, 60, 40, 25, 35, 50, 40, 30].map((h, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-full transition-all duration-500 group-hover:scale-y-110 ${i % 3 === 0 ? 'bg-pink-500' : 'bg-white/10'}`} 
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="absolute top-0 right-0 p-2 opacity-50"><div className="h-2 w-2 rounded-full bg-cyan-400 blur-[2px]" /></div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-3 group-hover:text-cyan-400 transition-colors">Net Worth</div>
                  <div className="text-3xl font-black text-white/90 font-mono tracking-tighter">
                    {symbol}{(summaryData.totalNetWorth * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-cyan-400 w-2/3 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="absolute top-0 right-0 p-2 opacity-50"><div className="h-2 w-2 rounded-full bg-emerald-400 blur-[2px]" /></div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-3 group-hover:text-emerald-400 transition-colors">Cash Flow</div>
                  <div className={`text-3xl font-black font-mono tracking-tighter ${summaryData.totalIncome - summaryData.totalExpenses >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {symbol}{((summaryData.totalIncome - summaryData.totalExpenses) * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-bold text-white/20 uppercase tracking-widest">
                    <span>Performance Meter</span>
                    <span className="text-emerald-400/50">Optimal</span>
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="absolute top-0 right-0 p-2 opacity-50"><div className="h-2 w-2 rounded-full bg-purple-400 blur-[2px]" /></div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-3 group-hover:text-purple-400 transition-colors">Savings Rate</div>
                  <div className="text-3xl font-light text-purple-400 font-mono tracking-tighter">
                    {summaryData.totalIncome > 0 ? ((summaryData.totalIncome - summaryData.totalExpenses) / summaryData.totalIncome * 100).toFixed(1) : 0}%
                  </div>
                  <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-400" style={{ width: `${Math.min(100, Math.max(0, summaryData.totalIncome > 0 ? (summaryData.totalIncome - summaryData.totalExpenses) / summaryData.totalIncome * 100 : 0))}%` }} />
                  </div>
                </div>

                <div className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="absolute top-0 right-0 p-2 opacity-50"><div className="h-2 w-2 rounded-full bg-amber-400 blur-[2px]" /></div>
                  <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 mb-3 group-hover:text-amber-400 transition-colors">Transactions</div>
                  <div className="text-3xl font-light text-white/90 font-mono tracking-tighter">{transactions.length}</div>
                  <div className="mt-4 flex gap-1 items-center">
                    {[...Array(5)].map((_, i) => <div key={i} className={`h-1 w-3 rounded-full ${i < 4 ? 'bg-amber-400' : 'bg-white/10'}`} />)}
                  </div>
                </div>
              </div>

              {/* Charts Segment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group glass-card rounded-[2.5rem] p-8 flex flex-col h-[400px] border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 z-10">
                     {hoveredAllocation ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-end">
                         <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{hoveredAllocation.name}</div>
                         <div className="text-sm font-black font-mono text-zinc-100">{symbol}{(hoveredAllocation.value * rate).toLocaleString()}</div>
                       </motion.div>
                     ) : (
                       <Info className="h-4 w-4 text-zinc-700 hover:text-teal-400 transition-colors cursor-help" />
                     )}
                  </div>
                  <h3 className="text-xs uppercase font-black tracking-[0.3em] text-zinc-500 mb-8 border-b border-white/5 pb-4">Asset Allocation</h3>
                  <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summaryData.assetAllocation}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                          onMouseMove={(e) => {
                            if (e && e.payload) setHoveredAllocation(e.payload);
                          }}
                          onMouseLeave={() => setHoveredAllocation(null)}
                        >
                          {summaryData.assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={() => null} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Assets</span>
                       <span className="text-xl font-black text-zinc-100 font-mono italic">100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t border-white/5">
                     {summaryData.assetAllocation.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                           <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter truncate">{entry.name}</span>
                        </div>
                     ))}
                  </div>
                </div>

                <div className="group glass-card rounded-[2.5rem] p-8 flex flex-col h-[400px] border-white/5 relative overflow-hidden">
                   <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 pe-1">
                      <h3 className="text-xs uppercase font-black tracking-[0.3em] text-zinc-500">Variable Expenditures</h3>
                      {hoveredExpense && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{hoveredExpense.name}</span>
                          <span className="text-xs font-black font-mono text-zinc-100">{symbol}{(hoveredExpense.value * rate).toLocaleString()}</span>
                        </motion.div>
                      )}
                   </div>
                   <div className="flex-1 min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={summaryData.pieData} 
                        layout="vertical" 
                        margin={{ left: 10, right: 30 }}
                        onMouseMove={(e: any) => {
                          if (e && e.activePayload) setHoveredExpense(e.activePayload[0].payload);
                        }}
                        onMouseLeave={() => setHoveredExpense(null)}
                      >
                        <XAxis 
                          type="number" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} 
                          tickFormatter={(val) => `${symbol}${val < 1000 ? val : (val/1000).toFixed(1) + 'k'}`}
                          dy={5}
                        />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 'black', textTransform: 'uppercase' }} width={80} />
                        {hoveredExpense && (
                          <ReferenceLine 
                            x={hoveredExpense.value} 
                            stroke="var(--color-pink-500)" 
                            strokeDasharray="3 3" 
                            label={{ position: 'top', value: `${symbol}${(hoveredExpense.value*rate).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`, fill: 'var(--color-pink-500)', fontSize: 9, fontWeight: 'black' }} 
                          />
                        )}
                        <Tooltip
                          cursor={false}
                          content={() => null}
                          isAnimationActive={false}
                        />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={16}>
                          {summaryData.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                   </div>
                </div>
              </div>

              {/* Performance & Trends Segment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
                <div className="glass-card rounded-[2.5rem] p-8 border-white/5 flex flex-col h-[450px]">
                  <div className="flex items-center justify-between mb-8">
                     <div className="flex flex-col">
                        <h3 className="text-xs uppercase font-bold tracking-[0.3em] text-white/40">Growth Trajectory</h3>
                        {hoveredTrend && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{hoveredTrend.date}</span>
                             <span className="text-xs font-black font-mono text-pink-400">{symbol}{(hoveredTrend.balance * rate).toLocaleString()}</span>
                          </motion.div>
                        )}
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-pink-400 font-black uppercase tracking-widest bg-pink-500/5 px-2 py-1 rounded">
                       <Activity className="h-3 w-3" />
                       Interactive Node
                     </div>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart 
                        data={summaryData.trendData} 
                        margin={{ left: -20, right: 0, bottom: 20 }}
                        onMouseMove={(e: any) => {
                          if (e && e.activePayload) setHoveredTrend(e.activePayload[0].payload);
                        }}
                        onMouseLeave={() => setHoveredTrend(null)}
                      >
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-pink-500)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-pink-500)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }} 
                          tickFormatter={(val) => `${symbol}${val < 1000 ? val : (val/1000).toFixed(1) + 'k'}`}
                          dx={-10} 
                          domain={['auto', 'auto']}
                        />
                        {hoveredTrend && (
                          <ReferenceLine 
                            y={hoveredTrend.balance} 
                            stroke="var(--color-pink-500)" 
                            strokeDasharray="3 3" 
                            label={{ position: 'insideTopLeft', value: `${symbol}${(hoveredTrend.balance*rate).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`, fill: 'var(--color-pink-500)', fontSize: 10, fontWeight: 'black', offset: 5 }} 
                          />
                        )}
                        <Tooltip
                          cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                          content={() => null}
                          isAnimationActive={false}
                        />
                        <Area type="monotone" dataKey="balance" stroke="var(--color-pink-500)" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" activeDot={{ r: 6, fill: 'var(--color-pink-500)', stroke: '#111', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[300px] shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex-1">
                      <h3 className="text-xs uppercase font-bold tracking-[0.3em] text-white/40">Portfolio Momentum</h3>
                      {hoveredMomentum ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{hoveredMomentum.ticker} Delta</span>
                           <span className={`text-xs font-black font-mono ${hoveredMomentum.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {hoveredMomentum.profit >= 0 ? '+' : ''}{symbol}{(hoveredMomentum.profit * rate).toLocaleString()}
                           </span>
                        </motion.div>
                      ) : (
                        <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest font-bold">Relative Gain Distribution</p>
                      )}
                    </div>
                    <div className="flex gap-4">
                       <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest"><TrendingUp className="h-3.5 w-3.5" /> Profitable</div>
                       <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase tracking-widest"><TrendingDown className="h-3.5 w-3.5" /> Under-par</div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={summaryData.investmentPerformance} 
                        layout="vertical" 
                        margin={{ left: -10, right: 30 }}
                        onMouseMove={(e: any) => {
                          if (e && e.activePayload) setHoveredMomentum(e.activePayload[0].payload);
                        }}
                        onMouseLeave={() => setHoveredMomentum(null)}
                      >
                        <XAxis 
                          type="number" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.1)', fontWeight: 'black' }} 
                          tickFormatter={(val) => `${symbol}${val < 1000 ? val : (val/1000).toFixed(1) + 'k'}`}
                          dy={5}
                        />
                        <YAxis dataKey="ticker" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }} width={60} />
                        {hoveredMomentum && (
                          <ReferenceLine 
                            x={hoveredMomentum.profit} 
                            stroke={hoveredMomentum.profit >= 0 ? "rgba(52,211,153,0.3)" : "var(--color-rose-500)"} 
                            strokeDasharray="3 3" 
                            label={{ position: 'top', value: `${symbol}${(Math.abs(hoveredMomentum.profit)*rate).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`, fill: hoveredMomentum.profit >= 0 ? 'var(--color-emerald-400)' : 'var(--color-rose-500)', fontSize: 9, fontWeight: 'black' }} 
                          />
                        )}
                        <Tooltip
                          cursor={false}
                          content={() => null}
                          isAnimationActive={false}
                        />
                        <Bar dataKey="profit" radius={[0, 8, 8, 0]} barSize={16}>
                          {summaryData.investmentPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? 'var(--color-emerald-400)' : 'var(--color-rose-500)'} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'goals' ? (
            <motion.div
              key="goals"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                <div>
                  <h3 className="text-3xl font-black font-display text-zinc-100 tracking-tight italic">Financial <span className="gradient-text">Objectives</span></h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em] mt-2">Strategic accumulation & capital targets</p>
                </div>
                <button
                  onClick={onAddGoal}
                  className="group relative flex items-center gap-3 px-8 py-3 bg-zinc-100 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Plus className="h-4 w-4 text-zinc-900 relative z-10 transition-colors" />
                  <span className="text-[10px] font-black text-zinc-900 relative z-10 uppercase tracking-widest whitespace-nowrap">Initialize Objective</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => (
                  <div key={goal.id} className="group glass-card rounded-[2.5rem] p-8 relative overflow-hidden transition-all duration-300 hover:bg-zinc-900/60">
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="absolute top-6 end-6 p-2 text-zinc-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                      <div className="mb-8">
                        <span className="text-[9px] uppercase font-black text-pink-500/80 tracking-[0.3em] italic">{goal.category}</span>
                        <input
                          value={goal.name}
                          onChange={(e) => onUpdateGoal(goal.id, 'name', e.target.value)}
                          placeholder="Define Objective..."
                          className="bg-transparent text-2xl font-black font-display text-zinc-100 outline-none w-full placeholder:text-zinc-800 transition-all focus:placeholder:opacity-0 italic uppercase"
                        />
                      </div>

                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4">
                        <div className="flex flex-col gap-1 flex-1 w-full">
                          <div className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em]">Position</div>
                          <div className="flex items-center text-2xl font-black font-mono text-zinc-100 relative w-full">
                            <span className="me-1">{symbol}</span>
                            <div className="relative flex-1">
                              <input
                                type="number"
                                value={goal.currentAmount === 0 ? '' : Number((goal.currentAmount * rate).toFixed(2)).toString()}
                                onChange={(e) => onUpdateGoal(goal.id, 'currentAmount', (parseFloat(e.target.value) || 0) / rate)}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="bg-transparent w-full outline-none border-b-2 border-transparent focus:border-teal-500/20 transition-all peer focus:opacity-100 opacity-0"
                              />
                              <div className="absolute inset-0 pointer-events-none peer-focus:hidden flex items-center truncate">
                                {(goal.currentAmount * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-1 w-full md:text-end">
                          <div className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em]">Target</div>
                          <div className="flex items-center justify-start md:justify-end text-2xl font-black font-mono text-zinc-500 relative w-full">
                             <span className="me-1">{symbol}</span>
                             <div className="relative flex-1 md:flex-none md:min-w-[150px]">
                               <input
                                type="number"
                                value={goal.targetAmount === 0 ? '' : Number((goal.targetAmount * rate).toFixed(2)).toString()}
                                onChange={(e) => onUpdateGoal(goal.id, 'targetAmount', (parseFloat(e.target.value) || 0) / rate)}
                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                className="bg-transparent w-full outline-none border-b-2 border-transparent focus:border-teal-500/20 md:text-end transition-all peer focus:opacity-100 opacity-0"
                              />
                              <div className="absolute inset-0 pointer-events-none peer-focus:hidden flex items-center justify-start md:justify-end truncate">
                                {(goal.targetAmount * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative h-3 w-full bg-zinc-800/50 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                          className={`h-full bg-linear-to-r from-pink-500 to-orange-400 shadow-[0_0_15px_var(--color-pink-500)]`}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-600 tracking-[0.3em]">Status</span>
                        <span className="text-pink-500 font-mono text-xs italic">{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
             <motion.div
              key="advisor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black font-display text-zinc-100 tracking-tight italic">AI <span className="gradient-text">Advisor</span></h3>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em] mt-2">Neural wealth strategy & risk mitigation protocols</p>
                </div>
                {loadingAi && (
                  <div className="flex items-center gap-3 text-pink-400 text-[10px] font-black tracking-widest animate-pulse px-4 py-2 rounded-full border border-pink-500/20 bg-pink-500/5 shadow-neon-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    OPTIMIZING NEURAL NETWORK...
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {['Safe Zone', 'Wealth Building', 'Goal Strategy'].map(cat => (
                  <div key={cat} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                       <div className={`h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${cat === 'Safe Zone' ? 'bg-emerald-400 shadow-emerald-500/50' : cat === 'Wealth Building' ? 'bg-purple-400 shadow-purple-500/50' : 'bg-cyan-400 shadow-cyan-500/50'}`} />
                       <span className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-400">{cat}</span>
                    </div>
                    <div className="space-y-4">
                      {aiTips.filter(tip => tip.category === cat).map((tip, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-pink-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="text-base font-black font-display text-zinc-100 mb-2 group-hover:text-pink-400 transition-colors uppercase tracking-tight italic">{tip.title}</div>
                          <div className="text-sm text-zinc-500 leading-relaxed font-medium">{tip.suggestion}</div>
                        </motion.div>
                      ))}
                      {aiTips.filter(tip => tip.category === cat).length === 0 && !loadingAi && (
                        <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest italic py-8 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                          No directives retrieved for this sector
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Strategy Summary Card */}
                <div className="p-12 rounded-[3.5rem] border border-white/5 bg-pink-500/[0.03] backdrop-blur-3xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 to-transparent opacity-50" />
                   <div className="h-16 w-16 rounded-3xl bg-pink-500/10 flex items-center justify-center mb-8 shadow-neon-sm relative z-10">
                      <Cpu className="h-8 w-8 text-pink-400" />
                   </div>
                   <h4 className="text-lg font-black text-zinc-100 font-display uppercase tracking-widest mb-6 relative z-10 italic">Autonomous Wealth Engine</h4>
                   <p className="text-sm text-zinc-500 leading-relaxed max-w-sm font-medium relative z-10">
                     Our proprietary AI evalutates liquidity velocity, risk exposure, and market sentiment to deliver millisecond-accurate wealth preservation strategies.
                   </p>
                   <div className="mt-12 pt-12 border-t border-white/5 w-full relative z-10">
                      <div className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em] mb-4">Neural Reliability Rating</div>
                      <div className="flex justify-center gap-2">
                         {[...Array(5)].map((_, i) => (
                           <motion.div 
                             key={i} 
                             initial={{ opacity: 0.2 }}
                             animate={{ opacity: 1 }}
                             transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2, repeatType: 'reverse' }}
                             className={`h-1.5 w-8 rounded-full bg-teal-500/40`} 
                           />
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
