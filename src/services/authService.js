import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged
} from 'firebase/auth';
import { auth } from './firebase';

const ADMIN_STORAGE_KEY = 'mechathon_admin_session';

/**
 * Convert user input teamCode (e.g. "AUTO-7892" or "auto-7892") to synthetic email
 */
export function formatTeamEmail(teamCode) {
  const cleanCode = teamCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `team_${cleanCode}@hackathon.internal`;
}

/**
 * Normalize admin login input (e.g. "Smec@clubs26" -> "smec@clubs26.internal" or standard email)
 */
export function normalizeAdminEmail(input) {
  const clean = input.trim();
  if (clean.includes('@') && clean.includes('.')) {
    return clean.toLowerCase();
  }
  if (clean.includes('@')) {
    return `${clean.toLowerCase()}.internal`;
  }
  return `${clean.toLowerCase()}@hackathon.internal`;
}

/**
 * Sign in Team with Team Code and Passkey
 */
export async function signInWithTeamCode(teamCode, password) {
  if (!teamCode || !password) {
    throw new Error('Team Code and Passkey are required.');
  }
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  const syntheticEmail = formatTeamEmail(teamCode);
  const userCredential = await signInWithEmailAndPassword(auth, syntheticEmail, password);
  return userCredential.user;
}

/**
 * Sign in Admin with Email/Login and Password
 * Supports official credentials: Login: Smec@clubs26, Password: Smec@2026
 */
export async function signInWithAdminCredentials(login, password) {
  if (!login || !password) {
    throw new Error('Admin Login and Password are required.');
  }

  const cleanLogin = login.trim();
  const cleanPass = password.trim();

  // Root Administrator Master Credentials Verification
  const isMasterAdmin = (
    (cleanLogin.toLowerCase() === 'smec@clubs26' || cleanLogin.toLowerCase() === 'smec@clubs26.internal' || cleanLogin.toLowerCase() === 'smec@clubs26.com' || cleanLogin === 'Smec@clubs26') &&
    cleanPass === 'Smec@2026'
  );

  if (isMasterAdmin) {
    const adminSession = {
      uid: 'admin_smec_root',
      email: 'Smec@clubs26',
      displayName: 'SMEC Root Administrator',
      isAdmin: true,
      role: 'ADMIN',
      token: 'smec_admin_master_token_' + Date.now()
    };
    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminSession));
    window.dispatchEvent(new Event('storage'));
    return adminSession;
  }

  // Attempt Firebase Auth sign-in
  try {
    const emailToUse = normalizeAdminEmail(cleanLogin);
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, cleanPass);
    const idTokenResult = await userCredential.user.getIdTokenResult(true);

    if (!idTokenResult.claims || idTokenResult.claims.admin !== true) {
      await signOut(auth);
      throw new Error('Access denied: Account lacks administrator privileges.');
    }

    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    return userCredential.user;
  } catch (err) {
    throw new Error(err.message || 'Admin authentication failed.');
  }
}

/**
 * Sign Out current user or admin
 */
export async function signOutUser() {
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  window.dispatchEvent(new Event('storage'));
}

/**
 * Check if local admin session is active
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

/**
 * Listen for Auth state and custom claim changes
 */
export function subscribeToAuthState(callback) {
  // Check local root admin session first
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
  }

  const handleStorageChange = () => {
    const currentAdmin = getActiveAdminSession();
    if (currentAdmin) {
      callback({
        user: currentAdmin,
        uid: currentAdmin.uid,
        email: currentAdmin.email,
        displayName: currentAdmin.displayName,
        isAdmin: true,
        role: 'ADMIN'
      });
    } else if (!auth.currentUser) {
      callback({ user: null, uid: null, role: 'VISITOR', isAdmin: false });
    }
  };

  window.addEventListener('storage', handleStorageChange);

  const unsub = onIdTokenChanged(auth, async (user) => {
    const adminSession = getActiveAdminSession();
    if (adminSession) return;

    if (user) {
      const tokenResult = await user.getIdTokenResult();
      const isAdmin = tokenResult.claims && tokenResult.claims.admin === true;
      callback({
        user,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAdmin,
        role: isAdmin ? 'ADMIN' : 'TEAM'
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
