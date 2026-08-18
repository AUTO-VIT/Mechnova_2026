import { useState, useCallback, useEffect } from 'react';
import { startSessionApi, submitAnswerApi } from '../services/callableApi';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useQuizSession(teamId) {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to real-time session updates
  useEffect(() => {
    if (!teamId) return;
    const sessionRef = doc(db, 'quizSessions', teamId);
    const unsubSession = onSnapshot(sessionRef, (snap) => {
      if (snap.exists()) {
        setSession({ id: snap.id, ...snap.data() });
      } else {
        setSession(null);
      }
    }, (err) => setError(err.message));

    const answersCol = collection(db, 'quizSessions', teamId, 'answers');
    const unsubAnswers = onSnapshot(answersCol, (snap) => {
      const ansMap = {};
      snap.docs.forEach(d => {
        ansMap[d.id] = d.data();
      });
      setAnswers(ansMap);
    }, (err) => console.warn("Answers snapshot error:", err));

    return () => {
      unsubSession();
      unsubAnswers();
    };
  }, [teamId]);

  /**
   * Start or Resume Quiz Session
   */
  const startQuiz = useCallback(async (eventId = 'default-event', quizId = 'default-quiz') => {
    setLoading(true);
    setError(null);
    try {
      const res = await startSessionApi({ eventId, quizId });
      if (res.session) setSession(res.session);
      if (res.currentQuestion) setCurrentQuestion(res.currentQuestion);
      return res;
    } catch (err) {
      console.error("Failed to start quiz session:", err);
      setError(err.message || "Failed to start quiz session.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit Answer Choice for Current Active Question
   */
  const submitAnswerChoice = useCallback(async ({ eventId = 'default-event', quizId = 'default-quiz', questionIndex, questionId, selectedOption }) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitAnswerApi({
        eventId,
        quizId,
        questionIndex,
        questionId,
        selectedOption
      });

      if (res.session) setSession(res.session);
      if (res.nextQuestion) setCurrentQuestion(res.nextQuestion);

      return res;
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError(err.message || "Answer submission failed.");
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  return {
    session,
    currentQuestion,
    setCurrentQuestion,
    answers,
    loading,
    submitting,
    error,
    setError,
    startQuiz,
    submitAnswerChoice
  };
}
