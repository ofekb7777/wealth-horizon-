import { Repository } from './Repository';
import { FirebaseRepository } from './FirebaseRepository';

/**
 * נקודת החיבור של שכבת הנתונים — המקום היחיד שבוחר מימוש.
 *
 * ⬅️ **בשלב 2 משנים כאן שורה אחת בלבד:**
 *    `new FirebaseRepository()` → `new SqliteRepository()`
 *    שאר האפליקציה לא יודעת ולא מעניין אותה מי מאחורי החוזה.
 */
export const repository: Repository = new FirebaseRepository();

export type { Repository } from './Repository';
export * from './types';
