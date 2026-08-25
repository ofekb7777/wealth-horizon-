import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { VersionProvider } from './context/VersionContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <VersionProvider>
        <App />
      </VersionProvider>
    </ThemeProvider>
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
