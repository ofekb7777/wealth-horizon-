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
| `@capacitor-community/sqlite` | ✅ נכנס בשלב 2 — המסד המקומי |
| `jeep-sqlite` + `sql.js` | ✅ נכנס בשלב 2 — SQLite בדפדפן (פיתוח בלבד) |
| Firebase / Firestore | ✅ **הוסר בשלב 2** |
| `react-firebase-hooks` · `@google/genai` | ✅ **הוסרו בשלב 2** (היו תלויות מתות) |
| `server.ts` (Express) + `yahoo-finance2` | ✅ **הוסרו בשלב 2** — הכל עובר דרך `services/marketData.ts` |
| `vite-plugin-pwa` | ❌ יוצא בשלב 3 |
| Capacitor | ➕ `@capacitor/core` כבר בפנים; פלטפורמת android בשלב 3 |
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
├── data/                    ⭐ שכבת הנתונים
│   ├── types.ts             טיפוסי הישויות — מקור האמת
│   ├── Repository.ts        ה-interface: החוזה שכל מימוש חייב לספק
│   ├── SqliteRepository.ts  המימוש היחיד — SQLite מקומי
│   ├── schema.sql           סכימת גרסה 1
│   ├── migrations.ts        גרסאות סכימה לפי PRAGMA user_version
│   └── index.ts             נקודת החיבור + initDatabase()
├── context/
│   ├── ThemeContext.tsx     ערכת נושא — localStorage (נטען סינכרונית)
│   └── VersionContext.tsx   גרסת אפליקציה
└── services/
    ├── marketData.ts        מחירים/חיפוש/אנליטיקה — ישירות מ-Yahoo, עם מטמון
    └── geminiService.ts     תובנות AI עם מפתח אישי מההגדרות
