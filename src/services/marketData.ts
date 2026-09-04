import { CapacitorHttp } from '@capacitor/core';
import { tickerCatalog } from '../data/tickers';

/**
 * נתוני שוק — נקראים ישירות מהמכשיר, בלי שרת באמצע.
 *
 * עד שלב 2 זה עבר דרך `server.ts` שהריץ `yahoo-finance2`. השרת נמחק,
 * ולכן הקריאות עברנו לכאן דרך `CapacitorHttp` — שכשהוא רץ באנדרואיד
 * עוקף את מגבלות ה-CORS של הדפדפן.
 *
 * **חוק ברזל: אף פונקציה כאן לא זורקת ולא מחזירה 0.**
 * אין רשת → מחזירים את המחיר האחרון שנשמר, עם חותמת זמן. האפליקציה
 * חייבת לעבוד במלואה במצב טיסה, ומחיר ישן עדיף על שגיאה או על אפס.
 *
 * הערה לדפדפן: Yahoo לא מאפשר CORS, ולכן בפיתוח בדפדפן הקריאות ייכשלו
 * ויוצגו מחירים מוטמנים. באנדרואיד זה עובד. זה מכוון ולא באג.
 *
 * **חיפוש סימולים לא תלוי ב-Yahoo בכלל.** הוא עונה מהקטלוג הארוז
 * (`data/tickers.ts`) ורק מוסיף מעליו תוצאות רשת כשהן זמינות. עד שלב 7
 * הוא היה תלוי בו לגמרי, ולכן פשוט לא עבד בדפדפן.
 */

const YAHOO = 'https://query1.finance.yahoo.com';
const CACHE_KEY = 'market_price_cache';

interface CachedPrice {
  price: number;
  at: string; // ISO
}

type PriceCache = Record<string, CachedPrice>;

function readCache(): PriceCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(cache: PriceCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('[market] could not cache prices', e);
  }
}

/** המחיר האחרון שנשמר עבור טיקר, אם יש. */
export function getCachedPrice(ticker: string): CachedPrice | null {
  return readCache()[ticker] ?? null;
}

/** מתי עודכן לאחרונה מחיר כלשהו — להצגת "עודכן ב-". */
export function getLastPriceUpdate(): string | null {
  const entries = Object.values(readCache());
  if (entries.length === 0) return null;
  return entries.map(e => e.at).sort().pop() ?? null;
}

async function getJson(url: string, params?: Record<string, string>): Promise<any | null> {
  try {
    const res = await CapacitorHttp.get({
      url,
      params,
      headers: { Accept: 'application/json' },
      readTimeout: 10000,
      connectTimeout: 10000,
    });
    if (res.status < 200 || res.status >= 300) return null;
    return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
  } catch (e) {
    // נכשל בשקט — זו הנקודה שבה "אין רשת" הופך ל"נשתמש במוטמן".
    console.warn('[market] request failed, falling back to cache');
    return null;
  }
}

/** מוציא את המחיר האחרון מתשובת chart של Yahoo. */
function priceFromChart(json: any): number | null {
  const meta = json?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice ?? meta?.previousClose;
  return typeof price === 'number' && price > 0 ? price : null;
}

function historyFromChart(json: any): { date: Date; price: number }[] {
  const result = json?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp ?? [];
  const closes: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? [];
  const out: { date: Date; price: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (typeof close === 'number') {
      out.push({ date: new Date(timestamps[i] * 1000), price: close });
    }
  }
  return out;
}

/**
 * מחירים נוכחיים. מחזיר תמיד ערך לכל טיקר שיש לו מחיר מוטמן,
 * גם כשאין רשת בכלל.
 */
export async function fetchPrices(tickers: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(tickers.filter(Boolean))];
  const cache = readCache();
  const out: Record<string, number> = {};

  // מתחילים מהמוטמן, כדי שגם כישלון מלא יחזיר משהו שמיש.
  for (const ticker of unique) {
    if (cache[ticker]) out[ticker] = cache[ticker].price;
  }

  const now = new Date().toISOString();
  await Promise.all(unique.map(async (ticker) => {
    const json = await getJson(`${YAHOO}/v8/finance/chart/${encodeURIComponent(ticker)}`, {
      interval: '1d', range: '1d',
    });
    const price = json && priceFromChart(json);
    if (price) {
      out[ticker] = price;
      cache[ticker] = { price, at: now };
    }
  }));

  writeCache(cache);
  return out;
}

export interface SearchResult {
  symbol: string;
  shortname: string;
  exchange: string;
  typeDisp: string;
}

/**
 * דירוג התאמה בין שאילתה לנייר ערך. מחזיר 0 כשאין התאמה בכלל.
 *
 * הסימול שוקל יותר מהשם: מי שמקליד "SPY" מחפש את SPY עצמו, לא כל
 * קרן שהמילה מופיעה בשמה.
 */
function matchScore(upperQuery: string, symbol: string, name: string): number {
  const sym = symbol.toUpperCase();
  const nm = name.toUpperCase();
  if (sym === upperQuery) return 100;
  if (nm === upperQuery) return 90;
  if (sym.startsWith(upperQuery)) return 80;
  if (nm.startsWith(upperQuery)) return 70;
  if (sym.includes(upperQuery)) return 60;
  if (nm.includes(upperQuery)) return 50;
  return 0;
}

const LIMIT = 10;

