// src/pages/QuizEngine.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useAuth } from '../context/AuthContext';
import { Zap, Clock, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Award, Lock, RefreshCw } from 'lucide-react';

export const QuizEngine = () => {
  const { questions, submitQuizResults, config } = useGlobalConfig();
  const { currentTeam } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(1); // 1 = Read-Only (0-10s), 2 = Answer-Mode (10-20s)
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(10);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  
  // Scoring state
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [totalTimeTakenMs, setTotalTimeTakenMs] = useState(0);

  const currentQuestion = questions[currentIndex];

  // Initialize Quiz Timer Loop
  useEffect(() => {
    if (isQuizCompleted || !currentQuestion) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setPhase(1);
    setPhaseSecondsLeft(10);
    setSelectedOptionId(null);

    // Phase 1 timer (0s to 10s)
    const phase1Interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(phase1Interval);
          // Transition to Phase 2
          setPhase(2);
          setPhaseSecondsLeft(10);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(phase1Interval);
  }, [currentIndex, isQuizCompleted]);

  // Phase 2 Timer Loop (10s to 20s)
  useEffect(() => {
    if (phase !== 2 || isQuizCompleted || !currentQuestion) return;

    const phase2Interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(phase2Interval);
          // Timeout! Auto advance to next question
          handleNextQuestion(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(phase2Interval);
  }, [phase, currentIndex, isQuizCompleted]);

  const handleSelectOption = (optionId) => {
    if (phase !== 2) return; // Cannot select during Phase 1!
    setSelectedOptionId(optionId);
  };

  const handleNextQuestion = (optionToSubmit = selectedOptionId) => {
    const isCorrect = optionToSubmit === currentQuestion.correctAnswerId;
    const answerRecord = {
      questionId: currentQuestion.id,
      selectedOptionId: optionToSubmit,
      isCorrect,
      points: isCorrect ? (currentQuestion.points || 100) : 0
    };

    const nextAnswers = [...userAnswers, answerRecord];
    setUserAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Quiz Finished!
      const totalElapsedMs = startTime ? (Date.now() - startTime) : 40000;
      const totalScore = nextAnswers.reduce((acc, a) => acc + a.points, 0);

      setTotalTimeTakenMs(totalElapsedMs);
      setIsQuizCompleted(true);

      if (currentTeam) {
        submitQuizResults(currentTeam.teamId, totalScore, totalElapsedMs);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setPhase(1);
    setPhaseSecondsLeft(10);
    setSelectedOptionId(null);
    setUserAnswers([]);
    setStartTime(Date.now());
    setIsQuizCompleted(false);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 font-mono text-center space-y-4">
        <div className="p-8 bg-zinc-950 border border-zinc-800">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-white uppercase">NO QUIZ QUESTIONS FOUND</h2>
          <p className="text-xs text-zinc-400">Administrators have not uploaded questions to the SCADA server yet.</p>
        </div>
      </div>
    );
  }

  if (isQuizCompleted) {
    const totalScore = userAnswers.reduce((acc, a) => acc + a.points, 0);
    const correctCount = userAnswers.filter(a => a.isCorrect).length;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 font-mono space-y-6">
        <div className="bg-zinc-950 border border-zinc-800 p-8 shadow-[0_0_30px_rgba(220,38,38,0.2)] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
            COMPLETED
          </div>

          <Award className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
          <h1 className="text-3xl font-extrabold text-white uppercase">QUIZ COMPLETED!</h1>
          <p className="text-xs text-zinc-400 mt-1">TELEMETRY & RESULTS TRANSMITTED TO SCADA LEADERBOARD</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="bg-black border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-500 uppercase">FINAL SCORE</div>
              <div className="text-3xl font-extrabold text-red-500">{totalScore} PTS</div>
            </div>
            <div className="bg-black border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-500 uppercase">ACCURACY</div>
              <div className="text-2xl font-bold text-white">{correctCount} / {questions.length} CORRECT</div>
            </div>
            <div className="bg-black border border-zinc-800 p-4">
              <div className="text-[10px] text-zinc-500 uppercase">TIME ELAPSED</div>
              <div className="text-xl font-bold text-emerald-400">{(totalTimeTakenMs / 1000).toFixed(1)}s</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={restartQuiz}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs uppercase font-bold flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RETRY SPEED QUIZ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-mono">
      {/* Header Bar */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">
            STRICT 10s + 10s DUAL-PHASE SPEED QUIZ
          </span>
          <h1 className="text-xl font-extrabold text-white uppercase">
            QUESTION {currentIndex + 1} OF {questions.length}
          </h1>
        </div>

        {/* Phase Indicator Badge */}
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 border text-xs font-bold uppercase flex items-center space-x-2 ${
            phase === 1 
              ? 'bg-amber-950/60 border-amber-800 text-amber-400' 
              : 'bg-red-950/60 border-red-600 text-red-400 animate-pulse'
          }`}>
            <Clock className="w-4 h-4" />
            <span>
              {phase === 1 ? `PHASE 1: ANALYZING (${phaseSecondsLeft}s)` : `PHASE 2: SUBMIT ANSWER (${phaseSecondsLeft}s)`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-950 border border-zinc-800 h-2 relative overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${phase === 1 ? 'bg-amber-500' : 'bg-red-600'}`}
          style={{ width: `${(phaseSecondsLeft / 10) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-zinc-950 border border-zinc-800 p-8 space-y-6 relative overflow-hidden">
        <div className="text-lg sm:text-xl font-bold text-white leading-snug">
          {currentQuestion.questionText}
        </div>

        {/* Phase 1 Overlay vs Options */}
        {phase === 1 ? (
          <div className="bg-black border border-amber-900/60 p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center mx-auto text-amber-500 animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-amber-400 text-sm font-bold uppercase tracking-wider">
              SYSTEM ANALYZING OPTIONS... ({phaseSecondsLeft}s)
            </div>
            <p className="text-zinc-500 text-xs font-sans">
              Read the question carefully. Answer choices will be revealed in Phase 2!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-zinc-500 uppercase tracking-widest">SELECT ONE OPTION BELOW:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options?.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 text-left border text-xs transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-red-950/80 border-red-500 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                        : 'bg-black border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <span className="leading-normal">{opt.text}</span>
                    <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 ml-3 ${
                      isSelected ? 'bg-red-600 border-red-500 text-white' : 'border-zinc-700'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => handleNextQuestion()}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                <span>CONFIRM & ADVANCE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
