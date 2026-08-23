# Wealth Horizon

> קובץ הנחיות לקלוד קוד. נוצר בשלב 0 של תוכנית המעבר לאנדרואיד.
> מקור האמת לתוכנית עצמה הוא `WEALTH_HORIZON_BRIEF.md` של אופק.

---

## 1. מטרת הפרויקט

אפליקציית **ניהול פיננסי אישי** לשימוש עצמי: תנועות, חשבונות, תקציבים, יעדים והשקעות.

**היעד שאליו אנחנו הולכים:**
- אפליקציית אנדרואיד אמיתית (APK), אייקון על מסך הבית — לא PWA ולא טאב בדפדפן.
- **ווידג'ט על מסך הבית** שמציג מבט חודשי: יתרה, הוצאה מול תקציב, 3 תנועות אחרונות.
- **100% אופליין.** כל הנתונים על המכשיר. חייב לעבוד במצב טיסה.
- אפס תלות בענן, אפס חשבון, אפס תשלום. גיבוי = ייצוא JSON ידני.

---

## 2. הסטאק — מה יש ולאן זה הולך

| רכיב | סטטוס |
|---|---|
| React 19 + Vite 6 + TypeScript + Tailwind 4 | ✅ נשאר |
| Recharts · lucide-react · motion | ✅ נשאר |
| `xlsx` | ✅ נשאר — **כבר בשימוש** ב-`Spreadsheet.tsx:3` לייבוא תנועות |
| Firebase / Firestore | ❌ יוצא בשלב 2 → SQLite מקומי |
| `react-firebase-hooks` | ❌ **תלות מתה** — ב-package.json, לא מיובאת באף קובץ |
| `@google/genai` | ❌ **תלות מתה** — לא מיובאת באף קובץ (ראה §6) |
| `server.ts` (Express) | ❌ יוצא בשלב 2 — אבל מריץ 5 endpoints, לא רק הגשה סטטית |
| `yahoo-finance2` | ⚠️ יעבור לקריאה ישירה מהמכשיר דרך Capacitor HTTP |
| `vite-plugin-pwa` | ❌ יוצא בשלב 3 |
| Capacitor | ➕ נכנס בשלב 3 |
| Jetpack Glance (Kotlin) | ➕ נכנס בשלב 4 — הווידג'ט |

---

## 3. מבנה התיקיות

**נקודת כניסה:** `index.html` → `src/main.tsx` → `AuthProvider` → `ThemeProvider` → `VersionProvider` → `App`

`src/App.tsx` (1190 שורות) הוא הליבה: מחזיק את **כל** ה-state באובייקט `SpreadsheetState` יחיד,
מחזיק את כל ה-handlers של CRUD, ומנתב בין המסכים לפי `state.activeSheetId`
(רינדור מותנה — **אין react-router**).

```
src/
├── App.tsx                  ליבה: state גלובלי + ניתוב + כל ה-CRUD handlers
├── main.tsx                 נקודת כניסה, שרשור ה-Providers
├── types.ts                 מודל הנתונים + קטגוריות + מטבעות
├── index.css                Tailwind + 8 ערכות נושא
│                            (default/mono/forest/sunset/lavender/crimson/gold/royal)
├── components/
│   ├── Home.tsx             מסך בית — סיכום, patch notes, תזכורות, ייבוא state
│   ├── Dashboard.tsx        אנליטיקה + יעדים + תובנות AI
│   ├── Spreadsheet.tsx      טבלת תנועות (income/expenses) + ייבוא Excel
│   ├── Accounts.tsx         CRUD חשבונות
│   ├── Investments.tsx      תיק השקעות, חיפוש טיקרים, גרפים
│   ├── Budgets.tsx          תקציבים לפי קטגוריה
│   ├── Settings.tsx         הגדרות + ייצוא state ל-JSON
│   ├── AdminConsole.tsx     פאנל אדמין — רואה נתוני כל המשתמשים
│   ├── Login.tsx            Google Sign-In
│   ├── Sidebar.tsx / BottomNav.tsx / MobileTopBar.tsx    ניווט
│   ├── RemindersWidget.tsx  תזכורות שנשלחות במייל
│   ├── SpecialBackgroundEffect.tsx   אפקטי רקע
│   └── InstallModal.tsx     הנחיות התקנת PWA
├── data/                    ⭐ שכבת הנתונים (שלב 1)
│   ├── types.ts             טיפוסי הישויות — מקור האמת
│   ├── Repository.ts        ה-interface: החוזה שכל מימוש חייב לספק
│   ├── FirebaseRepository.ts  המימוש הנוכחי — הקובץ היחיד עם firebase/firestore
│   ├── cloud.ts             פיצ'רים שהם ענן במהותם (הודעות, משוב, אדמין)
│   └── index.ts             נקודת החיבור — כאן משנים שורה אחת בשלב 2
├── context/
│   ├── AuthContext.tsx      Google auth + בדיקת אדמין (רשימת מיילים בקוד)
│   ├── ThemeContext.tsx     ערכת נושא — עובר דרך ה-Repository
│   └── VersionContext.tsx   גרסת אפליקציה
├── services/
│   ├── geminiService.ts     תובנות AI דרך פרוקסי /api/gemini
│   └── gmailService.ts      שליחת מייל לתזכורות
└── lib/
    ├── firebase.ts          אתחול Firebase + Google provider
    └── firestore-utils.ts   טיפול בשגיאות + sanitize
```

