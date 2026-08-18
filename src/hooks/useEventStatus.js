import { useState, useEffect } from 'react';
import { subscribeToEvent } from '../services/firestoreService';

export function useEventStatus(eventId = 'default-event') {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToEvent(eventId, (data) => {
      if (data) {
        setEventData(data);
      } else {
        // Fallback default state if doc does not exist yet
        setEventData({
          id: eventId,
          name: "Automation & Robotics Hackathon 2026",
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

    return () => unsub();
  }, [eventId]);

  return {
    eventData,
    loading,
    registrationOpen: eventData?.registrationOpen ?? true,
    quizOpen: eventData?.quizOpen ?? true,
    themesRevealed: eventData?.themesRevealed ?? false,
    biddingOpen: eventData?.biddingOpen ?? false,
    allocationFinalized: eventData?.allocationFinalized ?? false
  };
}
