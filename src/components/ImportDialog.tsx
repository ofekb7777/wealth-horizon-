import { useMemo, useState } from 'react';
import { Loader2, Upload, X, AlertTriangle, Check } from 'lucide-react';
import { motion } from 'motion/react';
import {
  readWorkbook, suggestMapping, isMappingComplete, parseRows, findDuplicates,
  ParsedSheet, ColumnMapping, ParseResult,
} from '../services/bankImport';
import { Transaction, Account, Currency, CURRENCIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { useI18n } from '../context/LanguageContext';

interface ImportDialogProps {
  accounts: Account[];
  /** התנועות הקיימות — משמשות לזיהוי כפילויות. */
  existingTransactions: Transaction[];
  currency: Currency;
  onImport: (transactions: Transaction[]) => void;
  onClose: () => void;
}

const format = (template: string, ...values: (string | number)[]) =>
  template.replace(/%(\d)\$s/g, (_, i) => String(values[Number(i) - 1] ?? ''));

/**
 * מסך הייבוא.
 *
 * שלושה שלבים על מסך אחד: בוחרים קובץ, מאשרים את מיפוי העמודות שזוהה,
 * ורואים תצוגה מקדימה לפני שמשהו נכנס לנתונים. כל הפענוח נמצא ב-
 * `services/bankImport.ts` — כאן רק תצוגה.
 */
export default function ImportDialog({
  accounts, existingTransactions, currency, onImport, onClose,
}: ImportDialogProps) {
  const { txt, plural } = useI18n();
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id ?? '');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = CURRENCIES[currency].rate;
  const symbol = CURRENCIES[currency].symbol;

  const handleFile = async (file: File) => {
    setIsReading(true);
    setError(null);
    try {
      const parsed = readWorkbook(await file.arrayBuffer());
      setSheet(parsed);
      setMapping(suggestMapping(parsed.headers));
    } catch (e) {
      console.error('[import] failed to read file', e);
      setError(txt.import.readFailed);
      setSheet(null);
      setMapping(null);
    } finally {
      setIsReading(false);
    }
  };

  // הפענוח רץ מחדש בכל שינוי במיפוי, כדי שהתצוגה המקדימה תמיד תשקף
  // את מה שייובא בפועל.
  const result: ParseResult | null = useMemo(() => {
    if (!sheet || !mapping || !isMappingComplete(mapping)) return null;
    return parseRows(sheet, mapping, {
      rate,
      defaultIncomeCategory: INCOME_CATEGORIES[0],
      defaultExpenseCategory: EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1],
      accountId: accountId || undefined,
    });
  }, [sheet, mapping, rate, accountId]);

  const duplicates = useMemo(
    () => (result ? findDuplicates(result.transactions, existingTransactions) : new Set<number>()),
    [result, existingTransactions],
  );

  const toImport = useMemo(() => {
    if (!result) return [];
    if (!skipDuplicates) return result.transactions;
    return result.transactions.filter((_, i) => !duplicates.has(i));
  }, [result, duplicates, skipDuplicates]);

  const setColumn = (field: keyof ColumnMapping, value: number) => {
    setMapping(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const columnSelect = (field: keyof ColumnMapping, label: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
      <select
        value={mapping ? mapping[field] : -1}
        onChange={e => setColumn(field, Number(e.target.value))}
        className="bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500/40"
      >
        <option value={-1}>{txt.import.colNone}</option>
        {sheet?.headers.map((header, index) => (
          <option key={index} value={index}>{header || `#${index + 1}`}</option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-3xl max-h-[88vh] glass-card rounded-[2rem] border border-white/10 bg-zinc-900/70 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between px-6 md:px-8 pt-6 pb-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest">{txt.import.title}</h2>
            <p className="text-[11px] text-zinc-500 mt-1">{txt.import.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6">
          {!sheet && (
            <label className="flex flex-col items-center justify-center gap-3 py-14 border border-dashed border-white/15 rounded-2xl cursor-pointer hover:border-pink-500/40 hover:bg-white/5 transition-all">
              {isReading
                ? <Loader2 className="h-7 w-7 text-pink-400 animate-spin" />
                : <Upload className="h-7 w-7 text-zinc-500" />}
              <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
                {isReading ? txt.import.reading : txt.import.choose}
              </span>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
              />
            </label>
          )}

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {sheet && mapping && (
            <>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{txt.import.mapping}</h3>
                <p className="text-[10px] text-zinc-500 mt-1 mb-3">{txt.import.mappingHint}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {columnSelect('date', txt.import.colDate)}
                  {columnSelect('description', txt.import.colDescription)}
                  {columnSelect('amount', txt.import.colAmount)}
                  {columnSelect('debit', txt.import.colDebit)}
                  {columnSelect('credit', txt.import.colCredit)}
                  {accounts.length > 0 && (
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{txt.import.account}</span>
                      <select
                        value={accountId}
                        onChange={e => setAccountId(e.target.value)}
                        className="bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500/40"
                      >
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name || '—'}</option>)}
                      </select>
                    </label>
                  )}
                </div>
              </div>

              {!isMappingComplete(mapping) && (
                <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {txt.import.incomplete}
                </div>
              )}

              {result && (
                <>
                  {duplicates.size > 0 && (
                    <label className="flex items-center gap-3 text-xs text-zinc-300 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipDuplicates}
                        onChange={e => setSkipDuplicates(e.target.checked)}
                        className="accent-pink-500"
                      />
                      <span>
                        {plural(duplicates.size, txt.import.duplicatesFoundOne, txt.import.duplicatesFound)} · {txt.import.skipDuplicates}
                      </span>
                    </label>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{txt.import.preview}</h3>
                      <span className="text-[10px] text-zinc-500">
                        {format(txt.import.previewCount, Math.min(8, result.transactions.length), result.transactions.length)}
                      </span>
                    </div>

                    {result.transactions.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-6 text-center">{txt.import.nothingToImport}</p>
                    ) : (
                      <div className="rounded-2xl border border-white/5 overflow-hidden">
                        {result.transactions.slice(0, 8).map((t, i) => (
                          <div
                            key={t.id}
                            className={`flex items-center gap-3 px-4 py-2.5 text-xs border-b border-white/5 last:border-b-0 ${
                              duplicates.has(i) ? 'bg-amber-500/5 opacity-60' : ''
                            }`}
                          >
                            <span className="text-zinc-500 font-mono text-[10px] shrink-0" dir="ltr">{t.date}</span>
                            <span className="text-zinc-200 flex-1 truncate">{t.description}</span>
                            {duplicates.has(i) && (
                              <span className="text-[9px] font-black uppercase text-amber-400 shrink-0">{txt.import.duplicate}</span>
                            )}
                            <span
                              className={`font-mono font-bold shrink-0 ${t.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}
                              dir="ltr"
                            >
                              {symbol}{Math.abs(t.amount * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {result.skipped.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300">
                        {plural(result.skipped.length, txt.import.skippedRowsOne, txt.import.skippedRows)}
                      </summary>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {result.skipped.map((s, i) => (
                          <div key={i} className="text-[10px] text-zinc-600">
                            שורה {s.rowNumber}: {s.reason}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {result && toImport.length > 0 && (
          <div className="px-6 md:px-8 py-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => { onImport(toImport); onClose(); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[11px] hover:brightness-110 active:scale-95 transition-all"
            >
              <Check className="h-4 w-4" />
              {plural(toImport.length, txt.import.confirmOne, txt.import.confirm)}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