function rank(items: (SearchResult & { score: number })[]): SearchResult[] {
  return items
    .sort((a, b) => b.score - a.score || a.symbol.localeCompare(b.symbol))
    .slice(0, LIMIT)
    .map(({ score: _score, ...rest }) => rest);
}

/**
 * חיפוש בקטלוג הארוז. **סינכרוני, בלי רשת, אף פעם לא נכשל.**
 *
 * זו הסיבה שהחיפוש עובד בדפדפן (ש-Yahoo חוסם לו CORS), במצב טיסה,
 * וכשמגיעים לחסימת קצב מצד Yahoo. עד היום החיפוש היה תלוי לגמרי
 * ברשת ולכן פשוט לא עבד בדפדפן.
 */
export function searchCatalog(query: string): SearchResult[] {
  const upper = query.trim().toUpperCase();
  if (!upper) return [];

  const hits: (SearchResult & { score: number })[] = [];
  for (const { symbol, name, exchange } of tickerCatalog()) {
    const score = matchScore(upper, symbol, name);
    if (score > 0) {
      hits.push({ symbol, shortname: name, exchange, typeDisp: exchange, score });
    }
  }
  return rank(hits);
}

/**
 * חיפוש מלא: הקטלוג המקומי, ומעליו תוצאות Yahoo כשיש רשת.
 *
 * Yahoo מוסיף ניירות שלא נכנסו לקטלוג (חברות קטנות, בורסות זרות).
 * כשהוא לא זמין פשוט נשארים עם המקומי — בלי שגיאה ובלי רשימה ריקה.
 *
 * הערה: קודם נמשך כאן גם גרף שנתי לכל אחת מעשר התוצאות. אף אחד מהם
 * לא הוצג בשום מקום (התצוגה היא סימול/שם/בורסה בלבד), והם הפכו כל
 * הקלדה ל-11 בקשות רשת — מספיק כדי לגרור חסימת קצב מ-Yahoo, שבתורה
 * החזירה "אין תוצאות". הם נמחקו.
 */
export async function searchTickers(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const upper = q.toUpperCase();
  const local = searchCatalog(q);
  const seen = new Set(local.map(r => r.symbol.toUpperCase()));

  const json = await getJson(`${YAHOO}/v1/finance/search`, {
    q, quotesCount: String(LIMIT), newsCount: '0',
  });
  const quotes: any[] = json?.quotes ?? [];

  const merged: (SearchResult & { score: number })[] = local.map(r => ({
    ...r,
    score: matchScore(upper, r.symbol, r.shortname),
  }));

  for (const quote of quotes) {
    const symbol = quote?.symbol as string | undefined;
    if (!symbol || seen.has(symbol.toUpperCase())) continue;
    seen.add(symbol.toUpperCase());
    const shortname = (quote.shortname || quote.longname || symbol) as string;
    merged.push({
      symbol,
      shortname,
      exchange: (quote.exchange || 'Market') as string,
      typeDisp: (quote.typeDisp || quote.quoteType || 'Asset') as string,
      score: matchScore(upper, symbol, shortname),
    });
  }

  return rank(merged);
}

export interface TickerAnalytics {
  perf: { '1M': number; '3M': number; '6M': number; '1Y': number };
  rating: string;
  score: number;
  ma20: number | null;
  ma50: number | null;
  ma200: number | null;
  history: { date: Date; price: number }[];
}

/**
 * ביצועים וממוצעים נעים. אותו חישוב שרץ קודם בשרת, רק מקומית.
 *
 * ⚠️ `rating` הוא תוצאה של ארבע השוואות לממוצעים נעים, לא המלצת השקעה.
 * ראה מלכודת #5 ב-CLAUDE.md.
 */
export async function fetchAnalytics(tickers: string[]): Promise<Record<string, TickerAnalytics>> {
  const unique = [...new Set(tickers.filter(Boolean))];
  const out: Record<string, TickerAnalytics> = {};

  await Promise.all(unique.map(async (ticker) => {
    const json = await getJson(`${YAHOO}/v8/finance/chart/${encodeURIComponent(ticker)}`, {
      interval: '1d', range: '1y',
    });
    if (!json) return;

    const history = historyFromChart(json);
    if (history.length === 0) return;

    const current = history[history.length - 1].price;
    const perfOver = (days: number) => {
      const past = history[Math.max(0, history.length - days)].price;
      return past > 0 ? ((current - past) / past) * 100 : 0;
    };
    const movingAverage = (period: number) => {
      if (history.length < period) return null;
      const slice = history.slice(-period);
      return slice.reduce((sum, q) => sum + q.price, 0) / period;
    };

    const ma20 = movingAverage(20);
    const ma50 = movingAverage(50);
    const ma200 = movingAverage(200);

    let score = 0;
    score += ma20 && current > ma20 ? 1 : -1;
    score += ma50 && current > ma50 ? 1 : -1;
    score += ma200 && current > ma200 ? 1 : -1;
    score += ma20 && ma50 && ma20 > ma50 ? 1 : -1;

    let rating = 'Neutral';
    if (score >= 3) rating = 'Strong Buy';
    else if (score >= 1) rating = 'Buy';
    else if (score <= -3) rating = 'Strong Sell';
    else if (score <= -1) rating = 'Sell';

    out[ticker] = {
      perf: { '1M': perfOver(21), '3M': perfOver(63), '6M': perfOver(126), '1Y': perfOver(252) },
      rating, score, ma20, ma50, ma200, history,
    };
  }));

  return out;
}