**7 מסכים** (`INITIAL_SHEETS`, App.tsx:26-34): Home · Accounts · Analytics · Income · Expenses · Budgets · Investments

**זרימת נתונים כיום (אחרי שלב 1):**
`App.tsx` → `data/index.ts` → `Repository` (interface) → `FirebaseRepository` → Firestore.
בנוסף `App.tsx` שומר עותק גיבוי של כל ה-state ב-`localStorage`.

**אחרי שלב 2:** אותה שרשרת בדיוק, רק ש-`data/index.ts` יחזיר `SqliteRepository`.
**אף קומפוננטה לא מייבאת `firebase`.** רק 4 קבצים עושים זאת:
`lib/firebase.ts` (אתחול), `context/AuthContext.tsx` (auth בלבד),
`data/FirebaseRepository.ts` ו-`data/cloud.ts`.

---

## 4. מודל הנתונים

6 הישויות מ-`firebase-blueprint.json` — **לשמר אותן**:

| ישות | שדות מפתח |
|---|---|
| `Transaction` | id, date, description, category, amount, type?, accountId? |
| `Account` | id, name, type (Bank/Investment/Pension/Cash), balance |
| `Investment` | id, ticker, name?, exchange?, shares, avgPrice, currentPrice |
| `Goal` | id, name, targetAmount, currentAmount, deadline?, category |
| `Budget` | id, category, limit |
| `UserProfile` | activeSheetId, notes, patchNotes, theme |

**שתי ישויות נוספות ב-`src/types.ts` שאינן ב-blueprint** — לא לשכוח אותן בסכימת SQLite:
- `Reminder` — id, subject, body, scheduledTime, sent, recurrence?, dayOfMonth?
- `Sheet` — הגדרת מסך (UI בלבד, לא צריך טבלה)

הגדרת המקור: `src/types.ts`.

---

## 5. כללי עבודה — מחייבים בכל שלב

1. **branch לכל שלב.** שם: `phase-1-repository`, `phase-2-sqlite` וכו'.
2. **קומיט קטן אחרי כל שינוי לוגי.** הודעות באנגלית, פורמט `type: description`
   (למשל `refactor: extract data access into Repository interface`).
3. **הבילד חייב לעבור.** בסוף כל שלב: `npm run lint` ו-`npm run build` נקיים.
   אם משהו נשבר — לתקן לפני שממשיכים.
4. **אל תדלג שלבים.** כל שלב מניח שהקודם הושלם.
5. **בסוף כל שלב** — סיכום של 3–5 שורות: מה השתנה, למה, ומה אמורים לראות עכשיו.
6. **אל תמחק קוד בלי לוודא שהוא באמת לא בשימוש.**

### תקשורת
- **עברית.** האפליקציה עצמה עוד לא — ראה מלכודת #3.
- **הסבר כל מונח טכני בשורה אחת** בפעם הראשונה שמשתמשים בו.
- **הסבר כל פקודת git בשורה** — מה היא עושה בפועל.
- **קבל החלטות סבירות בעצמך.** לא מטח שאלות הבהרה. לשאול רק כשההחלטה בלתי הפיכה
  או תלויה במידע שרק אופק יודע.
- **קצר ולעניין.** בלי הקדמות.

---

## 6. מלכודות ידועות — נמצאו בשלב 0

### 🔴 1. תזכורות ומשוב לא נשמרים בכלל
`firestore.rules` **אין בו כלל** ל-`users/{uid}/reminders` ולא ל-`feedback`, ואילו
`firestoreService.ts:204-222, 370-393` כותב לשניהם. הכלל הראשון בקובץ
(`match /{document=**} { allow read, write: if false }`) חוסם אותם.
`handleFirestoreError` (`lib/firestore-utils.ts:48`) מדפיס ל-console **וזורק מחדש**.
מכיוון שהקריאות ב-`App.tsx` לא מחכות ב-`await` ואין להן `.catch`, התוצאה היא
unhandled promise rejection: המשתמש לא רואה כלום, התזכורת נראית שנשמרה, ונעלמת ברענון.
**לא מתקנים** — נעלם מעצמו בשלב 2 עם המעבר ל-SQLite.

> תוקן ב-2026-08-23: בשלב 0 כתבתי כאן ש-`handleFirestoreError` "רק מדפיס ל-console".
> זה לא נכון — הוא זורק. האפקט שהמשתמש חווה זהה, המנגנון שונה.

