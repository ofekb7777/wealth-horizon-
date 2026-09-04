import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import {
  DEFAULT_LOCALE, Dictionary, LocaleCode,
  getDictionary, getDirection, isLocaleCode,
  accountTypeLabel, categoryLabel, plural, trendLabel,
} from '../i18n';

/**
 * שפת האפליקציה.
 *
 * נשמרת ב-localStorage ולא במסד — בדיוק מאותן שתי סיבות של
 * `ThemeContext`: היא נקראת **סינכרונית**, כך שהמסך הראשון כבר מצויר
 * בשפה ובכיוון הנכונים במקום להבהב; והיא לא נתון פיננסי, ולכן אין סיבה
 * שתיכלל בגיבוי או תימחק יחד עם "מחק הכל".
 */
export const LANGUAGE_KEY = 'language_preference';

/** הועבר ל-`i18n/index.ts` כדי שגם `main.tsx` יוכל לקרוא לפני הרינדור. */
export function readStoredLocale(): LocaleCode | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return isLocaleCode(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * התקנה שכבר קיימת נשארת בעברית.
 *
 * עד שלב 7 האפליקציה הייתה עברית בלבד ולא שמרה העדפת שפה. בלי ההגירה
 * הזאת אופק היה פותח בוקר אחד אפליקציה שהתהפכה לאנגלית. מזוהה לפי
 * מפתחות שרק גרסה קודמת יכלה לכתוב, ורצה פעם אחת בלבד.
 */
const PRIOR_INSTALL_KEYS = ['financial_state', 'theme_preference', 'currency_preference'];

export function migrateExistingInstallToHebrew(): void {
  try {
    if (localStorage.getItem(LANGUAGE_KEY)) return;
    if (PRIOR_INSTALL_KEYS.some(key => localStorage.getItem(key) !== null)) {
      localStorage.setItem(LANGUAGE_KEY, 'he');
    }
  } catch {
    // אין localStorage — נופלים לברירת המחדל, וזה בסדר.
  }
}

interface LanguageContextType {
  /** כל הטקסט. השם `txt` ולא `t` — `t` תפוס כשם משתנה בתשע קומפוננטות. */
  txt: Dictionary;
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  dir: 'ltr' | 'rtl';
  /** true כשהמשתמש עוד לא בחר שפה — מפעיל את מסך הפתיחה. */
  needsLanguageChoice: boolean;
  categoryLabel: (category: string) => string;
  accountTypeLabel: (type: string) => string;
  trendLabel: (rating: string) => string;
  plural: (count: number, one: string, many: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [stored, setStored] = useState<LocaleCode | null>(() => readStoredLocale());
  const locale = stored ?? DEFAULT_LOCALE;

  const setLocale = (next: LocaleCode) => {
    setStored(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch (error) {
      console.error('Failed to save the language preference', error);
    }
  };

  // `main.tsx` כבר הציב את אלה לפני הרינדור הראשון; כאן זה על שינוי.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  const value = useMemo<LanguageContextType>(() => {
    const txt = getDictionary(locale);
    return {
      txt,
      locale,
      setLocale,
      dir: getDirection(locale),
      needsLanguageChoice: stored === null,
      categoryLabel: (category: string) => categoryLabel(txt, category),
      accountTypeLabel: (type: string) => accountTypeLabel(txt, type),
      trendLabel: (rating: string) => trendLabel(txt, rating),
      plural,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, stored]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};
