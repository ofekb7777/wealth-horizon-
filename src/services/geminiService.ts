import { CapacitorHttp } from '@capacitor/core';
import { SpreadsheetState } from "../types";

/**
 * תובנות AI.
 *
 * עד שלב 2 זה עבר דרך `/api/gemini` ב-`server.ts`, שהחזיק את המפתח
 * בצד השרת. השרת נמחק, ולכן המפתח עבר להיות **אישי ושמור על המכשיר**:
 * מזינים אותו במסך ההגדרות, והוא נשמר ב-localStorage בלבד ולא נשלח
 * לשום מקום חוץ מ-Google.
 *
 * בלי מפתח או בלי רשת הפיצ'ר פשוט לא מחזיר תובנות. הוא לא מתרסק
 * ולא חוסם שום דבר אחר באפליקציה.
 */

const KEY_STORAGE = 'gemini_api_key';
// אפשר להחליף לדגם אחר בלי לגעת בשאר הקוד.
const MODEL = 'gemini-2.0-flash';

export function getApiKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed);
    else localStorage.removeItem(KEY_STORAGE);
  } catch (e) {
    console.error('Could not save the Gemini key', e);
  }
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

/**
 * מחזיר JSON כמחרוזת, או `"[]"` כשאין מפתח, אין רשת, או שהתשובה
 * לא הגיעה בפורמט צפוי. מי שקורא לא צריך try/catch.
 */
export async function getFinancialInsights(state: SpreadsheetState): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return "[]";

  const totalBalance = (state.accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvValue = (state.investments || []).reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);

  const summary = {
    netWorth: totalBalance + totalInvValue,
    cashReserve: totalBalance,
    investments: (state.investments || []).map(inv => ({
      ticker: inv.ticker,
      gainPercent: inv.avgPrice > 0 ? ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100 : 0,
      value: inv.shares * inv.currentPrice
    })),
    recentSpend: (state.transactions || []).filter(t => t.amount < 0).slice(0, 10).map(t => ({
      cat: t.category,
      amount: Math.abs(t.amount)
    })),
    goals: (state.goals || []).map(g => ({
      name: g.name,
      completion: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
    }))
  };

  try {
    const res = await CapacitorHttp.post({
      url: `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      params: { key: apiKey },
      headers: { 'Content-Type': 'application/json' },
      data: {
        contents: [{
          parts: [{
            text: `Analyze this financial profile: ${JSON.stringify(summary, null, 2)}...`,
          }],
        }],
        generationConfig: { responseMimeType: 'application/json' },
      },
      readTimeout: 30000,
      connectTimeout: 15000,
    });

    if (res.status < 200 || res.status >= 300) {
      console.warn(`[gemini] request rejected (${res.status})`);
      return "[]";
    }

    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  } catch (error) {
    console.warn('[gemini] insights unavailable', error);
    return "[]";
  }
}
