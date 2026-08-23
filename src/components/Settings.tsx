import { useState } from 'react';
import { Theme, BgEffect, MonoStyle } from '../context/ThemeContext';
import { Currency, CURRENCIES, SpreadsheetState } from '../types';
import { 
  Palette, 
  Sparkles, 
  Coins, 
  User as UserIcon, 
  ShieldAlert, 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  Settings as SettingsIcon,
  ChevronDown,
  Database,
  Lock,
  Globe,
  RefreshCw,
  FolderSync
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RemindersWidget from './RemindersWidget';
import { getApiKey, setApiKey } from '../services/geminiService';

interface SettingsProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  bgEffect: BgEffect;
  onSetBgEffect: (effect: BgEffect) => void;
  monoStyle: MonoStyle;
  onSetMonoStyle: (style: MonoStyle) => void;
  currency: Currency;
  onSetCurrency: (currency: Currency) => void;
  state: SpreadsheetState;
  onImportState: (state: SpreadsheetState) => void;
  onResetData: () => void;
  onAddReminder: (subject: string, body: string, time: string, recurrence?: 'monthly', dayOfMonth?: number) => void;
  onDeleteReminder: (id: string) => void;
}

export default function Settings({
  theme,
  onSetTheme,
  bgEffect,
  onSetBgEffect,
  monoStyle,
  onSetMonoStyle,
  currency,
  onSetCurrency,
  state,
  onImportState,
  onResetData,
  onAddReminder,
  onDeleteReminder
}: SettingsProps) {
  const [activeDropdown, setActiveDropdown] = useState<'theme' | 'effect' | 'currency' | 'backup' | 'reset' | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => getApiKey());
  const [keySaved, setKeySaved] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const toggleDropdown = (type: 'theme' | 'effect' | 'currency' | 'backup' | 'reset') => {
    setActiveDropdown(prev => prev === type ? null : type);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `wealth-horizon-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions && json.accounts) {
          onImportState(json);
          alert('Backup restored successfully.');
          setActiveDropdown(null);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        console.error('Import failed', err);
        alert('Failed to parse backup snapshot.');
      }
    };
    reader.readAsText(file);
  };

  const themesList: { id: Theme; label: string; color: string }[] = [
    { id: 'default', label: 'Horizon Pink', color: '#ec4899' },
    { id: 'mono', label: 'Black & White', color: '#000000' },
    { id: 'crimson', label: 'Crimson Cyber', color: '#f43f5e' },
    { id: 'gold', label: 'Gilded Amber', color: '#fbbf24' },
    { id: 'forest', label: 'Forest Jade', color: '#059669' },
    { id: 'royal', label: 'Royal Sapphire', color: '#3b82f6' },
    { id: 'lavender', label: 'Nebula Violet', color: '#8b5cf6' }
  ];

  const ambientEffects: { id: BgEffect; label: string; icon: string; desc: string }[] = [
    { id: 'none', label: 'No Effects', icon: '✕', desc: 'Static backing for optimal energy efficiency' },
    { id: 'cateyes', label: 'Colossal Eyes', icon: '👁️', desc: 'Blinking predatory eyes pacing in the backing' },
    { id: 'leaves', label: 'Sakura Cascade', icon: '🌸', desc: 'Falling cherry blossoms floating vertically' },
    { id: 'sparks', label: 'Glow Embers', icon: '✨', desc: 'Microscopic thermal particle storm rise' }
  ];

  const currentThemeObj = themesList.find(t => t.id === theme) || themesList[0];
  const currentEffectObj = ambientEffects.find(e => e.id === bgEffect) || ambientEffects[0];
  const appCurrencies = Object.keys(CURRENCIES) as Currency[];
  const currencyNames: Record<Currency, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    ILS: 'Israeli Shekel'
  };

  return (
    <div className="flex-1 space-y-8">
      {/* Visual Header matching Admin Panel exactly */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-pink-500/20 rounded-xl border border-pink-500/30">
            <SettingsIcon className="h-5 w-5 text-pink-400" />
          </div>
          <h1 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">Settings Console</h1>
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest ml-12">
          Configure Preferences & Control Dashboard Nodes
        </p>
      </div>

      {/* Grid pattern styled exactly like Admin Console tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Theme Option */}
        <div className="relative w-full flex flex-col justify-between h-full">
          <button 
            onClick={() => toggleDropdown('theme')}
            className={`p-4 border border-zinc-500/20 space-y-2 flex flex-col items-center justify-center text-center 
              transition-all duration-200 w-full rounded-2xl relative group min-h-[140px]
              glass-card bg-zinc-900/40
              shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer
              ${activeDropdown === 'theme' ? 'border-pink-500/50 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]' : 'hover:border-pink-500/20'}`}
          >
            <div className="p-2 w-fit rounded-xl bg-pink-500/10 border border-pink-500/20">
              <Palette className="h-5 w-5 text-pink-400" />
            </div>
            
            <div className="flex flex-col gap-1 items-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active UI Theme</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                {theme === 'mono' ? (monoStyle === 'light' ? 'Black & White' : 'White & Black') : currentThemeObj.label}
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${activeDropdown === 'theme' ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          {/* Sub-control for Monochrome style selection */}
          {/* Theme Dropdown matching active topology node details */}
          <AnimatePresence>
            {activeDropdown === 'theme' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-left cursor-default"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1 mb-1 border-b border-white/5 pb-1">Select Visual Scheme</h4>
                <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-hide font-display">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (t.id === 'mono') {
                          if (theme === 'mono') {
                            onSetMonoStyle?.(monoStyle === 'light' ? 'dark' : 'light');
                          } else {
                            onSetTheme('mono');
                          }
                          // Do not close so user can toggle
                        } else {
                          onSetTheme(t.id);
                          setActiveDropdown(null);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        theme === t.id 
                          ? (t.id === 'mono' ? (monoStyle === 'light' ? 'bg-black/10 text-black' : 'bg-white/10 text-white') : 'bg-pink-500/10 text-pink-400')
                          : (theme === 'mono' && monoStyle === 'light' ? 'hover:bg-black/5 text-zinc-600' : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200')
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className={`font-bold truncate text-[10px] uppercase tracking-wider ${theme === t.id && t.id === 'mono' ? 'text-zinc-100' : ''}`}>
                          {t.id === 'mono' ? (monoStyle === 'light' ? 'Black & White' : 'White & Black') : t.label}
                        </span>
                      </div>
                      <div className="h-2.5 w-2.5 rounded-full border border-black" style={{ backgroundColor: t.id === 'mono' ? (monoStyle === 'light' ? '#ffffff' : '#000000') : t.color }} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card 2: Background Effects Option */}
        <div className="relative w-full">
          <button 
            onClick={() => toggleDropdown('effect')}
            className={`p-4 border border-zinc-500/20 space-y-2 flex flex-col items-center justify-center text-center 
              transition-all duration-200 w-full rounded-2xl relative group min-h-[140px]
              glass-card bg-zinc-900/40
              shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer
              ${activeDropdown === 'effect' ? 'border-orange-500/50 shadow-[0_20px_40px_-15px_rgba(249,115,22,0.3)]' : 'hover:border-orange-500/20'}`}
          >
            <div className="p-2 w-fit rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Sparkles className="h-5 w-5 text-orange-400" />
            </div>
            
            <div className="flex flex-col gap-1 items-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ambient Canvas</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                {currentEffectObj.label}
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${activeDropdown === 'effect' ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          <AnimatePresence>
            {activeDropdown === 'effect' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-left cursor-default space-y-2"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1 mb-1 border-b border-white/5 pb-1">Ambient Atmosphere</h4>
                <div className="space-y-1">
                  {ambientEffects.map((ae) => (
                    <button
                      key={ae.id}
                      onClick={() => {
                        onSetBgEffect(ae.id);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors text-left ${
                        bgEffect === ae.id 
                          ? 'bg-orange-500/10 text-orange-400' 
                          : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className="text-sm">{ae.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[10px] uppercase tracking-wider">{ae.label}</span>
                        <span className="text-[7px] text-zinc-500 truncate">{ae.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card 3: Currency Preference */}
        <div className="relative w-full">
          <button 
            onClick={() => toggleDropdown('currency')}
            className={`p-4 border border-zinc-500/20 space-y-2 flex flex-col items-center justify-center text-center 
              transition-all duration-200 w-full rounded-2xl relative group min-h-[140px]
              glass-card bg-zinc-900/40
              shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer
              ${activeDropdown === 'currency' ? 'border-teal-500/50 shadow-[0_20px_40px_-15px_rgba(20,184,166,0.3)]' : 'hover:border-teal-500/20'}`}
          >
            <div className="p-2 w-fit rounded-xl bg-teal-500/10 border border-teal-500/20">
              <Coins className="h-5 w-5 text-teal-400" />
            </div>
            
            <div className="flex flex-col gap-1 items-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Currency</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                {currency} ({CURRENCIES[currency].symbol})
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${activeDropdown === 'currency' ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          <AnimatePresence>
            {activeDropdown === 'currency' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-left cursor-default"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1 mb-1 border-b border-white/5 pb-1">Native Standard</h4>
                <div className="space-y-1">
                  {appCurrencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        onSetCurrency(curr);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        currency === curr 
                          ? (theme === 'mono' && monoStyle === 'light' ? 'bg-black/10 text-black' : (theme === 'mono' ? 'bg-white/10 text-white' : 'bg-teal-500/10 text-teal-400'))
                          : (theme === 'mono' && monoStyle === 'light' ? 'hover:bg-black/5 text-zinc-600' : 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200')
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[10px] uppercase tracking-wider">{curr} - {currencyNames[curr]}</span>
                        <span className="text-[7px] text-zinc-500 font-mono">Precision System Rate Matrix</span>
                      </div>
                      <span className="text-[11px] font-mono font-black">{CURRENCIES[curr].symbol}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card 5: Snapshot Backups */}
        <div className="relative w-full">
          <button 
            onClick={() => toggleDropdown('backup')}
            className={`p-4 border border-zinc-500/20 space-y-2 flex flex-col items-center justify-center text-center 
              transition-all duration-200 w-full rounded-2xl relative group min-h-[140px]
              glass-card bg-zinc-900/40
              shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer
              ${activeDropdown === 'backup' ? 'border-sky-500/50 shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)]' : 'hover:border-sky-500/20'}`}
          >
            <div className="p-2 w-fit rounded-xl bg-sky-500/10 border border-sky-500/20">
              <Database className="h-5 w-5 text-sky-400" />
            </div>
            
            <div className="flex flex-col gap-1 items-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Database Sync</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                Backup State
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${activeDropdown === 'backup' ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          <AnimatePresence>
            {activeDropdown === 'backup' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-left cursor-default space-y-2"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest pl-1 border-b border-white/5 pb-1">Local Ledger Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleExportData}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-900 hover:border-sky-500/30 text-zinc-300 transition-all text-center gap-1 group/btn"
                  >
                    <Download className="h-4 w-4 text-sky-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Export State</span>
                  </button>

                  <label 
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-900 hover:border-sky-500/30 text-zinc-300 transition-all text-center gap-1 cursor-pointer group/label"
                  >
                    <Upload className="h-4 w-4 text-sky-400 group-hover/label:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Import State</span>
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card 6: Danger Zone / Destruct */}
        <div className="relative w-full">
          <button 
            onClick={() => toggleDropdown('reset')}
            className={`p-4 border border-zinc-500/20 space-y-2 flex flex-col items-center justify-center text-center 
              transition-all duration-200 w-full rounded-2xl relative group min-h-[140px]
              glass-card bg-zinc-900/40
              shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer
              ${activeDropdown === 'reset' ? 'border-rose-500/50 shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)] bg-rose-950/5' : 'hover:border-rose-500/20'}`}
          >
            <div className="p-2 w-fit rounded-xl bg-rose-500/10 border border-rose-500/20">
              <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-1 items-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Database Purge</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                Wipe Ledger
                <ChevronDown className={`h-3 w-3 text-zinc-500 transition-transform ${activeDropdown === 'reset' ? 'rotate-180' : ''}`} />
              </p>
            </div>
          </button>

          <AnimatePresence>
            {activeDropdown === 'reset' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full mt-2 left-0 w-full bg-zinc-950/95 rounded-2xl p-4 border border-rose-500/30 shadow-2xl z-50 text-left backdrop-blur-md space-y-3"
              >
                <div className="space-y-1">
                  <h4 className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Destructive Operation Protocol</h4>
                  <p className="text-[8px] text-zinc-500 font-medium leading-relaxed uppercase">
                    Wipes transactions, budgets, ledger lines and sets accounts to starter templates.
                  </p>
                </div>

                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest transition-all"
                  >
                    <Trash2 className="h-3 w-3" /> Execute Terminal Purge
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[8px] text-rose-300 font-black uppercase tracking-widest animate-pulse">Are you absolutely certain? This operation is persistent!</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        Abort
                      </button>
                      <button
                        onClick={() => {
                          onResetData();
                          setShowConfirmReset(false);
                          setActiveDropdown(null);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        Confirm Purge
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Infrastructure Platform Specs matching the Admin Panel bottom card perfectly but simplified */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-white/5 space-y-6">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-500" />
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Security & Nodes State</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">Cloud Sync Protocol</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">Firestore SSL Tunnel</span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <FolderSync className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">Persistent Storage Location</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">europe-west2 (Sandboxed ID)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-2xl border border-zinc-500/20 p-5 space-y-3 bg-zinc-900/40">
        <div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI Insights Key</h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
            Optional. Paste your own Google Gemini API key to turn on AI insights on the
            Analytics screen. It is stored on this device only and is sent nowhere but Google.
            Leave it empty and the feature stays off — nothing else is affected.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={geminiKey}
            onChange={(e) => { setGeminiKey(e.target.value); setKeySaved(false); }}
            placeholder="AIza..."
            className="flex-1 bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/30 transition-all"
          />
          <button
            onClick={() => { setApiKey(geminiKey); setKeySaved(true); }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10 transition-all active:scale-95"
          >
            {keySaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[350px]">
          <RemindersWidget 
            reminders={state.reminders || []}
            onAddReminder={onAddReminder}
            onDeleteReminder={onDeleteReminder}
          />
        </div>
      </div>

      {/* Elegant minimalist footer matching overall terminal dashboard */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-700">
          Terminal Console System Engine • Active & Encryption Secured
        </span>
      </div>
    </div>
  );
}
