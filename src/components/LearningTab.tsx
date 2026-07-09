import React, { useMemo, useState } from 'react';
import { LearningProfile, LearningSession, LearningSubject, DailyLearningPlan } from '../types';
import { learningRoadmap, getTopicsBySubject } from '../data/learningRoadmap';
import {
  generateDailyLearningPlan,
  isTopicUnlocked,
  subjectProgress,
  overallRoadmapProgress,
  ALL_SUBJECTS,
} from '../engine/learningEngine';
import { useTimer } from '../context/TimerContext';
import { IntelligenceSnapshot } from '../engine/intelligenceEngine';

interface LearningTabProps {
  learning: LearningProfile;
  setLearning: React.Dispatch<React.SetStateAction<LearningProfile>>;
  addXp: (amount: number) => void;
  intelligence: IntelligenceSnapshot;
  themeColor: string;
  secondaryThemeColor: string;
  accentColor: string;
}

type SubView = 'today' | 'roadmap' | 'settings';

const subjectLabels: Record<LearningSubject, string> = {
  linux: 'Linux',
  python: 'Python',
  networking: 'Networking',
  cybersecurity: 'Cybersecurity',
  ctf: 'CTF Practice',
  web: 'Web',
};

const subjectIcons: Record<LearningSubject, string> = {
  linux: 'terminal',
  python: 'code',
  networking: 'lan',
  cybersecurity: 'security',
  ctf: 'flag',
  web: 'public',
};

