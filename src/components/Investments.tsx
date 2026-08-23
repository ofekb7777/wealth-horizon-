import { Plus, Trash2, Search, RefreshCcw, ExternalLink, TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Investment, Currency, CURRENCIES } from '../types';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useVersion } from '../context/VersionContext';

interface InvestmentsProps {
  investments: Investment[];
  lastSynced?: string;
  onUpdateInvestment: (id: string, field: keyof Investment, value: any) => void;
  onAddInvestment: (tickerData?: any) => void;
  onDeleteInvestment: (id: string) => void;
  currency: Currency;
}

export default function Investments({
  investments,
  lastSynced,
  onUpdateInvestment,
  onAddInvestment,
  onDeleteInvestment,
  currency
}: InvestmentsProps) {
  const { version } = useVersion();
  const [searchQuery, setSearchQuery] = useState('');
  const [tickerResults, setTickerResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<Record<string, any>>({});
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [sortConfig, setSortConfig] = useState<{ field: 'ticker' | 'price' | 'netWorth', direction: 'asc' | 'desc' } | null>(null);
  
  const symbol = CURRENCIES[currency].symbol;
  const rate = CURRENCIES[currency].rate;

  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [pricingStatus, setPricingStatus] = useState<Record<string, 'up' | 'down' | 'neutral'>>({});
  const prevPrices = useRef<Record<string, number>>({});

  useEffect(() => {
    const newStatus: Record<string, 'up' | 'down' | 'neutral'> = { ...pricingStatus };
    let hasChange = false;

    investments.forEach(inv => {
      const prev = prevPrices.current[inv.id];
      if (prev !== undefined && inv.currentPrice !== prev) {
        newStatus[inv.id] = inv.currentPrice > prev ? 'up' : 'down';
        hasChange = true;
        
        // Reset status after a brief moment to end the animation
        setTimeout(() => {
          setPricingStatus(prev => ({ ...prev, [inv.id]: 'neutral' }));
        }, 2000);
      }
      prevPrices.current[inv.id] = inv.currentPrice;
    });

    if (hasChange) {
      setPricingStatus(newStatus);
    }
  }, [investments]);

  // Fetch analytics for all investments
  useEffect(() => {
    const fetchAnalytics = async () => {
      const tickers = investments.map(i => i.ticker).filter(Boolean);
      if (tickers.length === 0) return;
      
      setIsFetchingAnalytics(true);
      try {
        const res = await fetch(`/api/analytics?tickers=${tickers.join(',')}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAnalyticsData(data);
      } catch (e) {
        console.error("Analytics fetch failed", e);
      } finally {
        setIsFetchingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [investments.length]); // Refetch if count changes, otherwise rely on manual sync if needed

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setTickerResults([]);
        setErrorDetails(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (val: string) => {
    setIsSearching(true);
    setErrorDetails(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) {
        setErrorDetails(data.details || data.error);
        setTickerResults([]);
      } else {
        setTickerResults(data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setErrorDetails('Network error occurred.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleSort = (field: 'ticker' | 'price' | 'netWorth') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const selectTicker = (t: any) => {
    onAddInvestment(); // Create the item in state
    // We need to update the newly added item (the last one)
    // Actually, it's better if onAddInvestment accepts the ticker
    // But since the parent state update is async, I'll modify the parent to accept the ticker.
    setIsModalOpen(false);
    setSearchQuery('');
    setTickerResults([]);
  };

  const filteredInvestments = useMemo(() => {
    let sorted = [...investments];
    if (sortConfig) {
      sorted.sort((a, b) => {
        let aVal: number | string, bVal: number | string;
        if (sortConfig.field === 'ticker') {
          aVal = (a.ticker || '').toLowerCase();
          bVal = (b.ticker || '').toLowerCase();
        } else if (sortConfig.field === 'price') {
          aVal = a.currentPrice;
          bVal = b.currentPrice;
        } else if (sortConfig.field === 'netWorth') {
          aVal = a.shares * a.currentPrice;
          bVal = b.shares * b.currentPrice;
        } else {
          return 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [investments, sortConfig]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative">
      {/* Toolbar */}
      <div className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 shrink-0 shadow-sm sticky top-0 z-10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative flex items-center gap-3 px-6 py-2.5 bg-zinc-100 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-4 w-4 text-zinc-900 relative z-10 transition-colors" />
          <span className="text-[10px] font-black text-zinc-900 relative z-10 uppercase tracking-widest whitespace-nowrap">Connect Asset</span>
        </button>

        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] hidden md:block">
          Portfolio Management System v{version}
        </div>
      </div>

      {/* Add Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="glass-card rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/5">
            <div className="p-6 md:p-10 border-b border-white/5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl md:text-4xl font-black font-display text-zinc-100 tracking-tighter uppercase leading-none italic">Asset <span className="gradient-text">Selector</span></h3>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-2">Global Market Registry // Live Node</p>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setTickerResults([]);
                  setSearchQuery('');
                }} 
                className="text-zinc-500 hover:text-white transition-all p-2 group"
              >
                <div className="font-black text-[10px] uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">[ Close ]</div>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-10">
              <div className="relative group/search">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-6 md:h-8 w-6 md:w-8 text-zinc-700 group-focus-within/search:text-pink-500 transition-colors z-10" />
                <input 
                  id="investment-search-input"
                  autoFocus
                  type="text"
                  placeholder="IDENTIFY TICKER..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/5 py-3 md:py-6 pl-10 md:pl-14 text-xl md:text-4xl font-black text-zinc-100 placeholder:text-zinc-800 outline-none transition-all uppercase tracking-tighter focus:border-pink-500/50 italic"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {isSearching && (
                    <div className="h-6 w-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {tickerResults.length > 0 ? (
                  <>
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2 mb-2">Search Results</h4>
                    {tickerResults.map((t) => (
                      <button
                        key={t.symbol}
                        onClick={() => {
                          onAddInvestment({
                            ticker: t.symbol,
                            name: t.shortname,
                            exchange: t.exchange
                          }); 
                          setIsModalOpen(false);
                          setTickerResults([]);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-teal-400/40 hover:bg-zinc-800/80 transition-all text-left group"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-lg text-zinc-100 group-hover:text-teal-400 truncate">{t.symbol}</span>
                          <span className="text-[10px] font-medium text-zinc-500 truncate">{t.shortname} • {t.exchange}</span>
                        </div>
                        <Plus className="h-4 w-4 text-zinc-600 group-hover:text-teal-400 shrink-0" />
                      </button>
                    ))}
                  </>
                ) : errorDetails ? (
                  <div className="p-10 glass-card rounded-[2.5rem] text-center border-rose-500/20">
                    <div className="text-zinc-100 font-black uppercase tracking-widest mb-2">Protocol Error</div>
                    <div className="text-rose-400 text-[10px] font-mono">{errorDetails}</div>
                  </div>
                ) : searchQuery ? (
                  <div className="p-10 text-center text-zinc-500">
                    <Search className="h-8 w-8 mx-auto mb-4 text-zinc-800" />
                    <p className="font-black uppercase tracking-widest text-sm">No results for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2">Strategic Benchmarks</h4>
                     <div className="grid grid-cols-2 gap-4">
                       {[
                         { s: 'SPY', n: 'S&P 500' },
                         { s: 'QQQ', n: 'Nasdaq 100' },
                         { s: 'AAPL', n: 'Apple Inc.' },
                         { s: 'NVDA', n: 'NVIDIA' },
                         { s: 'BTC-USD', n: 'Bitcoin' },
                         { s: 'TSLA', n: 'Tesla' }
                       ].map(item => (
                         <button 
                           key={item.s}
                           onClick={() => {
                             onAddInvestment(item.s);
                             setIsModalOpen(false);
                           }}
                           className="group p-4 bg-white/[0.02] border border-white/10 rounded-2xl text-left hover:border-teal-400/40 hover:bg-teal-400/5 transition-all"
                         >
                           <div className="text-sm font-black text-zinc-100 group-hover:text-teal-400">{item.s}</div>
                           <div className="text-[9px] font-medium text-zinc-500 mt-0.5 line-clamp-1">{item.n}</div>
                         </button>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/5 flex justify-between items-center shrink-0">
               <div className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">Integrated Wealth Core // Data v0{version}</div>
               <div className="h-[2px] w-12 bg-teal-500/20"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 md:px-8 py-8 md:pb-8 pb-32">
        <div className="max-w-[1600px] mx-auto space-y-12">
          {/* Main Registry Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-6xl font-black font-display text-zinc-100 tracking-tighter uppercase italic leading-none">Security <span className="gradient-text">Registry</span></h2>
              <div className="flex items-center gap-4 mt-6">
                <p className="text-xs font-black text-zinc-350 uppercase tracking-widest">Integrated Portfolio Node</p>
                {lastSynced && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/20">
                    <RefreshCcw className="h-3 w-3 text-teal-350 animate-pulse" />
                    <span className="text-xs font-black text-teal-350 uppercase tracking-widest">Active Sync: {lastSynced}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Global Timeframe Selector */}
            <div className="flex items-center gap-4 w-full overflow-x-auto pb-2 sm:pb-0 sm:overflow-visible">
              <div className="flex flex-nowrap items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0">
                {(['ticker', 'price', 'netWorth'] as const).map((field) => (
                  <button
                    key={field}
                    onClick={() => handleSort(field)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      sortConfig?.field === field
                        ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.15)] scale-102 font-black'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent font-extrabold'
                    }`}
                  >
                    {field === 'netWorth' ? 'Sort by Net Worth' : 'Sort by ' + field}
                  </button>
                ))}
              </div>

              <div className="flex flex-nowrap items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl shrink-0">
                {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 md:px-5 lg:px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all min-w-[3rem] md:min-w-[3.5rem] text-center shrink-0 whitespace-nowrap ${
                      timeframe === tf 
                        ? 'bg-teal-500/25 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(45,212,191,0.15)] scale-102 font-black' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent font-extrabold'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
          {filteredInvestments.map((t) => {
          const totalValue = t.shares * t.currentPrice;
          const gainLoss = totalValue - (t.shares * t.avgPrice);
          const status = pricingStatus[t.id] || 'neutral';
          
          return (
          <div key={t.id} className="glass-card rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-2xl relative group overflow-visible transition-all duration-200 border border-white/5 hover:border-white/10">
            <button
               onClick={() => onDeleteInvestment(t.id)}
               className="absolute -top-3 -right-3 z-50 text-zinc-400 hover:text-rose-400 p-3 rounded-full bg-zinc-900 border border-white/10 shadow-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-95"
               title="Remove Investment"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
                 <div className="flex flex-col items-start">
                    <div className="flex items-center justify-between w-full mb-3">
                       <div className="flex items-center gap-2">
                          <span className="text-zinc-350 text-xs font-extrabold tracking-widest uppercase">Security Cluster</span>
                          {t.exchange && <span className="px-2.5 py-1 bg-zinc-800 rounded-lg text-[10px] font-black text-teal-300 uppercase tracking-widest border border-white/5">{t.exchange}</span>}
                       </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                             onClick={async () => {
                               if (!t.ticker) return;
                               try {
                                 const res = await fetch(`/api/prices?tickers=${t.ticker}`);
                                 if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                 const data = await res.json();
                                 if (data[t.ticker]) {
                                   onUpdateInvestment(t.id, 'currentPrice', data[t.ticker]);
                                 }
                               } catch (e) {
                                 console.error("Manual sync failed", e);
                                }
                             }}
                             className="text-zinc-500 hover:text-teal-400 p-2 rounded-full hover:bg-teal-500/10 transition-all"
                             title="Manual Sync"
                          >
                             <RefreshCcw className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                    <div className="flex flex-col">
                       <div className="font-display text-4xl md:text-5xl font-black text-zinc-100 tracking-tighter leading-none mb-2 uppercase italic">
                          {t.ticker || "UNDEFINED"}
                       </div>
                       {t.name && <div className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none mb-4">{t.name}</div>}
                    </div>
                 </div>

                 <div className="flex flex-col items-start md:items-end">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-zinc-350 text-xs font-extrabold tracking-widest uppercase">Live Market Node</span>
                    </div>
                    <motion.div 
                      key={t.currentPrice}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.3 }}
                      className="font-display text-5xl font-black text-zinc-100 tracking-tighter leading-none"
                    >
                       {symbol}{(totalValue * rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                     </motion.div>
                    <div className={`text-sm font-black font-mono mt-3 px-3 py-1 rounded-lg ${gainLoss >= 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                       {gainLoss >= 0 ? '+' : ''}{(gainLoss * rate).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({t.avgPrice > 0 ? ((gainLoss / (t.shares * t.avgPrice)) * 100).toFixed(2) : '0.00'}%)
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 py-6 border-t border-white/5 mt-6 border-b border-white/5 mb-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs sm:text-sm uppercase text-zinc-300 font-extrabold tracking-widest">Ticker</span>
                    <input
                      type="text"
                      value={t.ticker}
                      onChange={(e) => onUpdateInvestment(t.id, 'ticker', e.target.value.toUpperCase())}
                      className="w-full bg-zinc-800/40 px-3 md:px-4 py-2 md:py-3 rounded-2xl outline-none font-black text-xl md:text-2xl text-pink-500 italic focus:bg-zinc-800 transition-all uppercase border border-white/5 focus:border-pink-400/30"
                      placeholder="TICKER"
                    />
                  </div>
                <div className="col-span-2 flex flex-col gap-1.5 group/holdings relative">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm uppercase text-zinc-300 font-extrabold tracking-widest">Holdings & Amount</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <div className="relative w-full">
                      <input
                        type="number"
                        value={t.shares === 0 ? '' : Number(t.shares).toString()}
                        onChange={(e) => onUpdateInvestment(t.id, 'shares', parseFloat(e.target.value) || 0)}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        className="w-full bg-zinc-800/40 px-4 py-3 rounded-2xl outline-none font-mono text-lg text-zinc-100 font-black focus:bg-zinc-800 transition-all border border-white/5 focus:border-white/20 focus:ring-0 peer opacity-0 focus:opacity-100"
                        placeholder="Shares"
                      />
                      <div className="absolute inset-0 pointer-events-none px-4 py-3 font-mono text-lg text-zinc-100 flex items-center peer-focus:hidden font-black truncate">
                        {t.shares.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}
                      </div>
                    </div>
                    <div className="relative w-full">
                      <input
                        type="number"
                        value={t.shares * t.avgPrice === 0 ? '' : Number((t.shares * t.avgPrice * rate).toFixed(2)).toString()}
                        onChange={(e) => {
                          const amount = (parseFloat(e.target.value) || 0) / rate;
                          const price = t.avgPrice > 0 ? t.avgPrice : t.currentPrice;
                          if (price > 0) {
                            onUpdateInvestment(t.id, 'shares', amount / price);
                            if (t.avgPrice === 0) {
                              onUpdateInvestment(t.id, 'avgPrice', price);
                            }
                          }
                        }}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                        className="w-full bg-zinc-800/40 px-4 py-3 rounded-2xl outline-none font-mono text-lg text-zinc-100 font-black focus:bg-zinc-800 transition-all border border-white/5 focus:border-white/20 focus:ring-0 peer opacity-0 focus:opacity-100"
                        placeholder="Amount"
                      />
                      <div className="absolute inset-0 pointer-events-none px-4 py-3 font-mono text-lg text-zinc-100 flex items-center peer-focus:hidden font-black truncate">
                        {(t.shares * t.avgPrice * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                  </div>
                </div>
                </div>

                <div className="flex flex-col gap-1.5 group/buying relative min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm uppercase text-zinc-300 font-extrabold tracking-widest">Buying Point {symbol}</span>
                  </div>
                  <div className="relative w-full min-w-0">
                    <input
                      type="number"
                      value={t.avgPrice === 0 ? '' : Number((t.avgPrice * rate).toFixed(2)).toString()}
                      onChange={(e) => onUpdateInvestment(t.id, 'avgPrice', (parseFloat(e.target.value) || 0) / rate)}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      className="w-full bg-zinc-800/40 px-4 py-3 rounded-2xl outline-none font-mono text-lg text-zinc-100 font-black focus:bg-zinc-800 transition-all border border-white/5 focus:border-white/20 focus:ring-0 peer opacity-0 focus:opacity-100"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-0 pointer-events-none px-4 py-3 font-mono text-lg text-zinc-100 flex items-center peer-focus:hidden font-black truncate">
                      {(t.avgPrice * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 group/quote relative min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm uppercase text-zinc-300 font-extrabold tracking-widest">Live Quote {symbol}</span>
                  </div>
                  <div className="relative w-full min-w-0 px-4 py-3 border border-pink-400/20 rounded-2xl bg-pink-400/5">
                    <div className="font-mono text-lg text-pink-400 font-black truncate italic">
                      {(t.currentPrice * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>


              {/* Enhanced Analytics Section (TradingView Inspired) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
                 {/* 1. Global Timeframe Performance Node */}
                 <div className="lg:col-span-3 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                       <Activity className="h-4 w-4 text-zinc-400" />
                       <span className="text-xs font-black text-zinc-350 uppercase tracking-widest">Timeline Perf ({timeframe})</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Activity className="h-20 w-20" />
                       </div>
                       {(() => {
                          const val = analyticsData[t.ticker]?.perf?.[timeframe] || 0;
                          return (
                             <div className="relative z-10">
                                <div className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3">{timeframe} Net Delta</div>
                                <div className={`text-4xl lg:text-5xl font-black font-mono tracking-tighter ${val >= 0 ? 'text-emerald-450' : 'text-rose-455'}`}>
                                   {val >= 0 ? '+' : ''}{val.toFixed(2)}%
                                </div>
                             </div>
                          );
                       })()}
                    </div>
                 </div>

                 {/* 2. Technical Summary Gauge */}
                 <div className="lg:col-span-5 flex flex-col gap-4 lg:border-x lg:border-white/5 lg:px-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-zinc-400" />
                          <span className="text-xs font-black text-zinc-350 uppercase tracking-widest">Technical Sentiment</span>
                       </div>
                       <div className="text-xs font-black text-teal-300 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/35 uppercase tracking-widest">Live Engine</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center gap-6">
                       <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-y-0 left-0 w-full flex">
                             <div className="h-full w-[20%] bg-rose-500/40" />
                             <div className="h-full w-[20%] bg-rose-500/20" />
                             <div className="h-full w-[20%] bg-zinc-700" />
                             <div className="h-full w-[20%] bg-emerald-500/20" />
                             <div className="h-full w-[20%] bg-emerald-400/40" />
                          </div>
                          {/* Needle based on score */}
                          {(() => {
                             const score = analyticsData[t.ticker]?.score || 0;
                             const position = ((score + 4) / 8) * 100; // Map -4..+4 to 0..100
                             return (
                                <div 
                                   className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-white shadow-[0_0_8px_white] z-10 transition-all duration-1000 ease-out" 
                                   style={{ left: `${Math.min(98, Math.max(2, position))}%` }}
                                />
                             );
                          })()}
                       </div>
                       
                       <div className="flex justify-between items-center px-1">
                          <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Strong Sell</span>
                          <div className="flex flex-col items-center">
                             <div className={`text-2xl font-black font-display uppercase italic tracking-tighter ${
                                (analyticsData[t.ticker]?.score || 0) > 0 ? 'text-emerald-400' : 
                                (analyticsData[t.ticker]?.score || 0) < 0 ? 'text-rose-400' : 'text-zinc-400'
                             }`}>
                                {analyticsData[t.ticker]?.rating || 'Analyzing...'}
                             </div>
                          </div>
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Strong Buy</span>
                       </div>

                       {/* MA Indicators */}
                       <div className="flex items-center justify-between gap-4">
                          {[
                             { l: 'MA20', v: analyticsData[t.ticker]?.ma20 },
                             { l: 'MA50', v: analyticsData[t.ticker]?.ma50 },
                             { l: 'MA200', v: analyticsData[t.ticker]?.ma200 }
                          ].map(ma => (
                             <div key={ma.l} className="flex-1 p-3 rounded-2xl bg-zinc-800/40 border border-white/5 flex flex-col items-center">
                                <span className="text-xs font-extrabold text-zinc-350 uppercase mb-1">{ma.l}</span>
                                <span className={`text-[13px] font-black font-mono ${t.currentPrice > (ma.v || 0) ? 'text-emerald-400' : 'text-rose-400'}`}>
                                   {ma.v ? `${symbol}${(ma.v * rate).toFixed(2)}` : '---'}
                                </span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* 3. Real Performance Chart */}
                 <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-zinc-400" />
                          <span className="text-xs font-black text-zinc-350 uppercase tracking-widest">Asset Trajectory</span>
                       </div>
                       {analyticsData[t.ticker]?.history && (
                          <div className="text-xs font-black text-teal-300 px-3 py-1 bg-teal-500/10 rounded-full border border-teal-500/35 uppercase tracking-widest">{timeframe} Snapshot</div>
                       )}
                    </div>
                    <div className="h-[140px] w-full relative group/chart">
                       <div className="absolute inset-0 bg-linear-to-b from-teal-500/[0.02] to-transparent rounded-[2rem]" />
                       {analyticsData[t.ticker]?.history ? (
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={(() => {
                                const hist = analyticsData[t.ticker].history;
                                if (timeframe === '1M') return hist.slice(-21);
                                if (timeframe === '3M') return hist.slice(-63);
                                if (timeframe === '6M') return hist.slice(-126);
                                return hist; // 1Y
                             })()}>
                                <defs>
                                   <linearGradient id={`gauge-gradient-${t.id}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                                   </linearGradient>
                                </defs>
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip
                                  cursor={{ stroke: 'rgba(45,212,191,0.2)', strokeWidth: 1 }}
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-zinc-900/90 border border-white/5 rounded-md p-1.5 shadow-xl backdrop-blur-sm">
                                          <div className="text-[9px] font-black text-teal-400 font-mono">
                                            {symbol}{(Number(payload[0].value) * rate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Area 
                                   type="monotone" 
                                   dataKey="price" 
                                   stroke="#2dd4bf" 
                                   fillOpacity={1} 
                                   fill={`url(#gauge-gradient-${t.id})`} 
                                   strokeWidth={2.5}
                                   animationDuration={500}
                                   activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#0c0c0e', strokeWidth: 2 }}
                                />
                             </AreaChart>
                          </ResponsiveContainer>
                       ) : (
                          <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem]">
                             <RefreshCcw className="h-6 w-6 text-zinc-800 animate-spin" />
                          </div>
                       )}
                    </div>
                 </div>
              </div>

            </div>
          </div>
        );
      })}
          {filteredInvestments.length === 0 && (
            <div className="text-center text-zinc-500 mt-10">
              {searchQuery ? `No results for "${searchQuery}"` : "No active investments. Add an asset above."}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
