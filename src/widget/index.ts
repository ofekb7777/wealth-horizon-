import { registerPlugin, Capacitor } from '@capacitor/core';
import { SpreadsheetState, Currency } from '../types';
import { buildSnapshot, WidgetSnapshot } from './snapshot';

export type { WidgetSnapshot } from './snapshot';
export { buildSnapshot } from './snapshot';

interface WidgetBridgePlugin {
  /** כותב את ה-snapshot ומרענן את הווידג'טים על מסך הבית. */
  updateWidget(options: { snapshot: string }): Promise<void>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

const isNative = Capacitor.isNativePlatform();

/**
 * כמה זמן להמתין לפני כתיבה בפועל.
 *
 * `onUpdateTransaction` נקרא בכל הקשה במקלדת. בלי ההשהיה הזו כל תו
 * היה מפעיל כתיבה ל-SharedPreferences וריענון של הווידג'ט.
 */
const DEBOUNCE_MS = 1500;

let pending: ReturnType<typeof setTimeout> | null = null;
let lastPayload: string | null = null;

async function write(snapshot: WidgetSnapshot): Promise<void> {
  const payload = JSON.stringify(snapshot);

  // `lastUpdated` משתנה בכל בנייה, ולכן משווים בלעדיו — אחרת כל קריאה
  // הייתה נראית כמו שינוי אמיתי.
  const comparable = JSON.stringify({ ...snapshot, lastUpdated: '' });
  if (comparable === lastPayload) return;
  lastPayload = comparable;

  try {
    await WidgetBridge.updateWidget({ snapshot: payload });
  } catch (e) {
    // הווידג'ט הוא תוספת. אם הגשר לא זמין, האפליקציה ממשיכה כרגיל.
    console.warn('[widget] could not publish snapshot', e);
  }
}

/**
 * מפרסם את מצב האפליקציה לווידג'ט.
 *
 * בטוח לקריאה אחרי כל שינוי בנתונים — הקריאות מתמזגות להשהיה אחת,
 * ומצב זהה לא נכתב פעמיים. בדפדפן זה לא עושה כלום.
 */
export function publishSnapshot(state: SpreadsheetState, currency: Currency): void {
  if (!isNative) return;

  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    void write(buildSnapshot(state, currency));
  }, DEBOUNCE_MS);
}
