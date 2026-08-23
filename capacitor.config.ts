import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ofekb.wealthhorizon',
  appName: 'Wealth Horizon',

  // התיקייה ש-`npm run build` מייצר. `npx cap sync` מעתיק ממנה
  // אל תוך פרויקט האנדרואיד.
  webDir: 'dist',

  android: {
    // מונע את המסך הלבן שנצבע לרגע לפני שה-UI הכהה עולה.
    backgroundColor: '#09090b',
  },

  plugins: {
    CapacitorSQLite: {
      android: {
        // בלי הצפנה: זו אפליקציה אישית על המכשיר, והצפנה הייתה מחייבת
        // ניהול סיסמה שאין לי איפה לשמור בבטחה בלי חשבון.
        databaseLocation: 'default',
      },
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#09090b',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      // מוסתר ידנית ברגע שהמסד נפתח — ראה src/native/setup.ts
      launchAutoHide: false,
    },
  },
};

export default config;
