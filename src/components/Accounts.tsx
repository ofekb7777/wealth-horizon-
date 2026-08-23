import { Plus, Trash2 } from 'lucide-react';
import { Account, ACCOUNT_TYPES, Currency, CURRENCIES } from '../types';
import { txt, accountTypeLabel } from '../i18n/he';

interface AccountsProps {
  accounts: Account[];
  onUpdateAccount: (id: string, field: keyof Account, value: any) => void;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
  currency: Currency;
}

export default function Accounts({
  accounts,
  onUpdateAccount,
  onAddAccount,
  onDeleteAccount,
  currency
}: AccountsProps) {
  const symbol = CURRENCIES[currency].symbol;
  const rate = CURRENCIES[currency].rate;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative">
      {/* Toolbar */}
      <div className="h-16 bg-zinc-900/50 backdrop-blur-md flex justify-between items-center px-6 shrink-0 shadow-sm sticky top-0 z-10">
        <button
          onClick={onAddAccount}
          className="group relative flex items-center gap-3 px-6 py-2.5 bg-zinc-100 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="h-4 w-4 text-zinc-900 relative z-10 transition-colors" />
          <span className="text-[10px] font-black text-zinc-900 relative z-10 uppercase tracking-widest whitespace-nowrap">{txt.accounts.add}</span>
        </button>

        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] hidden md:block">
          Financial Institutions
        </div>
      </div>

      <div className="flex-1 px-4 md:px-8 py-8 md:pb-8 pb-32">
        <div className="max-w-[1600px] mx-auto">
          {accounts.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              {txt.accounts.empty}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((t) => (
                <div key={t.id} className="glass-card rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-2xl relative group overflow-visible transition-all duration-300 hover:bg-zinc-900/60 flex flex-col justify-between">
                  <button
                     onClick={() => onDeleteAccount(t.id)}
                     className="absolute -top-3 -end-3 z-30 text-zinc-400 hover:text-rose-400 p-2 rounded-full bg-zinc-900 border border-white/10 shadow-2xl transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                     title={txt.accounts.delete}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.3em] text-center">{txt.accounts.title}</span>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => onUpdateAccount(t.id, 'name', e.target.value)}
                        className="w-full bg-transparent text-center outline-none font-display font-black text-xl text-zinc-100 focus:text-white placeholder:text-zinc-700 transition-all"
                        placeholder={txt.accounts.namePlaceholder}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 p-4 sm:p-5 rounded-2xl bg-zinc-800/30 border border-white/5">
                      <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.3em] text-center">{txt.accounts.currentBalance}</span>
                      <div className="flex items-center justify-center">
                        <span className={`font-mono text-xl me-1.5 ${t.balance >= 0 ? 'text-pink-500 italic' : 'text-rose-400'}`}>{symbol}</span>
                        <div className="relative w-full min-w-0 max-w-[180px]">
                          <input
                            type="number"
                            id={`acc-input-${t.id}`}
                            value={t.balance === 0 ? '' : Number((t.balance * rate).toFixed(2)).toString()}
                            onChange={(e) => onUpdateAccount(t.id, 'balance', (parseFloat(e.target.value) || 0) / rate)}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            className={`w-full bg-transparent text-center outline-none font-mono text-2xl font-extrabold transition-all border-none focus:ring-0 peer ${
                              t.balance >= 0 ? 'text-pink-500 italic' : 'text-rose-400'
                            } ${t.balance !== 0 ? 'opacity-0 focus:opacity-100' : 'opacity-100'}`}
                            placeholder="0.00"
                          />
                          {t.balance !== 0 && (
                            <div className={`absolute inset-0 pointer-events-none text-center font-mono text-2xl font-extrabold flex items-center justify-center peer-focus:hidden truncate ${
                              t.balance >= 0 ? 'text-pink-500 italic' : 'text-rose-400'
                            }`}>
                              {(t.balance * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-1">
                      <div className="relative">
                         <select
                          value={t.type}
                          onChange={(e) => onUpdateAccount(t.id, 'type', e.target.value as any)}
                          className="bg-zinc-800 border border-white/5 px-4 py-2 rounded-xl outline-none font-black text-[9px] uppercase text-zinc-300 appearance-none transition-all cursor-pointer focus:border-teal-400/30 pe-10"
                         >
                          {ACCOUNT_TYPES.map(type => (
                            <option className="bg-zinc-900 text-zinc-100" key={type} value={type}>{accountTypeLabel(type)}</option>
                          ))}
                        </select>
                        <div className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 font-bold">
                          &darr;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
