// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMockData, saveMockData } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load active session from local storage or default to participant demo user
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("autohack_active_user");
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) { }
    }
    // Default to participant demo user
    return {
      uid: "user-demo-uid",
      email: "teamlead@cyberbotics.io",
      role: "participant",
      teamId: "team-cyberbotics",
      name: "CyberLead"
    };
  });

  const [currentTeam, setCurrentTeam] = useState(null);

  // Sync team whenever currentUser or DB changes
  const refreshTeam = () => {
    if (!currentUser || !currentUser.teamId) {
      setCurrentTeam(null);
      return;
    }
    const dbData = getMockData();
    const team = dbData.teams ? dbData.teams[currentUser.teamId] : null;
    setCurrentTeam(team || null);
  };

  useEffect(() => {
    refreshTeam();
    const handleDbUpdate = () => refreshTeam();
    window.addEventListener("autohack_db_update", handleDbUpdate);
    return () => window.removeEventListener("autohack_db_update", handleDbUpdate);
  }, [currentUser]);

  const saveSession = (userObj) => {
    setCurrentUser(userObj);
    if (userObj) {
      localStorage.setItem("autohack_active_user", JSON.stringify(userObj));
    } else {
      localStorage.removeItem("autohack_active_user");
    }
  };

  const login = async (email, password, preferredRole = "participant") => {
    const dbData = getMockData();
    // Search existing users by email
    const existingUserKey = Object.keys(dbData.users).find(
      uid => dbData.users[uid].email.toLowerCase() === email.toLowerCase()
    );

    let userObj;
    if (existingUserKey) {
      userObj = { ...dbData.users[existingUserKey] };
      // Allow overriding role if explicitly requested in form for testing
      if (preferredRole && userObj.role !== preferredRole) {
        userObj.role = preferredRole;
        dbData.users[existingUserKey].role = preferredRole;
        saveMockData(dbData);
      }
    } else {
      // Auto-create user for frictionless hackathon demo
      const uid = `user-${Date.now()}`;
      userObj = {
        uid,
        email,
        role: preferredRole || (email.includes("admin") ? "admin" : "participant"),
        teamId: null,
        name: email.split("@")[0]
      };
      dbData.users[uid] = userObj;
      saveMockData(dbData);
    }

    saveSession(userObj);
    return userObj;
  };

  const register = async (email, password, role = "participant", name = "") => {
    const dbData = getMockData();
    const uid = `user-${Date.now()}`;
    const userObj = {
      uid,
      email,
      role,
      teamId: null,
      name: name || email.split("@")[0]
    };
    dbData.users[uid] = userObj;
    saveMockData(dbData);
    saveSession(userObj);
    return userObj;
  };

  const logout = async () => {
    saveSession(null);
    setCurrentTeam(null);
  };

  const createTeam = (teamName) => {
    if (!currentUser) return { success: false, message: "User not authenticated" };
    const dbData = getMockData();
    const teamId = `team-${Date.now()}`;
    const joinCode = `HACK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTeam = {
      teamId,
      teamName,
      joinCode,
      leaderUid: currentUser.uid,
      memberUids: [currentUser.uid],
      quizState: {
        totalScore: 0,
        totalTimeTakenMs: 0,
        isCompleted: false,
        submittedAt: null
      },
      preferences: ["t1", "t2", "t3", "t4"],
      allocatedThemeId: null
    };

    dbData.teams = dbData.teams || {};
    dbData.teams[teamId] = newTeam;

    // Update user teamId
    if (dbData.users[currentUser.uid]) {
      dbData.users[currentUser.uid].teamId = teamId;
    }

    saveMockData(dbData);

    const updatedUser = { ...currentUser, teamId };
    saveSession(updatedUser);
    setCurrentTeam(newTeam);

    return { success: true, team: newTeam };
  };

  const joinTeam = (joinCode) => {
    if (!currentUser) return { success: false, message: "User not authenticated" };
    const dbData = getMockData();
    const cleanCode = joinCode.trim().toUpperCase();

    const foundTeamKey = Object.keys(dbData.teams || {}).find(
      tId => dbData.teams[tId].joinCode.toUpperCase() === cleanCode
    );

    if (!foundTeamKey) {
      return { success: false, message: "Invalid Team Join Code!" };
    }

    const team = dbData.teams[foundTeamKey];
    if (team.memberUids.length >= 4) {
      return { success: false, message: "Team has reached max capacity of 4 members!" };
    }

    if (!team.memberUids.includes(currentUser.uid)) {
      team.memberUids.push(currentUser.uid);
    }

    dbData.teams[foundTeamKey] = team;
    if (dbData.users[currentUser.uid]) {
      dbData.users[currentUser.uid].teamId = team.teamId;
    }

    saveMockData(dbData);

    const updatedUser = { ...currentUser, teamId: team.teamId };
    saveSession(updatedUser);
    setCurrentTeam(team);

    return { success: true, team };
  };

  const leaveTeam = () => {
    if (!currentUser || !currentUser.teamId) return;
    const dbData = getMockData();
    const team = dbData.teams[currentUser.teamId];
    if (team) {
      team.memberUids = team.memberUids.filter(id => id !== currentUser.uid);
      if (team.memberUids.length === 0) {
        delete dbData.teams[currentUser.teamId];
      } else {
        if (team.leaderUid === currentUser.uid) {
          team.leaderUid = team.memberUids[0];
        }
        dbData.teams[currentUser.teamId] = team;
      }
    }
    if (dbData.users[currentUser.uid]) {
      dbData.users[currentUser.uid].teamId = null;
    }
    saveMockData(dbData);
    const updatedUser = { ...currentUser, teamId: null };
    saveSession(updatedUser);
    setCurrentTeam(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentTeam,
      login,
      register,
      logout,
      createTeam,
      joinTeam,
      leaveTeam,
      refreshTeam
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
