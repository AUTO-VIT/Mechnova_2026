// src/context/GlobalConfigContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMockData, saveMockData } from '../firebase';

const GlobalConfigContext = createContext();

export const GlobalConfigProvider = ({ children }) => {
  const [dbState, setDbState] = useState(() => getMockData());

  const syncState = () => {
    setDbState(getMockData());
  };

  useEffect(() => {
    syncState();
    const handleDbUpdate = (e) => {
      if (e.detail) {
        setDbState(e.detail);
      } else {
        syncState();
      }
    };
    window.addEventListener("autohack_db_update", handleDbUpdate);
    return () => window.removeEventListener("autohack_db_update", handleDbUpdate);
  }, []);

  const config = dbState.config || {
    eventStatus: "registration",
    themesRevealed: false,
    quizStartTime: null,
    biddingEndTime: null
  };

  const siteContent = dbState.siteContent || {
    home: { heroTitle: "", heroSubtitle: "", announcementBanner: "" },
    schedule: { timelineEvents: [] },
    faq: { items: [] }
  };

  const questions = dbState.questions || [];
  const themes = dbState.themes || [];
  const teams = dbState.teams || {};

  // Admin CMS Functions
  const updateGlobalConfig = (newConfig) => {
    const data = getMockData();
    data.config = { ...data.config, ...newConfig, updatedAt: new Date().toISOString() };
    saveMockData(data);
  };

  const updateSiteContent = (section, content) => {
    const data = getMockData();
    data.siteContent = data.siteContent || {};
    data.siteContent[section] = content;
    saveMockData(data);
  };

  const setEventStatus = (status) => {
    updateGlobalConfig({ eventStatus: status });
  };

  const toggleThemesRevealed = (revealedState) => {
    const targetState = typeof revealedState === 'boolean' ? revealedState : !config.themesRevealed;
    updateGlobalConfig({ themesRevealed: targetState });
    
    // Update individual theme reveals
    const data = getMockData();
    if (data.themes) {
      data.themes = data.themes.map(t => ({ ...t, isRevealed: targetState }));
      saveMockData(data);
    }
  };

  const startQuiz = () => {
    const startTime = Date.now();
    updateGlobalConfig({
      eventStatus: "quiz_live",
      quizStartTime: startTime
    });
  };

  const saveQuestion = (questionObj) => {
    const data = getMockData();
    data.questions = data.questions || [];
    const index = data.questions.findIndex(q => q.id === questionObj.id);
    if (index >= 0) {
      data.questions[index] = questionObj;
    } else {
      data.questions.push({ ...questionObj, id: questionObj.id || `q-${Date.now()}` });
    }
    saveMockData(data);
  };

  const deleteQuestion = (qId) => {
    const data = getMockData();
    data.questions = (data.questions || []).filter(q => q.id !== qId);
    saveMockData(data);
  };

  const saveTheme = (themeObj) => {
    const data = getMockData();
    data.themes = data.themes || [];
    const index = data.themes.findIndex(t => t.themeId === themeObj.themeId);
    if (index >= 0) {
      data.themes[index] = themeObj;
    } else {
      data.themes.push({ ...themeObj, themeId: themeObj.themeId || `t-${Date.now()}` });
    }
    saveMockData(data);
  };

  const deleteTheme = (themeId) => {
    const data = getMockData();
    data.themes = (data.themes || []).filter(t => t.themeId !== themeId);
    saveMockData(data);
  };

  // Priority Allocation Engine Execution
  const runPriorityAllocation = () => {
    const data = getMockData();
    const teamList = Object.values(data.teams || {});
    const themeMap = {};
    (data.themes || []).forEach(t => {
      themeMap[t.themeId] = {
        ...t,
        assignedTeamCount: 0
      };
    });

    // 1. Sort teams by Total Score (descending), then Total Time Taken (ascending tie-breaker)
    teamList.sort((a, b) => {
      const scoreA = a.quizState?.totalScore || 0;
      const scoreB = b.quizState?.totalScore || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      
      const timeA = a.quizState?.totalTimeTakenMs || 9999999;
      const timeB = b.quizState?.totalTimeTakenMs || 9999999;
      return timeA - timeB;
    });

    // 2. Iterate and assign preferences based on quota availability
    teamList.forEach(team => {
      let assigned = null;
      const preferences = team.preferences && team.preferences.length > 0
        ? team.preferences
        : Object.keys(themeMap);

      for (const prefId of preferences) {
        const theme = themeMap[prefId];
        if (theme && theme.assignedTeamCount < theme.maxTeamQuota) {
          assigned = prefId;
          theme.assignedTeamCount += 1;
          break;
        }
      }

      // Fallback if top preferences are full
      if (!assigned) {
        for (const tId of Object.keys(themeMap)) {
          if (themeMap[tId].assignedTeamCount < themeMap[tId].maxTeamQuota) {
            assigned = tId;
            themeMap[tId].assignedTeamCount += 1;
            break;
          }
        }
      }

      data.teams[team.teamId].allocatedThemeId = assigned;
    });

    // Update themes assigned count
    data.themes = Object.values(themeMap);
    data.config.eventStatus = "allocated";
    saveMockData(data);

    return {
      success: true,
      teamsAllocatedCount: teamList.length,
      allocationSummary: teamList.map(t => ({
        teamName: t.teamName,
        allocatedTheme: themeMap[t.allocatedThemeId]?.title || "Unallocated"
      }))
    };
  };

  const updateTeamPreferences = (teamId, preferenceArray) => {
    const data = getMockData();
    if (data.teams && data.teams[teamId]) {
      data.teams[teamId].preferences = preferenceArray;
      saveMockData(data);
    }
  };

  const submitQuizResults = (teamId, score, timeTakenMs) => {
    const data = getMockData();
    if (data.teams && data.teams[teamId]) {
      data.teams[teamId].quizState = {
        totalScore: score,
        totalTimeTakenMs: timeTakenMs,
        isCompleted: true,
        submittedAt: new Date().toISOString()
      };
      saveMockData(data);
    }
  };

  return (
    <GlobalConfigContext.Provider value={{
      config,
      siteContent,
      questions,
      themes,
      teams,
      setEventStatus,
      toggleThemesRevealed,
      startQuiz,
      updateSiteContent,
      saveQuestion,
      deleteQuestion,
      saveTheme,
      deleteTheme,
      runPriorityAllocation,
      updateTeamPreferences,
      submitQuizResults
    }}>
      {children}
    </GlobalConfigContext.Provider>
  );
};

export const useGlobalConfig = () => useContext(GlobalConfigContext);
