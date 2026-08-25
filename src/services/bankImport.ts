import * as XLSX from 'xlsx';
import { Transaction } from '../types';

/**
 * ייבוא דפי בנק וכרטיס אשראי מקבצי Excel/CSV.
 *
 * הקבצים של הבנקים בישראל לא אחידים: לפעמים יש שורות כותרת לפני הטבלה,
 * לפעמים עמודת "סכום" אחת עם סימן, ולפעמים שתי עמודות נפרדות של חובה
 * וזכות. התאריכים כמעט תמיד ביום/חודש/שנה — פורמט ש-`new Date()` מפרש
 * הפוך או נכשל עליו.
 *
 * הקובץ הזה הוא לוגיקה טהורה בלבד, בלי React. מה שמוצג למשתמש נמצא
 * ב-`components/ImportDialog.tsx`.
 */

// ---------- קריאת הקובץ ----------

export interface ParsedSheet {
  /** שם הגיליון שנקרא. */
  sheetName: string;
  /** האינדקס של שורת הכותרות שזוהתה. */
  headerRowIndex: number;
  headers: string[];
  /** השורות שאחרי הכותרת. */
  rows: unknown[][];
}

/** מילים שמעידות על שורת כותרות של דף בנק. */
const HEADER_HINTS = [
  'תאריך', 'date', 'תיאור', 'פרטים', 'description', 'details', 'narrative',
  'סכום', 'amount', 'חובה', 'זכות', 'debit', 'credit', 'יתרה', 'balance',
  'עסק', 'merchant', 'business',
];

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

/**
 * מאתר את שורת הכותרות.
 *
 * דפי בנק פותחים לא פעם בשורות כמו "תנועות בחשבון" או מספר החשבון,
 * ורק אחר כך מגיעה הטבלה. סורקים את 25 השורות הראשונות ובוחרים את זו
 * עם הכי הרבה מילות כותרת מוכרות.
 */
function findHeaderRow(rows: unknown[][]): number {
  let best = 0;
  let bestScore = 0;

  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const cells = (rows[i] || []).map(c => cellText(c).toLowerCase());
    const nonEmpty = cells.filter(Boolean).length;
    if (nonEmpty < 2) continue;

    const score = cells.filter(c => HEADER_HINTS.some(h => c.includes(h))).length;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return bestScore > 0 ? best : 0;
}

export function readWorkbook(data: ArrayBuffer): ParsedSheet {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('הקובץ לא מכיל אף גיליון');

  const all = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    raw: true,
    // שומרים שורות ריקות: בלעדיהן מספרי השורות בהודעות הדילוג לא היו
    // תואמים למה שהמשתמש רואה באקסל.
    blankrows: true,
  }) as unknown[][];

  if (all.length === 0) throw new Error('הגיליון ריק');

  const headerRowIndex = findHeaderRow(all);
  const headers = (all[headerRowIndex] || []).map(cellText);

  return {
    sheetName,
    headerRowIndex,
    headers,
    rows: all.slice(headerRowIndex + 1),
  };
}

// ---------- מיפוי עמודות ----------

export interface ColumnMapping {
  date: number;
  description: number;
  /** עמודת סכום יחידה עם סימן. -1 כשאין. */
  amount: number;
  /** חובה — כסף שיצא. -1 כשאין. */
  debit: number;
  /** זכות — כסף שנכנס. -1 כשאין. */
  credit: number;
}

const ALIASES = {
  date: ['תאריך', 'תאריך עסקה', 'תאריך חיוב', 'date', 'transaction date', 'תאריך ערך', 'value date'],
  description: ['שם בית עסק', 'בית עסק', 'תיאור', 'פרטים', 'description', 'details', 'narrative', 'merchant', 'name'],
  amount: ['סכום חיוב', 'סכום עסקה', 'סכום', 'amount', 'value', 'sum'],
  debit: ['חובה', 'debit', 'withdrawal', 'משיכה'],
  credit: ['זכות', 'credit', 'deposit', 'הפקדה'],
};

