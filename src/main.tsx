import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider, migrateExistingInstallToHebrew, readStoredLocale } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { VersionProvider } from './context/VersionContext.tsx';
import { DEFAULT_LOCALE, getDirection } from './i18n';
import './index.css';

/*
 * שפה וכיוון נקבעים **לפני** הרינדור הראשון.
 *
 * `index.html` נשלח עם אנגלית ו-LTR, כי זו ברירת המחדל. אם המשתמש בחר
 * ערבית או עברית, מציבים את הכיוון כאן — אחרת הפריים הראשון היה נצבע
 * בכיוון ההפוך ואז מתהפך מול העיניים.
 */
migrateExistingInstallToHebrew();
const startupLocale = readStoredLocale() ?? DEFAULT_LOCALE;
document.documentElement.lang = startupLocale;
document.documentElement.dir = getDirection(startupLocale);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <VersionProvider>
          <App />
        </VersionProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);

/*
 * ניקוי שאריות מגרסת ה-PWA.
 *
 * גרסאות קודמות רשמו service worker (למעשה שלושה מתנגשים). מי שפתח
 * את האפליקציה בדפדפן עדיין נושא אחד כזה, והוא ימשיך להגיש קבצים
 * ישנים מהמטמון. מבטלים את הרישום ומנקים את המטמון פעם אחת.
 */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(regs => Promise.all(regs.map(r => r.unregister())))
    .catch(() => {});
}
if ('caches' in window) {
  caches.keys()
    .then(keys => Promise.all(keys.map(k => caches.delete(k))))
    .catch(() => {});
}
