import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type TimerMode = 'pomodoro' | 'stopwatch' | 'countdown' | 'interval' | 'rest';
export type TimerPhase = 'work' | 'break' | 'rest' | 'running';

export interface TimerState {
  mode: TimerMode;
  label: string;
  phase: TimerPhase;
  secondsRemaining: number; // for countdown-driven phases
  elapsedSeconds: number; // for stopwatch, and overall elapsed tracking
  totalCycles: number; // for interval/pomodoro: number of work phases
  currentCycle: number; // 1-indexed
  isPaused: boolean;
  isActive: boolean;
}

interface StartIntervalOpts {
  label: string;
  sets: number;
  workSeconds: number;
  restSeconds: number;
  onComplete?: () => void;
}

interface StartPomodoroOpts {
  label: string;
  totalMinutes: number;
  workMinutes?: number;
  breakMinutes?: number;
  onComplete?: () => void;
}

interface TimerContextValue {
  timer: TimerState | null;
  startCountdown: (seconds: number, label: string, onComplete?: () => void) => void;
  startStopwatch: (label: string) => void;
  startInterval: (opts: StartIntervalOpts) => void;
  startPomodoro: (opts: StartPomodoroOpts) => void;
  startRest: (seconds: number, label: string, onComplete?: () => void) => void;
  pause: () => void;
  resume: () => void;
  skipPhase: () => void;
  finishStopwatch: () => void;
  cancel: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

const defaultState = (): TimerState => ({
  mode: 'countdown',
  label: '',
  phase: 'running',
  secondsRemaining: 0,
  elapsedSeconds: 0,
  totalCycles: 1,
  currentCycle: 1,
  isPaused: false,
  isActive: false,
});

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const onCompleteRef = useRef<(() => void) | undefined>(undefined);
  const intervalOptsRef = useRef<StartIntervalOpts | null>(null);
  const pomodoroOptsRef = useRef<(StartPomodoroOpts & { workSeconds: number; breakSeconds: number }) | null>(null);

  const tick = useCallback(() => {
    setTimer((prev) => {
      if (!prev || prev.isPaused || !prev.isActive) return prev;

      if (prev.mode === 'stopwatch') {
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      }

      const nextRemaining = prev.secondsRemaining - 1;
      if (nextRemaining > 0) {
        return { ...prev, secondsRemaining: nextRemaining, elapsedSeconds: prev.elapsedSeconds + 1 };
      }

      // phase/cycle boundary hit
      if (prev.mode === 'countdown' || prev.mode === 'rest') {
        onCompleteRef.current?.();
        return null;
      }

      if (prev.mode === 'interval') {
        const opts = intervalOptsRef.current;
        if (!opts) return null;
        if (prev.phase === 'work') {
          if (prev.currentCycle >= opts.sets) {
            onCompleteRef.current?.();
            return null;
          }
          return {
            ...prev,
            phase: 'rest',
            secondsRemaining: opts.restSeconds,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        }
        // was resting -> move to next work set
        return {
          ...prev,
          phase: 'work',
          currentCycle: prev.currentCycle + 1,
          secondsRemaining: opts.workSeconds,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      }

      if (prev.mode === 'pomodoro') {
        const opts = pomodoroOptsRef.current;
        if (!opts) return null;
        if (prev.phase === 'work') {
          if (prev.currentCycle >= prev.totalCycles) {
            onCompleteRef.current?.();
            return null;
          }
          return {
            ...prev,
            phase: 'break',
            secondsRemaining: opts.breakSeconds,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        }
        return {
          ...prev,
          phase: 'work',
          currentCycle: prev.currentCycle + 1,
          secondsRemaining: opts.workSeconds,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    if (!timer || !timer.isActive || timer.isPaused) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timer?.isActive, timer?.isPaused, tick]);

  const startCountdown = useCallback((seconds: number, label: string, onComplete?: () => void) => {
    onCompleteRef.current = onComplete;
    setTimer({ ...defaultState(), mode: 'countdown', label, secondsRemaining: seconds, isActive: true });
  }, []);

  const startRest = useCallback((seconds: number, label: string, onComplete?: () => void) => {
    onCompleteRef.current = onComplete;
    setTimer({ ...defaultState(), mode: 'rest', phase: 'rest', label, secondsRemaining: seconds, isActive: true });
  }, []);

  const startStopwatch = useCallback((label: string) => {
    onCompleteRef.current = undefined;
    setTimer({ ...defaultState(), mode: 'stopwatch', label, isActive: true });
  }, []);

  const startInterval = useCallback((opts: StartIntervalOpts) => {
    intervalOptsRef.current = opts;
    onCompleteRef.current = opts.onComplete;
    setTimer({
      ...defaultState(),
      mode: 'interval',
      label: opts.label,
      phase: 'work',
      secondsRemaining: opts.workSeconds,
      totalCycles: opts.sets,
      currentCycle: 1,
      isActive: true,
    });
  }, []);

  const startPomodoro = useCallback((opts: StartPomodoroOpts) => {
    const workMinutes = opts.workMinutes ?? 25;
    const breakMinutes = opts.breakMinutes ?? 5;
    const totalCycles = Math.max(1, Math.round(opts.totalMinutes / workMinutes));
    pomodoroOptsRef.current = { ...opts, workSeconds: workMinutes * 60, breakSeconds: breakMinutes * 60 };
    onCompleteRef.current = opts.onComplete;
    setTimer({
      ...defaultState(),
      mode: 'pomodoro',
      label: opts.label,
      phase: 'work',
      secondsRemaining: workMinutes * 60,
      totalCycles,
      currentCycle: 1,
      isActive: true,
    });
  }, []);

  const pause = useCallback(() => setTimer((prev) => (prev ? { ...prev, isPaused: true } : prev)), []);
  const resume = useCallback(() => setTimer((prev) => (prev ? { ...prev, isPaused: false } : prev)), []);

  const skipPhase = useCallback(() => {
    // force the remaining seconds to 1 so the next tick resolves the boundary
    setTimer((prev) => (prev ? { ...prev, secondsRemaining: 1 } : prev));
  }, []);

  const finishStopwatch = useCallback(() => {
    setTimer(null);
  }, []);

  const cancel = useCallback(() => {
    onCompleteRef.current = undefined;
    setTimer(null);
  }, []);

  return (
    <TimerContext.Provider
      value={{ timer, startCountdown, startStopwatch, startInterval, startPomodoro, startRest, pause, resume, skipPhase, finishStopwatch, cancel }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within a TimerProvider');
  return ctx;
}
