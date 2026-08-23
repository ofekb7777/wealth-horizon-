/*
 * בדיקות ל-buildSnapshot.
 *
 * הרצה:  npm run test:widget
 *
 * למה קובץ .cjs ולא מסגרת בדיקות: זו הבדיקה היחידה בפרויקט כרגע,
 * ולא רציתי להוסיף תלות שלמה בשביל 19 טענות. הסקריפט מהדר את המודול
 * עם esbuild ומריץ אותו ב-node.
 */
const { buildSnapshot } = require('../../../.test-build/snapshot.cjs');
let pass = 0, fail = 0;
const check = (name, cond, extra='') => {
  if (cond) { console.log('✓', name); pass++; }
  else { console.log('✗', name, extra); fail++; }
};

const now = new Date();
const thisMonth = (d) => new Date(now.getFullYear(), now.getMonth(), d).toISOString().split('T')[0];
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().split('T')[0];

const state = {
  accounts: [{ id:'a', name:'עו"ש', type:'Bank', balance: 5000 }, { id:'b', name:'מזומן', type:'Cash', balance: 500 }],
  investments: [{ id:'i', ticker:'AAPL', shares: 10, avgPrice: 100, currentPrice: 150 }],
  transactions: [
    { id:'1', date: thisMonth(3),  description:'שכר דירה', category:'Housing', amount: -3000, type:'expense' },
    { id:'2', date: thisMonth(10), description:'סופר',     category:'Food',    amount: -450,  type:'expense' },
    { id:'3', date: thisMonth(12), description:'משכורת',   category:'Salary',  amount: 12000, type:'income'  },
    { id:'4', date: lastMonth,     description:'חודש שעבר',category:'Food',    amount: -800,  type:'expense' },
    { id:'5', date: thisMonth(5),  description:'ללא type', category:'Food',    amount: -120 },
  ],
  budgets: [{ id:'b1', category:'Food', limit: 1500 }, { id:'b2', category:'Housing', limit: 3200 }],
  goals: [], activeSheetId:'0', notes:'', patchNotes:'',
};

const s = buildSnapshot(state, 'USD');

check('שווי נקי = מזומן + השקעות', s.balance === 5000 + 500 + 10*150, `קיבלתי ${s.balance}`);
check('הוצאה חודשית מסכמת רק את החודש הנוכחי', s.monthlySpend === 3000 + 450 + 120, `קיבלתי ${s.monthlySpend}`);
check('חודש קודם לא נספר', s.monthlySpend !== 3000 + 450 + 120 + 800);
check('הכנסה לא נספרת כהוצאה', s.monthlySpend < 12000);
check('תנועה בלי type מזוהה לפי סכום שלילי', s.monthlySpend === 3570);
check('סך התקציב', s.monthlyBudget === 4700, `קיבלתי ${s.monthlyBudget}`);
check('בדיוק 3 תנועות אחרונות', s.recentTransactions.length === 3);
check('ממוינות מהחדשה לישנה', s.recentTransactions[0].date >= s.recentTransactions[1].date);
check('החדשה ביותר ראשונה', s.recentTransactions[0].description === 'משכורת', s.recentTransactions[0].description);
check('עברית נשמרת', s.recentTransactions.some(t => /[֐-׿]/.test(t.description)));
check('סימן מטבע', s.currencySymbol === '$');
check('חותמת זמן תקינה', !isNaN(Date.parse(s.lastUpdated)));

// המרת מטבע
const ils = buildSnapshot(state, 'ILS');
check('המרה לשקל מוכפלת בשער', Math.abs(ils.balance - s.balance * 3.7) < 0.01, `${ils.balance} vs ${s.balance*3.7}`);
check('סימן שקל', ils.currencySymbol === '₪');

// מצב ריק — לא אמור לקרוס או להחזיר NaN
const empty = buildSnapshot({ accounts:[], investments:[], transactions:[], budgets:[], goals:[], activeSheetId:'0', notes:'', patchNotes:'' }, 'USD');
check('state ריק לא מתרסק', empty.balance === 0 && empty.monthlySpend === 0 && empty.monthlyBudget === 0);
check('state ריק בלי תנועות', empty.recentTransactions.length === 0);
check('אין NaN בשום שדה', !JSON.stringify(empty).includes('null') && ![empty.balance, empty.monthlySpend, empty.monthlyBudget].some(Number.isNaN));

// שדות חסרים לגמרי
const partial = buildSnapshot({ activeSheetId:'0', notes:'', patchNotes:'' }, 'USD');
check('שדות חסרים לא מפילים', partial.balance === 0 && partial.recentTransactions.length === 0);

// גודל ה-snapshot — חייב להישאר זעיר, הוא נכתב ל-SharedPreferences
check('snapshot קטן מ-2KB', JSON.stringify(s).length < 2048, `${JSON.stringify(s).length} bytes`);

console.log(`\n${pass} עברו, ${fail} נכשלו`);
process.exit(fail ? 1 : 0);
