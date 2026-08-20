import { httpsCallable } from 'firebase/functions';
import { functions, db, auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  getAuth,
  connectAuthEmulator
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp,
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';

/**
 * Helper to call backend engine directly in standalone/development mode
 * or via Cloud Functions when configured
 */
async function callFunction(name, data) {
  if (import.meta.env.VITE_USE_CLOUD_FUNCTIONS === 'true') {
    try {
      const fn = httpsCallable(functions, name);
      const result = await fn(data);
      return result.data;
    } catch (error) {
      return await executeFallbackEngine(name, data);
    }
  }
  // Fast instantaneous authoritative engine execution
  return await executeFallbackEngine(name, data);
}

/**
 * Client Authoritative Engine Fallback
 */
async function executeFallbackEngine(name, data) {
  const nowMs = Date.now();

  if (name === 'registerTeam') {
    const { eventId = 'default-event', teamName, members = [] } = data;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomStr = "";
    for (let i = 0; i < 4; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const teamCode = `AUTO-${randomStr}`;
    const passChars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += passChars.charAt(Math.floor(Math.random() * passChars.length));
    }
    const syntheticEmail = `team_${teamCode.toLowerCase().replace("-", "")}@hackathon.internal`;

    try {
      const secondaryApp = initializeApp(auth.app.options, "TeamCreatorApp_" + nowMs);
      const secondaryAuth = getAuth(secondaryApp);
      const secondaryDb = getFirestore(secondaryApp);
      if (import.meta.env.VITE_USE_EMULATORS === 'true') {
        connectAuthEmulator(secondaryAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
        connectFirestoreEmulator(secondaryDb, '127.0.0.1', 8080);
      }
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, syntheticEmail, password);
      const teamId = userCred.user.uid;

      // Use the SECONDARY app's Firestore instance — its auth context matches the new uid
      const eventSnap = await getDoc(doc(secondaryDb, 'events', eventId));
      if (eventSnap.exists() && eventSnap.data().registrationOpen === false) {
        throw new Error('Team registration is currently closed.');
      }
      
      const teamRef = doc(secondaryDb, 'teams', teamId);
      await setDoc(teamRef, {
        teamId,
        authUid: teamId,
        eventId,
        teamCode,
        teamName: teamName.trim(),
        syntheticEmail,
        memberCount: members.length,
        members: members.map(m => ({
          name: m.name.trim(),
          email: m.email.trim(),
          phone: m.phone || '',
          registrationProofUrl: m.registrationProofUrl.trim()
        })),
        status: 'APPROVED',
        createdAtMs: nowMs
      });

      const scoreRef = doc(secondaryDb, 'scores', teamId);
      await setDoc(scoreRef, {
        teamId,
        totalPoints: 0,
        answeredCount: 0,
        correctCount: 0,
        finalized: false
      });

      // Clean up secondary app — sign out first, then delete
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      return {
        success: true,
        teamId,
        teamCode,
        password,
        teamName: teamName.trim(),
        syntheticEmail
      };
    } catch (e) {
      console.error("Auth/Firestore error during registration fallback:", e);
      throw new Error("Registration failed: " + e.message);
    }
  }

  if (name === 'startSession') {
    const { eventId = 'default-event', quizId = 'default-quiz' } = data;
    const teamId = auth.currentUser?.uid || data.teamId;

    if (!teamId) {
      throw new Error('A signed-in team is required to start the quiz.');
    }

    const eventSnap = await getDoc(doc(db, 'events', eventId));
    if (eventSnap.exists() && eventSnap.data().quizOpen === false) {
      throw new Error('The quiz channel is currently closed.');
    }

    const existingSessionSnap = await getDoc(doc(db, 'quizSessions', teamId));
    if (existingSessionSnap.exists()) {
      const existingSession = existingSessionSnap.data();
      if (existingSession.status === 'RUNNING' || existingSession.status === 'COMPLETED') {
        return {
          success: true,
          session: { id: existingSessionSnap.id, ...existingSession },
          currentQuestion: existingSession.currentQuestion || null
        };
      }
    }
    
    // Enforce one-quiz-per-team: check if team already completed the quiz
    if (teamId) {
      try {
        const scoreRef = doc(db, 'scores', teamId);
        const scoreSnap = await getDoc(scoreRef);
        if (scoreSnap.exists() && scoreSnap.data().finalized === true) {
          return {
            success: true,
            alreadyCompleted: true,
            session: {
              sessionId: teamId,
              status: 'COMPLETED',
              questionIndex: scoreSnap.data().answeredCount || 0,
              totalQuestions: scoreSnap.data().answeredCount || 0,
              phase: 'COMPLETED'
            },
            currentQuestion: null
          };
        }
      } catch (e) {
        console.warn("Score check notice:", e.message);
      }
    }

    try {
      // Fetch the quiz doc to get the ordered questionIds list (no answers)
      const quizDocRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizDocRef);
      const quizData = quizSnap.exists() ? quizSnap.data() : {};
      let questionIds = quizData.questionIds || [];

      if (questionIds.length === 0) {
        throw new Error("No ordered questions are configured for this quiz.");
      }

      // Fetch ONLY the first question by ID
      const firstQRef = doc(db, 'quizzes', quizId, 'questions', questionIds[0]);
      const firstQSnap = await getDoc(firstQRef);
      if (!firstQSnap.exists()) {
        throw new Error("First question document not found.");
      }
      const firstQuestion = { id: firstQSnap.id, ...firstQSnap.data() };
      // Strip answer key before sending to client
      delete firstQuestion.correctOption;
      delete firstQuestion.answerKey;

      const sessionData = {
        sessionId: teamId,
        status: 'RUNNING',
        questionIndex: 0,
        totalQuestions: questionIds.length,
        phase: 'READ_ONLY',
        phaseStartMs: nowMs,
        phaseDeadlineMs: nowMs + 10000,
        currentQuestion: firstQuestion
      };

      // Store session at quizSessions/{teamId} — matches useQuizSession subscription
      const sessionRef = doc(db, 'quizSessions', teamId);
      await setDoc(sessionRef, {
        teamId: teamId || 'unknown',
        quizId,
        questionIds,
        ...sessionData
      });

      return {
        success: true,
        session: sessionData,
        currentQuestion: firstQuestion
      };
    } catch (e) {
      console.warn("Firestore sync warning during session start:", e);
      throw new Error("Failed to start session: " + e.message);
    }
  }

  if (name === 'submitAnswer') {
    const { eventId = 'default-event', quizId = 'default-quiz', sessionId, questionIndex = 0, selectedOption } = data;
    const actualTeamId = sessionId || auth.currentUser?.uid || data.teamId;
    
    try {
      // Get the questionIds list from the session doc or quiz doc
      let questionIds = [];
      if (actualTeamId) {
        const sessionSnap = await getDoc(doc(db, 'quizSessions', actualTeamId));
        if (sessionSnap.exists() && sessionSnap.data().questionIds) {
          questionIds = sessionSnap.data().questionIds;
        }
      }
      if (questionIds.length === 0) {
        const quizSnap = await getDoc(doc(db, 'quizzes', quizId));
        questionIds = quizSnap.exists() ? (quizSnap.data().questionIds || []) : [];
      }

      if (questionIds.length === 0 || questionIndex >= questionIds.length) {
        throw new Error("No questions found or invalid question index.");
      }

      const totalQuestions = questionIds.length;
      const currentQId = questionIds[questionIndex];

      if (data.questionId && data.questionId !== currentQId) {
        throw new Error('Question stream is out of sync. Please reload the quiz.');
      }

      // Fetch ONLY the current question by ID to grade it
      const currentQRef = doc(db, 'quizzes', quizId, 'questions', currentQId);
      const currentQSnap = await getDoc(currentQRef);
      if (!currentQSnap.exists()) {
        throw new Error("Question document not found.");
      }
      const currentQ = { id: currentQSnap.id, ...currentQSnap.data() };
      const correctAnswer = currentQ.correctOption !== undefined ? currentQ.correctOption : currentQ.answerKey;
      const normalizedSelection = Number.isInteger(selectedOption) ? selectedOption : null;
      const isCorrect = normalizedSelection !== null && correctAnswer === normalizedSelection;
      const earned = isCorrect ? 100 : 0;

      const nextIndex = questionIndex + 1;
      const isCompleted = nextIndex >= totalQuestions;

      // Fetch next question (one at a time) if not completed
      let nextQuestion = null;
      if (!isCompleted) {
        const nextQId = questionIds[nextIndex];
        const nextQRef = doc(db, 'quizzes', quizId, 'questions', nextQId);
        const nextQSnap = await getDoc(nextQRef);
        if (nextQSnap.exists()) {
          nextQuestion = { id: nextQSnap.id, ...nextQSnap.data() };
          // Strip answer key before sending to client
          delete nextQuestion.correctOption;
          delete nextQuestion.answerKey;
        }
      }

      // Commit the immutable answer log, session transition, and score increment together.
      if (actualTeamId) {
        const answerRef = doc(db, 'quizSessions', actualTeamId, 'answers', currentQId);
        const sessionRef = doc(db, 'quizSessions', actualTeamId);
        const scoreRef = doc(db, 'scores', actualTeamId);
        const scoreSnap = await getDoc(scoreRef);
        if (!scoreSnap.exists()) {
          throw new Error('Team score ledger is missing.');
        }
        const currentScore = scoreSnap.data();
        const batch = writeBatch(db);

        batch.set(answerRef, {
          questionIndex,
          questionId: currentQId,
          selectedOption: normalizedSelection,
          isCorrect,
          earnedPoints: earned,
          submittedAt: serverTimestamp(),
          submittedAtMs: nowMs
        });

        // Update session state
        batch.set(sessionRef, {
          questionIndex: nextIndex,
          status: isCompleted ? 'COMPLETED' : 'RUNNING',
          currentQuestion: nextQuestion,
          phase: 'READ_ONLY',
          phaseStartMs: nowMs,
          phaseDeadlineMs: nowMs + 10000
        }, { merge: true });

        // Update score
        batch.set(scoreRef, {
          totalPoints: (currentScore.totalPoints || 0) + earned,
          answeredCount: (currentScore.answeredCount || 0) + 1,
          correctCount: (currentScore.correctCount || 0) + (isCorrect ? 1 : 0),
          finalized: isCompleted
        }, { merge: true });
        await batch.commit();
      }

      const nextSessionState = {
        sessionId: actualTeamId,
        status: isCompleted ? 'COMPLETED' : 'RUNNING',
        questionIndex: nextIndex,
        totalQuestions,
        phase: 'READ_ONLY',
        phaseStartMs: nowMs,
        phaseDeadlineMs: nowMs + 10000,
        currentQuestion: nextQuestion
      };

      return {
        success: true,
        isCorrect,
        earnedPoints: earned,
        isCompleted,
        session: nextSessionState,
        nextQuestion
      };
    } catch (e) {
      console.warn("Firestore sync warning during answer submission:", e);
      throw new Error("Failed to submit answer: " + e.message);
    }
  }

  if (name === 'revealThemes' || name === 'setThemeReveal') {
    const { eventId = 'default-event', revealed = true } = data;
    
    try {
      if (!revealed) {
        const publicThemesRef = collection(db, 'themesPublic', eventId, 'items');
        const publicThemesSnap = await getDocs(publicThemesRef);
        const batch = writeBatch(db);

        publicThemesSnap.forEach((theme) => {
          batch.set(doc(db, 'themesPublic', eventId, 'items', theme.id), {
            visible: false,
            hiddenAtMs: nowMs
          }, { merge: true });
        });

        const eventRef = doc(db, 'events', eventId);
        batch.set(eventRef, { themesRevealed: false, updatedAtMs: nowMs }, { merge: true });
        const auditRef = doc(collection(db, 'auditLogs', eventId, 'items'));
        batch.set(auditRef, {
          logId: auditRef.id,
          actorUid: auth.currentUser?.uid || 'admin-fallback',
          actorRole: 'ADMIN',
          action: 'THEME_REVEAL_HIDDEN',
          entityPath: `themesPublic/${eventId}/items`,
          details: { hiddenCount: publicThemesSnap.size },
          createdAtMs: nowMs
        });
        await batch.commit();

        return { success: true, revealedCount: 0, hiddenCount: publicThemesSnap.size, themesRevealed: false };
      }

      const privateRef = collection(db, 'themesPrivate', eventId, 'items');
      const snap = await getDocs(privateRef);
      const batch = writeBatch(db);
      let revealedCount = 0;

      snap.forEach(d => {
        const t = d.data();
        const publicRef = doc(db, 'themesPublic', eventId, 'items', d.id);
        batch.set(publicRef, {
          themeId: d.id,
          themeNumber: t.themeNumber,
          publicName: t.name || t.publicName || `Theme ${t.themeNumber || ''}`.trim(),
          publicDescription: t.description || t.publicDescription || '',
          brief: t.brief || '',
          eligibility: t.eligibility || 'All Registered Teams',
          seatCapacity: Number(t.seatCapacity || t.capacity || 1),
          visible: true,
          revealedAtMs: nowMs
        }, { merge: true });
        revealedCount++;
      });

      const eventRef = doc(db, 'events', eventId);
      batch.set(eventRef, { themesRevealed: true, updatedAtMs: nowMs }, { merge: true });

      const revealAuditRef = doc(collection(db, 'auditLogs', eventId, 'items'));
      batch.set(revealAuditRef, {
        logId: revealAuditRef.id,
        actorUid: auth.currentUser?.uid || 'admin-fallback',
        actorRole: 'ADMIN',
        action: 'THEME_REVEAL_EXECUTED',
        entityPath: `themesPublic/${eventId}/items`,
        details: { revealedCount },
        createdAtMs: nowMs
      });
      
      await batch.commit();
      
      return {
        success: true,
        revealedCount,
        themesRevealed: true
      };
    } catch (e) {
      console.warn("Firestore sync warning during theme reveal:", e);
      throw new Error("Failed to reveal themes: " + e.message);
    }
  }

  if (name === 'submitBid') {
    const { eventId = 'default-event', teamId, selectedThemeId, preferenceIds } = data;
    let effectiveBidPoints = 0;
    
    try {
      const actualTeamId = auth.currentUser?.uid || teamId;
      if (actualTeamId) {
        if (!Array.isArray(preferenceIds) || preferenceIds.length === 0) {
          throw new Error('Rank every revealed theme before submitting your bid.');
        }
        if (new Set(preferenceIds).size !== preferenceIds.length) {
          throw new Error('Each theme can appear only once in your preference list.');
        }
        if (selectedThemeId !== preferenceIds[0]) {
          throw new Error('Your selected theme must match preference rank 1.');
        }
        const scoreSnap = await getDoc(doc(db, 'scores', actualTeamId));
        if (!scoreSnap.exists()) throw new Error('Team score ledger is missing.');
        const scoreSnapshot = scoreSnap.data().totalPoints || 0;
        effectiveBidPoints = scoreSnapshot;

        const visibleThemes = await getDocs(
          query(collection(db, 'themesPublic', eventId, 'items'), where('visible', '==', true))
        );
        const visibleThemeIds = visibleThemes.docs.map((theme) => theme.id);
        if (visibleThemeIds.length === 0 || preferenceIds.length !== visibleThemeIds.length ||
          !preferenceIds.every((themeId) => visibleThemeIds.includes(themeId))) {
          throw new Error('Your preferences must contain every currently revealed theme exactly once.');
        }

        const bidRef = doc(db, 'bids', eventId, 'items', actualTeamId);
        await setDoc(bidRef, {
          teamId: actualTeamId,
          selectedThemeId,
          preferenceIds,
          bidPoints: effectiveBidPoints,
          scoreSnapshot,
          submittedAtMs: nowMs
        });
      }
    } catch (e) {
      console.warn("Firestore sync warning during bid submission:", e);
      throw new Error("Failed to submit bid: " + e.message);
    }
    
    return {
      success: true,
      selectedThemeId,
      preferenceIds,
      bidPoints: effectiveBidPoints,
      submittedAtMs: nowMs
    };
  }

  if (name === 'finalizeAllocation') {
    const { eventId = 'default-event' } = data;
    try {
      const bidsRef = collection(db, 'bids', eventId, 'items');
      const bidsSnap = await getDocs(bidsRef);

      if (bidsSnap.empty) {
        throw new Error("No bids submitted to finalize.");
      }

      const allBids = [];
      bidsSnap.forEach(d => allBids.push({ teamId: d.id, ...d.data() }));

      const priorityComparator = (a, b) => {
        if ((b.scoreSnapshot || 0) !== (a.scoreSnapshot || 0)) {
          return (b.scoreSnapshot || 0) - (a.scoreSnapshot || 0);
        }
        if ((a.submittedAtMs || 0) !== (b.submittedAtMs || 0)) {
          return (a.submittedAtMs || 0) - (b.submittedAtMs || 0);
        }
        return String(a.teamId || '').localeCompare(String(b.teamId || ''));
      };

      const themeSnap = await getDocs(collection(db, 'themesPublic', eventId, 'items'));
      const remainingSeats = new Map();
      themeSnap.docs.forEach((theme) => {
        const themeData = theme.data();
        if (themeData.visible !== true) return;
        const seatCapacity = Number(themeData.seatCapacity || themeData.capacity || 0);
        if (Number.isInteger(seatCapacity) && seatCapacity > 0) {
          remainingSeats.set(theme.id, seatCapacity);
        }
      });
      if (remainingSeats.size === 0) {
        throw new Error('No revealed themes with available seat capacity are configured.');
      }

      const batch = writeBatch(db);
      const allocationResults = [];
      const sortedBids = [...allBids].sort(priorityComparator);

      sortedBids.forEach((bid, orderIndex) => {
        const preferences = Array.isArray(bid.preferenceIds) && bid.preferenceIds.length > 0
          ? bid.preferenceIds
          : [bid.selectedThemeId].filter(Boolean);
        const preferenceIndex = preferences.findIndex((themeId) => (remainingSeats.get(themeId) || 0) > 0);
        const assignedThemeId = preferenceIndex >= 0 ? preferences[preferenceIndex] : null;
        if (assignedThemeId) {
          remainingSeats.set(assignedThemeId, remainingSeats.get(assignedThemeId) - 1);
        }

        const allocRef = doc(db, 'allocations', eventId, 'items', bid.teamId);
        const allocData = {
          teamId: bid.teamId,
          themeId: assignedThemeId,
          preferenceRank: assignedThemeId ? preferenceIndex + 1 : null,
          allocationOrder: orderIndex + 1,
          status: assignedThemeId ? 'ALLOCATED' : 'WAITLISTED',
          scoreSnapshot: bid.scoreSnapshot || 0,
          bidPoints: bid.scoreSnapshot || 0,
          preferenceIds: preferences,
          submittedAtMs: bid.submittedAtMs || nowMs,
          finalizedAtMs: nowMs
        };
        batch.set(allocRef, allocData);
        allocationResults.push(allocData);
      });

      const eventRef = doc(db, 'events', eventId);
      batch.set(
        eventRef,
        {
          allocationFinalized: true,
          allocationFinalizedAtMs: nowMs,
          biddingOpen: false,
        },
        { merge: true }
      );

      const allocationAuditRef = doc(collection(db, 'auditLogs', eventId, 'items'));
      batch.set(allocationAuditRef, {
        logId: allocationAuditRef.id,
        actorUid: auth.currentUser?.uid || 'admin-fallback',
        actorRole: 'ADMIN',
        action: 'ALLOCATION_FINALIZED',
        entityPath: `allocations/${eventId}/items`,
        details: {
          totalBids: allocationResults.length,
          allocatedCount: allocationResults.filter((allocation) => allocation.status === 'ALLOCATED').length,
          waitlistedCount: allocationResults.filter((allocation) => allocation.status === 'WAITLISTED').length,
          priority: 'scoreSnapshot DESC, submittedAtMs ASC, teamId ASC'
        },
        createdAtMs: nowMs
      });

      await batch.commit();

      return {
        success: true,
        totalAllocations: allocationResults.filter((allocation) => allocation.status === 'ALLOCATED').length,
        waitlistedCount: allocationResults.filter((allocation) => allocation.status === 'WAITLISTED').length,
        finalizedAtMs: nowMs,
        allocations: allocationResults,
      };
    } catch (e) {
      console.warn("Firestore sync warning during allocation finalization:", e);
      throw new Error("Failed to finalize allocation: " + e.message);
    }
  }

  if (name === 'syncClock') {
    return {
      serverTimeMs: nowMs
    };
  }

  if (name === 'setResultsReveal') {
    const { eventId = 'default-event', revealed = true } = data;
    try {
      const eventRef = doc(db, 'events', eventId);
      const auditRef = doc(collection(db, 'auditLogs', eventId, 'items'));
      const batch = writeBatch(db);
      batch.set(eventRef, {
        resultsRevealed: revealed === true,
        resultsRevealedAtMs: revealed ? nowMs : null,
        resultsHiddenAtMs: revealed ? null : nowMs,
        updatedAtMs: nowMs
      }, { merge: true });
      batch.set(auditRef, {
        logId: auditRef.id,
        actorUid: auth.currentUser?.uid || 'admin-fallback',
        actorRole: 'ADMIN',
        action: revealed ? 'RESULTS_REVEALED' : 'RESULTS_HIDDEN',
        entityPath: `allocations/${eventId}/items`,
        createdAtMs: nowMs
      });
      await batch.commit();
      return { success: true, resultsRevealed: revealed === true };
    } catch (e) {
      console.warn('Firestore sync warning during results release:', e);
      throw new Error(`Failed to ${revealed ? 'reveal' : 'hide'} results: ${e.message}`);
    }
  }

  return { success: true, fallback: true };
}

export async function registerTeamApi(payload) {
  return await callFunction('registerTeam', payload);
}

export async function setAdminClaimApi(payload) {
  return await callFunction('setAdminClaim', payload);
}

export async function startSessionApi(payload) {
  return await callFunction('startSession', payload);
}

export async function submitAnswerApi(payload) {
  return await callFunction('submitAnswer', payload);
}

export async function syncClockApi(payload) {
  return await callFunction('syncClock', payload);
}

export async function revealThemesApi(payload) {
  return await callFunction('revealThemes', payload);
}

export async function setThemeRevealApi(payload) {
  return await callFunction('setThemeReveal', payload);
}

export async function submitBidApi(payload) {
  return await callFunction('submitBid', payload);
}

export async function finalizeAllocationApi(payload) {
  return await callFunction('finalizeAllocation', payload);
}

export async function setResultsRevealApi(payload) {
  return await callFunction('setResultsReveal', payload);
}
