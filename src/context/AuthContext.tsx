import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, logout, getAccessToken, setCachedAccessToken } from '../lib/firebase';
import { repository, AppUser } from '../data';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * ממיר את אובייקט המשתמש של Firebase לטיפוס `AppUser` שלנו,
 * כדי שאף קומפוננטה לא תצטרך לייבא טיפוסים מ-`firebase/auth`.
 */
const toAppUser = (user: FirebaseUser): AppUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const appUser = firebaseUser ? toAppUser(firebaseUser) : null;
      setUser(appUser);

      const currentToken = getAccessToken();
      if (!appUser) {
        setCachedAccessToken(null);
        setAccessToken(null);
      } else if (currentToken) {
        setAccessToken(currentToken);
      } else {
        // If they sign in but no token, we can't reliably get the access token from just the user here
        // without re-authenticating if they don't have it locally cached (e.g. on page refresh)
        // Usually, the app requires a "Sign in with Google" button click to restore the credential.
        console.warn("User is logged in but no access token is cached. App may require re-auth for Gmail.");
      }

      // Hardcoded admin email list for role check
      const adminEmails = ["ofekb7777@gmail.com"];
      setIsAdmin(!!appUser && adminEmails.includes(appUser.email || ""));
      if (appUser) {
        await repository.syncUser(appUser);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
      const currentToken = getAccessToken();
      if (currentToken) {
        setAccessToken(currentToken);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await logout();
      setIsAdmin(false);
      setAccessToken(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin, accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
