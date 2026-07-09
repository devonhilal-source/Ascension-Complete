import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';

const phaseLabels: Record<string, string> = {
  work: 'WORK',
  break: 'BREAK',
  rest: 'REST',
  running: '',
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const TimerWidget: React.FC<{ themeColor: string; secondaryThemeColor: string }> = ({ themeColor, secondaryThemeColor }) => {
  const { timer, pause, resume, skipPhase, finishStopwatch, cancel } = useTimer();
  const [expanded, setExpanded] = useState(false);

  if (!timer) return null;

  const isStopwatch = timer.mode === 'stopwatch';
  const displaySeconds = isStopwatch ? timer.elapsedSeconds : timer.secondsRemaining;
  const phaseColor = timer.phase === 'rest' || timer.phase === 'break' ? secondaryThemeColor : themeColor;

  return (
    <div
      className="fixed left-0 right-0 z-40 px-3 transition-all"
      style={{ bottom: expanded ? '4.5rem' : '4.5rem' }}
    >
      <div
        className="mx-auto max-w-md rounded-xl border shadow-lg backdrop-blur-md"
        style={{ borderColor: phaseColor, background: '#0a0a0aee' }}
      >
        <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer" onClick={() => setExpanded((e) => !e)}>
          <span className="material-symbols-outlined text-xl" style={{ color: phaseColor }}>
            timer
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#9d9d9d] truncate">
              {timer.label} {phaseLabels[timer.phase] ? `· ${phaseLabels[timer.phase]}` : ''}
              {timer.mode === 'interval' || timer.mode === 'pomodoro' ? ` · ${timer.currentCycle}/${timer.totalCycles}` : ''}
            </p>
            <p className="text-lg font-mono font-bold" style={{ color: phaseColor }}>
              {formatTime(displaySeconds)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              timer.isPaused ? resume() : pause();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${phaseColor}22` }}
          >
            <span className="material-symbols-outlined text-lg" style={{ color: phaseColor }}>
              {timer.isPaused ? 'play_arrow' : 'pause'}
            </span>
          </button>
        </div>

        {expanded && (
          <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-1 border-t border-[#1c1c1c]">
            {isStopwatch ? (
              <button
                onClick={finishStopwatch}
                className="flex-1 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider font-bold"
                style={{ background: themeColor, color: '#050505' }}
              >
                Finish
              </button>
            ) : (
              <button
                onClick={skipPhase}
                className="flex-1 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider border"
                style={{ borderColor: '#333', color: '#9d9d9d' }}
              >
                Skip Phase
              </button>
            )}
            <button
              onClick={cancel}
              className="flex-1 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider border"
              style={{ borderColor: '#442222', color: '#c0665f' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
