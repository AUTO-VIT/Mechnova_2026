import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribe to Event status document
 */
export function subscribeToEvent(eventId, callback) {
  const eventRef = doc(db, 'events', eventId);
  return onSnapshot(eventRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => console.error("Event snapshot error:", err));
}

/**
 * Subscribe to Team profile document
 */
export function subscribeToTeam(teamId, callback) {
  if (!teamId) return () => {};
  const teamRef = doc(db, 'teams', teamId);
  return onSnapshot(teamRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => console.error("Team snapshot error:", err));
}

/**
 * Subscribe to Team Quiz Score document
 */
export function subscribeToScore(teamId, callback) {
  if (!teamId) return () => {};
  const scoreRef = doc(db, 'scores', teamId);
  return onSnapshot(scoreRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback({ totalPoints: 0, answeredCount: 0, correctCount: 0, finalized: false });
    }
  }, (err) => console.error("Score snapshot error:", err));
}

/**
 * Subscribe to Public Revealed Themes
 */
export function subscribeToPublicThemes(eventId, callback) {
  const q = query(
    collection(db, 'themesPublic', eventId, 'items'),
    orderBy('themeNumber', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const themes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(themes);
  }, (err) => console.error("Public themes snapshot error:", err));
}

/**
 * Subscribe to Private Themes (Admin only)
 */
export function subscribeToPrivateThemes(eventId, callback) {
  const q = query(
    collection(db, 'themesPrivate', eventId, 'items'),
    orderBy('themeNumber', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const themes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(themes);
  }, (err) => console.error("Private themes snapshot error:", err));
}

/**
 * Subscribe to Team's Bid
 */
export function subscribeToTeamBid(eventId, teamId, callback) {
  if (!teamId) return () => {};
  const bidRef = doc(db, 'bids', eventId, 'items', teamId);
  return onSnapshot(bidRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => console.error("Bid snapshot error:", err));
}

/**
 * Subscribe to All Bids (Admin)
 */
export function subscribeToAllBids(eventId, callback) {
  const q = query(collection(db, 'bids', eventId, 'items'));
  return onSnapshot(q, (snap) => {
    const bids = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(bids);
  }, (err) => console.error("All bids snapshot error:", err));
}

/**
 * Subscribe to Team Allocation Result
 */
export function subscribeToTeamAllocation(eventId, teamId, callback) {
  if (!teamId) return () => {};
  const allocRef = doc(db, 'allocations', eventId, 'items', teamId);
  return onSnapshot(allocRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => console.error("Allocation snapshot error:", err));
}

/**
 * Subscribe to All Allocations (Admin)
 */
export function subscribeToAllAllocations(eventId, callback) {
  const q = query(collection(db, 'allocations', eventId, 'items'));
  return onSnapshot(q, (snap) => {
    const allocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(allocs);
  }, (err) => console.error("All allocations snapshot error:", err));
}

/**
 * Subscribe to Audit Logs (Admin)
 */
export function subscribeToAuditLogs(eventId, callback) {
  const q = query(
    collection(db, 'auditLogs', eventId, 'items'),
    orderBy('createdAtMs', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(logs);
  }, (err) => console.error("Audit logs snapshot error:", err));
}

/**
 * Subscribe to CMS Page Content
 */
export function subscribeToCmsContent(eventId, pageId, callback) {
  const cmsRef = doc(db, 'events', eventId, 'publicContent', pageId);
  return onSnapshot(cmsRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => console.error("CMS snapshot error:", err));
}

/**
 * Subscribe to Quiz Questions (Admin Bank)
 */
export function subscribeToQuizQuestions(quizId, callback) {
  const q = query(
    collection(db, 'quizzes', quizId, 'questions'),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(questions);
  }, (err) => console.error("Quiz questions snapshot error:", err));
}

/**
 * Firestore Write Helpers for CMS & Admin
 */
export async function saveCmsPage(eventId, pageId, data) {
  const ref = doc(db, 'events', eventId, 'publicContent', pageId);
  await setDoc(ref, { pageId, ...data, updatedAtMs: Date.now() }, { merge: true });
}

export async function savePrivateTheme(eventId, themeId, themeData) {
  const ref = doc(db, 'themesPrivate', eventId, 'items', themeId);
  await setDoc(ref, { themeId, ...themeData, updatedAtMs: Date.now() }, { merge: true });
}

export async function saveQuizQuestion(quizId, questionId, questionData) {
  const ref = doc(db, 'quizzes', quizId, 'questions', questionId);
  await setDoc(ref, { id: questionId, ...questionData, updatedAtMs: Date.now() }, { merge: true });
}

export async function deleteQuizQuestion(quizId, questionId) {
  const ref = doc(db, 'quizzes', quizId, 'questions', questionId);
  await deleteDoc(ref);
}

export async function updateEventControls(eventId, controlsData) {
  const ref = doc(db, 'events', eventId);
  await updateDoc(ref, { ...controlsData, updatedAtMs: Date.now() });
}
