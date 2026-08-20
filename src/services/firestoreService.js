import {
  doc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, auth, isDummyConfig } from './firebase';

const CONTROLS_STORAGE_KEY = 'mechathon_event_controls';

/**
 * Subscribe to Event status document
 */
export function subscribeToEvent(eventId = 'default-event', callback) {
  const getMergedEvent = (remoteData, includeLocalControls = false) => {
    let localControls = {};
    try {
      const stored = localStorage.getItem(CONTROLS_STORAGE_KEY);
      if (stored) localControls = JSON.parse(stored);
    } catch (e) {}

    const base = remoteData || {
      id: eventId,
      name: "AUTOMATION & ROBOTICS HACKATHON 2026",
      status: "ACTIVE",
      registrationOpen: true,
      quizOpen: true,
      themesRevealed: false,
      biddingOpen: false,
      allocationFinalized: false,
      resultsRevealed: false,
      quizId: "default-quiz"
    };

    return includeLocalControls ? { ...base, ...localControls } : base;
  };

  // Initial call with cached/default data
  callback(getMergedEvent(null, true));

  const handleControlsEvent = () => {
    callback(getMergedEvent(null, true));
  };
  window.addEventListener('mechathon_controls_changed', handleControlsEvent);
  window.addEventListener('storage', handleControlsEvent);

  const eventRef = doc(db, 'events', eventId);
  const unsub = onSnapshot(eventRef, (snap) => {
    if (snap.exists()) {
      callback(getMergedEvent({ id: snap.id, ...snap.data() }));
    }
  }, (err) => {
    console.warn("Event snapshot notice:", err.message);
  });

  return () => {
    unsub();
    window.removeEventListener('mechathon_controls_changed', handleControlsEvent);
    window.removeEventListener('storage', handleControlsEvent);
  };
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
  }, (err) => console.warn("Team snapshot notice:", err.message));
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
  }, (err) => console.warn("Score snapshot notice:", err.message));
}

/**
 * Subscribe to all registered teams for an event (admin only).
 */
export function subscribeToRegisteredTeams(eventId = 'default-event', callback) {
  const teamsQuery = query(collection(db, 'teams'), where('eventId', '==', eventId));
  return onSnapshot(teamsQuery, (snap) => {
    const teams = snap.docs
      .map((team) => ({ id: team.id, ...team.data() }))
      .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    callback(teams);
  }, (err) => console.warn('Registration snapshot notice:', err.message));
}

/**
 * Subscribe to Public Revealed Themes
 */
export function subscribeToPublicThemes(eventId, callback) {
  const q = query(
    collection(db, 'themesPublic', eventId, 'items'),
    where('visible', '==', true),
    orderBy('themeNumber', 'asc')
  );

  const unsub = onSnapshot(q, (snap) => {
    const themes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(themes);
  }, (err) => {
    console.warn("Public themes snapshot notice:", err.message);
    callback([]);
  });

  return unsub;
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
  }, (err) => console.warn("Private themes snapshot notice:", err.message));
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
  }, (err) => console.warn("Bid snapshot notice:", err.message));
}

/**
 * Subscribe to All Bids (Admin)
 */
export function subscribeToAllBids(eventId, callback) {
  const q = query(collection(db, 'bids', eventId, 'items'));
  return onSnapshot(q, (snap) => {
    const bids = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(bids);
  }, (err) => console.warn("All bids snapshot notice:", err.message));
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
  }, (err) => console.warn("Allocation snapshot notice:", err.message));
}

/**
 * Subscribe to All Allocations (Admin)
 */
export function subscribeToAllAllocations(eventId, callback) {
  const q = query(collection(db, 'allocations', eventId, 'items'));
  return onSnapshot(q, (snap) => {
    const allocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(allocs);
  }, (err) => console.warn("All allocations snapshot notice:", err.message));
}

/**
 * Subscribe to Audit Logs (Admin)
 */
export function subscribeToAuditLogs(eventId, callback) {
  // Skip Firestore listener if no authenticated user (prevents permission errors)
  if (!auth.currentUser) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'auditLogs', eventId, 'items'),
    orderBy('createdAtMs', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(logs);
  }, (err) => console.warn("Audit logs snapshot notice:", err.message));
}

/**
 * Default Full Homepage & Navbar CMS Content
 */
