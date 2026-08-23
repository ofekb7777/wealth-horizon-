import { LayoutGrid, TrendingDown, TrendingUp, Wallet, LineChart, Home as HomeIcon, PieChart, Settings } from 'lucide-react';
import { Sheet } from '../types';

interface BottomNavProps {
  sheets: Sheet[];
  activeSheetId: string;
  onSelectSheet: (id: string) => void;
  onShowSettings: () => void;
}

export default function BottomNav({ sheets, activeSheetId, onSelectSheet, onShowSettings }: BottomNavProps) {
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
    <div className="flex h-20 w-full items-center overflow-x-auto bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 shrink-0 snap-x hide-scrollbar px-4 z-40 md:hidden pb-4">
      <div className="flex w-full justify-between items-center min-w-max gap-2 px-2">
        {sheets.map((sheet) => {
          const isActive = activeSheetId === sheet.id;
          return (
            <button
              key={sheet.id}
              onClick={() => onSelectSheet(sheet.id)}
              className={`flex flex-col items-center justify-center min-w-[70px] h-14 p-1 snap-center rounded-2xl transition-all duration-300 outline-none ${
                isActive ? 'text-pink-500' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-xl p-2 mb-1 transition-all duration-300 ${
                  isActive ? 'bg-pink-500/10 scale-110' : 'bg-transparent'
                }`}
              >
                {getIcon(sheet.icon)}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {sheet.name}
              </span>
            </button>
          );
        })}
        <button
            onClick={onShowSettings}
            className="flex flex-col items-center justify-center min-w-[70px] h-14 p-1 snap-center rounded-2xl transition-all duration-300 outline-none text-zinc-400 hover:text-pink-400">
             <div className="flex items-center justify-center rounded-xl p-2 mb-1 transition-all duration-300">
                <Settings className="h-5 w-5" />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
               Settings
             </span>
          </button>
      </div>
    </div>
  );
}
