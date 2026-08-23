import { Capacitor } from '@capacitor/core';

/**
 * עטיפה דקה מעל ה-APIs הנייטיביים של Capacitor.
 *
 * כל פונקציה כאן בטוחה לקריאה גם בדפדפן — שם היא פשוט לא עושה כלום.
 * כך `App.tsx` לא צריך לבדוק פלטפורמה בשום מקום.
 *
 * התוספים מיובאים דינמית (`await import`) ולא בראש הקובץ, כדי שקוד
 * נייטיב לא ייכנס לבאנדל של הדפדפן.
 */

/** האם אנחנו רצים בתוך אפליקציה אמיתית (ולא בטאב בדפדפן). */
export const isNative = Capacitor.isNativePlatform();

/**
 * צובע את סרגל הסטטוס של אנדרואיד בצבע הרקע של האפליקציה,
 * כדי שהשעה והסוללה לא ירחפו על רצועה לבנה מעל UI כהה.
 */
export async function initStatusBar(): Promise<void> {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark }); // אייקונים בהירים
    await StatusBar.setBackgroundColor({ color: '#09090b' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    console.warn('[native] status bar unavailable', e);
  }
}

/**
 * מסתיר את מסך הפתיחה. נקרא רק אחרי שהמסד נפתח — כך המשתמש רואה
 * את הלוגו עד שיש מה להציג, במקום מסך טעינה ריק.
 */
export async function hideSplashScreen(): Promise<void> {
  if (!isNative) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.warn('[native] splash screen unavailable', e);
  }
}

/**
 * רושם מטפל לכפתור "חזור" של אנדרואיד.
 *
 * `handler` מחזיר `true` אם הוא טיפל בלחיצה (סגר מודל, ניווט אחורה).
 * מחזיר `false` → האפליקציה עוברת לרקע, כמו לחיצה על Home.
 * **לא סוגרים את האפליקציה**, כי אז המשתמש מאבד את המקום שבו היה.
 *
 * מחזיר פונקציית ביטול רישום.
 */
export function onAndroidBack(handler: () => boolean): () => void {
  if (!isNative) return () => {};

  let remove: (() => void) | null = null;
  let cancelled = false;

  (async () => {
    try {
      const { App } = await import('@capacitor/app');
      const listener = await App.addListener('backButton', () => {
        if (!handler()) App.minimizeApp();
      });
      if (cancelled) listener.remove();
      else remove = () => listener.remove();
    } catch (e) {
      console.warn('[native] back button unavailable', e);
    }
  })();

  return () => {
    cancelled = true;
    remove?.();
  };
}
