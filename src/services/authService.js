import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged
} from 'firebase/auth';
import { auth, db, isDummyConfig } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_STORAGE_KEY = 'mechathon_admin_session';
const TEAM_STORAGE_KEY = 'mechathon_team_session';

/**
 * Convert user input teamCode (e.g. "AUTO-7892" or "auto-7892") to synthetic email
 */
export function formatTeamEmail(teamCode) {
  const cleanCode = teamCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `team_${cleanCode.toLowerCase()}@hackathon.internal`;
}

/**
 * Normalize admin login input (e.g. "Smec@clubs26" -> "smec@clubs26.internal" or standard email)
 */
export function normalizeAdminEmail(input) {
  const clean = input.trim();
  if (clean.includes('@') && clean.includes('.')) {
    return clean;
  }
  if (clean.includes('@')) {
    return `${clean}.com`;
  }
  return `${clean}@hackathon.internal`;
}

/**
 * Sign in Team with Team Code and Passkey
 */
export async function signInWithTeamCode(teamCode, password) {
  if (!teamCode || !password) {
    throw new Error('Team Code and Passkey are required.');
  }

  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  // Legacy builds stored unauthenticated demo identities here. Never reuse them.
  sessionStorage.removeItem(TEAM_STORAGE_KEY);
  const cleanCode = teamCode.trim().toUpperCase();
  const cleanPass = password.trim();

  if (isDummyConfig) {
    throw new Error('Firebase is not configured. Team login is unavailable until Firebase credentials are set.');
  }

  try {
    const syntheticEmail = formatTeamEmail(cleanCode);
    const userCredential = await signInWithEmailAndPassword(auth, syntheticEmail, cleanPass);
    sessionStorage.removeItem(TEAM_STORAGE_KEY);
    return userCredential.user;
  } catch (err) {
    console.warn("Firebase Auth team sign-in failed:", err.message);
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      throw new Error('Invalid Team Code or Passkey. Use the credentials generated during team registration.');
    }
    throw new Error(err.message || 'Team authentication failed.');
  }
}

/**
 * Sign in Admin with Email/Login and Password
 * Administrators are real Firebase Authentication users with an accompanying
 * admins/{uid} Firestore role document. No credentials are embedded in the client.
 */
export async function signInWithAdminCredentials(login, password) {
  if (!login || !password) {
    throw new Error('Admin Login and Password are required.');
  }

  const rawLogin = login.trim();
  const cleanPass = password.trim();

  // 1. Try direct live Firebase Auth sign-in first (for accounts created in Firebase Console)
  if (!isDummyConfig) {
    try {
      const emailToUse = rawLogin.includes('@') && rawLogin.includes('.') ? rawLogin : normalizeAdminEmail(rawLogin);
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, cleanPass);
      
      const adminSnap = await getDoc(doc(db, 'admins', userCredential.user.uid));
      if (!adminSnap.exists()) {
        await signOut(auth);
        throw new Error('This account is not authorized for administrator access.');
      }

      // Automatically grant Admin session for successfully authenticated admin console users
      const adminSession = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || rawLogin,
        displayName: userCredential.user.displayName || 'Firebase Console Administrator',
        isAdmin: true,
        role: 'ADMIN',
        token: await userCredential.user.getIdToken().catch(() => 'firebase_admin_token')
      };
      
      sessionStorage.removeItem(TEAM_STORAGE_KEY);
      sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminSession));
      window.dispatchEvent(new Event('storage'));
      return adminSession;
    } catch (firebaseErr) {
      console.warn("Firebase Auth live sign-in note:", firebaseErr.message);
      if (firebaseErr.code === 'permission-denied') {
        throw new Error('Firebase Auth succeeded, but this account cannot read its admin record. Deploy the current Firestore rules and create admins/{uid}.');
      }
      if (firebaseErr.message === 'This account is not authorized for administrator access.') {
        throw firebaseErr;
      }
    }
  }

  throw new Error('Invalid administrator credentials or account is not authorized.');
}

/**
 * Sign Out current user or admin
 */
export async function signOutUser() {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  sessionStorage.removeItem(TEAM_STORAGE_KEY);
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  window.dispatchEvent(new Event('storage'));
}

/**
 * Check if local admin or team session is active
 */
export function getActiveAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}

export function getActiveTeamSession() {
  try {
    const raw = sessionStorage.getItem(TEAM_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return null;
}

/**
 * Listen for Auth state and custom claim changes
 */
export function subscribeToAuthState(callback) {
  const syncState = () => {
    // 1. Check local root admin session
    const localAdmin = getActiveAdminSession();
    if (localAdmin) {
      callback({
        user: localAdmin,
        uid: localAdmin.uid,
        email: localAdmin.email,
        displayName: localAdmin.displayName,
        isAdmin: true,
        role: 'ADMIN'
      });
      return;
    }

    // 2. Clear any legacy local team session. Team access now requires Firebase Auth.
    const localTeam = getActiveTeamSession();
    if (localTeam) {
      sessionStorage.removeItem(TEAM_STORAGE_KEY);
    }

    // 3. Resolve Firebase users against the same admin/team documents used by rules.
    if (auth.currentUser) {
      const user = auth.currentUser;
      Promise.all([
        getDoc(doc(db, 'admins', user.uid)),
        getDoc(doc(db, 'teams', user.uid))
      ]).then(([adminSnap, teamSnap]) => {
        if (adminSnap.exists()) {
          callback({ user, uid: user.uid, email: user.email, displayName: user.displayName, isAdmin: true, role: 'ADMIN' });
        } else if (teamSnap.exists()) {
          callback({ user, uid: user.uid, email: user.email, displayName: user.displayName, isAdmin: false, role: 'TEAM' });
        } else {
          callback({ user: null, uid: null, role: 'VISITOR', isAdmin: false });
        }
      }).catch(() => callback({ user: null, uid: null, role: 'VISITOR', isAdmin: false }));
    } else {
      callback({ user: null, uid: null, role: 'VISITOR', isAdmin: false });
    }
  };

  // Initial call
  syncState();

  const handleStorageChange = () => {
    syncState();
  };

  window.addEventListener('storage', handleStorageChange);

  const unsub = onIdTokenChanged(auth, async (user) => {
    const adminSession = getActiveAdminSession();
    if (adminSession) return;
    const teamSession = getActiveTeamSession();
    if (teamSession) return;

    syncState();
  });

  return () => {
    unsub();
    window.removeEventListener('storage', handleStorageChange);
  };
}
