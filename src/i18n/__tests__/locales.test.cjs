/*
 * בדיקת שלמות המילונים.
 *
 * הרצה:  npm run test:i18n
 *
 * `Dictionary = typeof en` כבר תופס מפתח חסר ב-`npm run lint`, אבל הוא
 * לא תופס **ערך ריק** ולא מפתח שנשאר באנגלית בטעות. הבדיקה הזאת כן.
 */
const { LOCALES, getDictionary } = require('../../../.test-build/i18n.cjs');
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { console.log('✓', name); pass++; }
  else { console.log('✗', name, extra); fail++; }
};

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

const en = flatten(getDictionary('en'));
const enKeys = en.map(([k]) => k).sort();

check('יש שתי שפות', LOCALES.length === 2, `קיבלתי ${LOCALES.length}`);
check('אנגלית ראשונה — היא ברירת המחדל', LOCALES[0].code === 'en');
check('עברית מסומנת RTL',
  LOCALES.filter(l => l.dir === 'rtl').map(l => l.code).join(',') === 'he');
check('לכל שפה יש שם בשפה עצמה', LOCALES.every(l => l.nativeName && l.englishName));

for (const { code } of LOCALES) {
  const entries = flatten(getDictionary(code));
  const keys = entries.map(([k]) => k).sort();

  check(`${code}: אותם מפתחות בדיוק כמו באנגלית`,
    keys.join('|') === enKeys.join('|'),
    `חסר: ${enKeys.filter(k => !keys.includes(k)).join(', ') || '—'} | עודף: ${keys.filter(k => !enKeys.includes(k)).join(', ') || '—'}`);

  check(`${code}: אין ערך ריק`,
    entries.every(([, v]) => typeof v === 'string' && v.trim().length > 0),
    entries.filter(([, v]) => !String(v).trim()).map(([k]) => k).join(', '));

  if (code !== 'en') {
    // מפתחות טכניים שנשארים זהים בכל שפה — לא עדות לתרגום חסר.
    const SHARED = new Set(['analytics.range3m', 'analytics.range6m']);
    const untranslated = entries.filter(([k, v]) => {
      const enValue = en.find(([ek]) => ek === k)?.[1];
      return !SHARED.has(k) && !k.startsWith('categories.') && !k.startsWith('accountTypes.')
        && v === enValue && /[a-zA-Z]/.test(String(v));
    });
    check(`${code}: כמעט שום מחרוזת לא נשארה באנגלית`,
      untranslated.length <= 3,
      untranslated.map(([k, v]) => `${k}="${v}"`).join(', '));
  }
}

console.log(`\n${pass} עברו, ${fail} נכשלו`);
process.exit(fail ? 1 : 0);
