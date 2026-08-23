import React from 'react';
import { Sheet } from '../types';
import { LayoutGrid, TrendingDown, TrendingUp, Wallet, LineChart, Home as HomeIcon, LogOut, User as UserIcon, Shield, PieChart, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppUser } from '../data';
import AdminConsole from './AdminConsole';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  user: AppUser | null;
  onLogout: () => void;
  currency: any; // Added for admin console
  isAdmin?: boolean;
  onShowAdmin: () => void;
  onShowSettings: () => void;
  onInstall: () => void;
}

export default function Sidebar({ sheets, activeSheetId, onSelectSheet, user, onLogout, currency, isAdmin, onShowAdmin, onShowSettings, onInstall }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return <HomeIcon className="h-5 w-5" />;
      case 'trending-up': return <TrendingUp className="h-5 w-5" />;
      case 'trending-down': return <TrendingDown className="h-5 w-5" />;
      case 'dashboard': return <LineChart className="h-5 w-5" />;
      case 'wallet': return <Wallet className="h-5 w-5" />;
      case 'pie-chart': return <PieChart className="h-5 w-5" />;
      case 'investments': return <LineChart className="h-5 w-5" />;
      default: return <LayoutGrid className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-64 glass-sidebar flex flex-col hidden md:flex shrink-0 z-20">
      <div className="p-8">
        <div className="relative group cursor-default">
          {/* Horizon Line Asset */}
          <div className="absolute -top-6 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/40 to-transparent blur-[1px]" />
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2 relative">
              {/* Wings Effect */}
              <motion.div 
                animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-0.5"
              >
                <div className="w-6 h-3 bg-gradient-to-br from-pink-600 via-pink-700 to-orange-500 rounded-l-full rounded-tr-md border border-white/20 shadow-md shadow-pink-500/40" />
                <div className="w-6 h-3 bg-gradient-to-bl from-pink-600 via-pink-700 to-orange-500 rounded-r-full rounded-tl-md border border-white/20 shadow-md shadow-pink-500/40" />
              </motion.div>
            </div>

            <h1 className="text-center">
              <span className={`text-[11px] font-black uppercase tracking-[0.4em] block mb-0.5 italic ${theme === 'mono' ? 'text-zinc-600' : 'text-rose-500'}`}>Wealth</span>
              <span className={`font-display italic font-black text-4xl tracking-tighter relative transition-colors horizon-title ${theme === 'mono' ? 'text-zinc-900 group-hover:text-black' : 'text-white group-hover:text-pink-100'}`}>
                Horizon
                <span className="absolute -inset-x-8 -inset-y-4 bg-pink-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </span>
            </h1>
          </div>

          <div className="absolute -bottom-4 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        {sheets.map((sheet) => {
          const isActive = activeSheetId === sheet.id;
          return (
            <button
              key={sheet.id}
              onClick={() => onSelectSheet(sheet.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? 'bg-pink-500/10 text-pink-400 font-semibold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {getIcon(sheet.icon)}
              {sheet.name}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        {user && (
          <div className={`flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all duration-500 ${
            isAdmin 
              ? 'bg-pink-950/20 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)] ring-1 ring-pink-500/20' 
              : 'bg-white/5 border-white/5'
          }`}>
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className={`w-8 h-8 rounded-full border ${isAdmin ? 'border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)]' : 'border-zinc-700'}`} referrerPolicy="no-referrer" />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isAdmin ? 'bg-pink-900/40 border-pink-500/50' : 'bg-zinc-800 border-white/10'}`}>
                <UserIcon className={`w-4 h-4 ${isAdmin ? 'text-pink-400' : 'text-zinc-500'}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black truncate ${isAdmin ? 'text-pink-50 w-full' : 'text-zinc-100'}`}>{user.displayName}</p>
                {isAdmin && <div className="h-1 w-1 rounded-full bg-pink-400 animate-ping shrink-0" />}
              </div>
              <div className="flex items-center gap-1.5 mt-1 justify-between">
                {isAdmin ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-[7px] font-black text-pink-400/80 truncate uppercase tracking-[0.2em] mr-auto">ROOT</span>
                    <button 
                      onClick={onShowSettings}
                      className="p-1 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all shrink-0 cursor-pointer"
                      title="Settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-[8px] font-bold text-zinc-500 truncate uppercase tracking-tighter mr-auto">Terminal User</span>
                    <button 
                      onClick={onShowSettings}
                      className="p-1 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-all shrink-0 cursor-pointer"
                      title="Settings"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Shield button moved inside text div */}
          </div>
        )}
        
        <button
          onClick={onInstall}
          className="w-full flex items-center gap-3 px-3 py-2 text-pink-400 hover:bg-pink-500/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest italic"
        >
          <LayoutGrid className="h-4 w-4" />
          Install App
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </div>
    </div>
  );
}
