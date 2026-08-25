import { Repository } from './Repository';
import { SqliteRepository } from './SqliteRepository';

/**
 * נקודת החיבור של שכבת הנתונים — המקום היחיד שבוחר מימוש.
 *
 * שלב 2 החליף כאן שורה אחת: `FirebaseRepository` → `SqliteRepository`.
 * שאר האפליקציה לא השתנתה בכלל, כי שניהם מממשים את אותו חוזה.
 */
const sqliteRepository = new SqliteRepository();

export const repository: Repository = sqliteRepository;

/**
 * פותח את מסד הנתונים ומריץ מיגרציות.
 * חייב לרוץ פעם אחת בעליית האפליקציה, לפני כל קריאה ל-`repository`.
 */
export const initDatabase = () => sqliteRepository.open();

/** מחיקה מלאה כולל תזכורות ופרופיל — עבור כפתור "מחק הכל" בהגדרות. */
export const wipeEverything = () => sqliteRepository.wipeEverything();

export type { Repository } from './Repository';
export * from './types';
