// src/firebase.js
// Dual-mode Firebase setup: Live Firebase SDK + Interactive Mock Fallback Engine

import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const isConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId
);

let app, auth, db;

if (isConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// Default Seed State for Initial Hydration in Local Storage (Demo Mode)
const INITIAL_DEMO_STATE = {
  config: {
    eventStatus: "registration", // "registration" | "quiz_live" | "bidding_open" | "allocated" | "ended"
    themesRevealed: false,
    quizStartTime: null,
    biddingEndTime: null,
    updatedAt: new Date().toISOString()
  },
  siteContent: {
    home: {
      heroTitle: "AUTOMATION HACKATHON 2026",
      heroSubtitle: "ENGINEER THE NEXT GENERATION OF CYBER-PHYSICAL AUTOMATION & SCADA SYSTEMS",
      announcementBanner: "⚡ REGISTRATION OPEN: Form your team now! 10s+10s Dual-Phase Quiz schedule published."
    },
    schedule: {
      timelineEvents: [
        { time: "09:00 AM", title: "System Check & Check-in", description: "Participant verification and workstation IP allocation." },
        { time: "10:00 AM", title: "Dual-Phase Speed Quiz", description: "Strict 10s Read + 10s Answer speed quiz determining priority rank." },
        { time: "11:30 AM", title: "Priority Theme Bidding", description: "Rank your top 4 theme preferences using earned quiz points." },
        { time: "12:00 PM", title: "Deterministic Allocation & Secret Theme Reveal", description: "Priority allocation engine assigns themes and unlocks vault." },
        { time: "01:00 PM", title: "Hackathon Build Phase", description: "24-hour sprint to build automation & SCADA prototypes." },
        { time: "05:00 PM (Day 2)", title: "Final SCADA Demo & Judging", description: "Live evaluation by panel of industrial automation experts." }
      ]
    },
    faq: {
      items: [
        { question: "What is the 10s + 10s Dual-Phase Quiz?", answer: "During each question, Phase 1 (0-10s) hides options while the system analyzes input. Phase 2 (10-20s) unlocks the 4 options with a live countdown bar to submit your answer!" },
        { question: "How does Priority Theme Allocation work?", answer: "Teams earn quiz points. Ranks are determined by Score + Speed. The algorithm allocates highest available preferred themes up to quota limits." },
        { question: "When are Secret Themes revealed?", answer: "Themes are locked in an industrial security vault until the admin toggles reveal or 2 days prior to kickoff." },
        { question: "How many members per team?", answer: "Teams can have between 1 and 4 members." }
      ]
    }
  },
  questions: [
    {
      id: "q1",
      questionText: "In PLC programming & industrial operations, what does 'SCADA' stand for?",
      options: [
        { id: "a", text: "Supervisory Control and Data Acquisition" },
        { id: "b", text: "Sequential Control and Digital Automation" },
        { id: "c", text: "System Computer Automated Data Analysis" },
        { id: "d", text: "Synchronous Circuit for Automated Devices" }
      ],
      correctAnswerId: "a",
      points: 100,
      order: 1
    },
    {
      id: "q2",
      questionText: "Which industrial communication protocol is commonly used over serial or Ethernet for telemetry?",
      options: [
        { id: "a", text: "Modbus / Modbus TCP" },
        { id: "b", text: "HTTP/2 REST API" },
        { id: "c", text: "GraphQL Subscription" },
        { id: "d", text: "POP3 Mail Protocol" }
      ],
      correctAnswerId: "a",
      points: 100,
      order: 2
    },
    {
      id: "q3",
      questionText: "In cyber-physical control loops, what is the core mechanism of a PID controller?",
      options: [
        { id: "a", text: "Proportional-Integral-Derivative feedback error correction" },
        { id: "b", text: "Password Identification Data encryption" },
        { id: "c", text: "Protocol Interface Device packet routing" },
        { id: "d", text: "Packet Inspection and Telemetry Diagnostics" }
      ],
      correctAnswerId: "a",
      points: 100,
      order: 3
    },
    {
      id: "q4",
      questionText: "Which IEC 61131-3 standard language uses rungs and contacts resembling electrical relay logic?",
      options: [
        { id: "a", text: "Ladder Diagram (LD)" },
        { id: "b", text: "Structured Text (ST)" },
        { id: "c", text: "Sequential Function Chart (SFC)" },
        { id: "d", text: "Instruction List (IL)" }
      ],
      correctAnswerId: "a",
      points: 100,
      order: 4
    }
  ],
  themes: [
    {
      themeId: "t1",
      title: "Autonomous Warehouse Robotics & AMR Swarms",
      description: "Develop intelligent pathfinding, collision avoidance, and fleet coordination algorithms for autonomous mobile robots in high-throughput logistics.",
      tags: ["Robotics", "AMR", "Pathfinding", "ROS2"],
      maxTeamQuota: 5,
      assignedTeamCount: 0,
      isRevealed: false
    },
    {
      themeId: "t2",
      title: "Smart Microgrid SCADA Telemetry & Anomaly Detection",
      description: "Build real-time power distribution telemetry monitoring with predictive ML fault detection and automated breaker isolation.",
      tags: ["SCADA", "IoT", "Microgrid", "Telemetry"],
      maxTeamQuota: 5,
      assignedTeamCount: 0,
      isRevealed: false
    },
    {
      themeId: "t3",
      title: "Industrial Cyber-Defense & PLC Air-Gap Intrusion Detection",
      description: "Engineer honeypots and zero-trust packet inspection for Modbus/PROFINET industrial control network traffic.",
      tags: ["Cybersecurity", "PLC", "Zero-Trust", "Modbus"],
      maxTeamQuota: 5,
      assignedTeamCount: 0,
      isRevealed: false
    },
    {
      themeId: "t4",
      title: "Digital Twin Manufacturing & Predictive Quality Control",
      description: "Create a 3D digital twin visualization fed by live sensor telemetry to optimize assembly line throughput and eliminate micro-stoppages.",
      tags: ["Digital Twin", "3D Telemetry", "Predictive AI"],
      maxTeamQuota: 5,
      assignedTeamCount: 0,
      isRevealed: false
    }
  ],
  users: {
    "admin-demo-uid": {
      uid: "admin-demo-uid",
      email: "admin@autohack.io",
      role: "admin",
      teamId: null,
      name: "Lead System Admin"
    },
    "user-demo-uid": {
      uid: "user-demo-uid",
      email: "teamlead@cyberbotics.io",
      role: "participant",
      teamId: "team-cyberbotics",
      name: "CyberLead"
    }
  },
  teams: {
    "team-cyberbotics": {
      teamId: "team-cyberbotics",
      teamName: "Cyberbotics Prime",
      joinCode: "CYBER-99",
      leaderUid: "user-demo-uid",
      memberUids: ["user-demo-uid"],
      quizState: {
        totalScore: 300,
        totalTimeTakenMs: 14200,
        isCompleted: true,
        submittedAt: new Date().toISOString()
      },
      preferences: ["t1", "t3", "t2", "t4"],
      allocatedThemeId: null
    },
    "team-scada-core": {
      teamId: "team-scada-core",
      teamName: "SCADA Protocol Enforcers",
      joinCode: "SCADA-42",
      leaderUid: "user-demo-2",
      memberUids: ["user-demo-2"],
      quizState: {
        totalScore: 400,
        totalTimeTakenMs: 11800,
        isCompleted: true,
        submittedAt: new Date().toISOString()
      },
      preferences: ["t2", "t1", "t4", "t3"],
      allocatedThemeId: null
    }
  }
};

// Initialize Mock Store from localStorage if empty
const getMockData = () => {
  const stored = localStorage.getItem("autohack_demo_db");
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { console.error("Error parsing demo db", e); }
  }
  localStorage.setItem("autohack_demo_db", JSON.stringify(INITIAL_DEMO_STATE));
  return INITIAL_DEMO_STATE;
};

const saveMockData = (data) => {
  localStorage.setItem("autohack_demo_db", JSON.stringify(data));
  // Dispatch custom storage event for dynamic re-renders across tabs/components
  window.dispatchEvent(new CustomEvent("autohack_db_update", { detail: data }));
};

export { app, auth, db, isConfigured, getMockData, saveMockData };
