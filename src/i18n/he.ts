/**
 * כל הטקסט שמוצג למשתמש, במקום אחד.
 *
 * למה מרוכז ולא מפוזר בקומפוננטות: כדי שאפשר יהיה לתקן ניסוח בלי
 * לחפש בין 14 קבצים, ולראות את כל הקופי של האפליקציה במבט אחד.
 *
 * **הערה על ניסוח:** המקור באנגלית היה מלא ז'רגון מומצא
 * ("Neural Delta", "Autonomous Wealth Engine"). לא תרגמתי אותו מילולית —
 * זו אפליקציה לניהול כסף אישי, והעברית בה פשוטה וברורה.
 */
export const txt = {
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
  },

  // --- תקציבים ---
  budgets: {
    title: 'תקציבים',
    subtitle: 'כמה מותר להוציא בכל קטגוריה',
    create: 'תקציב חדש',
    limit: 'תקרה',
    exceededBy: 'חריגה של',
    spent: 'הוצאת',
    remaining: 'נשאר',
    totalLimit: 'סך התקציב',
    overBudget: 'חריגה',
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
    searchNeedsNetwork: 'אין תוצאות. חיפוש סימולים דורש חיבור לאינטרנט.',
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
    insightsNeedKey: 'הזן מפתח Gemini בהגדרות כדי להפעיל תובנות.',
    insightsLoading: 'מנתח...',
    topCategories: 'הקטגוריות הגדולות',
    // קבוצות התובנות שמגיעות מ-Gemini
    groupSafe: 'יציבות',
    groupWealth: 'בניית הון',
    groupGoals: 'יעדים',
  },

  // --- הגדרות ---
  settings: {
    title: 'הגדרות',
    theme: 'ערכת נושא',
    themeHint: 'בחר מראה',
    ambient: 'אפקט רקע',
    currency: 'מטבע תצוגה',
    backup: 'גיבוי',
    backupHint: 'הנתונים שלך על המכשיר בלבד. ייצא מדי פעם.',
    export: 'ייצוא לקובץ',
    import: 'ייבוא מקובץ',
    importSuccess: 'הגיבוי שוחזר בהצלחה.',
    importInvalid: 'הקובץ לא נראה כמו גיבוי תקין.',
    importFailed: 'לא הצלחתי לקרוא את הקובץ.',
    reset: 'מחיקת כל הנתונים',
    resetWarning: 'פעולה בלתי הפיכה',
    resetConfirm: 'למחוק הכל?',
    resetConfirmHint: 'כל התנועות, החשבונות, ההשקעות, היעדים והתקציבים יימחקו. לא ניתן לשחזר.',
    resetDo: 'כן, מחק הכל',
    aiKey: 'מפתח לתובנות AI',
    aiKeyHint: 'לא חובה. הדבק מפתח Gemini אישי כדי להפעיל תובנות במסך הניתוח. הוא נשמר על המכשיר הזה בלבד ונשלח רק ל-Google. בלי מפתח הפיצ\'ר פשוט כבוי.',
    storage: 'מיקום האחסון',
    storageValue: 'SQLite מקומי על המכשיר',
  },

  // --- תזכורות ---
  reminders: {
    title: 'תזכורות',
    add: 'תזכורת חדשה',
    subject: 'נושא',
    subjectPlaceholder: 'על מה להזכיר...',
    dayOfMonth: 'ביום בחודש',
    monthly: 'חודשי',
    empty: 'לא הוגדרו תזכורות',
    delete: 'מחק תזכורת',
    note: 'התזכורות מוצגות כאן באפליקציה. התראות במכשיר יתווספו בהמשך.',
  },
} as const;

/**
 * שמות תצוגה לקטגוריות.
 *
 * **הערכים עצמם נשמרים במסד באנגלית ולא משתנים.** התרגום הוא בתצוגה
 * בלבד — אחרת כל הנתונים הקיימים היו נשברים, וקבצי גיבוי ישנים לא
 * היו נקראים.
 */
const CATEGORY_LABELS: Record<string, string> = {
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
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  'Bank': 'עו"ש',
  'Investment': 'השקעות',
  'Pension': 'פנסיה',
  'Cash': 'מזומן',
};

/** שם תצוגה לקטגוריה. קטגוריה שהמשתמש הגדיר בעצמו מוצגת כמו שהיא. */
export const categoryLabel = (category: string): string =>
  CATEGORY_LABELS[category] ?? category;

export const accountTypeLabel = (type: string): string =>
  ACCOUNT_TYPE_LABELS[type] ?? type;

/** שם תצוגה לדירוג המגמה. */
export const trendLabel = (rating: string): string =>
  txt.trend[rating] ?? rating;
