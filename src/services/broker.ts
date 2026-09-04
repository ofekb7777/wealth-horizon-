import { CapacitorHttp } from '@capacitor/core';
import { XMLParser } from 'fast-xml-parser';

/**
 * חיבור **קריאה בלבד** לברוקר, דרך Flex Web Service של Interactive Brokers.
 *
 * **למה דווקא IBKR ולמה זה מתאים לפרויקט הזה:** בהגדרות החשבון שלך
 * מייצרים טוקן אישי (תקף עד שנה) ומזהה שאילתה, וזהו. אין OAuth, אין
 * שרת באמצע, ואין צד שלישי שמחזיק את הנתונים שלך — בדיוק אותו מודל של
 * מפתח ה-AI שכבר יושב ב-localStorage על המכשיר.
 *
 * ⚠️ **זה לא בנקאות פתוחה, ולא יכול להיות.** בישראל גישה ל-API של
 * הבנקים מוסדרת בחוק שירות מידע פיננסי תשפ"ב-2021 ופתוחה רק לחברות
 * בעלות רישיון מרשות ניירות ערך. ראה `CLAUDE.md` §12.
 *
 * **הפרוטוקול הוא שני שלבים:**
 *   1. `SendRequest` עם הטוקן ומזהה השאילתה → מחזיר `ReferenceCode`.
 *   2. `GetStatement` עם ה-`ReferenceCode` → מחזיר את הדוח עצמו.
 * בין השניים השרת מייצר את הדוח, ולכן שלב 2 עשוי להחזיר "בהכנה"
 * (קוד 1019) וצריך לנסות שוב.
 *
 * **חוק ברזל, כמו בכל שאר קריאות הרשת (§7): לא זורק, לא חוסם מסך.**
 * כישלון מוחזר כאובייקט תוצאה עם הודעה, והתיק נשאר כפי שהיה.
 *
 * בדפדפן IBKR חוסם CORS, בדיוק כמו Yahoo — הסנכרון עובד באנדרואיד.
 */

const TOKEN_KEY = 'ibkr_flex_token';
const QUERY_KEY = 'ibkr_flex_query_id';

const SEND_REQUEST_URL =
  'https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService/SendRequest';
const GET_STATEMENT_URL =
  'https://gdcdyn.interactivebrokers.com/AccountManagement/FlexWebService/GetStatement';

/** גרסת הפרוטוקול. IBKR דורשים אותה במפורש בכל בקשה. */
const API_VERSION = '3';

/** השרת עדיין מייצר את הדוח — צריך לנסות שוב, לא להיכשל. */
const STILL_GENERATING = new Set(['1019', '1009']);
const MAX_POLLS = 5;
const POLL_DELAY_MS = 2000;

export interface BrokerCredentials {
  token: string;
  queryId: string;
}

export interface BrokerPosition {
  symbol: string;
  name: string;
  exchange: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  currency: string;
}

export type BrokerResult =
  | { ok: true; positions: BrokerPosition[]; accountId: string }
  /** `message` מגיע מ-IBKR באנגלית ומוצג כמו שהוא, לצד הודעה מתורגמת. */
  | { ok: false; code: string; message: string };

export function getBrokerCredentials(): BrokerCredentials {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY) || '',
      queryId: localStorage.getItem(QUERY_KEY) || '',
    };
  } catch {
    return { token: '', queryId: '' };
  }
}

export function setBrokerCredentials({ token, queryId }: BrokerCredentials): void {
  try {
    const t = token.trim();
    const q = queryId.trim();
    if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY);
    if (q) localStorage.setItem(QUERY_KEY, q); else localStorage.removeItem(QUERY_KEY);
  } catch (e) {
    console.error('Could not save the broker credentials', e);
  }
}

export function hasBrokerCredentials(): boolean {
  const { token, queryId } = getBrokerCredentials();
  return token.length > 0 && queryId.length > 0;
}