```

**7 מסכים** (`INITIAL_SHEETS`, App.tsx:26-34): Home · Accounts · Analytics · Income · Expenses · Budgets · Investments

**זרימת נתונים (אחרי שלב 2):**
`App.tsx` → `data/index.ts` → `Repository` (interface) → `SqliteRepository` → SQLite על המכשיר.
בנוסף `App.tsx` שומר עותק גיבוי של כל ה-state ב-`localStorage`.

**אין התחברות ואין משתמשים.** האפליקציה נפתחת ישר לנתונים.
במקום שער ההתחברות יש שער פתיחת מסד: מסך טעינה עד שהמסד נפתח, ומסך שגיאה אם נכשל.

**רשת:** רק למחירי מניות ולתובנות AI. שתיהן נכשלות בשקט ולא חוסמות כלום.

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

### ✅ 1. תזכורות ומשוב לא נשמרים — נפתר בשלב 2
`firestore.rules` **אין בו כלל** ל-`users/{uid}/reminders` ולא ל-`feedback`, ואילו
`firestoreService.ts:204-222, 370-393` כותב לשניהם. הכלל הראשון בקובץ
(`match /{document=**} { allow read, write: if false }`) חוסם אותם.
`handleFirestoreError` (`lib/firestore-utils.ts:48`) מדפיס ל-console **וזורק מחדש**.
מכיוון שהקריאות ב-`App.tsx` לא מחכות ב-`await` ואין להן `.catch`, התוצאה היא
unhandled promise rejection: המשתמש לא רואה כלום, התזכורת נראית שנשמרה, ונעלמת ברענון.
**נפתר:** אין יותר Firestore ואין כללי הרשאה. תזכורות נשמרות בטבלה מקומית.
בדרך התגלה באג שני: `Settings` רינדר את ווידג'ט התזכורות עם `onAddReminder!`
בעוד ש-`App.tsx` לא העביר את ההנדלר — כלומר הוספת תזכורת זרקה שגיאה. תוקן.

> תוקן ב-2026-08-23: בשלב 0 כתבתי כאן ש-`handleFirestoreError` "רק מדפיס ל-console".
> זה לא נכון — הוא זרק. האפקט שהמשתמש חווה היה זהה, המנגנון שונה.

### 🟡 2. כתיבות בתוך `setState` — טופל חלקית
**היה:** ~45 קריאות ל-Firestore מפוזרות ב-`App.tsx`, רובן בתוך פונקציות עדכון של
`setState` — פונקציות שחייבות להיות טהורות. ב-React 19 StrictMode הן רצות פעמיים → כתיבה כפולה.

**עכשיו:** כל הגישה עוברת דרך ה-Repository, וכל כתיבה היא **upsert** — ולכן קריאה
כפולה כבר לא מזיקה. 15 כתיבות עדיין יושבות בתוך updaters, כולן בהנדלרים שמחשבים
מצב נגזר מ-`prev` (יתרות חשבון, עריכת שדה). ההערה ב-`App.tsx` מסבירה למה.

**מה שנשאר:** כל עריכת תנועה עדיין כותבת מחדש את *כל* החשבונות
(`nextAccounts.forEach`). ב-SQLite זה upsert מקומי ולא קריאת רשת, ולכן זה
כבר לא כואב — אבל זה עדיין בזבזני. שווה ניקוי בשלב עתידי.

### 🟠 3. האפליקציה כולה באנגלית, LTR
אפס תווים עבריים ב-`src/`. `index.html` הוא `<html lang="en">` בלי `dir` בכלל.
תרגום 14 קומפוננטות + RTL אמיתי = היקף של שלב מלא.
**החלטה: שלב 3.5 נפרד**, אחרי שה-APK עובד ולפני העיצוב.

### 🟠 4. שלושה service workers מתנגשים — שלב 3
`public/sw.js` הוא מעטפת ריקה שלא מטמיעה כלום. הוא נרשם **פעמיים**
(`main.tsx:21` ו-`App.tsx:744`), ובמקביל `vite-plugin-pwa` רושם שלישי עם `autoUpdate`.
אייקוני ה-manifest מגיעים מ-CDN חיצוני (flaticon ב-`vite.config.ts:25-38`,
icons8 ב-`public/manifest.json`) — בלי רשת אין אייקון. הכל יוצא בשלב 3.

### 🟡 5. נתונים מזויפים — שניים מתוך שלושה נפתרו
- ✅ סימולציית המחירים האקראית הוסרה. מה שמוצג הוא מחיר אמיתי שנמשך,
  או האחרון שנשמר במטמון.
- ✅ `cpuUsagePercent` המזויף נמחק יחד עם `server.ts` ו-`AdminConsole`.
- ⚠️ **נשאר:** דירוג "Strong Buy / Sell" (`services/marketData.ts`). החישוב אמיתי —
  ארבע השוואות לממוצעים נעים — אבל התווית מציגה אותו כהמלצת השקעה. שווה לשנות
  את הניסוח בשלב העיצוב.

### מפתחות API — נסגר בשלב 2
- ✅ `firebase-applet-config.json` נמחק יחד עם Firebase.
- ✅ מפתח Gemini: נבחרה **אפשרות ב׳** מהבריף. מזינים מפתח אישי במסך ההגדרות,
  הוא נשמר ב-localStorage על המכשיר בלבד, ונשלח רק ל-Google. בלי מפתח הפיצ'ר
  כבוי ולא חוסם כלום. ה-`define` ב-`vite.config.ts` שהיה מטמיע מפתח בבאנדל הוסר.
- ✅ טוקן Gmail נמחק. שליחת תזכורות במייל ירדה יחד עם ההתחברות ל-Google —
  התזכורות נשמרות ומוצגות באפליקציה, והתראה אמיתית תיכנס בשלב 4.

---

## 7. רשת — מה עדיין יוצא החוצה

`server.ts` נמחק בשלב 2. שתי קריאות רשת נשארו, שתיהן אופציונליות:

| מה | לאן | כשאין רשת |
|---|---|---|
| מחירים · חיפוש טיקרים · אנליטיקה | Yahoo, ישירות מהמכשיר (`CapacitorHttp`) | מחזיר מחיר מוטמן אחרון; חיפוש מחזיר ריק |
| תובנות AI | Google Gemini, עם מפתח אישי מההגדרות | הפיצ'ר כבוי בשקט |

**חוק:** אף אחת מהן לא זורקת, לא מחזירה 0, ולא חוסמת שום מסך.
בדפדפן Yahoo חוסם CORS ולכן המחירים לא יתעדכנו בפיתוח — באנדרואיד זה עובד.

## 8. פקודות

```bash
npm install       # התקנת תלויות
npm run dev       # שרת פיתוח (tsx server.ts) — פורט 3000
npm run lint      # tsc --noEmit — בדיקת טיפוסים
npm run build     # vite build → dist/
npm run preview   # תצוגה מקדימה של הבילד
```

**חובה בסוף כל שלב:** `npm run lint && npm run build` — שניהם נקיים.
