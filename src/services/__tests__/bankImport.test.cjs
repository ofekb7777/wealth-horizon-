/*
 * בדיקות לייבוא דפי בנק.
 *
 * הרצה:  npm run test:import
 *
 * הקבצים בבדיקות נבנים כאן ולא נשמרים בריפו — הם מדמים מבנים אמיתיים
 * של בנקים וכרטיסי אשראי בישראל: שורות כותרת לפני הטבלה, עמודות
 * חובה/זכות, תאריכים ביום/חודש/שנה, ומפרידי אלפים.
 */
const XLSX = require('xlsx');
const B = require('../../../.test-build/bankImport.cjs');

let pass = 0, fail = 0;
const check = (name, cond, extra='') => {
  if (cond) { console.log('✓', name); pass++; }
  else { console.log('✗', name, extra); fail++; }
};
const sheetFrom = (rows) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'גיליון1');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return B.readWorkbook(buf);
};
const OPTS = { rate: 1, defaultIncomeCategory: 'Salary', defaultExpenseCategory: 'Other Expense' };

console.log('=== פענוח תאריכים ===');
check('יום/חודש/שנה — 03/08/2026 הוא 3 באוגוסט', B.parseDate('03/08/2026') === '2026-08-03', B.parseDate('03/08/2026'));
check('לא מתפרש כפורמט אמריקאי', B.parseDate('03/08/2026') !== '2026-03-08');
check('יום דו-ספרתי 25/12/2025', B.parseDate('25/12/2025') === '2025-12-25', B.parseDate('25/12/2025'));
check('מפריד נקודה 01.02.2026', B.parseDate('01.02.2026') === '2026-02-01', B.parseDate('01.02.2026'));
check('מפריד מקף 5-3-2026', B.parseDate('5-3-2026') === '2026-03-05', B.parseDate('5-3-2026'));
check('שנה דו-ספרתית 15/06/25', B.parseDate('15/06/25') === '2025-06-15', B.parseDate('15/06/25'));
check('ISO נשמר', B.parseDate('2026-08-23') === '2026-08-23');
check('אובייקט Date', B.parseDate(new Date(2026, 7, 23)) === '2026-08-23', B.parseDate(new Date(2026,7,23)));
check('מספר סידורי של Excel', B.parseDate(46000) !== null);
check('31 בפברואר נדחה', B.parseDate('31/02/2026') === null);
check('חודש 13 נדחה', B.parseDate('01/13/2026') === null);
check('טקסט חופשי נדחה', B.parseDate('סה"כ') === null);
check('ריק נדחה', B.parseDate('') === null && B.parseDate(null) === null);

console.log('\n=== פענוח סכומים ===');
check('מפריד אלפים 1,234.56', B.parseAmount('1,234.56') === 1234.56, B.parseAmount('1,234.56'));
check('סימן שקל ₪1,200', B.parseAmount('₪1,200') === 1200, B.parseAmount('₪1,200'));
check('שלילי -450.20', B.parseAmount('-450.20') === -450.2);
check('סוגריים = שלילי (99.90)', B.parseAmount('(99.90)') === -99.9, B.parseAmount('(99.90)'));
check('מספר רגיל', B.parseAmount(543.21) === 543.21);
check('אפס הוא ערך תקין', B.parseAmount(0) === 0);
check('ריק מחזיר null', B.parseAmount('') === null && B.parseAmount(null) === null);
check('טקסט מחזיר null', B.parseAmount('לא מספר') === null);
check('אלפים גדולים 12,345,678', B.parseAmount('12,345,678') === 12345678, B.parseAmount('12,345,678'));

console.log('\n=== דף בנק ישראלי: שורות כותרת + חובה/זכות ===');
const bank = sheetFrom([
  ['בנק לדוגמה בע"מ'],
  ['תנועות בחשבון 12-345-678900'],
  [],
  ['תאריך', 'תאריך ערך', 'תיאור', 'חובה', 'זכות', 'יתרה'],
  ['03/08/2026', '03/08/2026', 'משכורת אוגוסט', '', '12,500.00', '15,200.00'],
  ['05/08/2026', '05/08/2026', 'שכר דירה', '4,200.00', '', '11,000.00'],
  ['07/08/2026', '07/08/2026', 'סופרמרקט', '312.45', '', '10,687.55'],
  [],
  ['סה"כ', '', '', '4,512.45', '12,500.00', ''],
]);
check('שורת הכותרות אותרה (אינדקס 3)', bank.headerRowIndex === 3, `קיבלתי ${bank.headerRowIndex}`);
check('הכותרות נקראו', bank.headers.includes('חובה') && bank.headers.includes('זכות'));

const bankMap = B.suggestMapping(bank.headers);
check('עמודת תאריך מופתה', bankMap.date === 0, `קיבלתי ${bankMap.date}`);
check('עמודת תיאור מופתה', bankMap.description === 2, `קיבלתי ${bankMap.description}`);
check('חובה מופתה', bankMap.debit === 3, `קיבלתי ${bankMap.debit}`);
check('זכות מופתה', bankMap.credit === 4, `קיבלתי ${bankMap.credit}`);
check('המיפוי שלם', B.isMappingComplete(bankMap));

