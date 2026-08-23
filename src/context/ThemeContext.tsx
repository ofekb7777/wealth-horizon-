import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

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

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('default');
  const [bgEffect, setBgEffectState] = useState<BgEffect>('none');
  const [monoStyle, setMonoStyleState] = useState<MonoStyle>('dark');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTheme = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.theme) {
              setThemeState(data.theme as Theme);
            }
            if (data.bgEffect) {
              setBgEffectState(data.bgEffect as BgEffect);
            }
            if (data.monoStyle) {
              setMonoStyleState(data.monoStyle as MonoStyle);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user theme/effect:", error);
        }
      } else {
        setThemeState('default');
        setBgEffectState('none');
        const localStyle = localStorage.getItem('mono_style_preference') as MonoStyle;
        if (localStyle) {
          setMonoStyleState(localStyle);
        } else {
          setMonoStyleState('dark');
        }
      }
    };
    fetchTheme();
  }, [user]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
      } catch (error) {
        console.error("Failed to save user theme:", error);
      }
    }
  };

  const setBgEffect = async (newEffect: BgEffect) => {
    setBgEffectState(newEffect);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { bgEffect: newEffect }, { merge: true });
      } catch (error) {
        console.error("Failed to save user effect:", error);
      }
    }
  };

  const setMonoStyle = async (newStyle: MonoStyle) => {
    setMonoStyleState(newStyle);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { monoStyle: newStyle }, { merge: true });
      } catch (error) {
        console.error("Failed to save user mono style:", error);
      }
    } else {
      localStorage.setItem('mono_style_preference', newStyle);
    }
  };

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
