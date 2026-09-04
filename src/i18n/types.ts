import { en } from './en';

/**
 * החוזה שכל שפה חייבת לקיים.
 *
 * זה לא טיפוס שנכתב ביד אלא הצורה של המילון האנגלי עצמו. מפתח שחסר
 * בשפה כלשהי, או מפתח שהשם שלו הוקלד לא נכון, נופל ב-`npm run lint`
 * ולא מגיע למסך כשדה ריק.
 */
export type Dictionary = typeof en;

/** קודי השפות הנתמכות. */
export type LocaleCode = 'en' | 'he';

export interface LocaleMeta {
  code: LocaleCode;
  /** השם בשפה עצמה — ככה בוחרים שפה שאתה לא קורא. */
  nativeName: string;
  /** השם באנגלית, לזיהוי מהיר במסך ההגדרות. */
  englishName: string;
  dir: 'ltr' | 'rtl';
}
