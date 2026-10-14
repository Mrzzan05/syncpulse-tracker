import { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../../core/audio';

export type TimerMode = 'pomodoro' | 'stopwatch' | 'break';

// Isolated timer hook: 1-second ticks only update components that subscribe to it!
export function useFocusTimer(onPresenceChange?: (isRunning: boolean, mode: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>(() => {
    return (localStorage.getItem('sp_timer_mode') as TimerMode) || 'pomodoro';
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    return localStorage.getItem('sp_timer_running') === 'true';
  });
  const [startedAtMs, setStartedAtMs] = useState<number | null>(() => {
    const s = localStorage.getItem('sp_timer_start');
    return s ? Number(s) : null;
  });
  const [accumulatedSec, setAccumulatedSec] = useState<number>(() => {
    return Number(localStorage.getItem('sp_timer_acc') || 0);
  });
  const [displaySeconds, setDisplaySeconds] = useState<number>(25 * 60);

  useEffect(() => {
    localStorage.setItem('sp_timer_mode', mode);
    localStorage.setItem('sp_timer_running', String(isRunning));
    if (startedAtMs) localStorage.setItem('sp_timer_start', String(startedAtMs));
    else localStorage.removeItem('sp_timer_start');
    localStorage.setItem('sp_timer_acc', String(accumulatedSec));
  }, [mode, isRunning, startedAtMs, accumulatedSec]);

  useEffect(() => {
    const tick = () => {
      const activeElapsed =
        isRunning && startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
      const totalElapsed = accumulatedSec + activeElapsed;

      if (mode === 'stopwatch') {
        setDisplaySeconds(totalElapsed);
      } else {
        const target = mode === 'pomodoro' ? 25 * 60 : 5 * 60;
        const remaining = Math.max(0, target - totalElapsed);
        setDisplaySeconds(remaining);
        if (remaining === 0 && isRunning) {
          setIsRunning(false);
          setStartedAtMs(null);
          setAccumulatedSec(target);
          soundEngine.playChime();
          onPresenceChange?.(false, mode);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startedAtMs, accumulatedSec, mode, onPresenceChange]);

  const toggle = useCallback(() => {
    if (isRunning) {
      const elapsed = startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
      setAccumulatedSec((prev) => prev + elapsed);
      setStartedAtMs(null);
      setIsRunning(false);
      onPresenceChange?.(false, mode);
    } else {
      setStartedAtMs(Date.now());
      setIsRunning(true);
      onPresenceChange?.(true, mode);
    }
  }, [isRunning, startedAtMs, mode, onPresenceChange]);

  const reset = useCallback(
    (newMode: TimerMode = mode) => {
      setIsRunning(false);
      setStartedAtMs(null);
      setAccumulatedSec(0);
      setMode(newMode);
      onPresenceChange?.(false, newMode);
    },
    [mode, onPresenceChange]
  );

  const getElapsedMinutes = useCallback((): number => {
    const activeElapsed =
      isRunning && startedAtMs ? Math.floor((Date.now() - startedAtMs) / 1000) : 0;
    return Math.floor((accumulatedSec + activeElapsed) / 60);
  }, [isRunning, startedAtMs, accumulatedSec]);

  return {
    mode,
    isRunning,
    displaySeconds,
    elapsedMinutes: getElapsedMinutes(),
    toggle,
    reset
  };
}
