import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration for the MechNova production project.
// The Firebase web API key identifies this app; access is enforced by Firebase Auth
// and Firestore Security Rules, not by keeping this client-side value secret.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5AeljmRuS2ajykYvn9dTWIZ03fUJk30s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mechnova-vit.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mechnova-vit-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mechnova-vit",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mechnova-vit.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "971911526110",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:971911526110:web:f98bbbaab015d8e160344f"
};

// Detect dummy/missing credentials at startup
const isDummyConfig = !import.meta.env.VITE_FIREBASE_API_KEY &&
  !firebaseConfig.apiKey;

if (isDummyConfig && import.meta.env.VITE_USE_EMULATORS !== 'true') {
  console.warn(
    '%c⚠ MECHNOVA: Firebase API key is not configured. Add VITE_FIREBASE_API_KEY to your .env file. ' +
    'Auth and Firestore will use local-only fallback mode.',
    'color: #F59E0B; font-weight: bold;'
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Firestore with robust connection settings to prevent infinite loop errors
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true
  });
} catch (e) {
  db = getFirestore(app);
}

const functions = getFunctions(app, "us-central1");

// Connect to Local Firebase Emulators if configured
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  } catch (e) {
    // ignore
  }
}

export { app, auth, db, functions, isDummyConfig };
