import React from 'react';
import { Sheet } from '../types';
import { LayoutGrid, TrendingDown, TrendingUp, Wallet, LineChart, Home as HomeIcon, PieChart, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  currency: any;
  onShowSettings: () => void;
  onInstall: () => void;
}

export default function Sidebar({ sheets, activeSheetId, onSelectSheet, onShowSettings, onInstall }: SidebarProps) {
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
        <button
          onClick={onShowSettings}
          className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>

        <button
          onClick={onInstall}
          className="w-full flex items-center gap-3 px-3 py-2 text-pink-400 hover:bg-pink-500/5 rounded-xl transition-all text-xs font-black uppercase tracking-widest italic"
        >
          <LayoutGrid className="h-4 w-4" />
          Install App
        </button>

      </div>
    </div>
  );
}