const bankResult = B.parseRows(bank, bankMap, OPTS);
check('3 תנועות יובאו', bankResult.transactions.length === 3, `קיבלתי ${bankResult.transactions.length}`);
const salary = bankResult.transactions.find(t => t.description.includes('משכורת'));
check('זכות = הכנסה חיובית', salary && salary.amount === 12500 && salary.type === 'income', JSON.stringify(salary));
const rent = bankResult.transactions.find(t => t.description.includes('שכר דירה'));
check('חובה = הוצאה שלילית', rent && rent.amount === -4200 && rent.type === 'expense', JSON.stringify(rent));
check('תאריך נכון (5 באוגוסט)', rent && rent.date === '2026-08-05', rent && rent.date);
check('שורת הסיכום לא יובאה', !bankResult.transactions.some(t => t.description.includes('סה"כ')));

console.log('\n=== כרטיס אשראי: עמודת סכום יחידה ===');
const card = sheetFrom([
  ['פירוט חיובים'],
  ['תאריך עסקה', 'שם בית עסק', 'סכום חיוב'],
  ['12/08/2026', 'רמי לוי', '-289.90'],
  ['13/08/2026', 'דלק', '-320.00'],
  ['14/08/2026', 'זיכוי החזר', '150.00'],
]);
const cardMap = B.suggestMapping(card.headers);
check('תאריך עסקה מופה', cardMap.date === 0, `קיבלתי ${cardMap.date}`);
check('שם בית עסק מופה לתיאור', cardMap.description === 1, `קיבלתי ${cardMap.description}`);
check('סכום חיוב מופה', cardMap.amount === 2, `קיבלתי ${cardMap.amount}`);
check('אין חובה/זכות', cardMap.debit === -1 && cardMap.credit === -1);

const cardResult = B.parseRows(card, cardMap, OPTS);
check('3 תנועות מהכרטיס', cardResult.transactions.length === 3, `קיבלתי ${cardResult.transactions.length}`);
check('סכום שלילי = הוצאה', cardResult.transactions[0].type === 'expense');
check('סכום חיובי = הכנסה', cardResult.transactions[2].type === 'income');

console.log('\n=== כותרות באנגלית ===');
const eng = sheetFrom([
  ['Date', 'Description', 'Amount'],
  ['2026-08-01', 'Coffee', '-15.00'],
]);
const engMap = B.suggestMapping(eng.headers);
check('מיפוי אנגלי עובד', engMap.date === 0 && engMap.description === 1 && engMap.amount === 2);

console.log('\n=== שורות פגומות ===');
const messy = sheetFrom([
  ['תאריך', 'תיאור', 'סכום'],
  ['01/08/2026', 'תקין', '-100'],
  ['', 'בלי תאריך', '-50'],
  ['02/08/2026', '', '-50'],
  ['03/08/2026', 'בלי סכום', ''],
  ['04/08/2026', 'סכום אפס', '0'],
  ['לא תאריך', 'תאריך פגום', '-25'],
]);
const messyResult = B.parseRows(messy, B.suggestMapping(messy.headers), OPTS);
check('רק השורה התקינה יובאה', messyResult.transactions.length === 1, `קיבלתי ${messyResult.transactions.length}`);
check('הדילוגים דווחו', messyResult.skipped.length >= 4, `קיבלתי ${messyResult.skipped.length}`);
check('לדילוג יש מספר שורה', messyResult.skipped.every(s => typeof s.rowNumber === 'number' && s.rowNumber > 0));
check('לדילוג יש סיבה בעברית', messyResult.skipped.every(s => /[֐-׿]/.test(s.reason)));

console.log('\n=== זיהוי כפילויות ===');
const existing = [
  { id:'x1', date:'2026-08-03', description:'משכורת אוגוסט', category:'Salary', amount:12500, type:'income' },
];
const dupes = B.findDuplicates(bankResult.transactions, existing);
check('המשכורת הקיימת סומנה ככפילות', dupes.size === 1, `קיבלתי ${dupes.size}`);
const dupIndex = [...dupes][0];
check('סומנה התנועה הנכונה', bankResult.transactions[dupIndex].description.includes('משכורת'));
check('תנועות חדשות לא סומנו', dupes.size < bankResult.transactions.length);

const twice = B.findDuplicates([...bankResult.transactions, ...bankResult.transactions], []);
check('כפילות בתוך הקובץ עצמו נתפסת', twice.size === 3, `קיבלתי ${twice.size}`);
check('ייבוא נקי לא מסמן כלום', B.findDuplicates(cardResult.transactions, []).size === 0);

console.log('\n=== המרת מטבע ===');
const ils = B.parseRows(card, cardMap, { ...OPTS, rate: 3.7 });
check('סכום מומר חזרה לבסיס', Math.abs(ils.transactions[0].amount - (-289.90/3.7)) < 0.001, ils.transactions[0].amount);

console.log('\n=== שיוך לחשבון ===');
const withAcc = B.parseRows(card, cardMap, { ...OPTS, accountId: 'bank-1' });
check('כל התנועות משויכות', withAcc.transactions.every(t => t.accountId === 'bank-1'));

console.log(`\n${pass} עברו, ${fail} נכשלו`);
process.exit(fail ? 1 : 0);