export const LearningTab: React.FC<LearningTabProps> = ({
  learning,
  setLearning,
  addXp,
  intelligence,
  themeColor,
  secondaryThemeColor,
  accentColor,
}) => {
  const [view, setView] = useState<SubView>('today');

  const todaysPlan: DailyLearningPlan = useMemo(() => {
    const isoDate = new Date().toISOString().slice(0, 10);
    const existing = learning.planHistory.find((p) => p.date === isoDate);
    if (existing) return existing;
    const missedYesterday = intelligence.directive === 'recover' || intelligence.missedSessions7 >= 2;
    return generateDailyLearningPlan(learning, new Date(), missedYesterday);
  }, [learning, intelligence.directive, intelligence.missedSessions7]);

  React.useEffect(() => {
    if (!learning.planHistory.find((p) => p.date === todaysPlan.date)) {
      setLearning((prev) => ({ ...prev, planHistory: [...prev.planHistory, todaysPlan] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysPlan.date]);

  const persistPlan = (plan: DailyLearningPlan) => {
    setLearning((prev) => ({
      ...prev,
      planHistory: [...prev.planHistory.filter((p) => p.date !== plan.date), plan],
    }));
  };

  const toggleSessionComplete = (index: number) => {
    const session = todaysPlan.sessions[index];
    const wasCompleted = !!session.completed;
    const updatedSessions = todaysPlan.sessions.map((s, i) => (i === index ? { ...s, completed: !s.completed } : s));
    const updatedPlan: DailyLearningPlan = { ...todaysPlan, sessions: updatedSessions };
    const allDone = updatedSessions.every((s) => s.completed);
    if (allDone && !updatedPlan.completed) updatedPlan.completed = true;
    if (!allDone && updatedPlan.completed) updatedPlan.completed = false;
    persistPlan(updatedPlan);

    if (!wasCompleted) {
      addXp(session.xp);
      setLearning((prev) => ({
        ...prev,
        completedTopicIds: prev.completedTopicIds.includes(session.topicId)
          ? prev.completedTopicIds
          : [...prev.completedTopicIds, session.topicId],
      }));
    } else {
      addXp(-session.xp);
      setLearning((prev) => ({
        ...prev,
        completedTopicIds: prev.completedTopicIds.filter((id) => id !== session.topicId),
      }));
    }
  };

  const navItems: { id: SubView; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: 'school' },
    { id: 'roadmap', label: 'Roadmap', icon: 'route' },
    { id: 'settings', label: 'Settings', icon: 'tune' },
  ];

  const overall = overallRoadmapProgress(learning.completedTopicIds);

  return (
    <div className="w-full text-left animate-in fade-in duration-500">
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-wider whitespace-nowrap border transition-all"
            style={{
              borderColor: view === item.id ? themeColor : '#222',
              color: view === item.id ? themeColor : '#9d9d9d',
              background: view === item.id ? `${themeColor}11` : 'transparent',
            }}
          >
            <span className="material-symbols-outlined text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-2 font-mono text-[11px] text-[#9d9d9d] whitespace-nowrap">
          {overall.done}/{overall.total} topics
        </div>
      </div>

      {view === 'today' && (
        <div
          className="rounded-xl border p-3 mb-4 flex items-start gap-2.5"
          style={{
            borderColor: intelligence.directive === 'recover' ? '#5a3a3a' : intelligence.directive === 'push' ? themeColor : '#222',
            background: intelligence.directive === 'recover' ? '#2a1a1a33' : '#0c0c0c',
          }}
        >
          <span className="material-symbols-outlined text-base mt-0.5" style={{ color: intelligence.directive === 'recover' ? '#c0665f' : themeColor }}>
            psychology
          </span>
          <p className="text-xs text-[#9d9d9d] leading-snug">{intelligence.headline}</p>
        </div>
      )}

      {view === 'today' && (
        <TodayView plan={todaysPlan} onToggle={toggleSessionComplete} themeColor={themeColor} secondaryThemeColor={secondaryThemeColor} />
      )}

      {view === 'roadmap' && (
        <RoadmapView learning={learning} themeColor={themeColor} accentColor={accentColor} />
      )}

      {view === 'settings' && (
        <SettingsView learning={learning} setLearning={setLearning} themeColor={themeColor} />
      )}
    </div>
  );
};

// =============================================================================
// TODAY
// =============================================================================
const SessionCard: React.FC<{
  session: LearningSession;
  onToggle: () => void;
  themeColor: string;
  secondaryThemeColor: string;
}> = ({ session, onToggle, themeColor, secondaryThemeColor }) => {
  const [expanded, setExpanded] = useState(false);
  const { startPomodoro } = useTimer();

  const handleStartTimer = () => {
    const workMinutes = Math.min(25, session.estimatedMinutes);
    startPomodoro({
      label: session.title,
      totalMinutes: session.estimatedMinutes,
      workMinutes,
      breakMinutes: 5,
      onComplete: () => {
        if (!session.completed) onToggle();
      },
    });
  };

  return (
    <div
      className="rounded-xl border mb-3 overflow-hidden"
      style={{ borderColor: session.completed ? themeColor : '#222', background: session.completed ? `${themeColor}0d` : '#0c0c0c' }}
    >
      <div className="flex items-start gap-3 p-4">
        <button onClick={onToggle} className="shrink-0 mt-0.5">
          <span
            className="material-symbols-outlined text-xl"
            style={{ color: session.completed ? themeColor : '#444', fontVariationSettings: session.completed ? "'FILL' 1" : "'FILL' 0" }}
          >
            {session.completed ? 'check_circle' : 'radio_button_unchecked'}
          </span>
        </button>
        <div className="flex-1 min-w-0" onClick={() => setExpanded((e) => !e)}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: secondaryThemeColor }}>
              {subjectLabels[session.subject]}
            </p>
            <p className="text-xs font-mono font-bold shrink-0" style={{ color: themeColor }}>
              +{session.xp} XP
            </p>
          </div>
          <p className={`text-sm font-semibold ${session.completed ? 'text-[#9d9d9d] line-through' : 'text-[#e5e2e1]'}`}>
            {session.title}
          </p>
          <p className="text-[11px] text-[#9d9d9d] font-mono mt-0.5">
            {session.estimatedMinutes} min · tier {session.difficultyTier}/10
          </p>
        </div>
        {!session.completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartTimer();
            }}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
            style={{ background: `${themeColor}15` }}
          >
            <span className="material-symbols-outlined text-base" style={{ color: themeColor }}>
              timer
            </span>
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[#1c1c1c]">
          <p className="text-[11px] font-mono uppercase text-[#666] mt-2 mb-1">Subtopics</p>
          <ul className="text-xs text-[#9d9d9d] list-disc list-inside mb-2 space-y-0.5">
            {session.subtopics.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          <p className="text-[11px] font-mono uppercase text-[#666] mb-1">Objective</p>
          <p className="text-xs text-[#e5e2e1] mb-2">{session.objective}</p>
          <p className="text-[11px] font-mono uppercase text-[#666] mb-1">Learn From</p>
          <p className="text-xs text-[#e5e2e1] mb-2">{session.resource.name} · {session.resource.platform}</p>
          <p className="text-[11px] font-mono uppercase text-[#666] mb-1">Practical Exercise</p>
          <p className="text-xs text-[#e5e2e1] mb-2">{session.practicalExercise}</p>
          <p className="text-[11px] font-mono uppercase text-[#666] mb-1">Mini Challenge</p>
          <p className="text-xs text-[#e5e2e1]">{session.miniChallenge}</p>
        </div>
      )}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-[#666] py-1.5 border-t border-[#1c1c1c]"
      >
        {expanded ? 'Collapse' : 'View details'}
      </button>
    </div>
  );
};

const TodayView: React.FC<{
  plan: DailyLearningPlan;
  onToggle: (index: number) => void;
  themeColor: string;
  secondaryThemeColor: string;
}> = ({ plan, onToggle, themeColor, secondaryThemeColor }) => {
  const doneCount = plan.sessions.filter((s) => s.completed).length;

  return (
    <div>
      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: themeColor }}>
          Today's Learning Schedule
        </p>
        <div className="flex gap-4 text-xs font-mono mt-2">
          <span className="text-[#e5e2e1]">
            <span style={{ color: secondaryThemeColor }}>{doneCount}</span>/{plan.sessions.length} sessions
          </span>
          <span className="text-[#e5e2e1]">{plan.totalMinutes} min total</span>
          <span className="text-[#e5e2e1]">{plan.totalXp} XP total</span>
        </div>
      </div>

      {plan.sessions.length === 0 ? (
        <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-6 text-center text-sm text-[#9d9d9d]">
          No sessions scheduled — either your roadmap is fully cleared or no focus subjects are selected. Check Settings.
        </div>
      ) : (
        plan.sessions.map((s, i) => (
          <SessionCard key={s.topicId} session={s} onToggle={() => onToggle(i)} themeColor={themeColor} secondaryThemeColor={secondaryThemeColor} />
        ))
      )}
    </div>
  );
};