export const DEFAULT_HOMEPAGE_CMS = {
  // Navbar
  brandTitle: "MECHNOVA",
  brandSubtitle: "ROBOTICS & AUTOMATION / 2026",
  navStatusBadge: "EVENT LIVE",
  navLink1Text: "Home",
  navLink2Text: "Themes",
  navLink3Text: "Status",
  navCtaText: "Team Portal",

  // Hero Section
  heroBadge: "MECHNOVA 2026 · VIT CHENNAI",
  heroTitleLine1: "Think bold.",
  heroTitleLine2: "Build",
  heroSubtitle: "MechNova brings student teams together to solve practical challenges across robotics, automation, perception, and control.",
  heroPrimaryCtaText: "Create your team",
  heroPrimaryCtaLink: "/register",
  heroSecondaryCtaText: "Explore the event",
  heroSecondaryCtaLink: "/login",
  heroAnnouncements: "",

  // Mission Radar Stats
  stat1Value: "48H",
  stat1Label: "MISSION RUNTIME",
  stat2Value: "04",
  stat2Label: "CHALLENGE DOMAINS",
  stat3Value: "100%",
  stat3Label: "SERVER DETERMINISTIC",
  stat4Value: "NTP",
  stat4Label: "TIME SYNCHRONIZED",

  // Challenge Domains
  domain1Category: "DOM-01",
  domain1Title: "Autonomous Kinematics",
  domain1Desc: "Build machines that perceive, plan, and move through uncertainty.",
  domain1Stat: "6-DOF ROBOTIC MANIPULATORS",

  domain2Category: "DOM-02",
  domain2Title: "Perception & Vision",
  domain2Desc: "Turn visual signals into decisions at the edge.",
  domain2Stat: "<15MS LATENCY BOUND",

  domain3Category: "DOM-03",
  domain3Title: "Industrial Intelligence",
  domain3Desc: "Design safe, deterministic automation systems.",
  domain3Stat: "SIL-3 SAFETY ARCHITECTURE",

  domain4Category: "DOM-04",
  domain4Title: "Swarm Coordination",
  domain4Desc: "Coordinate systems that think better together.",
  domain4Stat: "BYZANTINE FAULT TOLERANCE",

  // 4-Phase Sequence Timeline
  phase1Num: "01",
  phase1Title: "Register",
  phase1Badge: "PHASE 01",
  phase1Desc: "Create your team and keep your one-time credentials safe.",

  phase2Num: "02",
  phase2Title: "Earn",
  phase2Badge: "PHASE 02",
  phase2Desc: "Complete the timed quiz to earn your bidding power.",

  phase3Num: "03",
  phase3Title: "Discover",
  phase3Badge: "PHASE 03",
  phase3Desc: "Explore themes after the administrator reveals them.",

  phase4Num: "04",
  phase4Title: "Choose",
  phase4Badge: "PHASE 04",
  phase4Desc: "Rank every theme; available seats decide your assignment.",

  // Content used by the current redesigned homepage
  heroEyebrow: "Engineering beyond the expected",
  heroTitleAccent: "beyond.",
  heroBenefit1: "2–4 innovators per team",
  heroBenefit2: "Timed quiz",
  heroBenefit3: "Seat-based theme allocation",
  heroCoreText: "Quiz performance sets allocation priority; your ranked preferences decide what comes next.",
  heroStatusLabel: "Registration",
  heroStatusValue: "Teams of 2–4",
  heroMissionLabel: "Event format",
  heroMissionValue: "Quiz → Preferences → Build",
  announcementLabel: "Event update",
  liveEyebrow: "Current event status",
  liveTitle: "See what is open right now.",
  liveDescription: "Registration, quiz, theme reveal, and bidding status update here as the event progresses.",
  liveLinkText: "View event status",
  statusRegistrationLabel: "Registration",
  statusRegistrationOpen: "Open",
  statusRegistrationClosed: "Closed",
  statusQuizLabel: "Quiz",
  statusQuizLive: "Live",
  statusQuizStandby: "Standby",
  statusThemesLabel: "Theme reveal",
  statusThemesSealed: "Hidden",
  statusThemesSuffix: "revealed",
  statusBiddingLabel: "Bidding",
  statusBiddingOpen: "Open",
  statusBiddingClosed: "Closed",
  hiddenThemesEyebrow: "Challenge areas",
  hiddenThemesTitle: "The themes stay hidden until reveal.",
  hiddenThemesDescription: "Explore the event’s core disciplines while the final challenge briefs remain private.",
  revealedThemesEyebrow: "Now revealed",
  revealedThemesTitle: "Choose the challenge you want to own.",
  revealedThemesDescription: "These are the live challenge themes released by event administration.",
  themeCardLabel: "Theme",
  themeSeatSuffix: "seats",
  workflowEyebrow: "How it works",
  workflowTitle: "From registration to challenge assignment.",
  workflowDescription: "Register your team, complete the quiz, rank every revealed theme, and receive the highest available choice your score can secure.",
  ctaEyebrow: "MechNova 2026",
  ctaTitle: "Bring a team. Leave with something built.",
  ctaDescription: "Register two to four members and prepare for the quiz, theme reveal, and build challenge.",
  ctaButtonText: "Start registration",
  timestampLabel: "Last checked",

  // Footer
  footerTitle: "MECHNOVA // 2026",
  footerDescription: "The official platform for MechNova 2026 registrations, quiz, theme preferences, and results.",
  footerTagline: "ROBOTICS & AUTOMATION CLUB · VIT CHENNAI",
  footerCopyright: "© 2026 MECHNOVA // ROBOTICS & AUTOMATION PLATFORM. ALL RIGHTS RESERVED."
};

