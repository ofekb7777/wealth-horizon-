import { CapacitorHttp } from '@capacitor/core';
import { SpreadsheetState } from '../types';

/**
 * תובנות AI — Gemini או Claude, לפי בחירת המשתמש.
 *
 * עד שלב 2 זה עבר דרך `/api/gemini` ב-`server.ts`, שהחזיק את המפתח
 * בצד השרת. השרת נמחק, ולכן המפתח עבר להיות **אישי ושמור על המכשיר**:
 * מזינים אותו במסך ההגדרות, הוא נשמר ב-localStorage בלבד, ונשלח רק
 * לספק שהוא שייך לו — מפתח Gemini רק ל-Google, מפתח Anthropic רק
 * ל-Anthropic.
 *
 * **חוזה קבוע: מחזיר `"[]"` בלי מפתח, בלי רשת, או בתשובה לא צפויה.
 * לא זורק, ולא חוסם שום מסך.** מי שקורא לא צריך try/catch.
 *
 * **למה HTTP גולמי ולא ה-SDK הרשמי של Anthropic:** ה-SDK חוסם שימוש
 * מהדפדפן כברירת מחדל, ובאנדרואיד `CapacitorHttp` הוא הדבר היחיד
 * שעוקף CORS. זו בדיוק הסיבה ש-Gemini ו-`marketData` כבר עובדים ככה.
 */

export type AiProvider = 'gemini' | 'claude';

const PROVIDER_STORAGE = 'ai_provider';

/** `gemini_api_key` נשאר בשמו המקורי כדי שמפתח קיים לא ייעלם. */
const KEY_STORAGE: Record<AiProvider, string> = {
  gemini: 'gemini_api_key',
  claude: 'claude_api_key',
};

const GEMINI_MODEL = 'gemini-2.0-flash';
const CLAUDE_MODEL = 'claude-opus-5';

export function getProvider(): AiProvider {
  try {
    return localStorage.getItem(PROVIDER_STORAGE) === 'claude' ? 'claude' : 'gemini';
  } catch {
    return 'gemini';
  }
}

export function setProvider(provider: AiProvider): void {
  try {
    localStorage.setItem(PROVIDER_STORAGE, provider);
  } catch (e) {
    console.error('Could not save the AI provider', e);
  }
}

export function getApiKey(provider: AiProvider = getProvider()): string {
  try {
    return localStorage.getItem(KEY_STORAGE[provider]) || '';
  } catch {
    return '';
  }
}

export function setApiKey(provider: AiProvider, key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) localStorage.setItem(KEY_STORAGE[provider], trimmed);
    else localStorage.removeItem(KEY_STORAGE[provider]);
  } catch (e) {
    console.error('Could not save the API key', e);
  }
}

/** האם לספק הפעיל יש מפתח. */
export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

/** התקציר שנשלח לשני הספקים. מספרים בלבד — בלי תיאורי תנועות. */
function buildSummary(state: SpreadsheetState) {
  const totalBalance = (state.accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvValue = (state.investments || []).reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0);

  return {
    netWorth: totalBalance + totalInvValue,
    cashReserve: totalBalance,
    investments: (state.investments || []).map(inv => ({
      ticker: inv.ticker,
      gainPercent: inv.avgPrice > 0 ? ((inv.currentPrice - inv.avgPrice) / inv.avgPrice) * 100 : 0,
      value: inv.shares * inv.currentPrice,
    })),
    recentSpend: (state.transactions || []).filter(t => t.amount < 0).slice(0, 10).map(t => ({
      cat: t.category,
      amount: Math.abs(t.amount),
    })),
    goals: (state.goals || []).map(g => ({
      name: g.name,
      completion: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
    })),
  };
}

const PROMPT = 'Analyze this financial profile and reply with JSON only';

/** מקלף גדר ```json אם המודל עטף בה את התשובה. */
function stripFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return (fenced ? fenced[1] : text).trim();
}

async function geminiInsights(apiKey: string, summary: unknown): Promise<string> {
  const res = await CapacitorHttp.post({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    params: { key: apiKey },
    headers: { 'Content-Type': 'application/json' },
    data: {
      contents: [{ parts: [{ text: `${PROMPT}: ${JSON.stringify(summary, null, 2)}` }] }],
      generationConfig: { responseMimeType: 'application/json' },
    },
    readTimeout: 30000,
    connectTimeout: 15000,
  });

  if (res.status < 200 || res.status >= 300) {
    console.warn(`[ai] gemini rejected the request (${res.status})`);
    return '[]';
  }

  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === 'string' ? stripFence(text) : '[]';
}

async function claudeInsights(apiKey: string, summary: unknown): Promise<string> {
  const res = await CapacitorHttp.post({
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // נדרש רק למסלול הדפדפן בפיתוח; באנדרואיד הבקשה יוצאת נייטיב.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    data: {
      model: CLAUDE_MODEL,
      // הפלט הוא JSON קצר של תובנות. חשיבה מורחבת רק הייתה מוסיפה
      // השהיה ועלות על טלפון, בלי להוסיף דיוק על משימה בגודל הזה.
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `${PROMPT}, no prose and no code fence: ${JSON.stringify(summary, null, 2)}`,
      }],
    },
    readTimeout: 30000,
    connectTimeout: 15000,
  });

  if (res.status < 200 || res.status >= 300) {
    console.warn(`[ai] claude rejected the request (${res.status})`);
    return '[]';
  }

  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  // `content` הוא מערך בלוקים. מחפשים את בלוק הטקסט ולא לוקחים את
  // הראשון — כל בלוק שיתווסף לפניו בעתיד היה שובר את הפענוח בשקט.
  const block = Array.isArray(data?.content)
    ? data.content.find((b: { type?: string }) => b?.type === 'text')
    : null;
  return typeof block?.text === 'string' ? stripFence(block.text) : '[]';
}

/**
 * מחזיר JSON כמחרוזת, או `"[]"` כשאין מפתח, אין רשת, או שהתשובה
 * לא הגיעה בפורמט צפוי.
 */
export async function getFinancialInsights(state: SpreadsheetState): Promise<string> {
  const provider = getProvider();
  const apiKey = getApiKey(provider);
  if (!apiKey) return '[]';

  const summary = buildSummary(state);

  try {
    return provider === 'claude'
      ? await claudeInsights(apiKey, summary)
      : await geminiInsights(apiKey, summary);
  } catch (error) {
    console.warn(`[ai] insights unavailable (${provider})`, error);
    return '[]';
  }
}