// =============================================================================
// ROADMAP
// =============================================================================
const RoadmapView: React.FC<{
  learning: LearningProfile;
  themeColor: string;
  accentColor: string;
}> = ({ learning, themeColor, accentColor }) => {
  return (
    <div className="space-y-4">
      {ALL_SUBJECTS.map((subject) => {
        const topics = getTopicsBySubject(subject);
        if (topics.length === 0) return null;
        const progress = subjectProgress(subject, learning.completedTopicIds);
        return (
          <div key={subject} className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg" style={{ color: themeColor }}>
                  {subjectIcons[subject]}
                </span>
                <p className="text-sm font-bold text-[#e5e2e1]">{subjectLabels[subject]}</p>
              </div>
              <span className="text-[11px] font-mono" style={{ color: accentColor }}>
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="space-y-2">
              {topics.map((topic) => {
                const completed = learning.completedTopicIds.includes(topic.id);
                const unlocked = isTopicUnlocked(topic, learning.completedTopicIds);
                return (
                  <div
                    key={topic.id}
                    className="flex items-center gap-2 py-1.5"
                    style={{ opacity: completed ? 0.6 : unlocked ? 1 : 0.35 }}
                  >
                    <span
                      className="material-symbols-outlined text-base shrink-0"
                      style={{ color: completed ? themeColor : unlocked ? '#9d9d9d' : '#444' }}
                    >
                      {completed ? 'check_circle' : unlocked ? 'radio_button_unchecked' : 'lock'}
                    </span>
                    <span className={`text-xs ${completed ? 'text-[#9d9d9d] line-through' : 'text-[#e5e2e1]'}`}>
                      {topic.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#666] ml-auto shrink-0">tier {topic.difficultyTier}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// =============================================================================
// SETTINGS
// =============================================================================
const SettingsView: React.FC<{
  learning: LearningProfile;
  setLearning: React.Dispatch<React.SetStateAction<LearningProfile>>;
  themeColor: string;
}> = ({ learning, setLearning, themeColor }) => {
  const toggleSubject = (subject: LearningSubject) => {
    setLearning((prev) => ({
      ...prev,
      focusSubjects: prev.focusSubjects.includes(subject)
        ? prev.focusSubjects.filter((s) => s !== subject)
        : [...prev.focusSubjects, subject],
    }));
  };

  return (
    <div>
      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Focus Subjects
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_SUBJECTS.map((subject) => (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1.5"
              style={{
                borderColor: learning.focusSubjects.includes(subject) ? themeColor : '#222',
                color: learning.focusSubjects.includes(subject) ? themeColor : '#9d9d9d',
              }}
            >
              <span className="material-symbols-outlined text-sm">{subjectIcons[subject]}</span>
              {subjectLabels[subject]}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#666] mt-2">
          The scheduler round-robins across these subjects each day, respecting prerequisite order in each roadmap.
        </p>
      </div>

      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Daily Time Budget
        </p>
        <input
          type="range"
          min={20}
          max={180}
          step={10}
          value={learning.availableMinutesPerDay}
          onChange={(e) => setLearning((prev) => ({ ...prev, availableMinutesPerDay: Number(e.target.value) }))}
          className="w-full"
        />
        <p className="text-sm text-[#e5e2e1] font-mono mt-1">{learning.availableMinutesPerDay} minutes / day</p>
      </div>
    </div>
  );
};