/**
 * Subscribe to CMS Page Content (Homepage & Navbar)
 */
export function subscribeToCmsContent(eventId = 'default-event', pageId = 'homepage', callback) {
  callback({ ...DEFAULT_HOMEPAGE_CMS });

  const cmsRef = doc(db, 'events', eventId, 'publicContent', pageId);
  const unsub = onSnapshot(cmsRef, (snap) => {
    callback({ ...DEFAULT_HOMEPAGE_CMS, ...(snap.exists() ? snap.data() : {}) });
  }, (err) => {
    console.warn("CMS snapshot notice:", err.message);
  });

  return () => {
    unsub();
  };
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
  }, (err) => console.warn("Quiz questions snapshot notice:", err.message));
}

export async function ensureQuizQuestionOrder(quizId, questions) {
  const questionIds = (questions || []).map((question) => question.id);
  const quizRef = doc(db, 'quizzes', quizId);
  const quizSnap = await getDoc(quizRef);
  const existingIds = quizSnap.exists() ? (quizSnap.data().questionIds || []) : [];
  if (JSON.stringify(existingIds) === JSON.stringify(questionIds)) return;
  await setDoc(quizRef, { questionIds, updatedAtMs: Date.now() }, { merge: true });
}

/**
 * Save CMS Page Content
 */
export async function saveCmsPage(eventId = 'default-event', pageId = 'homepage', data) {
  const ref = doc(db, 'events', eventId, 'publicContent', pageId);
  await setDoc(ref, { pageId, ...data, updatedAtMs: Date.now() }, { merge: true });
}

export async function savePrivateTheme(eventId, themeId, themeData) {
  const ref = doc(db, 'themesPrivate', eventId, 'items', themeId);
  const ownerUid = auth && auth.currentUser ? auth.currentUser.uid : null;
  await setDoc(ref, { themeId, ...themeData, ownerUid, updatedAtMs: Date.now() }, { merge: true });
}

export async function saveQuizQuestion(quizId, questionId, questionData) {
  const ref = doc(db, 'quizzes', quizId, 'questions', questionId);
  // Map 'answerKey' to 'correctOption' for consistent grading in callableApi
  const dataToSave = { ...questionData };
  if (dataToSave.answerKey !== undefined && dataToSave.correctOption === undefined) {
    dataToSave.correctOption = dataToSave.answerKey;
  }
  const existingSnap = await getDocs(query(
    collection(db, 'quizzes', quizId, 'questions'),
    orderBy('order', 'asc')
  ));
  const orderedQuestions = existingSnap.docs
    .filter((question) => question.id !== questionId)
    .map((question) => ({ id: question.id, ...question.data() }))
    .concat({ id: questionId, ...dataToSave });
  orderedQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

  const batch = writeBatch(db);
  batch.set(ref, { id: questionId, ...dataToSave, updatedAtMs: Date.now() }, { merge: true });
  const quizRef = doc(db, 'quizzes', quizId);
  batch.set(quizRef, {
    questionIds: orderedQuestions.map((question) => question.id),
    updatedAtMs: Date.now()
  }, { merge: true });
  await batch.commit();
}

export async function deleteQuizQuestion(quizId, questionId) {
  const ref = doc(db, 'quizzes', quizId, 'questions', questionId);
  const existingSnap = await getDocs(query(
    collection(db, 'quizzes', quizId, 'questions'),
    orderBy('order', 'asc')
  ));
  const remainingIds = existingSnap.docs
    .filter((question) => question.id !== questionId)
    .map((question) => question.id);

  const batch = writeBatch(db);
  batch.delete(ref);
  const quizRef = doc(db, 'quizzes', quizId);
  batch.set(quizRef, { questionIds: remainingIds, updatedAtMs: Date.now() }, { merge: true });
  await batch.commit();
}

/**
 * Update Event Controls (Quiz Open/Close, Registration, Bidding)
 */
export async function updateEventControls(eventId = 'default-event', controlsData) {
  // 1. Cache and broadcast locally for instant toggle response
  try {
    const current = localStorage.getItem(CONTROLS_STORAGE_KEY);
    const existing = current ? JSON.parse(current) : {};
    const merged = { ...existing, ...controlsData, updatedAtMs: Date.now() };
    localStorage.setItem(CONTROLS_STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('mechathon_controls_changed'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn("Local storage controls cache notice:", e);
  }

  // 2. Persist to Firestore with setDoc + merge (creates doc if missing)
  try {
    const ref = doc(db, 'events', eventId);
    await setDoc(ref, { ...controlsData, updatedAtMs: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Firestore Event Controls sync notice:", err.message);
    if (!isDummyConfig) throw err;
  }
}
