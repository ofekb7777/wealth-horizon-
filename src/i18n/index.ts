import { Dictionary, LocaleCode, LocaleMeta } from './types';
import { en } from './en';
import { he } from './he';

export type { Dictionary, LocaleCode, LocaleMeta } from './types';

/**
 * השפות הנתמכות: אנגלית ועברית.
 *
 * **התשתית בנויה לריבוי שפות בכוונה.** בשלב 7 היו כאן שש, ואופק ביקש
 * לצמצם לשתיים שהוא באמת משתמש בהן. אם בעתיד תפורסם לקהל רחב, הוספת
 * שפה היא קובץ מילון אחד ושורה אחת כאן — `Dictionary` יאכוף שהמילון
 * מלא, ו-`npm run sweep:i18n` יתפוס טקסט שלא עבר.
 */
export const LOCALES: readonly LocaleMeta[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'he', nativeName: 'עברית',   englishName: 'Hebrew',  dir: 'rtl' },
];

const DICTIONARIES: Record<LocaleCode, Dictionary> = { en, he };

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
 * שתי צורות מספיקות לאנגלית ולעברית. שפה שמבחינה ביותר (ערבית מבחינה
 * בשש) תדרוש כאן משהו אמיתי יותר — נקודה לזכור אם מוסיפים שפות.
 */
export const plural = (count: number, one: string, many: string): string =>
  count === 1 ? one : many.replace(/%1\$s/g, String(count));
