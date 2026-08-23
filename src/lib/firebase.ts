import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const config = firebaseConfig as any;
const isValidConfig = config && config.apiKey && config.apiKey !== "";

/** האם Firebase מוגדר בכלל. נחשף כדי ש-Login לא יצטרך לייבא את קובץ הקונפיג. */
export const isAuthConfigured = !!isValidConfig;

const app = isValidConfig ? initializeApp(config) : null as any;
export const auth = isValidConfig ? getAuth(app) : null as any;

export const db = isValidConfig ? 
  initializeFirestore(app, 
    { experimentalForceLongPolling: true }, 
    (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' 
      ? config.firestoreDatabaseId : undefined)
  ) : null as any;

export const googleProvider = isValidConfig ? new GoogleAuthProvider() : null as any;

if (isValidConfig) {
  googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
}

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const signInWithGoogle = async () => {
  if (!isValidConfig) {
    return Promise.reject(new Error("Firebase is not configured yet. Please update the configuration."));
  }
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return result;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = () => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => cachedAccessToken = token;

export const logout = async () => {
  if (isValidConfig) {
    await signOut(auth);
    cachedAccessToken = null;
  }
};