/*
 * `parseAttributeValue: false` בכוונה: מזהי הפניה של IBKR הם מחרוזות
 * אטומות שיכולות להיראות כמו מספרים, והמרה אוטומטית הייתה מאבדת אפסים
 * מובילים. כל המרה למספר נעשית כאן, עם בדיקה.
 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
});

/** מחזיר מספר סופי, או `fallback` כשהערך חסר או לא מספרי. */
function num(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'string' ? Number(value) : Number(value ?? NaN);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** רכיב שמופיע פעם אחת מגיע כאובייקט; פעמיים ומעלה — כמערך. */
function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

export type SendRequestOutcome =
  | { ok: true; referenceCode: string; url: string }
  | { ok: false; code: string; message: string };

/** מפענח את תשובת שלב 1. מיוצא לבדיקות. */
export function parseSendRequest(xml: string): SendRequestOutcome {
  let root: any;
  try {
    root = parser.parse(xml)?.FlexStatementResponse;
  } catch {
    root = null;
  }
  if (!root) {
    return { ok: false, code: 'PARSE', message: 'Unexpected response from Interactive Brokers.' };
  }

  if (String(root.Status) === 'Success' && root.ReferenceCode) {
    return {
      ok: true,
      referenceCode: String(root.ReferenceCode),
      url: root.Url ? String(root.Url) : GET_STATEMENT_URL,
    };
  }

  return {
    ok: false,
    code: root.ErrorCode ? String(root.ErrorCode) : 'UNKNOWN',
    message: root.ErrorMessage ? String(root.ErrorMessage) : 'Interactive Brokers rejected the request.',
  };
}

/**
 * מפענח את דוח האחזקות. **פונקציה טהורה** — כל הלוגיקה נבדקת בלי רשת.
 *
 * מדלג על שורות בלי סימול או בלי כמות: דוח Flex יכול להכיל סגירות
 * ופוזיציות אפס, ואין טעם להכניס אותן לתיק.
 */
export function parsePositions(xml: string): BrokerPosition[] {
  let statements: any[];
  try {
    const root = parser.parse(xml)?.FlexQueryResponse;
    statements = asArray(root?.FlexStatements?.FlexStatement);
  } catch {
    return [];
  }

  const out: BrokerPosition[] = [];
  for (const statement of statements) {
    for (const row of asArray(statement?.OpenPositions?.OpenPosition)) {
      const symbol = String(row?.symbol ?? '').trim();
      const shares = num(row?.position);
      if (!symbol || shares === 0) continue;

      /*
       * מחיר הקנייה: IBKR מספקים אותו בשלוש צורות תלוי בהגדרת השאילתה.
       * `costBasisPrice` הוא הישיר; אחרת מחלקים את העלות הכוללת בכמות.
       */
      const avgPrice =
        num(row?.costBasisPrice) ||
        num(row?.openPrice) ||
        (num(row?.costBasisMoney) ? num(row.costBasisMoney) / shares : 0);

      out.push({
        symbol,
        name: String(row?.description ?? '').trim(),
        exchange: String(row?.listingExchange ?? row?.exchange ?? '').trim(),
        shares,
        avgPrice,
        currentPrice: num(row?.markPrice),
        currency: String(row?.currency ?? 'USD').trim(),
      });
    }
  }
  return out;
}

/** מזהה החשבון, להצגה בלבד. ריק כשהדוח לא כולל אותו. */
export function parseAccountId(xml: string): string {
  try {
    const statements = asArray(parser.parse(xml)?.FlexQueryResponse?.FlexStatements?.FlexStatement);
    return String(statements[0]?.accountId ?? '').trim();
  } catch {
    return '';
  }
}

async function get(url: string, params: Record<string, string>): Promise<string | null> {
  try {
    const res = await CapacitorHttp.get({
      url,
      params,
      // IBKR דוחים בקשות בלי user-agent מוכר.
      headers: { Accept: 'application/xml', 'User-Agent': 'Java' },
      readTimeout: 30000,
      connectTimeout: 15000,
    });
    if (res.status < 200 || res.status >= 300) return null;
    return typeof res.data === 'string' ? res.data : String(res.data ?? '');
  } catch (e) {
    console.warn('[broker] request failed', e);
    return null;
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const NO_NETWORK: BrokerResult = {
  ok: false,
  code: 'NETWORK',
  message: 'Could not reach Interactive Brokers.',
};

/**
 * מושך את האחזקות. שני שלבים, עם המתנה בין ניסיונות כשהדוח עוד בהכנה.
 *
 * מחזיר תוצאה ולא זורק — הקורא מציג הודעה, והתיק לא משתנה בכישלון.
 */
export async function fetchBrokerPositions(): Promise<BrokerResult> {
  const { token, queryId } = getBrokerCredentials();
  if (!token || !queryId) {
    return { ok: false, code: 'NO_CREDENTIALS', message: 'No broker token saved.' };
  }

  const requestXml = await get(SEND_REQUEST_URL, { v: API_VERSION, t: token, q: queryId });
  if (!requestXml) return NO_NETWORK;

  const outcome = parseSendRequest(requestXml);
  /*
   * `=== false` ולא `!outcome.ok`: ב-tsconfig של הפרויקט
   * `strictNullChecks` כבוי, ובמצב הזה TypeScript לא מצמצם טיפוס איחוד
   * לפי truthiness — רק לפי השוואה מפורשת לדיסקרימיננט.
   */
  if (outcome.ok === false) return outcome;

  for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
    const statementXml = await get(outcome.url, {
      v: API_VERSION, t: token, q: outcome.referenceCode,
    });
    if (!statementXml) return NO_NETWORK;

    // תשובת שגיאה בשלב 2 מגיעה באותה מעטפת של שלב 1.
    if (statementXml.includes('<FlexStatementResponse')) {
      const error = parseSendRequest(statementXml);
      if (error.ok === false) {
        if (STILL_GENERATING.has(error.code) && attempt < MAX_POLLS - 1) {
          await wait(POLL_DELAY_MS);
          continue;
        }
        return error;
      }
    }

    return {
      ok: true,
      positions: parsePositions(statementXml),
      accountId: parseAccountId(statementXml),
    };
  }

  return { ok: false, code: '1019', message: 'Statement generation is still in progress.' };
}
