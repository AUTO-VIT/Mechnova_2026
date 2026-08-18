const { HttpsError } = require("firebase-functions/v2/https");

async function finalizeAllocationHandler(data, context, admin) {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new HttpsError("permission-denied", "Only administrators can finalize theme allocations.");
  }

  const { eventId = "default-event" } = data || {};
  const db = admin.firestore();

  // Fetch all bids
  const bidsSnap = await db.collection("bids").doc(eventId).collection("items").get();

  if (bidsSnap.empty) {
    throw new HttpsError("failed-precondition", "No bids submitted to finalize.");
  }

  const allBids = bidsSnap.docs.map((d) => ({
    teamId: d.id,
    ...d.data(),
  }));

  // Priority Tuple Comparator: (scoreSnapshot desc, bidPoints desc, submittedAtMs asc, tieBreakValue asc)
  const priorityComparator = (a, b) => {
    // 1. scoreSnapshot Descending
    if ((b.scoreSnapshot || 0) !== (a.scoreSnapshot || 0)) {
      return (b.scoreSnapshot || 0) - (a.scoreSnapshot || 0);
    }
    // 2. bidPoints Descending
    if ((b.bidPoints || 0) !== (a.bidPoints || 0)) {
      return (b.bidPoints || 0) - (a.bidPoints || 0);
    }
    // 3. submittedAtMs Ascending (earlier submission wins)
    if ((a.submittedAtMs || 0) !== (b.submittedAtMs || 0)) {
      return (a.submittedAtMs || 0) - (b.submittedAtMs || 0);
    }
    // 4. tieBreakValue Ascending (monotonically assigned)
    return (a.tieBreakValue || 0) - (b.tieBreakValue || 0);
  };

  // Group bids by selectedThemeId
  const themeGroups = {};
  allBids.forEach((bid) => {
    const themeId = bid.selectedThemeId || "unassigned";
    if (!themeGroups[themeId]) {
      themeGroups[themeId] = [];
    }
    themeGroups[themeId].push(bid);
  });

  const nowMs = Date.now();
  const batch = db.batch();
  const allocationResults = [];

  // Sort each theme group and assign rank
  Object.keys(themeGroups).forEach((themeId) => {
    const groupBids = themeGroups[themeId];
    groupBids.sort(priorityComparator);

    groupBids.forEach((bid, index) => {
      const rank = index + 1;
      const allocRef = db.collection("allocations").doc(eventId).collection("items").doc(bid.teamId);

      const allocData = {
        teamId: bid.teamId,
        themeId: bid.selectedThemeId,
        rank,
        scoreSnapshot: bid.scoreSnapshot || 0,
        bidPoints: bid.bidPoints || 0,
        submittedAtMs: bid.submittedAtMs || nowMs,
        finalizedAtMs: nowMs,
      };

      batch.set(allocRef, allocData);
      allocationResults.push(allocData);
    });
  });

  // Update Event Document
  const eventRef = db.collection("events").doc(eventId);
  batch.set(
    eventRef,
    {
      allocationFinalized: true,
      allocationFinalizedAtMs: nowMs,
      biddingOpen: false,
    },
    { merge: true }
  );

  // Write Audit Log
  const auditRef = db.collection("auditLogs").doc(eventId).collection("items").doc();
  batch.set(auditRef, {
    logId: auditRef.id,
    actorUid: context.auth.uid,
    actorRole: "ADMIN",
    action: "ALLOCATION_FINALIZED",
    entityPath: `allocations/${eventId}/items`,
    details: { totalAllocations: allocationResults.length },
    createdAtMs: nowMs,
  });

  await batch.commit();

  return {
    success: true,
    totalAllocations: allocationResults.length,
    finalizedAtMs: nowMs,
    allocations: allocationResults,
  };
}

module.exports = { finalizeAllocationHandler };
