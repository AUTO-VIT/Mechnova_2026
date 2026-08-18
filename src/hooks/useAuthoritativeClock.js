import { useState, useEffect, useRef } from 'react';

/**
 * Trusted Server Time & Authoritative Countdown Timer Hook
 * Uses serverOffsetMs and requestAnimationFrame for high-precision timer ticks.
 */
export function useAuthoritativeClock(phaseDeadlineMs, serverOffsetMs = 0, onDeadlineReached) {
  const [remainingMs, setRemainingMs] = useState(0);
  const firedRef = useRef(false);
  const callbackRef = useRef(onDeadlineReached);

  useEffect(() => {
    callbackRef.current = onDeadlineReached;
  }, [onDeadlineReached]);

  useEffect(() => {
    firedRef.current = false;
    if (!phaseDeadlineMs || phaseDeadlineMs <= 0) {
      setRemainingMs(0);
      return undefined;
    }

    let frameId;
    const tick = () => {
      const nowAdjusted = Date.now() + serverOffsetMs;
      const next = Math.max(0, phaseDeadlineMs - nowAdjusted);
      setRemainingMs(next);

      if (next === 0 && !firedRef.current) {
        firedRef.current = true;
        if (typeof callbackRef.current === 'function') {
          callbackRef.current();
        }
        return;
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [phaseDeadlineMs, serverOffsetMs]);

  return {
    remainingMs,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    isExpired: remainingMs <= 0
  };
}
