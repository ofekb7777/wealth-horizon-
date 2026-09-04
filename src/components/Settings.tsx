import { useState } from 'react';
import { useI18n } from '../context/LanguageContext';
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
  FolderSync
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RemindersWidget from './RemindersWidget';
import { AiProvider, getApiKey, getProvider, setApiKey, setProvider } from '../services/aiService';
import { LOCALES } from '../i18n';

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
  const { txt, locale, setLocale } = useI18n();
  const [activeDropdown, setActiveDropdown] = useState<'theme' | 'effect' | 'currency' | 'backup' | 'reset' | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [aiProvider, setAiProviderState] = useState<AiProvider>(() => getProvider());
  const [apiKeyDraft, setApiKeyDraft] = useState(() => getApiKey());
  const [keySaved, setKeySaved] = useState(false);

  // החלפת ספק טוענת את המפתח **שלו**, לא משאירה את זה של הקודם בשדה.
  const switchProvider = (next: AiProvider) => {
    setProvider(next);
    setAiProviderState(next);
    setApiKeyDraft(getApiKey(next));
    setKeySaved(false);
  };
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
          alert(txt.settings.importSuccess);
          setActiveDropdown(null);
        } else {
          alert(txt.settings.importInvalid);
        }
      } catch (err) {
        console.error('Import failed', err);
        alert(txt.settings.importFailed);
      }
    };
    reader.readAsText(file);
  };

  const themesList: { id: Theme; label: string; color: string }[] = [
    { id: 'default', label: txt.themes.default, color: '#ec4899' },
    { id: 'mono', label: txt.themes.mono, color: '#000000' },
    { id: 'crimson', label: txt.themes.crimson, color: '#f43f5e' },
    { id: 'gold', label: txt.themes.gold, color: '#fbbf24' },
    { id: 'forest', label: txt.themes.forest, color: '#059669' },
    { id: 'royal', label: txt.themes.royal, color: '#3b82f6' },
    { id: 'lavender', label: txt.themes.lavender, color: '#8b5cf6' },
  ];

  /** שחור-על-לבן ולבן-על-שחור הן אותה ערכה בשני מצבים. */
  const monoLabel = () => (monoStyle === 'light' ? txt.themes.mono : txt.themes.monoInverted);

  const ambientEffects: { id: BgEffect; label: string; icon: string; desc: string }[] = [
    { id: 'none', label: txt.settings.ambientNone, icon: '✕', desc: txt.settings.ambientNoneHint },
    { id: 'cateyes', label: txt.settings.ambientEyes, icon: '👁️', desc: txt.settings.ambientEyesHint },
    { id: 'leaves', label: txt.settings.ambientLeaves, icon: '🌸', desc: txt.settings.ambientLeavesHint },
    { id: 'sparks', label: txt.settings.ambientSparks, icon: '✨', desc: txt.settings.ambientSparksHint },
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
          <h1 className="text-3xl font-black text-zinc-100 uppercase tracking-tighter italic">{txt.settings.title}</h1>
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest ms-12">
          {txt.settings.subtitle}
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
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.theme}</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                {theme === 'mono' ? monoLabel() : currentThemeObj.label}
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
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-start cursor-default"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ps-1 mb-1 border-b border-white/5 pb-1">{txt.settings.themeHint}</h4>
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
                          {t.id === 'mono' ? monoLabel() : t.label}
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
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.ambient}</p>
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
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-start cursor-default space-y-2"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ps-1 mb-1 border-b border-white/5 pb-1">{txt.settings.ambient}</h4>
                <div className="space-y-1">
                  {ambientEffects.map((ae) => (
                    <button
                      key={ae.id}
                      onClick={() => {
                        onSetBgEffect(ae.id);
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors text-start ${
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
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.currency}</p>
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
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-start cursor-default"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ps-1 mb-1 border-b border-white/5 pb-1">{txt.settings.currency}</h4>
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
                        <span className="text-[7px] text-zinc-500 font-mono">{txt.settings.currency}</span>
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
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.backup}</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                {txt.settings.backupValue}
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
                className="absolute top-full mt-2 left-0 w-full glass-card rounded-2xl p-3 border border-zinc-500/20 shadow-2xl z-50 text-start cursor-default space-y-2"
              >
                <h4 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ps-1 border-b border-white/5 pb-1">{txt.settings.backupHint}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleExportData}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-900 hover:border-sky-500/30 text-zinc-300 transition-all text-center gap-1 group/btn"
                  >
                    <Download className="h-4 w-4 text-sky-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">{txt.settings.export}</span>
                  </button>

                  <label 
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-900 hover:border-sky-500/30 text-zinc-300 transition-all text-center gap-1 cursor-pointer group/label"
                  >
                    <Upload className="h-4 w-4 text-sky-400 group-hover/label:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">{txt.settings.import}</span>
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
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.reset}</p>
              <p className="text-base font-black tracking-tighter text-zinc-100 flex items-center gap-1.5 justify-center">
                {txt.settings.resetValue}
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
                className="absolute top-full mt-2 left-0 w-full bg-zinc-950/95 rounded-2xl p-4 border border-rose-500/30 shadow-2xl z-50 text-start backdrop-blur-md space-y-3"
              >
                <div className="space-y-1">
                  <h4 className="text-[8px] font-black text-rose-400 uppercase tracking-widest">{txt.settings.resetWarning}</h4>
                  <p className="text-[8px] text-zinc-500 font-medium leading-relaxed uppercase">
                    {txt.settings.resetConfirmHint}
                  </p>
                </div>

                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase tracking-widest transition-all"
                  >
                    <Trash2 className="h-3 w-3" /> {txt.settings.reset}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[8px] text-rose-300 font-black uppercase tracking-widest animate-pulse">{txt.settings.resetConfirm}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        {txt.common.cancel}
                      </button>
                      <button
                        onClick={() => {
                          onResetData();
                          setShowConfirmReset(false);
                          setActiveDropdown(null);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest transition-all"
                      >
                        {txt.settings.resetDo}
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
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{txt.settings.storage}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <FolderSync className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">{txt.settings.storage}</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">{txt.settings.storageValue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 glass-card rounded-2xl border border-zinc-500/20 p-5 space-y-3 bg-zinc-900/40">
        <div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.language}</h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{txt.settings.languageHint}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LOCALES.map(item => (
            <button
              key={item.code}
              lang={item.code}
              dir={item.dir}
              onClick={() => setLocale(item.code)}
              aria-pressed={locale === item.code}
              className={`px-3 py-2 rounded-xl border text-xs font-black transition-all active:scale-95 ${
                locale === item.code
                  ? 'border-pink-500/50 bg-pink-500/10 text-zinc-100'
                  : 'border-white/10 bg-white/[0.02] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.nativeName}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 glass-card rounded-2xl border border-zinc-500/20 p-5 space-y-3 bg-zinc-900/40">
        <div>
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{txt.settings.aiKey}</h3>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
            {aiProvider === 'claude' ? txt.settings.aiKeyHintClaude : txt.settings.aiKeyHintGemini}
          </p>
        </div>

        <div>
          <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">{txt.settings.aiKeyProvider}</p>
          <div className="flex gap-2">
            {([
              { id: 'gemini' as const, label: 'Google Gemini' },
              { id: 'claude' as const, label: 'Anthropic Claude' },
            ]).map(option => (
              <button
                key={option.id}
                onClick={() => switchProvider(option.id)}
                aria-pressed={aiProvider === option.id}
                className={`flex-1 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  aiProvider === option.id
                    ? 'border-pink-500/50 bg-pink-500/10 text-zinc-100'
                    : 'border-white/10 bg-white/[0.02] text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKeyDraft}
            onChange={(e) => { setApiKeyDraft(e.target.value); setKeySaved(false); }}
            placeholder={aiProvider === 'claude' ? 'sk-ant-...' : 'AIza...'}
            dir="ltr"
            className="flex-1 bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/30 transition-all"
          />
          <button
            onClick={() => { setApiKey(aiProvider, apiKeyDraft); setKeySaved(true); }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10 transition-all active:scale-95"
          >
            {keySaved ? txt.common.saved : txt.common.save}
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
          {txt.settings.storage} &middot; {txt.settings.storageValue}
        </span>
      </div>
    </div>
  );
}
