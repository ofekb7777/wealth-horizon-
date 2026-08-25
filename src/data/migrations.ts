import schemaV1 from './schema.sql?raw';

/**
 * מנגנון גרסאות סכימה.
 *
 * SQLite מחזיק מספר גרסה משלו בתוך הקובץ (`PRAGMA user_version`).
 * בכל פתיחה אנחנו קוראים אותו ומריצים רק את המיגרציות שעוד לא רצו.
 * כך אפשר לשנות מבנה טבלאות בעתיד בלי לאבד נתונים קיימים.
 *
 * **להוספת שינוי עתידי:** הוסף איבר חדש למערך עם `version` הבא בתור.
 * לעולם אל תערוך מיגרציה שכבר שוחררה — היא כבר רצה אצלי במכשיר.
 */
export interface Migration {
  version: number;
  /** תיאור קצר, נכתב ללוג בזמן ההרצה. */
  description: string;
  /** SQL להרצה. יכול להכיל כמה פקודות מופרדות בנקודה-פסיק. */
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'initial schema',
    sql: schemaV1,
  },
];

/** הגרסה שהקוד הנוכחי מצפה לה. */
export const LATEST_VERSION = MIGRATIONS.reduce(
  (max, m) => Math.max(max, m.version), 0,
);

/**
 * מחזיר את המיגרציות שצריך להריץ כדי לעלות מגרסה `current` לאחרונה,
 * ממוינות לפי סדר.
 */
export function pendingMigrations(current: number): Migration[] {
  return MIGRATIONS
    .filter(m => m.version > current)
    .sort((a, b) => a.version - b.version);
}
