/**
 * Every user-facing string, in one place. **English is the source of truth.**
 *
 * Each of the other locales is typed as `Dictionary`, which is
 * `typeof en` — so a missing or misspelled key is a compile error rather
 * than a blank space someone notices in production. `npm run lint` is
 * what actually keeps the six languages in step.
 *
 * A note on wording: the original template was full of invented jargon
 * ("Neural Delta", "Autonomous Wealth Engine"). This is an app for
 * managing your own money, so the copy here is plain.
 */
export const en = {
  // --- Shared ---
  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    saved: 'Saved',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    total: 'Total',
    amount: 'Amount',
    date: 'Date',
    description: 'Description',
    category: 'Category',
    account: 'Account',
    unassigned: 'Unassigned',
    none: 'None',
    status: 'Status',
  },

  // --- Screens (INITIAL_SHEETS) ---
  screens: {
    home: 'Home',
    accounts: 'Accounts',
    analytics: 'Analytics',
    income: 'Income',
    expenses: 'Expenses',
    budgets: 'Budgets',
    investments: 'Investments',
    settings: 'Settings',
  },

  // --- Startup ---
  boot: {
    opening: 'Opening your database...',
    failedTitle: 'The local database did not open',
    failedHint: 'Your data is still on this device. Reopening the app usually fixes this.',
  },

  // --- Home ---
  home: {
    netWorth: 'Net worth',
    cashAssets: 'Cash and liquid',
    totalAssets: 'Total assets',
    monthlyFlow: 'Monthly flow',
    netFlow: 'Left this month',
    totalValue: 'Total value',
    snapshot: 'Snapshot',
    inflow: 'In',
    outflow: 'Out',
    savingsRate: 'Savings rate',
    notes: 'Notes',
    notesPlaceholder: 'Write yourself a note...',
    recentActivity: 'Recent activity',
    noRecords: 'No transactions yet',
    welcome: 'Welcome',
    manage: 'Manage',
    totalNetWorth: 'Total net worth',
    snapshotAt: 'As of',
  },

  // --- Transaction table ---
  /** Seeded into `patchNotes` on a fresh install. */
  welcomeNote: 'Welcome. All your data is kept on this device only.',

  ledger: {
    incomeTitle: 'Income',
    expensesTitle: 'Expenses',
    addIncome: 'Add income',
    addExpense: 'Add expense',
    importExcel: 'Import from Excel',
    descriptionPlaceholder: 'What was it for...',
    sourceAccount: 'Account',
    noRecords: 'Nothing to show',
    addFirst: 'Add your first transaction',
    deleteRow: 'Delete transaction',
  },

  // --- Accounts ---
  accounts: {
    title: 'Accounts',
    subtitle: 'Where the money sits',
    add: 'Add account',
    namePlaceholder: 'Account name...',
    currentBalance: 'Current balance',
    classification: 'Type',
    delete: 'Delete account',
    empty: 'No accounts yet. Add one above.',
    defaultChecking: 'Checking',
    defaultInvestment: 'Investment account',
  },

  // --- Budgets ---
  budgets: {
    title: 'Budgets',
    subtitle: 'How much each category is allowed',
    totalLimitHint: 'All limits combined',
    create: 'New budget',
    limit: 'Limit',
    exceededBy: 'Over by',
    spent: 'Spent',
    remaining: 'Left',
    totalLimit: 'Total budget',
    overBudget: 'Over budget',
    overBy: 'Over by',
    underControl: 'Under control',
    spendingTarget: 'Monthly limit',
    optimal: 'Doing fine',
    safetyMargin: 'Still room left',
    excellent: 'Well under budget',
    attention: 'Close to the limit',
    empty: 'No budgets set',
    targetsCount: 'Active budgets',
    presets: 'Ready-made categories',
    custom: 'My own',
    emptyHint: 'Set a monthly spending limit for any category using the form on the side.',
    createHint: 'You can set a limit on an existing category or one of your own.',
    allAllocated: 'Every category already has a budget',
    customCategory: 'Category name',
    customPlaceholder: 'For example: holidays, vacation',
    setLimit: 'Set limit',
    monthlyLimit: 'Monthly limit',
    deleteTarget: 'Delete budget',
  },

  // --- Investments ---
  investments: {
    title: 'Investments',
    subtitle: 'Your portfolio',
    connect: 'Add a security',
    searchPlaceholder: 'Search a ticker...',
    searchResults: 'Search results',
    ticker: 'Ticker',
    holdings: 'Shares and price',
    shares: 'Shares',
    position: 'Value',
    avgPrice: 'Average price',
    currentPrice: 'Current price',
    buyPoint: 'Buy price',
    liveQuote: 'Live quote',
    portfolioSystem: 'Portfolio management',
    gain: 'Gain / loss',
    allocation: 'Allocation',
    performance: 'Performance',
    trend: 'Versus moving averages',
    manualSync: 'Refresh price',
    remove: 'Remove security',
    empty: 'No investments yet. Add one above.',
    noResultsFor: 'No results for',
    sortBy: 'Sort by',
    sortTicker: 'Sort by ticker',
    sortPrice: 'Sort by price',
    sortValue: 'Sort by value',
    lastUpdated: 'Updated',
    offlineNote: 'Offline — showing the last saved price',
  },

  /**
   * Trend rating.
   * ⚠️ This is **not** investment advice — it is the result of four
   * comparisons against moving averages. The wording deliberately
   * describes a position rather than telling anyone to act.
   */
  trend: {
    'Strong Buy': 'Above every moving average',
    'Buy': 'Above most moving averages',
    'Neutral': 'Mixed',
    'Sell': 'Below most moving averages',
    'Strong Sell': 'Below every moving average',
  } as Record<string, string>,

  // --- Analytics and goals ---
  analytics: {
    title: 'Analytics',
    subtitle: 'Where the money goes',
    netFlowHint: 'Income minus expenses',
    liveStatus: 'Data is current',
    tabOverview: 'Overview',
    tabGoals: 'Goals',
    tabAdvisor: 'Insights',
    positiveNet: 'Positive net worth',
    range1m: 'Month',
    range3m: '3 months',
    range6m: '6 months',
    range1y: 'Year',
    rangeAll: 'All',
    seriesIncome: 'Income',
    seriesExpenses: 'Expenses',
    cashFlow: 'Cash flow',
    growth: 'Growth trend',
    goals: 'Goals',
    addGoal: 'New goal',
    goalPlaceholder: 'Goal name...',
    target: 'Target',
    current: 'Saved',
    deadline: 'Target date',
    deleteGoal: 'Delete goal',
    noGoals: 'No goals set',
    insights: 'AI insights',
    insightsNeedKey: 'Add an AI key in settings to turn insights on.',
    insightsLoading: 'Analyzing...',
    topCategories: 'Biggest categories',
    gainers: 'Gainers',
    laggards: 'Laggards',
    groupSafe: 'Stability',
    groupWealth: 'Building wealth',
    groupGoals: 'Goals',
  },

  // --- Settings ---
  settings: {
    title: 'Settings',
    subtitle: 'Preferences and data',
    theme: 'Theme',
    themeHint: 'Pick a look',
    ambient: 'Background effect',
    ambientNone: 'No effect',
    ambientNoneHint: 'A plain background, easiest on the battery',
    ambientEyes: 'Watching eyes',
    ambientEyesHint: 'Eyes that blink and drift behind the screen',
    ambientLeaves: 'Falling petals',
    ambientLeavesHint: 'Cherry blossom petals drifting downward',
    ambientSparks: 'Glowing embers',
    ambientSparksHint: 'Small warm particles rising slowly',
    currency: 'Display currency',
    language: 'Language',
    languageHint: 'Changes everything on screen. Your data is not affected.',
    backup: 'Backup',
    backupHint: 'Your data lives on this device only. Export it now and then.',
    backupValue: 'Export or import',
    export: 'Export to a file',
    import: 'Import from a file',
    importSuccess: 'Backup restored.',
    importInvalid: 'That file does not look like a valid backup.',
    importFailed: 'Could not read that file.',
    reset: 'Delete everything',
    resetWarning: 'Cannot be undone',
    resetValue: 'Cannot be undone',
    resetConfirm: 'Delete everything?',
    resetConfirmHint: 'Every transaction, account, investment, goal and budget will be erased. There is no way back.',
    resetDo: 'Yes, delete everything',
    aiKey: 'Key for AI insights',
    aiKeyProvider: 'Provider',
    aiKeyHintGemini: 'Optional. Paste a personal Google Gemini key to turn on insights in the analytics screen. It is stored on this device only and sent to Google alone. Without a key the feature is simply off.',
    aiKeyHintClaude: 'Optional. Paste a personal Anthropic key to turn on insights in the analytics screen. It is stored on this device only and sent to Anthropic alone. Without a key the feature is simply off.',
    storage: 'Where data is stored',
    storageValue: 'Local SQLite on this device',
  },

  // --- Broker (Interactive Brokers, read-only) ---
  broker: {
    title: 'Broker',
    subtitle: 'Interactive Brokers, read-only',
    readOnly: 'Read-only. This app can place no trades and move no money — it only reads your positions.',
    hint: 'In Client Portal: Performance & Reports \u2192 Flex Queries. Create an Activity Flex query that includes Open Positions, then enable the Flex Web Service to get a token.',
    token: 'Flex token',
    queryId: 'Query ID',
    sync: 'Sync from broker',
    syncing: 'Fetching from your broker...',
    noCredentials: 'Add your broker token in settings first.',
    failed: 'Could not fetch from the broker.',
    nothing: 'The report came back with no open positions.',
    account: 'Account',
    willUpdate: '%1$s to update',
    willAdd: '%1$s to add',
    apply: 'Update my portfolio',
    done: 'Portfolio updated',
    browserNote: 'Syncing works on your phone. In a desktop browser your broker blocks the request.',
  },

  // --- Bank import ---
  import: {
    title: 'Import from a file',
    subtitle: 'An Excel or CSV file from your bank or credit card',
    choose: 'Choose a file',
    reading: 'Reading the file...',
    sheet: 'Sheet',
    headerRow: 'Header row',
    mapping: 'Column mapping',
    mappingHint: 'Detected automatically. Change anything that looks wrong.',
    colDate: 'Date',
    colDescription: 'Description',
    colAmount: 'Amount',
    colDebit: 'Debit (out)',
    colCredit: 'Credit (in)',
    colNone: '— none —',
    incomplete: 'Pick at least a date, a description, and one amount column (or debit/credit).',
    preview: 'Preview',
    previewCount: 'Showing %1$s of %2$s',
    account: 'Assign to account',
    duplicate: 'Already there',
    duplicatesFound: '%1$s transactions already exist',
    duplicatesFoundOne: 'One transaction already exists',
    skipDuplicates: 'Skip duplicates',
    skippedRows: '%1$s rows skipped',
    skippedRowsOne: 'One row skipped',
    skippedTitle: 'Rows that were not imported',
    nothingToImport: 'No transactions found in this file.',
    confirm: 'Import %1$s transactions',
    confirmOne: 'Import one transaction',
    readFailed: 'Could not read that file.',
  },

  // --- Reminders ---
  reminders: {
    title: 'Reminders',
    add: 'New reminder',
    subject: 'Subject',
    subjectPlaceholder: 'What should I remind you about...',
    dayOfMonth: 'On day',
    monthly: 'Monthly',
    next: 'Next',
    empty: 'No reminders set',
    delete: 'Delete reminder',
    note: 'Reminders show up here in the app. Device notifications are coming later.',
    defaultSubject: 'Enter salary details',
    defaultBody: 'Time to enter this month\\u2019s salary details.',
  },

  /**
   * Display names for categories and account types.
   *
   * **The stored values stay English and never change.** Translation
   * happens at display time only — otherwise every existing row and
   * every older backup file would stop making sense.
   */
  categories: {
    // Income
    'Salary': 'Salary',
    'Dividends': 'Dividends',
    'Yield': 'Yield',
    'Interests': 'Interest',
    'Business': 'Business',
    'Asset Sale': 'Asset sale',
    'Other Income': 'Other income',
    // Expenses
    'Housing': 'Housing',
    'Transport': 'Transport',
    'Food': 'Food',
    'Subscriptions': 'Subscriptions',
    'Entertainment': 'Entertainment',
    'Health': 'Health',
    'Shopping': 'Shopping',
    'Investment Purchase': 'Investment purchase',
    'Taxes': 'Taxes',
    'Other Expense': 'Other expense',
    // Goals
    'Savings': 'Savings',
  } as Record<string, string>,

  /** Theme names. `monoInverted` is the white-on-black variant. */
  themes: {
    default: 'Horizon pink',
    mono: 'Black and white',
    monoInverted: 'White and black',
    crimson: 'Crimson',
    gold: 'Amber',
    forest: 'Forest green',
    royal: 'Royal blue',
    lavender: 'Violet',
  } as Record<string, string>,

  accountTypes: {
    'Bank': 'Checking',
    'Investment': 'Investment',
    'Pension': 'Pension',
    'Cash': 'Cash',
  } as Record<string, string>,

  // --- First-run language picker ---
  languagePicker: {
    title: 'Choose your language',
    subtitle: 'You can change this any time in settings.',
    confirm: 'Continue',
  },
};
// אין `as const` בכוונה: אנחנו רוצים ש-`typeof en` ייתן `string` בכל עלה,
// כדי שהוא ישמש כחוזה לשאר השפות ולא ידרוש מהן את אותה מילה בדיוק.
