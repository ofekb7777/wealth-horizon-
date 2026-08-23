-- Wealth Horizon — סכימת גרסה 1
--
-- מקור האמת למבנה הטבלאות. הקובץ נטען כטקסט ע"י migrations.ts ומורץ
-- פעם אחת בפתיחה ראשונה של מסד הנתונים.
--
-- הערות:
--  * מזהים הם TEXT ולא INTEGER — האפליקציה מייצרת אותם בעצמה (Math.random),
--    וכך גם קובצי גיבוי ישנים נשארים תקפים.
--  * אין FOREIGN KEY על accountId בכוונה: מחיקת חשבון לא אמורה למחוק
--    את התנועות שלו, והקוד הקיים מרשה תנועה בלי חשבון.
--  * booleans נשמרים כ-INTEGER 0/1 — SQLite לא מכיר טיפוס boolean.

CREATE TABLE IF NOT EXISTS accounts (
  id      TEXT PRIMARY KEY NOT NULL,
  name    TEXT NOT NULL DEFAULT '',
  type    TEXT NOT NULL DEFAULT 'Bank',
  balance REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transactions (
  id          TEXT PRIMARY KEY NOT NULL,
  date        TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT '',
  amount      REAL NOT NULL DEFAULT 0,
  type        TEXT,
  accountId   TEXT
);

CREATE TABLE IF NOT EXISTS investments (
  id           TEXT PRIMARY KEY NOT NULL,
  ticker       TEXT NOT NULL DEFAULT '',
  name         TEXT,
  exchange     TEXT,
  shares       REAL NOT NULL DEFAULT 0,
  avgPrice     REAL NOT NULL DEFAULT 0,
  currentPrice REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS goals (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  targetAmount  REAL NOT NULL DEFAULT 0,
  currentAmount REAL NOT NULL DEFAULT 0,
  deadline      TEXT,
  category      TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS budgets (
  id        TEXT PRIMARY KEY NOT NULL,
  category  TEXT NOT NULL DEFAULT '',
  "limit"   REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reminders (
  id            TEXT PRIMARY KEY NOT NULL,
  subject       TEXT NOT NULL DEFAULT '',
  body          TEXT NOT NULL DEFAULT '',
  scheduledTime TEXT NOT NULL DEFAULT '',
  sent          INTEGER NOT NULL DEFAULT 0,
  recurrence    TEXT,
  dayOfMonth    INTEGER
);

-- שורה יחידה (id=1) שמחזיקה את מצב ה-UI שכן שייך לנתונים.
-- העדפות תצוגה (ערכת נושא, אפקט רקע) יושבות ב-localStorage — ראה ThemeContext.
CREATE TABLE IF NOT EXISTS user_profile (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  activeSheetId TEXT,
  notes         TEXT,
  patchNotes    TEXT
);

INSERT OR IGNORE INTO user_profile (id) VALUES (1);

-- אינדקסים: התנועות הן הטבלה היחידה שגדלה בלי גבול, והשאילתות
-- הנפוצות עליה הן לפי תאריך ולפי חשבון.
CREATE INDEX IF NOT EXISTS idx_transactions_date       ON transactions (date);
CREATE INDEX IF NOT EXISTS idx_transactions_accountId  ON transactions (accountId);
CREATE INDEX IF NOT EXISTS idx_budgets_category        ON budgets (category);
