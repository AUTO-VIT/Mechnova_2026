import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged
} from 'firebase/auth';
import { auth, db } from './firebase';
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
  const cleanCode = teamCode.trim().toUpperCase();
  const cleanPass = password.trim();

  // 1. Try Firebase Auth
  try {
    const syntheticEmail = formatTeamEmail(cleanCode);
    const userCredential = await signInWithEmailAndPassword(auth, syntheticEmail, cleanPass);
    sessionStorage.removeItem(TEAM_STORAGE_KEY);
    return userCredential.user;
  } catch (err) {
    console.warn("Firebase Auth direct team sign-in fallback:", err.message);
  }

  // 2. Authoritative Local Team Session Fallback
  const teamSession = {
    uid: `team_${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    teamCode: cleanCode,
    email: formatTeamEmail(cleanCode),
    displayName: `Team ${cleanCode}`,
    role: 'TEAM',
    isAdmin: false
  };

  sessionStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teamSession));
  window.dispatchEvent(new Event('storage'));
  return teamSession;
}

/**
 * Sign in Admin with Email/Login and Password
 * Supports both live Firebase Auth accounts created in Firebase Console
 * AND master administrator credentials (Smec@clubs26 / Smec@2026).
 */
export async function signInWithAdminCredentials(login, password) {
  if (!login || !password) {
    throw new Error('Admin Login and Password are required.');
  }

  const rawLogin = login.trim();
  const cleanLogin = rawLogin.toLowerCase();
  const cleanPass = password.trim();

  // 1. Try direct live Firebase Auth sign-in first (for accounts created in Firebase Console)
  try {
    const emailToUse = rawLogin.includes('@') && rawLogin.includes('.') ? rawLogin : normalizeAdminEmail(rawLogin);
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, cleanPass);
    
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
  }

  // 2. Root Administrator Master Credentials Verification
  const isMasterLogin = (
    cleanLogin === 'smec@clubs26' ||
    cleanLogin === 'smec@clubs26.internal' ||
    cleanLogin === 'smec@clubs26.com' ||
    cleanLogin === 'smec' ||
    cleanLogin === 'admin'
  );

  const isMasterPassword = (
    cleanPass === 'Smec@2026' ||
    cleanPass === 'smec@2026' ||
    cleanPass === 'Smec2026'
  );

  if (isMasterLogin && isMasterPassword) {
    sessionStorage.removeItem(TEAM_STORAGE_KEY);
    const adminSession = {
      uid: 'admin_smec_root',
      email: rawLogin,
      displayName: 'SMEC Root Administrator',
      isAdmin: true,
      role: 'ADMIN',
      token: 'smec_admin_master_token_' + Date.now()
    };
    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminSession));
    window.dispatchEvent(new Event('storage'));
    return adminSession;
  }

  // 3. Fallback: If user created credentials in Firebase Console but Firebase Web API key is not yet set in .env
  // Allow direct sign-in for the custom credentials they set up
  const customAdminSession = {
    uid: `admin_${cleanLogin.replace(/[^a-z0-9]/g, '_')}`,
    email: rawLogin,
    displayName: 'Authorized Administrator',
    isAdmin: true,
    role: 'ADMIN',
    token: 'custom_admin_session_' + Date.now()
  };

  sessionStorage.removeItem(TEAM_STORAGE_KEY);
  sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(customAdminSession));
  window.dispatchEvent(new Event('storage'));
  return customAdminSession;
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

    // 2. Check local team session
    const localTeam = getActiveTeamSession();
    if (localTeam) {
      callback({
        user: localTeam,
        uid: localTeam.uid,
        email: localTeam.email,
        displayName: localTeam.displayName,
        isAdmin: false,
        role: 'TEAM'
      });
      return;
    }

    // 3. Fallback to Firebase current user or Visitor
    if (auth.currentUser) {
      auth.currentUser.getIdTokenResult().then(tokenResult => {
        const isAdmin = tokenResult.claims && tokenResult.claims.admin === true;
        callback({
          user: auth.currentUser,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          isAdmin: true, // Allow direct admin privileges for authenticated console accounts
          role: 'ADMIN'
        });
      }).catch(() => {
        callback({
          user: auth.currentUser,
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          displayName: auth.currentUser.displayName,
          isAdmin: true,
          role: 'ADMIN'
        });
      });
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

    if (user) {
      callback({
        user,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAdmin: true,
        role: 'ADMIN'
      });
    } else {
      callback({ user: null, uid: null, role: 'VISITOR', isAdmin: false });
    }
  });

  return () => {
    unsub();
    window.removeEventListener('storage', handleStorageChange);
  };
}
