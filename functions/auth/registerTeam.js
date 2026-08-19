const { HttpsError } = require("firebase-functions/v2/https");

/**
 * Generate 8-character uppercase Team Code (e.g. AUTO-7892)
 */
function generateTeamCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomStr = "";
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AUTO-${randomStr}`;
}

/**
 * Generate 12-character high-entropy passkey
 */
function generatePasskey() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

/**
 * Register Team Cloud Function Handler
 */
async function registerTeamHandler(data, context, admin) {
  const db = admin.firestore();
  const auth = admin.auth();

  const { eventId = "default-event", teamName, members } = data || {};

  // Validation
  if (!teamName || typeof teamName !== "string" || teamName.trim().length < 2) {
    throw new HttpsError("invalid-argument", "Valid Team Name is required (minimum 2 characters).");
  }

  if (!Array.isArray(members) || members.length < 2 || members.length > 4) {
    throw new HttpsError("invalid-argument", "Teams must consist of 2 to 4 members.");
  }

  for (const m of members) {
    if (!m.name || !m.email || !m.registrationProofUrl) {
      throw new HttpsError("invalid-argument", "Every team member must provide a name, email, and registration proof link.");
    }
  }

  // Check event registration status
  const eventRef = db.collection("events").doc(eventId);
  const eventSnap = await eventRef.get();
  
  if (eventSnap.exists) {
    const eventData = eventSnap.data();
    if (eventData.registrationOpen === false) {
      throw new HttpsError("failed-precondition", "Team registration is currently CLOSED for this event.");
    }
  }

  // Generate Synthetic Credentials
  const teamCode = generateTeamCode();
  const password = generatePasskey();
  const syntheticEmail = `team_${teamCode.toLowerCase().replace("-", "")}@hackathon.internal`;

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: syntheticEmail,
      password: password,
      displayName: teamName.trim(),
      emailVerified: true,
    });
  } catch (err) {
    console.error("Failed to create synthetic Auth user:", err);
    throw new HttpsError("internal", `Failed to initialize synthetic auth account: ${err.message}`);
  }

  const teamId = userRecord.uid;
  const nowMs = Date.now();

  const batch = db.batch();

  // 1. Teams Collection
  const teamDocRef = db.collection("teams").doc(teamId);
  batch.set(teamDocRef, {
    teamId,
    authUid: teamId,
    eventId,
    teamCode,
    teamName: teamName.trim(),
    syntheticEmail,
    memberCount: members.length,
    members: members.map((m) => ({
      name: m.name.trim(),
      email: m.email.trim(),
      phone: m.phone ? m.phone.trim() : "",
      registrationProofUrl: m.registrationProofUrl.trim(),
    })),
    status: "APPROVED",
    createdAtMs: nowMs,
  });

  // 2. Team Credentials Audit Record (NO RAW PASSWORD)
  const credDocRef = db.collection("teamCredentials").doc(teamId);
  batch.set(credDocRef, {
    authUid: teamId,
    teamId,
    teamCode,
    syntheticEmail,
    credentialVersion: 1,
    createdAtMs: nowMs,
    lastLoginAtMs: null,
    disabledAtMs: null,
  });

  // 3. Audit Log Entry
  const auditDocRef = db.collection("auditLogs").doc(eventId).collection("items").doc();
  batch.set(auditDocRef, {
    logId: auditDocRef.id,
    actorUid: teamId,
    actorRole: "TEAM",
    action: "TEAM_REGISTERED",
    entityPath: `teams/${teamId}`,
    details: { teamName: teamName.trim(), teamCode, memberCount: members.length },
    createdAtMs: nowMs,
  });

  await batch.commit();

  return {
    success: true,
    teamId,
    teamCode,
    password, // Returned ONCE to frontend for high-visibility modal display
    teamName: teamName.trim(),
    syntheticEmail,
  };
}

module.exports = { registerTeamHandler };