/** מוצא את העמודה שהכותרת שלה מתאימה הכי טוב לאחד הכינויים. */
function matchColumn(headers: string[], aliases: string[]): number {
  const lower = headers.map(h => h.toLowerCase().trim());

  // התאמה מדויקת קודמת להתאמה חלקית, כדי ש"תאריך" לא ייבחר כשקיים
  // "תאריך עסקה" מדויק יותר.
  for (const alias of aliases) {
    const exact = lower.indexOf(alias);
    if (exact !== -1) return exact;
  }
  for (const alias of aliases) {
    const partial = lower.findIndex(h => h.includes(alias));
    if (partial !== -1) return partial;
  }
  return -1;
}

export function suggestMapping(headers: string[]): ColumnMapping {
  const debit = matchColumn(headers, ALIASES.debit);
  const credit = matchColumn(headers, ALIASES.credit);
  let amount = matchColumn(headers, ALIASES.amount);

  // כשיש חובה/זכות נפרדות, עמודת "סכום" מיותרת ולרוב אפילו לא קיימת.
  if (debit !== -1 && credit !== -1) amount = -1;

  return {
    date: matchColumn(headers, ALIASES.date),
    description: matchColumn(headers, ALIASES.description),
    amount,
    debit,
    credit,
  };
}

/** האם המיפוי מספיק כדי לייבא. */
export function isMappingComplete(mapping: ColumnMapping): boolean {
  const hasAmount = mapping.amount !== -1 || mapping.debit !== -1 || mapping.credit !== -1;
  return mapping.date !== -1 && mapping.description !== -1 && hasAmount;
}

// ---------- פענוח ערכים ----------

/** תאריך תחילת הספירה של Excel. */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);

/**
 * מפענח תאריך מתא.
 *
 * **הנחת יסוד: יום לפני חודש.** כל הבנקים בישראל מייצאים ככה, ואילו
 * `new Date('03/08/2026')` היה מפרש את זה כ-3 באוגוסט לפי התקן האמריקאי
 * — הבדל של חמישה חודשים בלי שום שגיאה שתסגיר אותו.
 */
export function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return toIsoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  // Excel שומר תאריכים כמספר ימים מ-1899-12-30.
  if (typeof value === 'number' && value > 20000 && value < 80000) {
    const d = new Date(EXCEL_EPOCH + value * 86400000);
    return toIsoDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }

  const text = String(value).trim();

  // ISO — כבר בסדר הנכון.
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return toIsoDate(+iso[1], +iso[2], +iso[3]);

  // יום/חודש/שנה, עם / . או -
  const dmy = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (dmy) {
    let [, day, month, year] = dmy;
    let y = +year;
    if (y < 100) y += y < 70 ? 2000 : 1900;
    return toIsoDate(y, +month, +day);
  }

  return null;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  // דוחה תאריכים שגלשו, כמו 31 בפברואר.
  if (d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * מפענח סכום.
 *
 * מטפל במפריד אלפים, בסימן ₪, וב-(123.45) שבחלק מהדוחות מציין מספר
 * שלילי. מחזיר null כשאין מספר אמיתי, כדי להבדיל בין "אפס" ל"ריק".
 */
export function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isFinite(value) ? value : null;

  let text = String(value).trim();
  if (!text) return null;

  const parenthesised = /^\(.*\)$/.test(text);
  if (parenthesised) text = text.slice(1, -1);

  // משאירים ספרות, נקודה, פסיק ומינוס בלבד.
  text = text.replace(/[^\d.,-]/g, '');
  // מפריד אלפים: פסיק שאחריו בדיוק שלוש ספרות.
  text = text.replace(/,(?=\d{3}\b)/g, '');
  // מה שנשאר מפסיק הוא מפריד עשרוני בסגנון אירופי.
  text = text.replace(',', '.');

  const parsed = parseFloat(text);
  if (isNaN(parsed)) return null;
  return parenthesised ? -Math.abs(parsed) : parsed;
}

// ---------- בניית תנועות ----------

export interface ParseOptions {
  /** מטבע התצוגה — הסכומים מומרים חזרה לבסיס. */
  rate: number;
  /** קטגוריית ברירת מחדל לתנועות שנכנסות. */
  defaultIncomeCategory: string;
  defaultExpenseCategory: string;
  /** לשייך את כל התנועות לחשבון הזה. */
  accountId?: string;
}

