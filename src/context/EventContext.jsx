import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToEvent, subscribeToPublicThemes } from '../services/firestoreService';
import { syncClockApi } from '../services/callableApi';

const EventContext = createContext(null);

export function EventProvider({ children, eventId = 'default-event' }) {
  const [eventData, setEventData] = useState(null);
  const [publicThemes, setPublicThemes] = useState([]);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [eventLoading, setEventLoading] = useState(true);
  const [themesLoading, setThemesLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // Sync Server Clock Offset
  const refreshClockOffset = useCallback(async () => {
    try {
      const clientReqStart = Date.now();
      const res = await syncClockApi();
      const serverMs = res?.serverEpochMs || res?.serverTimeMs;
      if (serverMs) {
        const clientReqEnd = Date.now();
        const roundTripHalf = Math.floor((clientReqEnd - clientReqStart) / 2);
        const estimatedServerNow = serverMs + roundTripHalf;
        const offset = estimatedServerNow - Date.now();
        setServerOffsetMs(offset);
      }
    } catch (e) {
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
    setEventData(null);
    setPublicThemes([]);
    setEventLoading(true);
    setThemesLoading(true);
    setLoadFailed(false);
    const unsubEvent = subscribeToEvent(eventId, (data) => {
      setEventData(data);
      setEventLoading(false);
    }, () => {
      setLoadFailed(true);
      setEventLoading(false);
    });

    const unsubThemes = subscribeToPublicThemes(eventId, (themes) => {
      setPublicThemes(themes || []);
      setThemesLoading(false);
    }, () => {
      setLoadFailed(true);
      setThemesLoading(false);
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
    loading: eventLoading || themesLoading,
    loadFailed
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
