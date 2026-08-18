import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, signInWithTeamCode, signInWithAdminCredentials, signOutUser } from '../services/authService';
import { subscribeToTeam, subscribeToScore } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ user: null, uid: null, role: 'VISITOR', isAdmin: false });
  const [teamData, setTeamData] = useState(null);
  const [teamScore, setTeamScore] = useState({ totalPoints: 0, answeredCount: 0, correctCount: 0 });
  const [loading, setLoading] = useState(true);

  // Subscribe to Auth State
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((state) => {
      setAuthState(state);
      if (!state.user) {
        setTeamData(null);
        setTeamScore({ totalPoints: 0, answeredCount: 0, correctCount: 0 });
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to Team data when authenticated as Team
  useEffect(() => {
    if (!authState.uid || authState.isAdmin) {
      if (!authState.uid) setLoading(false);
      return;
    }

    setLoading(true);
    const unsubTeam = subscribeToTeam(authState.uid, (data) => {
      setTeamData(data);
    });

    const unsubScore = subscribeToScore(authState.uid, (score) => {
      setTeamScore(score || { totalPoints: 0, answeredCount: 0, correctCount: 0 });
      setLoading(false);
    });

    return () => {
      unsubTeam();
      unsubScore();
    };
  }, [authState.uid, authState.isAdmin]);

  const value = {
    currentUser: authState.user,
    uid: authState.uid,
    role: authState.role,
    isAdmin: authState.isAdmin,
    teamData,
    teamScore,
    loading,
    signInTeam: signInWithTeamCode,
    signInAdmin: signInWithAdminCredentials,
    logout: signOutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
