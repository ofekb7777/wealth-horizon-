/*
 * צד טקסט שלא תורגם, על ידי רינדור האפליקציה בדפדפן אמיתי.
 *
 * הרצה:  npm run build && npm run sweep:i18n
 *
 * **למה דפדפן ולא grep.** בשלב 3.5 חיפשנו טקסט לא מתורגם עם grep
 * ופספסנו — שלוש פעמים, כל פעם צורה אחרת. בשלב 7 התברר שנשארו מחרוזות
 * אנגליות בכל דיאלוג מחיקת הנתונים, בשמות ערכות הנושא, באפקטי הרקע
 * ובטופס התזכורות, ואף אחת מהן לא נמצאה בגרפ. הן נמצאו רק כשרינדרנו
 * את האפליקציה **בסינית** וסרקנו את ה-DOM אחרי טקסט לטיני. סינית היא
 * הגלאי הטוב ביותר: כל שריד באנגלית או בעברית בולט מיד.
 *
 * הסקריפט מרים `vite preview` בעצמו ומכבה אותו בסוף.
 *
 * playwright לא נמצא בתלויות הפרויקט בכוונה — הוא כבד, והבדיקה הזאת
 * רצה מדי פעם ולא בכל בנייה. אם הוא חסר, הסקריפט אומר מה להתקין.
 */
import { spawn } from 'node:child_process';

const PORT = 4188;
const URL = `http://127.0.0.1:${PORT}/`;

/** מילים לטיניות שנכון שיישארו כך: שמות מותג, סימולים, קודי מטבע. */
const ALLOWED = new Set([
  'wealth', 'horizon', 'settings', 'sqlite', 'excel', 'csv', 'json',
  'spy', 'qqq', 'aapl', 'nvda', 'tsla', 'btc', 'usd', 'eur', 'gbp', 'ils',
  'nasdaq', 'nyse', 'etf', 'crypto', 'tase', 'ai', 'id', 'data', 'v',
  'google', 'gemini', 'anthropic', 'claude', 'sk', 'ant', 'aiza',
  'english', 'chinese', 'hindi', 'spanish', 'arabic', 'hebrew', 'espanol',
]);

let playwright;
try {
  playwright = await import('playwright');
} catch {
  console.error('playwright לא מותקן. להתקנה חד-פעמית:\n');
  console.error('  npm i -D playwright && npx playwright install chromium\n');
  process.exit(2);
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
  stdio: 'ignore',
});
const stop = () => { try { server.kill(); } catch { /* כבר מת */ } };
process.on('exit', stop);

// ממתינים לשרת במקום לישון זמן קבוע.
for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(URL);
    if (res.ok) break;
  } catch { /* עוד לא עלה */ }
  await new Promise(r => setTimeout(r, 500));
}

/*
 * CHROMIUM_PATH מאפשר להצביע על דפדפן שכבר קיים במערכת, במקום להוריד
 * אחד דרך playwright. שימושי בסביבות שאין בהן גישה להורדות.
 */
let browser;
try {
  browser = await playwright.chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
} catch (error) {
  stop();
  console.error('לא הצלחתי להפעיל דפדפן:', error.message);
  console.error('\nלהתקנה:  npx playwright install chromium');
  console.error('או להצביע על דפדפן קיים:  CHROMIUM_PATH=/path/to/chrome npm run sweep:i18n');
  process.exit(2);
}
const page = await (await browser.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

await page.locator('button[lang="zh"]').click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: '继续' }).click();
await page.waitForTimeout(2500);

const findings = [];

async function scan(screen) {
  const texts = await page.evaluate(() => {
    const out = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walk.nextNode())) {
      const text = (node.textContent || '').trim();
      if (text && node.parentElement?.offsetParent) out.push(text);
    }
    return [...new Set(out)];
  });

  for (const text of texts) {
    // עברית, ערבית או דוונאגרי בזמן שהאפליקציה בסינית = מחרוזת שנעוצה בשפה.
    const wrongScript = /[֐-׿؀-ۿऀ-ॿ]/.test(text);
    const latin = (text.match(/[A-Za-z]{3,}/g) || [])
      .filter(w => !ALLOWED.has(w.toLowerCase()));
    if (wrongScript || latin.length) findings.push({ screen, text: text.slice(0, 90) });
  }
}

// בורר השפה עצמו מציג את כל השפות בכתב שלהן — זה נכון, ולא ממצא.
const IGNORE_SCREEN = '设置-languages';

for (const nav of ['首页', '账户', '分析', '收入', '支出', '预算', '投资']) {
  await page.getByText(nav, { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(900);
  await scan(nav);
}

await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')]
    .find(b => b.querySelector('svg.lucide-settings'));
  button?.click();
});
await page.waitForTimeout(1200);
await scan('设置');

await browser.close();
stop();

// כפתורי בחירת השפה בהגדרות הם היוצא מן הכלל היחיד.
const LANGUAGE_BUTTONS = new Set(['English', '中文', 'हिन्दी', 'Español', 'العربية', 'עברית']);
const real = findings.filter(f => !LANGUAGE_BUTTONS.has(f.text) && f.screen !== IGNORE_SCREEN);

if (real.length === 0) {
  console.log('✓ אין טקסט לא מתורגם באף מסך');
  process.exit(0);
}

console.log(`✗ ${real.length} מחרוזות לא מתורגמות:\n`);
for (const f of real) console.log(`  [${f.screen}] ${f.text}`);
process.exit(1);
