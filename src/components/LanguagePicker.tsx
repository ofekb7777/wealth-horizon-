import { useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { LOCALES, LocaleCode, getDictionary, getDirection } from '../i18n';
import { useI18n } from '../context/LanguageContext';

/**
 * מסך בחירת השפה, בהרצה הראשונה בלבד.
 *
 * הבריף ביקש את הבחירה "בהקמת החשבון" — אבל אין הקמת חשבון, ההתחברות
 * הוסרה כולה בשלב 2. זה השקול לה: מוצג פעם אחת, אחרי שהמסד נפתח
 * בהצלחה, ואחר כך אפשר לשנות בהגדרות בכל רגע.
 *
 * הבחירה משנה מיד את הכיוון ואת שפת הכפתור, כדי שרואים מה בוחרים
 * לפני שמאשרים.
 */
/*
 * אין prop של onDone: `setLocale` כותב את ההעדפה, וזה לבדו מוריד את
 * `needsLanguageChoice` ומחליף את המסך. פחות חוטים לחבר.
 */
export default function LanguagePicker() {
  const { locale, setLocale } = useI18n();
  const [picked, setPicked] = useState<LocaleCode>(locale);

  // מציגים את הטקסט בשפה שבה מרחפים, לא בברירת המחדל.
  const preview = getDictionary(picked).languagePicker;
  const dir = getDirection(picked);

  return (
    <div
      dir={dir}
      className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 gap-10 p-8 mesh-gradient"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Globe className="w-10 h-10 text-pink-500" />
        <h1 className="horizon-title text-2xl tracking-[0.15em]">{preview.title}</h1>
        <p className="text-xs text-zinc-500 max-w-xs">{preview.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {LOCALES.map(item => {
          const active = item.code === picked;
          return (
            <button
              key={item.code}
              type="button"
              lang={item.code}
              dir={item.dir}
              onClick={() => setPicked(item.code)}
              aria-pressed={active}
              className={`relative flex flex-col items-start gap-1 rounded-2xl border p-4 transition-all text-start ${
                active
                  ? 'border-pink-500/60 bg-pink-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <span className="text-lg font-black text-zinc-100 leading-tight">{item.nativeName}</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500" dir="ltr">
                {item.englishName}
              </span>
              {active && <Check className="absolute top-3 end-3 h-4 w-4 text-pink-500" />}
            </button>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => setLocale(picked)}
        className="px-10 py-3 rounded-full bg-pink-500 text-zinc-950 font-black tracking-widest uppercase text-sm"
      >
        {preview.confirm}
      </motion.button>
    </div>
  );
}
