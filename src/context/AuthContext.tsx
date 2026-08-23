import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout, getAccessToken, setCachedAccessToken } from '../lib/firebase';
import { firestoreService } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      const currentToken = getAccessToken();
      if (!user) {
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
      setIsAdmin(!!user && adminEmails.includes(user.email || ""));
      if (user) {
        await firestoreService.syncUser(user);
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
