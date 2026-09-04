import { Dictionary, LocaleCode, LocaleMeta } from './types';
import { en } from './en';
import { zh } from './zh';
import { hi } from './hi';
import { es } from './es';
import { ar } from './ar';
import { he } from './he';

export type { Dictionary, LocaleCode, LocaleMeta } from './types';

/**
 * השפות הנתמכות.
 *
 * חמש הראשונות הן חמש השפות המדוברות בעולם, ועברית שישית — האפליקציה
 * נכתבה בה, ואופק משתמש בה. הסדר כאן הוא הסדר שבו הן מוצגות.
 */
export const LOCALES: readonly LocaleMeta[] = [
  { code: 'en', nativeName: 'English',  englishName: 'English', dir: 'ltr' },
  { code: 'zh', nativeName: '中文',      englishName: 'Chinese', dir: 'ltr' },
  { code: 'hi', nativeName: 'हिन्दी',     englishName: 'Hindi',   dir: 'ltr' },
  { code: 'es', nativeName: 'Español',  englishName: 'Spanish', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية',   englishName: 'Arabic',  dir: 'rtl' },
  { code: 'he', nativeName: 'עברית',    englishName: 'Hebrew',  dir: 'rtl' },
];

const DICTIONARIES: Record<LocaleCode, Dictionary> = { en, zh, hi, es, ar, he };

export const DEFAULT_LOCALE: LocaleCode = 'en';

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return !!value && LOCALES.some(l => l.code === value);
}

export function getDictionary(locale: LocaleCode): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

export function getDirection(locale: LocaleCode): 'ltr' | 'rtl' {
  return LOCALES.find(l => l.code === locale)?.dir ?? 'ltr';
}

/**
 * שם תצוגה לקטגוריה.
 *
 * **הערך עצמו נשמר במסד באנגלית ולא משתנה.** קטגוריה שהמשתמש הגדיר
 * בעצמו מוצגת כמו שהיא.
 */
export const categoryLabel = (dict: Dictionary, category: string): string =>
  dict.categories[category] ?? category;

export const accountTypeLabel = (dict: Dictionary, type: string): string =>
  dict.accountTypes[type] ?? type;

/** שם תצוגה לדירוג המגמה. ראה ההערה ב-`trend` — זו לא המלצת השקעה. */
export const trendLabel = (dict: Dictionary, rating: string): string =>
  dict.trend[rating] ?? rating;

/**
 * בחירה בין צורת יחיד לרבים.
 *
 * בעברית "1 שורות דולגו" שגוי — מספר אחד דורש צורת יחיד. פונקציה קטנה
 * במקום לפזר תנאים בקומפוננטות.
 *
 * זה מכסה שתי צורות בלבד, וזה מכוון: ערבית מבחינה בשש. במקום להוסיף
 * מנוע ICU שלם בשביל ארבע מחרוזות, המחרוזות בערבית ובהינדי נוסחו כך
 * שהן נכונות בשתי הצורות.
 */
export const plural = (count: number, one: string, many: string): string =>
  count === 1 ? one : many.replace(/%1\$s/g, String(count));
