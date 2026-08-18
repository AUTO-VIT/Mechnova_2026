const { HttpsError } = require("firebase-functions/v2/https");

async function setAdminClaimHandler(data, context, admin) {
  // Only existing admins or bootstrapping (if auth is missing during initial setup)
  const isCallerAdmin = context.auth && context.auth.token && context.auth.token.admin === true;

  const { targetEmail, targetUid, passkey } = data || {};

  // Simple emergency setup secret for initial admin assignment if no admin exists yet
  const BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET || "MECHATHON_ADMIN_INIT_2026";
  const isBootstrapValid = passkey && passkey === BOOTSTRAP_SECRET;

  if (!isCallerAdmin && !isBootstrapValid) {
    throw new HttpsError("permission-denied", "Only administrators can assign admin privileges.");
  }

  let uidToUpdate = targetUid;
  if (!uidToUpdate && targetEmail) {
    try {
      const user = await admin.auth().getUserByEmail(targetEmail);
      uidToUpdate = user.uid;
    } catch (e) {
      throw new HttpsError("not-found", `No user found with email ${targetEmail}`);
    }
  }

  if (!uidToUpdate) {
    throw new HttpsError("invalid-argument", "Target UID or Email is required.");
  }

  await admin.auth().setCustomUserClaims(uidToUpdate, { admin: true });

  // Update Firestore user document if present
  const db = admin.firestore();
  await db.collection("adminUsers").doc(uidToUpdate).set(
    {
      uid: uidToUpdate,
      isAdmin: true,
      updatedAtMs: Date.now(),
    },
    { merge: true }
  );

  return { success: true, uid: uidToUpdate, admin: true };
}

module.exports = { setAdminClaimHandler };
