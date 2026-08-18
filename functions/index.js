const admin = require("firebase-admin");
const { onCall } = require("firebase-functions/v2/https");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const { registerTeamHandler } = require("./auth/registerTeam");
const { setAdminClaimHandler } = require("./auth/adminClaims");
const { startSessionHandler } = require("./quiz/startSession");
const { submitAnswerHandler } = require("./quiz/submitAnswer");
const { syncClockHandler } = require("./quiz/syncClock");
const { revealThemesHandler } = require("./themes/revealThemes");
const { submitBidHandler } = require("./themes/submitBid");
const { finalizeAllocationHandler } = require("./allocation/finalizeAllocation");

// Export HTTPS Callable Functions
exports.registerTeam = onCall({ cors: true }, (request) =>
  registerTeamHandler(request.data, request, admin)
);

exports.setAdminClaim = onCall({ cors: true }, (request) =>
  setAdminClaimHandler(request.data, request, admin)
);

exports.startSession = onCall({ cors: true }, (request) =>
  startSessionHandler(request.data, request, admin)
);

exports.submitAnswer = onCall({ cors: true }, (request) =>
  submitAnswerHandler(request.data, request, admin)
);

exports.syncClock = onCall({ cors: true }, (request) =>
  syncClockHandler(request.data, request, admin)
);

exports.revealThemes = onCall({ cors: true }, (request) =>
  revealThemesHandler(request.data, request, admin)
);

exports.submitBid = onCall({ cors: true }, (request) =>
  submitBidHandler(request.data, request, admin)
);

exports.finalizeAllocation = onCall({ cors: true }, (request) =>
  finalizeAllocationHandler(request.data, request, admin)
);
