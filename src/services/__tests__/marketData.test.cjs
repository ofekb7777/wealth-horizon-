/*
 * בדיקות לחיפוש הסימולים.
 *
 * הרצה:  npm run test:search
 *
 * הבדיקה החשובה כאן היא הראשונה: עד היום החיפוש היה תלוי לגמרי
 * ב-Yahoo, ש-CORS חוסם לו את הדרך בדפדפן. אופק ראה SPY על המסך
 * (רשימת קיצורים קשיחה) אבל חיפוש "SPY" לא מצא כלום. כל הבדיקות
 * כאן רצות **בלי רשת בכלל**.
 */
const { searchCatalog, searchTickers } = require('../../../.test-build/marketData.cjs');
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { console.log('✓', name); pass++; }
  else { console.log('✗', name, extra); fail++; }
};

// --- הבאג המקורי ---
const spy = searchCatalog('SPY');
check('חיפוש "SPY" מוצא את SPY בלי רשת', spy.length > 0 && spy[0].symbol === 'SPY',
  `קיבלתי ${JSON.stringify(spy.slice(0, 2))}`);
check('SPY מגיע עם שם ובורסה', !!spy[0] && !!spy[0].shortname && !!spy[0].exchange);

// --- שאר רשימת הקיצורים שמוצגת כשתיבת החיפוש ריקה ---
for (const t of ['QQQ', 'AAPL', 'NVDA', 'TSLA', 'BTC-USD']) {
  const r = searchCatalog(t);
  check(`חיפוש "${t}" מוצא אותו`, r.length > 0 && r[0].symbol === t,
    `קיבלתי ${r[0] && r[0].symbol}`);
}

// --- דירוג ---
check('התאמה מדויקת מנצחת התאמה חלקית', searchCatalog('V')[0].symbol === 'V');
check('חיפוש לפי שם עובד', searchCatalog('apple').some(r => r.symbol === 'AAPL'));
check('חיפוש לא רגיש לאותיות', searchCatalog('spy')[0].symbol === 'SPY');
check('רווחים בקצוות לא מפריעים', searchCatalog('  SPY  ')[0].symbol === 'SPY');

// --- גבולות ---
check('שאילתה ריקה מחזירה ריק', searchCatalog('').length === 0);
check('רק רווחים מחזיר ריק', searchCatalog('   ').length === 0);
check('שאילתה שאינה קיימת מחזירה ריק', searchCatalog('ZZZQQQNOPE').length === 0);
check('לכל היותר 10 תוצאות', searchCatalog('A').length <= 10, `קיבלתי ${searchCatalog('A').length}`);
check('אין כפילויות בתוצאה', (() => {
  const r = searchCatalog('A').map(x => x.symbol);
  return new Set(r).size === r.length;
})());

// --- מניות תל אביב וקריפטו ---
check('מניית תל אביב נמצאת', searchCatalog('TEVA').some(r => r.symbol === 'TEVA.TA'));
check('קריפטו נמצא לפי שם', searchCatalog('bitcoin').some(r => r.symbol === 'BTC-USD'));

// --- המסלול המלא, כש-Yahoo לא זמין (בדיוק כמו בדפדפן) ---
(async () => {
  const merged = await searchTickers('SPY');
  check('searchTickers מחזיר SPY גם כש-Yahoo נופל', merged.length > 0 && merged[0].symbol === 'SPY');
  check('searchTickers לא זורק בלי רשת', Array.isArray(merged));
  check('searchTickers על שאילתה ריקה מחזיר ריק', (await searchTickers('')).length === 0);

  const noMatch = await searchTickers('ZZZQQQNOPE');
  check('שאילתה שאינה קיימת מחזירה ריק ולא שגיאה', Array.isArray(noMatch) && noMatch.length === 0);

  console.log(`\n${pass} עברו, ${fail} נכשלו`);
  process.exit(fail ? 1 : 0);
})();
