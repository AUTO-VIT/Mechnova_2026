const { HttpsError } = require("firebase-functions/v2/https");

async function submitAnswerHandler(data, context, admin) {
  if (!context.auth) {
    throw new HttpsError("unauthenticated", "Authentication is required to submit quiz answers.");
  }

  const teamId = context.auth.uid;
  const db = admin.firestore();

  const {
    eventId = "default-event",
    quizId = "default-quiz",
    questionIndex,
    questionId,
    selectedOption,
  } = data || {};

  if (typeof questionIndex !== "number" || !questionId) {
    throw new HttpsError("invalid-argument", "questionIndex and questionId are required.");
  }

  const sessionRef = db.collection("quizSessions").doc(teamId);

  return db.runTransaction(async (transaction) => {
    const sessionSnap = await transaction.get(sessionRef);

    if (!sessionSnap.exists) {
      throw new HttpsError("not-found", "No active quiz session found for team.");
    }

    const session = sessionSnap.data();

    if (session.status !== "RUNNING") {
      throw new HttpsError("failed-precondition", "Quiz session is already completed or inactive.");
    }

    if (session.questionIndex !== questionIndex) {
      throw new HttpsError(
        "failed-precondition",
        `Question index mismatch. Expected index ${session.questionIndex}, received ${questionIndex}.`
      );
    }

    const nowMs = Date.now();

    // Check if client is trying to submit during sealed READ_ONLY phase
    if (session.phase === "READ_ONLY") {
      if (nowMs < session.phaseDeadlineMs) {
        throw new HttpsError(
          "failed-precondition",
          "Answer channel is SEALED during the 10-second READ_ONLY prompt phase."
        );
      }
      // If READ_ONLY deadline passed, phase becomes ANSWER_MODE
      session.phase = "ANSWER_MODE";
      session.phaseDeadlineMs = nowMs + 10000;
    }

    // Check ANSWER_MODE timeout (allowing 1.5s network grace)
    const isTimedOut = nowMs > session.phaseDeadlineMs + 1500;

    // Idempotency check: check if already submitted
    const attemptRef = sessionRef.collection("answers").doc(questionId);
    const attemptSnap = await transaction.get(attemptRef);

    if (attemptSnap.exists) {
      const existing = attemptSnap.data();
      return {
        success: true,
        alreadySubmitted: true,
        isCorrect: existing.isCorrect,
        pointsAwarded: existing.pointsAwarded,
        session,
      };
    }

    // Fetch Quiz and Question
    const quizRef = db.collection("quizzes").doc(quizId);
    const quizSnap = await transaction.get(quizRef);
    const pointsCorrect = quizSnap.exists ? quizSnap.data().pointsCorrect || 100 : 100;

    const questionRef = db.collection("quizzes").doc(quizId).collection("questions").doc(questionId);
    const questionSnap = await transaction.get(questionRef);

    if (!questionSnap.exists) {
      throw new HttpsError("not-found", `Question '${questionId}' not found.`);
    }

    const questionData = questionSnap.data();

    // Evaluate correctness
    let isCorrect = false;
    if (!isTimedOut && selectedOption !== null && selectedOption !== undefined) {
      isCorrect = selectedOption === questionData.answerKey;
    }

    const pointsAwarded = isCorrect ? pointsCorrect : 0;

    // 1. Record Attempt
    transaction.set(attemptRef, {
      questionId,
      selectedOption: selectedOption ?? null,
      isCorrect,
      pointsAwarded,
      isTimedOut,
      acceptedAtMs: nowMs,
    });

    // 2. Update Score
    const scoreRef = db.collection("scores").doc(teamId);
    const scoreSnap = await transaction.get(scoreRef);
    const currentScore = scoreSnap.exists
      ? scoreSnap.data()
      : { totalPoints: 0, answeredCount: 0, correctCount: 0 };

    const newTotalPoints = (currentScore.totalPoints || 0) + pointsAwarded;
    const newAnsweredCount = (currentScore.answeredCount || 0) + 1;
    const newCorrectCount = (currentScore.correctCount || 0) + (isCorrect ? 1 : 0);

    const isFinalQuestion = questionIndex + 1 >= session.totalQuestions;

    transaction.set(
      scoreRef,
      {
        eventId,
        teamId,
        totalPoints: newTotalPoints,
        answeredCount: newAnsweredCount,
        correctCount: newCorrectCount,
        finalized: isFinalQuestion,
        calculatedAtMs: nowMs,
      },
      { merge: true }
    );

    // 3. Fetch questions to load sanitized next question
    const questionsSnap = await db
      .collection("quizzes")
      .doc(quizId)
      .collection("questions")
      .orderBy("order", "asc")
      .get();

    const questionsList = questionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const nextQRaw = !isFinalQuestion ? questionsList[questionIndex + 1] : null;

    let nextQuestionSanitized = null;
    if (nextQRaw) {
      nextQuestionSanitized = {
        id: nextQRaw.id,
        order: nextQRaw.order,
        prompt: nextQRaw.prompt,
        options: nextQRaw.options || [],
        category: nextQRaw.category || "Robotics & Automation",
      };
    }

    // 4. Update Session
    const updatedSession = { ...session };
    if (isFinalQuestion) {
      updatedSession.status = "COMPLETED";
      updatedSession.completedAtMs = nowMs;
    } else {
      updatedSession.questionIndex = questionIndex + 1;
      updatedSession.phase = "READ_ONLY"; // 10s read mode for next question
      updatedSession.phaseStartedAtMs = nowMs;
      updatedSession.phaseDeadlineMs = nowMs + 10000;
    }
    updatedSession.version = (session.version || 1) + 1;
    updatedSession.serverEpochMs = nowMs;

    transaction.set(sessionRef, updatedSession);

    return {
      success: true,
      isCorrect,
      pointsAwarded,
      isTimedOut,
      session: updatedSession,
      nextQuestion: nextQuestionSanitized,
    };
  });
}

module.exports = { submitAnswerHandler };
