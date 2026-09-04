import { Dictionary } from './types';

/**
 * עברית.
 *
 * **הערה על ניסוח:** המקור באנגלית היה מלא ז'רגון מומצא
 * ("Neural Delta", "Autonomous Wealth Engine"). לא תרגמתי אותו מילולית —
 * זו אפליקציה לניהול כסף אישי, והעברית בה פשוטה וברורה.
 */
export const he: Dictionary = {
  // --- כללי ---
  common: {
    add: 'הוסף',
    edit: 'ערוך',
    delete: 'מחק',
    cancel: 'ביטול',
    save: 'שמור',
    saved: 'נשמר',
    close: 'סגור',
    confirm: 'אישור',
    back: 'חזרה',
    total: 'סה"כ',
    amount: 'סכום',
    date: 'תאריך',
    description: 'תיאור',
    category: 'קטגוריה',
    account: 'חשבון',
    unassigned: 'ללא שיוך',
    none: 'אין',
    status: 'מצב',
  },

  // --- מסכים (INITIAL_SHEETS) ---
  screens: {
    home: 'בית',
    accounts: 'חשבונות',
    analytics: 'ניתוח',
    income: 'הכנסות',
    expenses: 'הוצאות',
    budgets: 'תקציבים',
    investments: 'השקעות',
    settings: 'הגדרות',
  },

  // --- מצבי אתחול ---
  boot: {
    opening: 'פותח את מסד הנתונים...',
    failedTitle: 'מסד הנתונים המקומי לא נפתח',
    failedHint: 'הנתונים שלך עדיין על המכשיר. בדרך כלל פתיחה מחדש של האפליקציה פותרת את זה.',
  },

  // --- מסך הבית ---
  home: {
    netWorth: 'שווי נקי',
    cashAssets: 'מזומן ונזיל',
    totalAssets: 'סך הנכסים',
    monthlyFlow: 'תזרים חודשי',
    netFlow: 'עודף החודש',   // הכנסות פחות הוצאות, בשקלים
    totalValue: 'שווי כולל',
    snapshot: 'נקודת זמן',
    inflow: 'נכנס',
    outflow: 'יצא',
    savingsRate: 'שיעור חיסכון',
    notes: 'הערות',
    notesPlaceholder: 'כתוב לעצמך הערה...',
    recentActivity: 'תנועות אחרונות',
    noRecords: 'אין עדיין תנועות',
    welcome: 'ברוך הבא',
    manage: 'לניהול',
    totalNetWorth: 'שווי נקי כולל',
    snapshotAt: 'נכון ל-',
  },

  // --- טבלת תנועות ---
  /** נכתב ל-`patchNotes` בהתקנה חדשה — נתון של המשתמש, לכן בשפה שנבחרה. */
  welcomeNote: 'ברוך הבא. כל הנתונים שלך נשמרים על המכשיר הזה בלבד.',

  ledger: {
    incomeTitle: 'הכנסות',
    expensesTitle: 'הוצאות',
    addIncome: 'הוסף הכנסה',
    addExpense: 'הוסף הוצאה',
    importExcel: 'ייבוא מאקסל',
    descriptionPlaceholder: 'תיאור התנועה...',
    sourceAccount: 'חשבון',
    noRecords: 'אין תנועות להצגה',
    addFirst: 'הוסף את התנועה הראשונה',
    deleteRow: 'מחק תנועה',
  },

  // --- חשבונות ---
  accounts: {
    title: 'חשבונות',
    subtitle: 'איפה הכסף יושב',
    add: 'הוסף חשבון',
    namePlaceholder: 'שם החשבון...',
    currentBalance: 'יתרה נוכחית',
    classification: 'סוג',
    delete: 'מחק חשבון',
    empty: 'אין עדיין חשבונות. הוסף אחד למעלה.',
    defaultChecking: 'עובר ושב',
    defaultInvestment: 'חשבון השקעות',
  },

  // --- תקציבים ---
  budgets: {
    title: 'תקציבים',
    subtitle: 'כמה מותר להוציא בכל קטגוריה',
    totalLimitHint: 'סכום כל התקרות',
    create: 'תקציב חדש',
    limit: 'תקרה',
    exceededBy: 'חריגה של',
    spent: 'הוצאת',
    remaining: 'נשאר',
    totalLimit: 'סך התקציב',
    overBudget: 'חריגה',
    overBy: 'חריגה של',
    underControl: 'בשליטה',
    spendingTarget: 'תקרה חודשית',
    optimal: 'בסדר גמור',
    safetyMargin: 'עוד יש מרווח',
    excellent: 'הרבה מתחת לתקציב',
    attention: 'מתקרב לתקרה',
    empty: 'לא הוגדרו תקציבים',
    targetsCount: 'תקציבים פעילים',
    presets: 'קטגוריות מוכנות',
    custom: 'משלי',
    emptyHint: 'קבע תקרת הוצאה חודשית לכל קטגוריה שתרצה, דרך הטופס שבצד.',
    createHint: 'אפשר לקבוע תקרה לקטגוריה קיימת או לקטגוריה משלך.',
    allAllocated: 'כל הקטגוריות כבר מתוקצבות',
    customCategory: 'שם קטגוריה',
    customPlaceholder: 'למשל: חופשה, חגים',
    setLimit: 'קבע תקרה',
    monthlyLimit: 'תקרה חודשית',
    deleteTarget: 'מחק תקציב',
  },

  // --- השקעות ---
  investments: {
    title: 'השקעות',
    subtitle: 'תיק ההשקעות שלך',
    connect: 'הוסף נייר ערך',
    searchPlaceholder: 'חפש סימול...',
    searchResults: 'תוצאות חיפוש',
    ticker: 'סימול',
    holdings: 'כמות ומחיר',
    shares: 'יחידות',
    position: 'שווי',
    avgPrice: 'מחיר ממוצע',
    currentPrice: 'מחיר נוכחי',
    buyPoint: 'מחיר קנייה',
    liveQuote: 'ציטוט חי',
    portfolioSystem: 'ניהול תיק השקעות',
    gain: 'רווח/הפסד',
    allocation: 'פיזור התיק',
    performance: 'ביצועים',
    trend: 'מגמה מול ממוצעים נעים',
    manualSync: 'רענן מחיר',
    remove: 'הסר נייר ערך',
    empty: 'אין עדיין השקעות. הוסף אחת למעלה.',
    noResultsFor: 'אין תוצאות עבור',
    sortBy: 'מיון לפי',
    sortTicker: 'מיון לפי סימול',
    sortPrice: 'מיון לפי מחיר',
    sortValue: 'מיון לפי שווי',
    lastUpdated: 'עודכן',
    offlineNote: 'אין חיבור — מוצג המחיר האחרון שנשמר',
  },

  /**
   * דירוג המגמה.
   * ⚠️ זה **לא** המלצת השקעה — זו תוצאה של ארבע השוואות לממוצעים נעים.
   * הניסוח בעברית נבחר בכוונה כתיאור מצב ולא כהוראה לפעולה.
   */
  trend: {
    'Strong Buy': 'מעל כל הממוצעים',
    'Buy': 'מעל רוב הממוצעים',
    'Neutral': 'מעורב',
    'Sell': 'מתחת לרוב הממוצעים',
    'Strong Sell': 'מתחת לכל הממוצעים',
  } as Record<string, string>,

  // --- ניתוח ויעדים ---
  analytics: {
    title: 'ניתוח',
    subtitle: 'לאן הכסף הולך',
    netFlowHint: 'הכנסות פחות הוצאות',
    liveStatus: 'הנתונים מעודכנים',
    tabOverview: 'סקירה',
    tabGoals: 'יעדים',
    tabAdvisor: 'תובנות',
    positiveNet: 'שווי חיובי',
    range1m: 'חודש',
    range3m: '3 חודשים',
    range6m: 'חצי שנה',
    range1y: 'שנה',
    rangeAll: 'הכל',
    seriesIncome: 'הכנסות',
    seriesExpenses: 'הוצאות',
    cashFlow: 'תזרים',
    growth: 'מגמת צמיחה',
    goals: 'יעדים',
    addGoal: 'יעד חדש',
    goalPlaceholder: 'שם היעד...',
    target: 'יעד',
    current: 'נצבר',
    deadline: 'תאריך יעד',
    deleteGoal: 'מחק יעד',
    noGoals: 'לא הוגדרו יעדים',
    insights: 'תובנות AI',
    insightsNeedKey: 'הזן מפתח AI בהגדרות כדי להפעיל תובנות.',
    insightsLoading: 'מנתח...',
    topCategories: 'הקטגוריות הגדולות',
    gainers: 'ברווח',
    laggards: 'בהפסד',
    // קבוצות התובנות שמגיעות מ-Gemini
    groupSafe: 'יציבות',
    groupWealth: 'בניית הון',
    groupGoals: 'יעדים',
  },

  // --- הגדרות ---
  settings: {
    title: 'הגדרות',
    subtitle: 'העדפות ונתונים',
    theme: 'ערכת נושא',
    themeHint: 'בחר מראה',
    ambient: 'אפקט רקע',
    ambientNone: 'בלי אפקט',
    ambientNoneHint: 'רקע נקי, והכי חסכוני בסוללה',
    ambientEyes: 'עיניים',
    ambientEyesHint: 'עיניים שממצמצות ונעות מאחורי המסך',
    ambientLeaves: 'עלים נופלים',
    ambientLeavesHint: 'עלי דובדבן שיורדים למטה',
    ambientSparks: 'גיצים',
    ambientSparksHint: 'חלקיקים חמים שעולים לאט',
    currency: 'מטבע תצוגה',
    language: 'שפה',
    languageHint: 'משנה את כל מה שמוצג. הנתונים עצמם לא מושפעים.',
    backup: 'גיבוי',
    backupHint: 'הנתונים שלך על המכשיר בלבד. ייצא מדי פעם.',
    backupValue: 'ייצוא או ייבוא',
    export: 'ייצוא לקובץ',
    import: 'ייבוא מקובץ',
    importSuccess: 'הגיבוי שוחזר בהצלחה.',
    importInvalid: 'הקובץ לא נראה כמו גיבוי תקין.',
    importFailed: 'לא הצלחתי לקרוא את הקובץ.',
    reset: 'מחיקת כל הנתונים',
    resetWarning: 'פעולה בלתי הפיכה',
    resetValue: 'בלתי הפיך',
    resetConfirm: 'למחוק הכל?',
    resetConfirmHint: 'כל התנועות, החשבונות, ההשקעות, היעדים והתקציבים יימחקו. לא ניתן לשחזר.',
    resetDo: 'כן, מחק הכל',
    aiKey: 'מפתח לתובנות AI',
    aiKeyProvider: 'ספק',
    aiKeyHintGemini: 'לא חובה. הדבק מפתח Gemini אישי כדי להפעיל תובנות במסך הניתוח. הוא נשמר על המכשיר הזה בלבד ונשלח רק ל-Google. בלי מפתח הפיצ\'ר פשוט כבוי.',
    aiKeyHintClaude: 'לא חובה. הדבק מפתח Anthropic אישי כדי להפעיל תובנות במסך הניתוח. הוא נשמר על המכשיר הזה בלבד ונשלח רק ל-Anthropic. בלי מפתח הפיצ\'ר פשוט כבוי.',
    storage: 'מיקום האחסון',
    storageValue: 'SQLite מקומי על המכשיר',
  },

  // --- ברוקר (Interactive Brokers, קריאה בלבד) ---
  broker: {
    title: 'ברוקר',
    subtitle: 'Interactive Brokers, קריאה בלבד',
    readOnly: 'קריאה בלבד. האפליקציה לא יכולה לבצע פעולות ולא להזיז כסף — היא רק קוראת את האחזקות.',
    hint: 'ב-Client Portal: Performance & Reports \u2190 Flex Queries. צור שאילתת Activity Flex שכוללת Open Positions, ואז הפעל את Flex Web Service כדי לקבל טוקן.',
    token: 'טוקן Flex',
    queryId: 'מזהה שאילתה',
    sync: 'משוך מהברוקר',
    syncing: 'מושך מהברוקר...',
    noCredentials: 'הזן קודם טוקן ברוקר בהגדרות.',
    failed: 'לא הצלחתי למשוך מהברוקר.',
    nothing: 'הדוח חזר בלי אחזקות פתוחות.',
    account: 'חשבון',
    willUpdate: '%1$s לעדכון',
    willAdd: '%1$s להוספה',
    apply: 'עדכן את התיק',
    done: 'התיק עודכן',
    browserNote: 'המשיכה עובדת בטלפון. בדפדפן במחשב הברוקר חוסם את הבקשה.',
  },

  // --- ייבוא מהבנק ---
  import: {
    title: 'ייבוא מקובץ',
    subtitle: 'קובץ Excel או CSV מהבנק או מחברת האשראי',
    choose: 'בחר קובץ',
    reading: 'קורא את הקובץ...',
    sheet: 'גיליון',
    headerRow: 'שורת כותרות',
    mapping: 'מיפוי עמודות',
    mappingHint: 'זוהה אוטומטית. אפשר לשנות אם משהו לא נכון.',
    colDate: 'תאריך',
    colDescription: 'תיאור',
    colAmount: 'סכום',
    colDebit: 'חובה (יוצא)',
    colCredit: 'זכות (נכנס)',
    colNone: '— ללא —',
    incomplete: 'צריך לבחור לפחות תאריך, תיאור, וסכום אחד (או חובה/זכות).',
    preview: 'תצוגה מקדימה',
    previewCount: 'מציג %1$s מתוך %2$s',
    account: 'לשייך לחשבון',
    duplicate: 'כבר קיים',
    duplicatesFound: 'זוהו %1$s תנועות שכבר קיימות',
    duplicatesFoundOne: 'זוהתה תנועה אחת שכבר קיימת',
    skipDuplicates: 'דלג על כפילויות',
    skippedRows: '%1$s שורות דולגו',
    skippedRowsOne: 'שורה אחת דולגה',
    skippedTitle: 'שורות שלא יובאו',
    nothingToImport: 'לא נמצאו תנועות לייבוא בקובץ הזה.',
    confirm: 'ייבא %1$s תנועות',
    confirmOne: 'ייבא תנועה אחת',
    readFailed: 'לא הצלחתי לקרוא את הקובץ.',
  },

  // --- תזכורות ---
  reminders: {
    title: 'תזכורות',
    add: 'תזכורת חדשה',
    subject: 'נושא',
    subjectPlaceholder: 'על מה להזכיר...',
    dayOfMonth: 'ביום בחודש',
    monthly: 'חודשי',
    next: 'הבא',
    empty: 'לא הוגדרו תזכורות',
    delete: 'מחק תזכורת',
    note: 'התזכורות מוצגות כאן באפליקציה. התראות במכשיר יתווספו בהמשך.',
    defaultSubject: 'להזין נתוני משכורת',
    defaultBody: 'הגיע הזמן להזין את נתוני המשכורת החודש.',
  },
  /**
   * שמות תצוגה לקטגוריות ולסוגי חשבונות.
   *
   * **הערכים עצמם נשמרים במסד באנגלית ולא משתנים.** התרגום הוא בתצוגה
   * בלבד — אחרת כל הנתונים הקיימים היו נשברים, וקבצי גיבוי ישנים לא
   * היו נקראים.
   */
  categories: {
    // הכנסות
    'Salary': 'משכורת',
    'Dividends': 'דיבידנדים',
    'Yield': 'תשואה',
    'Interests': 'ריבית',
    'Business': 'עסק',
    'Asset Sale': 'מכירת נכס',
    'Other Income': 'הכנסה אחרת',
    // הוצאות
    'Housing': 'דיור',
    'Transport': 'תחבורה',
    'Food': 'אוכל',
    'Subscriptions': 'מנויים',
    'Entertainment': 'בילויים',
    'Health': 'בריאות',
    'Shopping': 'קניות',
    'Investment Purchase': 'רכישת השקעה',
    'Taxes': 'מיסים',
    'Other Expense': 'הוצאה אחרת',
    // יעדים
    'Savings': 'חיסכון',
  } as Record<string, string>,

  /** שמות ערכות הנושא. `monoInverted` הוא לבן-על-שחור. */
  themes: {
    default: 'ורוד',
    mono: 'שחור ולבן',
    monoInverted: 'לבן ושחור',
    crimson: 'ארגמן',
    gold: 'ענבר',
    forest: 'ירוק יער',
    royal: 'כחול מלכותי',
    lavender: 'סגול',
  } as Record<string, string>,

  accountTypes: {
    'Bank': 'עו"ש',
    'Investment': 'השקעות',
    'Pension': 'פנסיה',
    'Cash': 'מזומן',
  } as Record<string, string>,

  // --- מסך בחירת השפה בהרצה הראשונה ---
  languagePicker: {
    title: 'בחר שפה',
    subtitle: 'אפשר לשנות בכל רגע בהגדרות.',
    confirm: 'המשך',
  },
};
