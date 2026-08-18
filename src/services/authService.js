import {
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Convert user input teamCode (e.g. "AUTO-7892" or "auto-7892") to synthetic email
 */
export function formatTeamEmail(teamCode) {
  const cleanCode = teamCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `team_${cleanCode}@hackathon.internal`;
}

/**
 * Sign in Team with Team Code and Passkey
 */
export async function signInWithTeamCode(teamCode, password) {
  if (!teamCode || !password) {
    throw new Error('Team Code and Passkey are required.');
  }
  const syntheticEmail = formatTeamEmail(teamCode);
  const userCredential = await signInWithEmailAndPassword(auth, syntheticEmail, password);
  return userCredential.user;
}

/**
 * Sign in Admin with Email and Password
 */
export async function signInWithAdminCredentials(email, password) {
  if (!email || !password) {
    throw new Error('Admin Email and Password are required.');
  }
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const idTokenResult = await userCredential.user.getIdTokenResult(true);
  
  if (!idTokenResult.claims || idTokenResult.claims.admin !== true) {
    // If not flagged as admin claim yet, throw error
    await signOut(auth);
    throw new Error('Access denied: Account lacks administrator privileges.');
  }
  
  return userCredential.user;
}

/**
 * Sign Out current user
 */
export async function signOutUser() {
  await signOut(auth);
}

/**
 * Listen for Auth state and custom claim changes
 */
export function subscribeToAuthState(callback) {
  return onIdTokenChanged(auth, async (user) => {
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
      callback({ user: null, uid: null, role: 'VISITOR' });
    }
  });
}
