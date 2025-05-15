/**
 * Firebase bootstrap for Aspen AI Tool (frontend)
 * ------------------------------------------------
 *  ‣ Reads all required keys from Vite env vars
 *  ‣ Throws immediately if any key is missing
 *  ‣ Exports:
 *        • app              – the initialized FirebaseApp
 *        • auth             – Firebase Auth instance
 *        • googleProvider   – GoogleAuthProvider
 *        • analytics        – Firebase Analytics instance
 *        • logEvent         – Event logger for tracking auth or custom events
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";

function env(name: string): string {
  const v = import.meta.env[name];
  if (!v) throw new Error(`❌ Missing env var: ${name}`);
  return v;
}

const firebaseConfig = {
  apiKey:            env("VITE_FIREBASE_API_KEY"),
  authDomain:        env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId:         env("VITE_FIREBASE_PROJECT_ID"),
  storageBucket:     env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId:             env("VITE_FIREBASE_APP_ID"),
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export { logEvent };

googleProvider.setCustomParameters({ prompt: "select_account" });