const { HttpsError } = require("firebase-functions/v2/https");

async function startSessionHandler(data, context, admin) {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required to start a quiz session.");
  }

  const teamId = context.auth.uid;
  const db = admin.firestore();

  const { eventId = "default-event", quizId = "default-quiz" } = data || {};

  // Check event runtime status
  const eventDoc = await db.collection("events").doc(eventId).get();
  if (eventDoc.exists && eventDoc.data().quizOpen === false) {
    throw new HttpsError("failed-precondition", "Quiz phase is currently CLOSED by the admin console.");
  }

  // Fetch quiz info
  const quizDoc = await db.collection("quizzes").doc(quizId).get();
  if (!quizDoc.exists) {
    throw new HttpsError("not-found", `Quiz template '${quizId}' not found.`);
  }
  const quizData = quizDoc.data();

  // Fetch questions count
  const questionsSnap = await db.collection("quizzes").doc(quizId).collection("questions").orderBy("order", "asc").get();
  if (questionsSnap.empty) {
    throw new HttpsError("failed-precondition", "Quiz contains no active questions.");
  }

  const questions = questionsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Helper to sanitize question (remove answerKey)
  const sanitize = (q) => ({
    id: q.id,
    order: q.order,
    prompt: q.prompt,
    options: q.options || [],
    category: q.category || "Robotics & Automation",
  });

  const sessionRef = db.collection("quizSessions").doc(teamId);
  const sessionSnap = await sessionRef.get();
  const nowMs = Date.now();

  if (sessionSnap.exists) {
    const session = sessionSnap.data();
    if (session.status === "COMPLETED") {
      return {
        success: true,
        completed: true,
        session,
        message: "Quiz already completed.",
      };
    }

    // Check if session phase has expired and auto-advance if needed
    const currentQIndex = session.questionIndex || 0;
    const currentQ = questions[currentQIndex];

    return {
      success: true,
      session,
      totalQuestions: questions.length,
      currentQuestion: currentQ ? sanitize(currentQ) : null,
      serverEpochMs: nowMs,
    };
  }

  // Create new session document
  const READ_SECONDS = quizData.readSeconds || 10;
  const initialPhaseDeadline = nowMs + READ_SECONDS * 1000;

  const newSession = {
    sessionId: teamId,
    eventId,
    teamId,
    quizId,
    questionIndex: 0,
    totalQuestions: questions.length,
    phase: "READ_ONLY", // 10s prompt preview
    phaseStartedAtMs: nowMs,
    phaseDeadlineMs: initialPhaseDeadline,
    serverEpochMs: nowMs,
    status: "RUNNING",
    version: 1,
    createdAtMs: nowMs,
  };

  const batch = db.batch();
  batch.set(sessionRef, newSession);

  // Initialize Score document if not exists
  const scoreRef = db.collection("scores").doc(teamId);
  batch.set(
    scoreRef,
    {
      eventId,
      teamId,
      totalPoints: 0,
      answeredCount: 0,
      correctCount: 0,
      finalized: false,
      calculatedAtMs: nowMs,
    },
    { merge: true }
  );

  await batch.commit();

  return {
    success: true,
    session: newSession,
    totalQuestions: questions.length,
    currentQuestion: sanitize(questions[0]),
    serverEpochMs: nowMs,
  };
}

module.exports = { startSessionHandler };
