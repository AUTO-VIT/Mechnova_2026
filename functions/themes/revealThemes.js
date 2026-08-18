const { HttpsError } = require("firebase-functions/v2/https");

async function revealThemesHandler(data, context, admin) {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Only administrators can trigger theme reveals.");
  }

  const { eventId = "default-event" } = data || {};
  const db = admin.firestore();

  const privateItemsSnap = await db.collection("themesPrivate").doc(eventId).collection("items").get();

  if (privateItemsSnap.empty) {
    throw new HttpsError(
      "failed-precondition",
      "No private themes found to reveal. Please configure private themes in Admin Console."
    );
  }

  const privateThemes = privateItemsSnap.docs.map((doc) => ({
    themeId: doc.id,
    ...doc.data(),
  }));

  const nowMs = Date.now();
  const batch = db.batch();

  // 1. Copy to public themes node
  privateThemes.forEach((t, idx) => {
    const publicRef = db.collection("themesPublic").doc(eventId).collection("items").doc(t.themeId);
    batch.set(publicRef, {
      themeId: t.themeId,
      themeNumber: t.themeNumber || idx + 1,
      publicName: t.name || t.publicName || `Theme Option ${idx + 1}`,
      publicDescription: t.description || t.publicDescription || "",
      brief: t.brief || "",
      eligibility: t.eligibility || "Open to all qualified teams",
      visible: true,
      revealedAtMs: nowMs,
    });
  });

  // 2. Update event status
  const eventRef = db.collection("events").doc(eventId);
  batch.set(
    eventRef,
    {
      themesRevealed: true,
      themeRevealAtMs: nowMs,
    },
    { merge: true }
  );

  // 3. Write Audit Log
  const auditRef = db.collection("auditLogs").doc(eventId).collection("items").doc();
  batch.set(auditRef, {
    logId: auditRef.id,
    actorUid: context.auth.uid,
    actorRole: "ADMIN",
    action: "THEME_REVEAL_EXECUTED",
    entityPath: `themesPublic/${eventId}/items`,
    details: { revealedCount: privateThemes.length },
    createdAtMs: nowMs,
  });

  await batch.commit();

  return {
    success: true,
    revealedCount: privateThemes.length,
    revealedAtMs: nowMs,
  };
}

module.exports = { revealThemesHandler };
