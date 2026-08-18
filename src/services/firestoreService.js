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

const CMS_STORAGE_KEY_PREFIX = 'mechathon_cms_';
const CONTROLS_STORAGE_KEY = 'mechathon_event_controls';

/**
 * Subscribe to Event status document
 */
export function subscribeToEvent(eventId = 'default-event', callback) {
  const getMergedEvent = (remoteData) => {
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
      quizId: "default-quiz"
    };

    return { ...base, ...localControls };
  };

  // Initial call with cached/default data
  callback(getMergedEvent(null));

  const handleControlsEvent = () => {
    callback(getMergedEvent(null));
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
 * Subscribe to Public Revealed Themes
 */
export function subscribeToPublicThemes(eventId, callback) {
  const defaultThemes = [
    {
      id: 'theme-1',
      themeNumber: 1,
      publicName: 'Autonomous Kinematics & Orbital Trajectory Planning',
      publicDescription: 'Design trajectory optimization algorithms, SLAM routines, and dynamic collision avoidance for robotic vehicles operating in GPS-denied environments.',
      brief: 'Deliver inverse kinematics models, simulated ROS2 nodes, and latency benchmarking.',
      eligibility: 'All Registered Robotics Teams'
    },
    {
      id: 'theme-2',
      themeNumber: 2,
      publicName: 'Perception & Neural Edge Inspection',
      publicDescription: 'Implement low-latency spatial depth estimation, feature extraction, and automated surface defect classification using edge AI accelerators.',
      brief: 'Must include inference profiling under 15ms and confidence calibration.',
      eligibility: 'All Registered Robotics Teams'
    },
    {
      id: 'theme-3',
      themeNumber: 3,
      publicName: 'Industrial PLC Logic & Deterministic SCADA Automation',
      publicDescription: 'Develop deterministic IEC 61131-3 ladder logic, safety interlocking state machines, and industrial bus communications.',
      brief: 'Requires structured text definitions, safety interlock proofs, and telemetry dashboards.',
      eligibility: 'All Registered Robotics Teams'
    },
    {
      id: 'theme-4',
      themeNumber: 4,
      publicName: 'Satellite Swarm Telemetry & Distributed Consensus',
      publicDescription: 'Architect decentralized peer-to-peer fleet coordination, mesh telemetry routing, and fault-tolerant consensus for multi-agent swarm deployments.',
      brief: 'Must demonstrate consensus retention during 40% packet degradation.',
      eligibility: 'All Registered Robotics Teams'
    }
  ];

  const q = query(
    collection(db, 'themesPublic', eventId, 'items'),
    orderBy('themeNumber', 'asc')
  );

  const unsub = onSnapshot(q, (snap) => {
    if (snap && snap.docs && snap.docs.length > 0) {
      const themes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(themes);
    } else {
      callback(defaultThemes);
    }
  }, (err) => {
    console.warn("Public themes fallback notice:", err.message);
    callback(defaultThemes);
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
  brandSubtitle: "AUTONOMOUS SYSTEMS // 2026",
  navStatusBadge: "LIVE PROTOCOL ACTIVE",
  navLink1Text: "Mission Brief",
  navLink2Text: "Themes",
  navLink3Text: "Telemetry",
  navCtaText: "Team Portal",

  // Hero Section
  heroBadge: "MECHNOVA 2026 // ROBOTICS & AUTONOMY",
  heroTitleLine1: "AUTONOMOUS",
  heroTitleLine2: "HACKATHON",
  heroSubtitle: "The next-generation mission control and evaluation platform for engineering teams. Features timed two-phase quiz verification, sealed theme reveals, and deterministic priority bidding.",
  heroPrimaryCtaText: "REGISTER TEAM",
  heroPrimaryCtaLink: "/register",
  heroSecondaryCtaText: "TEAM GATEWAY",
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
  domain1Category: "KINEMATICS // SLAM",
  domain1Title: "Autonomous Motion & Spatial SLAM",
  domain1Desc: "Inverse kinematics, trajectory optimization, and point-cloud feature mapping under sensor noise.",
  domain1Stat: "6-DOF ROBOTIC MANIPULATORS",

  domain2Category: "EDGE AI // PERCEPTION",
  domain2Title: "Neural Vision & Surface Inspection",
  domain2Desc: "Low-latency edge AI inference, real-time depth mapping, and defect segmentation pipelines.",
  domain2Stat: "<15MS LATENCY BOUND",

  domain3Category: "PLC // DETERMINISTIC SCADA",
  domain3Title: "Deterministic SCADA & Safety Logic",
  domain3Desc: "IEC 61131-3 structured control, fail-safe interlocking, and deterministic industrial communications.",
  domain3Stat: "SIL-3 SAFETY ARCHITECTURE",

  domain4Category: "FLEET // MESH TELEMETRY",
  domain4Title: "Swarm Coordination & Fleet Mesh",
  domain4Desc: "Distributed consensus, fault-tolerant state replication, and peer-to-peer packet routing.",
  domain4Stat: "BYZANTINE FAULT TOLERANCE",

  // 4-Phase Sequence Timeline
  phase1Num: "01",
  phase1Title: "Synthetic Roster Intake",
  phase1Badge: "PHASE 01",
  phase1Desc: "Teams register 2-4 member engineering units and obtain single-use passkeys and unique Team Codes.",

  phase2Num: "02",
  phase2Title: "Server-Authoritative Evaluation",
  phase2Badge: "PHASE 02",
  phase2Desc: "Two-stage timed quiz (10s read prompt + 10s answer mode) with server timestamp enforcement.",

  phase3Num: "03",
  phase3Title: "Audited Theme Reveal",
  phase3Badge: "PHASE 03",
  phase3Desc: "Theme briefs transition from encrypted storage to public distribution in a single atomic commit.",

  phase4Num: "04",
  phase4Title: "Priority Tuple Bidding & Lock",
  phase4Badge: "PHASE 04",
  phase4Desc: "Deterministic priority ranking allocates challenge themes strictly by score, bid points, and time.",

  // Footer
  footerTitle: "MECHNOVA // 2026",
  footerDescription: "Authoritative autonomous systems competition platform. Built with server-side deterministic state machines, audited theme reveals, and cryptographic credentials.",
  footerTagline: "ENGINEERED FOR THE NEXT GENERATION OF ROBOTICS PIONEERS.",
  footerCopyright: "© 2026 MECHNOVA // ROBOTICS & AUTOMATION PLATFORM. ALL RIGHTS RESERVED."
};

/**
 * Subscribe to CMS Page Content (Homepage & Navbar)
 */
export function subscribeToCmsContent(eventId = 'default-event', pageId = 'homepage', callback) {
  const getMergedCms = (remoteData) => {
    let localCms = {};
    try {
      const stored = localStorage.getItem(`${CMS_STORAGE_KEY_PREFIX}${pageId}`);
      if (stored) localCms = JSON.parse(stored);
    } catch (e) {}

    return { ...DEFAULT_HOMEPAGE_CMS, ...(remoteData || {}), ...localCms };
  };

  // Initial call with defaults / cache
  callback(getMergedCms(null));

  const handleCmsEvent = () => {
    callback(getMergedCms(null));
  };
  window.addEventListener('mechathon_cms_changed', handleCmsEvent);
  window.addEventListener('storage', handleCmsEvent);

  const cmsRef = doc(db, 'events', eventId, 'publicContent', pageId);
  const unsub = onSnapshot(cmsRef, (snap) => {
    if (snap.exists()) {
      callback(getMergedCms(snap.data()));
    }
  }, (err) => {
    console.warn("CMS snapshot notice:", err.message);
  });

  return () => {
    unsub();
    window.removeEventListener('mechathon_cms_changed', handleCmsEvent);
    window.removeEventListener('storage', handleCmsEvent);
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

/**
 * Save CMS Page Content
 */
export async function saveCmsPage(eventId = 'default-event', pageId = 'homepage', data) {
  // 1. Cache immediately in localStorage & broadcast event for zero-latency instant updates
  try {
    const current = localStorage.getItem(`${CMS_STORAGE_KEY_PREFIX}${pageId}`);
    const existing = current ? JSON.parse(current) : {};
    const merged = { ...DEFAULT_HOMEPAGE_CMS, ...existing, ...data, updatedAtMs: Date.now() };
    localStorage.setItem(`${CMS_STORAGE_KEY_PREFIX}${pageId}`, JSON.stringify(merged));
    window.dispatchEvent(new Event('mechathon_cms_changed'));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.warn("Local storage CMS cache notice:", e);
  }

  // 2. Persist to Firestore
  try {
    const ref = doc(db, 'events', eventId, 'publicContent', pageId);
    await setDoc(ref, { pageId, ...data, updatedAtMs: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Firestore CMS sync notice:", err.message);
  }
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
  }
}
