/*
 * בדיקות לפענוח דוח ה-Flex של Interactive Brokers.
 *
 * הרצה:  npm run test:broker
 *
 * הכל טהור ובלי רשת. הדוגמאות למטה הן הצורה שבה IBKR באמת מחזירים
 * את התשובות — שני שלבים, ומעטפת שגיאה זהה בשניהם.
 */
const { parseSendRequest, parsePositions, parseAccountId } =
  require('../../../.test-build/broker.cjs');

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { console.log('✓', name); pass++; }
  else { console.log('✗', name, extra); fail++; }
};

// --- שלב 1 ---
const okXml = `<FlexStatementResponse timestamp="21 September, 2026 09:10 AM EDT">
<Status>Success</Status><ReferenceCode>0123456789</ReferenceCode>
<Url>https://gdcdyn.interactivebrokers.com/AccountManagement/FlexWebService/GetStatement</Url>
</FlexStatementResponse>`;
const okRes = parseSendRequest(okXml);
check('שלב 1 מוצלח מוחזר כהצלחה', okRes.ok === true);
check('קוד ההפניה נשמר כמחרוזת עם האפס המוביל', okRes.referenceCode === '0123456789',
  `קיבלתי ${JSON.stringify(okRes.referenceCode)}`);
check('כתובת שלב 2 נלקחת מהתשובה', String(okRes.url).includes('GetStatement'));

const badTokenXml = `<FlexStatementResponse timestamp="x"><Status>Fail</Status>
<ErrorCode>1015</ErrorCode><ErrorMessage>Token is invalid.</ErrorMessage></FlexStatementResponse>`;
const badRes = parseSendRequest(badTokenXml);
check('טוקן שגוי מוחזר ככישלון', badRes.ok === false);
check('קוד השגיאה נשמר', badRes.code === '1015', `קיבלתי ${badRes.code}`);
check('הודעת IBKR נשמרת כלשונה', badRes.message === 'Token is invalid.');

check('XML פגום לא מתרסק', parseSendRequest('<<<not xml').ok === false);
check('מחרוזת ריקה לא מתרסקת', parseSendRequest('').ok === false);

// --- שלב 2: אחזקות ---
const report = `<FlexQueryResponse queryName="Positions" type="AF">
 <FlexStatements count="1">
  <FlexStatement accountId="U1234567" fromDate="20260901" toDate="20260921">
   <OpenPositions>
    <OpenPosition currency="USD" symbol="AAPL" description="APPLE INC" assetCategory="STK"
      listingExchange="NASDAQ" position="10" markPrice="150.25" costBasisPrice="120.50" />
    <OpenPosition currency="USD" symbol="SPY" description="SPDR S&amp;P 500 ETF TRUST"
      listingExchange="ARCA" position="3" markPrice="510.10" costBasisMoney="1200" />
    <OpenPosition currency="USD" symbol="ZERO" description="CLOSED" position="0" markPrice="5" />
    <OpenPosition currency="USD" symbol="" description="NO SYMBOL" position="4" markPrice="5" />
   </OpenPositions>
  </FlexStatement>
 </FlexStatements>
</FlexQueryResponse>`;

const positions = parsePositions(report);
check('שתי אחזקות אמיתיות נקראו', positions.length === 2, `קיבלתי ${positions.length}`);

const aapl = positions.find(p => p.symbol === 'AAPL');
check('סימול, כמות ומחיר נוכחי', aapl.shares === 10 && aapl.currentPrice === 150.25);
check('costBasisPrice הופך למחיר ממוצע', aapl.avgPrice === 120.5, `קיבלתי ${aapl.avgPrice}`);
check('שם ובורסה נקראו', aapl.name === 'APPLE INC' && aapl.exchange === 'NASDAQ');

const spy = positions.find(p => p.symbol === 'SPY');
check('בלי costBasisPrice מחשבים מהעלות הכוללת', spy.avgPrice === 400,
  `קיבלתי ${spy.avgPrice}`);
check('ישויות XML מפוענחות', spy.name === 'SPDR S&P 500 ETF TRUST', `קיבלתי ${spy.name}`);

check('פוזיציית אפס מדולגת', !positions.some(p => p.symbol === 'ZERO'));
check('שורה בלי סימול מדולגת', !positions.some(p => p.name === 'NO SYMBOL'));
check('מזהה החשבון נקרא', parseAccountId(report) === 'U1234567');

// --- אחזקה בודדת: XML מחזיר אובייקט ולא מערך ---
const single = `<FlexQueryResponse><FlexStatements><FlexStatement accountId="U9">
 <OpenPositions><OpenPosition symbol="NVDA" position="2" markPrice="900" costBasisPrice="500"/>
 </OpenPositions></FlexStatement></FlexStatements></FlexQueryResponse>`;
check('אחזקה בודדת נקראת כמו רשימה', parsePositions(single).length === 1);

// --- גבולות ---
check('דוח ריק מחזיר רשימה ריקה',
  parsePositions('<FlexQueryResponse><FlexStatements/></FlexQueryResponse>').length === 0);
check('דוח בלי OpenPositions לא מתרסק',
  parsePositions('<FlexQueryResponse><FlexStatements><FlexStatement accountId="U1"/></FlexStatements></FlexQueryResponse>').length === 0);
check('XML פגום מחזיר רשימה ריקה ולא זורק', parsePositions('<<<').length === 0);
check('מזהה חשבון חסר מחזיר ריק', parseAccountId('<FlexQueryResponse/>') === '');

// --- שני חשבונות באותו דוח ---
const two = `<FlexQueryResponse><FlexStatements>
 <FlexStatement accountId="U1"><OpenPositions>
   <OpenPosition symbol="AAA" position="1" markPrice="10" costBasisPrice="5"/></OpenPositions></FlexStatement>
 <FlexStatement accountId="U2"><OpenPositions>
   <OpenPosition symbol="BBB" position="2" markPrice="20" costBasisPrice="8"/></OpenPositions></FlexStatement>
</FlexStatements></FlexQueryResponse>`;
check('אחזקות משני חשבונות מאוחדות', parsePositions(two).length === 2);

// --- ערכים לא מספריים לא הופכים ל-NaN ---
const junk = `<FlexQueryResponse><FlexStatements><FlexStatement accountId="U1"><OpenPositions>
 <OpenPosition symbol="XYZ" position="5" markPrice="" costBasisPrice="abc"/>
</OpenPositions></FlexStatement></FlexStatements></FlexQueryResponse>`;
const j = parsePositions(junk)[0];
check('מחיר חסר הופך ל-0 ולא ל-NaN', j.currentPrice === 0 && !Number.isNaN(j.currentPrice));
check('מחיר לא מספרי הופך ל-0 ולא ל-NaN', j.avgPrice === 0 && !Number.isNaN(j.avgPrice));

console.log(`\n${pass} עברו, ${fail} נכשלו`);
process.exit(fail ? 1 : 0);
