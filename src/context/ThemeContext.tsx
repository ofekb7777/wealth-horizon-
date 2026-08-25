import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Theme = 'default' | 'mono' | 'forest' | 'sunset' | 'lavender' | 'crimson' | 'gold' | 'royal';
export type BgEffect = 'none' | 'cateyes' | 'leaves' | 'sparks';
export type MonoStyle = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  bgEffect: BgEffect;
  setBgEffect: (effect: BgEffect) => Promise<void>;
  monoStyle: MonoStyle;
  setMonoStyle: (style: MonoStyle) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * העדפות תצוגה נשמרות ב-localStorage ולא במסד הנתונים.
 *
 * שתי סיבות: הן נקראות באופן סינכרוני, כך שהאפליקציה עולה כבר בערכת
 * הנושא הנכונה במקום להבהב; והן לא נתונים פיננסיים, ולכן אין סיבה
 * שייכללו בגיבוי או יימחקו יחד עם "מחק הכל".
 */
const KEYS = {
  theme: 'theme_preference',
  bgEffect: 'bg_effect_preference',
  monoStyle: 'mono_style_preference',
} as const;

const read = <T extends string>(key: string, fallback: T): T => {
  try {
    return (localStorage.getItem(key) as T) || fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save preference "${key}"`, error);
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => read(KEYS.theme, 'default'));
  const [bgEffect, setBgEffectState] = useState<BgEffect>(() => read(KEYS.bgEffect, 'none'));
  const [monoStyle, setMonoStyleState] = useState<MonoStyle>(() => read(KEYS.monoStyle, 'dark'));

  useEffect(() => { write(KEYS.theme, theme); }, [theme]);
  useEffect(() => { write(KEYS.bgEffect, bgEffect); }, [bgEffect]);
  useEffect(() => { write(KEYS.monoStyle, monoStyle); }, [monoStyle]);

  // החתימות נשארו async כדי לא לשנות את הקוד שקורא להן.
  const setTheme = async (newTheme: Theme) => setThemeState(newTheme);
  const setBgEffect = async (newEffect: BgEffect) => setBgEffectState(newEffect);
  const setMonoStyle = async (newStyle: MonoStyle) => setMonoStyleState(newStyle);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, bgEffect, setBgEffect, monoStyle, setMonoStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
