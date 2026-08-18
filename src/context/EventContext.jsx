import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToEvent, subscribeToPublicThemes } from '../services/firestoreService';
import { syncClockApi } from '../services/callableApi';

const EventContext = createContext(null);

export function EventProvider({ children, eventId = 'default-event' }) {
  const [eventData, setEventData] = useState(null);
  const [publicThemes, setPublicThemes] = useState([]);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync Server Clock Offset
  const refreshClockOffset = useCallback(async () => {
    try {
      const clientReqStart = Date.now();
      const res = await syncClockApi();
      if (res && res.serverEpochMs) {
        const clientReqEnd = Date.now();
        const roundTripHalf = Math.floor((clientReqEnd - clientReqStart) / 2);
        const estimatedServerNow = res.serverEpochMs + roundTripHalf;
        const offset = estimatedServerNow - Date.now();
        setServerOffsetMs(offset);
      }
    } catch (e) {
      console.warn("Clock sync failed, falling back to local clock:", e.message);
      setServerOffsetMs(0);
    }
  }, []);

  useEffect(() => {
    refreshClockOffset();
    const interval = setInterval(refreshClockOffset, 120000); // refresh every 2 mins
    return () => clearInterval(interval);
  }, [refreshClockOffset]);

  // Subscribe to Event Document
  useEffect(() => {
    setLoading(true);
    const unsubEvent = subscribeToEvent(eventId, (data) => {
      if (data) {
        setEventData(data);
      } else {
        setEventData({
          id: eventId,
          name: "AUTOMATION & ROBOTICS HACKATHON 2026",
          status: "ACTIVE",
          registrationOpen: true,
          quizOpen: true,
          themesRevealed: false,
          biddingOpen: false,
          allocationFinalized: false,
          quizId: "default-quiz"
        });
      }
      setLoading(false);
    });

    const unsubThemes = subscribeToPublicThemes(eventId, (themes) => {
      setPublicThemes(themes || []);
    });

    return () => {
      unsubEvent();
      unsubThemes();
    };
  }, [eventId]);

  const value = {
    eventId,
    eventData,
    publicThemes,
    serverOffsetMs,
    refreshClockOffset,
    loading
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}