export interface ParseResult {
  transactions: Transaction[];
  /** שורות שדולגו, עם הסיבה — כדי שהמשתמש יראה מה לא נכנס. */
  skipped: { rowNumber: number; reason: string }[];
}

export function parseRows(
  sheet: ParsedSheet,
  mapping: ColumnMapping,
  options: ParseOptions,
): ParseResult {
  const transactions: Transaction[] = [];
  const skipped: ParseResult['skipped'] = [];

  sheet.rows.forEach((row, index) => {
    // מספר השורה כפי שהמשתמש רואה אותו בגיליון (1-based, אחרי הכותרת).
    const rowNumber = sheet.headerRowIndex + index + 2;

    // שורה ריקה לגמרי — מפריד ויזואלי בגיליון, לא שגיאה.
    if (!(row || []).some(c => cellText(c))) return;

    const date = parseDate(row[mapping.date]);
    if (!date) {
      skipped.push({ rowNumber, reason: 'תאריך לא תקין' });
      return;
    }

    const description = cellText(row[mapping.description]);
    if (!description) {
      skipped.push({ rowNumber, reason: 'אין תיאור' });
      return;
    }

    const amount = resolveAmount(row, mapping);
    if (amount === null) {
      skipped.push({ rowNumber, reason: 'אין סכום' });
      return;
    }
    if (amount === 0) {
      skipped.push({ rowNumber, reason: 'סכום אפס' });
      return;
    }

    const isExpense = amount < 0;
    transactions.push({
      id: Math.random().toString(36).slice(2, 11),
      date,
      description,
      category: isExpense ? options.defaultExpenseCategory : options.defaultIncomeCategory,
      amount: amount / options.rate,
      type: isExpense ? 'expense' : 'income',
      accountId: options.accountId,
    });
  });

  return { transactions, skipped };
}

/**
 * מחלץ את הסכום החתום מהשורה.
 *
 * חובה = כסף שיצא ולכן שלילי, זכות = כסף שנכנס ולכן חיובי. כשיש עמודת
 * סכום יחידה משתמשים בה כמו שהיא.
 */
function resolveAmount(row: unknown[], mapping: ColumnMapping): number | null {
  if (mapping.debit !== -1 || mapping.credit !== -1) {
    const debit = mapping.debit !== -1 ? parseAmount(row[mapping.debit]) : null;
    const credit = mapping.credit !== -1 ? parseAmount(row[mapping.credit]) : null;

    if (debit !== null && debit !== 0) return -Math.abs(debit);
    if (credit !== null && credit !== 0) return Math.abs(credit);
    return null;
  }

  if (mapping.amount === -1) return null;
  return parseAmount(row[mapping.amount]);
}

// ---------- זיהוי כפילויות ----------

/** מנרמל תיאור להשוואה: אותיות ומספרים בלבד, בלי רווחים כפולים. */
function normalise(description: string): string {
  return description.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w֐-׿ ]/g, '').trim();
}

function fingerprint(t: Pick<Transaction, 'date' | 'description' | 'amount'>): string {
  // הסכום מעוגל לאגורות: אותה עסקה יכולה לחזור עם הפרש זעיר של עיגול.
  return `${t.date}|${normalise(t.description)}|${Math.round(t.amount * 100)}`;
}

/**
 * מחזיר את האינדקסים של התנועות שכבר קיימות.
 *
 * ההנחה: אותו תאריך + אותו תיאור + אותו סכום = אותה עסקה. זה מכוון
 * לזהות ייבוא חוזר של אותו קובץ, שזה המקרה הנפוץ. שתי עסקאות אמיתיות
 * זהות לגמרי באותו יום יסומנו גם הן — ולכן המשתמש מאשר, לא המערכת.
 */
export function findDuplicates(
  candidates: Transaction[],
  existing: Transaction[],
): Set<number> {
  const seen = new Set(existing.map(fingerprint));
  const duplicates = new Set<number>();

  candidates.forEach((candidate, index) => {
    const key = fingerprint(candidate);
    if (seen.has(key)) {
      duplicates.add(index);
    } else {
      // כפילות גם בתוך הקובץ עצמו, לא רק מול הקיים.
      seen.add(key);
    }
  });

  return duplicates;
}
