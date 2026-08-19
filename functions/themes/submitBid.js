const { HttpsError } = require("firebase-functions/v2/https");

async function submitBidHandler(data, context, admin) {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required to submit a theme bid.");
  }

  const teamId = context.auth.uid;
  const db = admin.firestore();

  const { eventId = "default-event", selectedThemeId } = data || {};

  if (!selectedThemeId) {
    throw new HttpsError("invalid-argument", "A selectedThemeId is required.");
  }

  // Verify event bidding status
  const eventDoc = await db.collection("events").doc(eventId).get();
  if (eventDoc.exists && eventDoc.data().biddingOpen === false) {
    throw new HttpsError("failed-precondition", "Theme bidding channel is currently CLOSED.");
  }

  // Verify theme is revealed and visible
  const themeDoc = await db.collection("themesPublic").doc(eventId).collection("items").doc(selectedThemeId).get();
  if (!themeDoc.exists || themeDoc.data().visible !== true) {
    throw new HttpsError("not-found", "Selected theme is invalid or not yet revealed.");
  }

  // Read team's earned quiz score
  const scoreDoc = await db.collection("scores").doc(teamId).get();
  const scoreSnapshot = scoreDoc.exists ? scoreDoc.data().totalPoints || 0 : 0;

  const nowMs = Date.now();
  const bidRef = db.collection("bids").doc(eventId).collection("items").doc(teamId);

  const existingBidDoc = await bidRef.get();
  const tieBreakValue = existingBidDoc.exists
    ? existingBidDoc.data().tieBreakValue || nowMs
    : nowMs;

  const bidData = {
    teamId,
    selectedThemeId,
    bidPoints: scoreSnapshot,
    scoreSnapshot,
    submittedAtMs: nowMs,
    tieBreakValue,
    status: "SUBMITTED",
  };

  await bidRef.set(bidData);

  return {
    success: true,
    bid: bidData,
  };
}

module.exports = { submitBidHandler };