### 🟡 2. כתיבות בתוך `setState` — טופל חלקית בשלב 1
**היה:** ~45 קריאות ל-Firestore מפוזרות ב-`App.tsx`, רובן בתוך פונקציות עדכון של
`setState` — פונקציות שחייבות להיות טהורות. ב-React 19 StrictMode הן רצות פעמיים → כתיבה כפולה.

**עכשיו:** כל הגישה עוברת דרך ה-Repository, וכל כתיבה היא **upsert** — ולכן קריאה
כפולה כבר לא מזיקה. 15 כתיבות עדיין יושבות בתוך updaters, כולן בהנדלרים שמחשבים
מצב נגזר מ-`prev` (יתרות חשבון, עריכת שדה). ההערה ב-`App.tsx` מסבירה למה.

**מה שנשאר:** כל עריכת תנועה עדיין כותבת מחדש את *כל* החשבונות. נפתר בשלב 2,
שם עדכון יתרה הוא `UPDATE` ממוקד ולא כתיבה מחדש של אוסף.

### 🟠 3. האפליקציה כולה באנגלית, LTR
אפס תווים עבריים ב-`src/`. `index.html` הוא `<html lang="en">` בלי `dir` בכלל.
תרגום 14 קומפוננטות + RTL אמיתי = היקף של שלב מלא.
**החלטה: שלב 3.5 נפרד**, אחרי שה-APK עובד ולפני העיצוב.

### 🟠 4. שלושה service workers מתנגשים
`public/sw.js` הוא מעטפת ריקה שלא מטמיעה כלום. הוא נרשם **פעמיים**
(`main.tsx:21` ו-`App.tsx:744`), ובמקביל `vite-plugin-pwa` רושם שלישי עם `autoUpdate`.
אייקוני ה-manifest מגיעים מ-CDN חיצוני (flaticon ב-`vite.config.ts:25-38`,
icons8 ב-`public/manifest.json`) — בלי רשת אין אייקון. הכל יוצא בשלב 3.

### 🟡 5. נתונים מזויפים מוצגים כאמיתיים
- `App.tsx:212-238` — טיימר שכל 3 שניות משנה כל מחיר מניה ב-±0.1% אקראי "ל-liveliness",
  והתוצאה נכנסת ל-state ומשם ל-localStorage.
- `server.ts:265-271` — `cpuUsagePercent` הוא `Math.random()` טהור.
- `server.ts:211-223` — דירוג "Strong Buy / Sell" מארבעה ממוצעים נעים, מוצג כהמלצת השקעה.

### מפתחות API
- 🟡 `firebase-applet-config.json` — apiKey אמיתי בגיט. תקין ל-Firebase web (ההגנה היא ה-rules).
  הקובץ נמחק בשלב 2.
- 🟢 **מפתח Gemini לא חשוף.** `@google/genai` לא מיובא באף קובץ.
  `geminiService.ts:26` קורא ל-`/api/gemini` שרץ בשרת, והמפתח נקרא מ-`process.env` שם.
  `vite.config.ts:51` מגדיר `define` שהיה מטמיע אותו בבאנדל — אבל אף קוד לקוח לא מפנה אליו.
  **החלטה נדרשת בשלב 2** כשמוחקים את `server.ts`: המלצה — הזנת מפתח אישי בהגדרות,
  נשמר על המכשיר, נכשל בשקט כשאין מפתח או רשת.
- 🟡 טוקן Gmail (`lib/firebase.ts:26,39`) יושב בזיכרון בלבד — נעלם ברענון,
  והתזכורות מפסיקות לעבוד עד התחברות מחדש.

---

## 7. `server.ts` — מה הוא באמת עושה

לא "רק שרת סטטי". מחיקתו שוברת 4 פיצ'רים:

| Endpoint | מה עושה | מי קורא |
|---|---|---|
| `GET /api/prices` | מחירי מניות מ-Yahoo | `App.tsx:252` (כל 15ש'), `App.tsx:517`, `Investments.tsx:384` |
| `GET /api/search` | חיפוש טיקרים + היסטוריה שנתית | `Investments.tsx:105` |
| `GET /api/analytics` | ביצועים 1M/3M/6M/1Y + ממוצעים נעים + דירוג | `Investments.tsx:73` |
| `POST /api/gemini` | פרוקסי ל-Gemini | `geminiService.ts:26` |
| `GET /api/system-metrics` | CPU/זיכרון (CPU מזויף) | `AdminConsole.tsx:86` |

בנוסף מגיש את הפרונטאנד: Vite middleware בפיתוח, `dist` סטטי בפרודקשן.

---

## 8. פקודות

```bash
npm install       # התקנת תלויות
npm run dev       # שרת פיתוח (tsx server.ts) — פורט 3000
npm run lint      # tsc --noEmit — בדיקת טיפוסים
npm run build     # vite build → dist/
npm run preview   # תצוגה מקדימה של הבילד
```

**חובה בסוף כל שלב:** `npm run lint && npm run build` — שניהם נקיים.
