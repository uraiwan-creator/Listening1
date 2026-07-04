/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Get configuration from Vite environment variables
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "listening1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "listening1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "listening1.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if we have saved custom config in localStorage for easy browser-based configuration
const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('CUSTOM_FIREBASE_CONFIG');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse custom firebase config', e);
  }
  return null;
};

const activeConfig = getSavedFirebaseConfig() || envConfig;

const isConfigValid = !!activeConfig.apiKey;

let app;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    console.log('Firebase successfully initialized with project:', activeConfig.projectId);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
} else {
  console.warn('Firebase VITE_FIREBASE_API_KEY is not defined. Falling back to Demo LocalStorage database.');
}

export { app, auth, db, googleProvider, isConfigValid, activeConfig };
