import React, { useMemo, useState } from 'react';
import { FitnessProfile, AssessmentResult, BodyMeasurements, RecoveryLog, DailyWorkout, WorkoutExercise, ProgressPhoto } from '../types';
import {
  determineFitnessLevel,
  calculateBMI,
  calculateRecoveryScore,
  generateDailyWorkout,
  generateWeeklyPlan,
} from '../engine/fitnessEngine';
import { useTimer } from '../context/TimerContext';
import { IntelligenceSnapshot } from '../engine/intelligenceEngine';

interface FitnessTabProps {
  fitness: FitnessProfile;
  setFitness: React.Dispatch<React.SetStateAction<FitnessProfile>>;
  addXp: (amount: number) => void;
  intelligence: IntelligenceSnapshot;
  themeColor: string;
  secondaryThemeColor: string;
  accentColor: string;
}

type SubView = 'today' | 'assessment' | 'profile' | 'weekly' | 'skills' | 'recovery';

const focusLabels: Record<string, string> = {
  push: 'PUSH DAY',
  pull: 'PULL DAY',
  legs: 'LEG DAY',
  core: 'CORE DAY',
  mobility: 'MOBILITY',
  cardio: 'CARDIO',
  active_recovery: 'ACTIVE RECOVERY',
  rest: 'REST DAY',
};

export const FitnessTab: React.FC<FitnessTabProps> = ({
  fitness,
  setFitness,
  addXp,
  intelligence,
  themeColor,
  secondaryThemeColor,
  accentColor,
}) => {
  const [view, setView] = useState<SubView>('today');

  const fitnessLevel = fitness.latestAssessment ? fitness.latestAssessment.fitnessLevel : undefined;

  const todaysWorkout: DailyWorkout | null = useMemo(() => {
    if (!fitnessLevel) return null;
    const existing = fitness.workoutHistory.find(
      (w) => w.date === new Date().toISOString().slice(0, 10)
    );
    if (existing) return existing;
    const forceRecovery = intelligence.directive === 'recover';
    return generateDailyWorkout(fitness, fitnessLevel, forceRecovery ? 'active_recovery' : undefined);
  }, [fitness, fitnessLevel, intelligence.directive]);

  const persistTodaysWorkout = (workout: DailyWorkout) => {
    setFitness((prev) => {
      const others = prev.workoutHistory.filter((w) => w.date !== workout.date);
      return { ...prev, workoutHistory: [...others, workout] };
    });
  };

  React.useEffect(() => {
    if (todaysWorkout && !fitness.workoutHistory.find((w) => w.date === todaysWorkout.date)) {
      persistTodaysWorkout(todaysWorkout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaysWorkout?.date]);

  const toggleExerciseComplete = (block: 'warmup' | 'main' | 'cooldown', index: number) => {
    if (!todaysWorkout) return;
    const updated: DailyWorkout = {
      ...todaysWorkout,
      [block]: todaysWorkout[block].map((ex, i) =>
        i === index ? { ...ex, completed: !ex.completed } : ex
      ),
    };
    const allDone = [...updated.warmup, ...updated.main, ...updated.cooldown].every((e) => e.completed);
    if (allDone && !updated.completed) {
      updated.completed = true;
      addXp(updated.totalXp);
    } else if (!allDone && updated.completed) {
      updated.completed = false;
      addXp(-updated.totalXp);
    }
    persistTodaysWorkout(updated);
  };

  const navItems: { id: SubView; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: 'bolt' },
    { id: 'weekly', label: 'Week', icon: 'calendar_view_week' },
    { id: 'skills', label: 'Skills', icon: 'account_tree' },
    { id: 'recovery', label: 'Recovery', icon: 'bedtime' },
    { id: 'profile', label: 'Profile', icon: 'monitor_weight' },
  ];

  return (
    <div className="w-full text-left animate-in fade-in duration-500">
      {/* Sub-nav */}
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

      {!fitnessLevel && view !== 'assessment' && view !== 'profile' && (
        <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-6 text-center mb-4">
          <span className="material-symbols-outlined text-4xl mb-2 block" style={{ color: themeColor }}>
            assignment
          </span>
          <p className="font-mono text-sm text-[#e5e2e1] mb-1">NO BASELINE ON RECORD</p>
          <p className="text-xs text-[#9d9d9d] mb-4">
            Run the fitness assessment first so the engine can calibrate your workouts.
          </p>
          <button
            onClick={() => setView('assessment')}
            className="px-5 py-2 rounded-lg font-mono text-xs uppercase tracking-wider font-bold"
            style={{ background: themeColor, color: '#050505' }}
          >
            Start Assessment
          </button>
        </div>
      )}

      {view === 'today' && fitnessLevel && todaysWorkout && (
        <TodayView
          workout={todaysWorkout}
          fitnessLevel={fitnessLevel}
          onToggle={toggleExerciseComplete}
          themeColor={themeColor}
          secondaryThemeColor={secondaryThemeColor}
        />
      )}

      {view === 'assessment' && (
        <AssessmentView
          fitness={fitness}
          setFitness={setFitness}
          onDone={() => setView('today')}
          themeColor={themeColor}
        />
      )}

      {view === 'weekly' && (
        <WeeklyView fitness={fitness} setFitness={setFitness} themeColor={themeColor} />
      )}

      {view === 'skills' && (
        <SkillsProgressionView fitness={fitness} setFitness={setFitness} addXp={addXp} themeColor={themeColor} accentColor={accentColor} />
      )}

      {view === 'recovery' && (
        <RecoveryView fitness={fitness} setFitness={setFitness} themeColor={themeColor} />
      )}

      {view === 'profile' && (
        <PhysicalProfileView fitness={fitness} setFitness={setFitness} themeColor={themeColor} />
      )}
    </div>
  );
};

// =============================================================================
// TODAY'S WORKOUT
// =============================================================================
const ExerciseRow: React.FC<{
  ex: WorkoutExercise;
  onToggle: () => void;
  themeColor: string;
}> = ({ ex, onToggle, themeColor }) => {
  const { startInterval, startRest } = useTimer();

  const handleStartTimer = () => {
    if (ex.durationSeconds) {
      startInterval({
        label: ex.name,
        sets: ex.sets,
        workSeconds: ex.durationSeconds,
        restSeconds: ex.restSeconds,
        onComplete: () => {
          if (!ex.completed) onToggle();
        },
      });
    } else {
      startRest(ex.restSeconds, `${ex.name} · rest`);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg border mb-2"
      style={{ borderColor: ex.completed ? themeColor : '#1c1c1c', background: ex.completed ? `${themeColor}0d` : '#0a0a0a' }}
    >
      <button onClick={onToggle} className="shrink-0">
        <span
          className="material-symbols-outlined text-xl"
          style={{ color: ex.completed ? themeColor : '#444', fontVariationSettings: ex.completed ? "'FILL' 1" : "'FILL' 0" }}
        >
          {ex.completed ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${ex.completed ? 'text-[#9d9d9d] line-through' : 'text-[#e5e2e1]'}`}>
          {ex.name}
        </p>
        <p className="text-[11px] text-[#9d9d9d] font-mono">
          {ex.sets} × {ex.durationSeconds ? `${ex.durationSeconds}s` : ex.reps}
          {ex.tempo ? ` · tempo ${ex.tempo}` : ''} · rest {ex.restSeconds}s
        </p>
      </div>
      <button onClick={handleStartTimer} className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${themeColor}15` }}>
        <span className="material-symbols-outlined text-base" style={{ color: themeColor }}>
          timer
        </span>
      </button>
      <div className="text-right shrink-0">
        <p className="text-xs font-mono font-bold" style={{ color: themeColor }}>
          +{ex.xp} XP
        </p>
        <p className="text-[10px] text-[#666]">~{ex.estimatedMinutes}m</p>
      </div>
    </div>
  );
};

const TodayView: React.FC<{
  workout: DailyWorkout;
  fitnessLevel: string;
  onToggle: (block: 'warmup' | 'main' | 'cooldown', index: number) => void;
  themeColor: string;
  secondaryThemeColor: string;
}> = ({ workout, fitnessLevel, onToggle, themeColor, secondaryThemeColor }) => {
  const { startStopwatch } = useTimer();
  const totalExercises = workout.warmup.length + workout.main.length + workout.cooldown.length;
  const doneCount = [...workout.warmup, ...workout.main, ...workout.cooldown].filter((e) => e.completed).length;

  return (
    <div>
      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-xs uppercase tracking-wider" style={{ color: themeColor }}>
            {focusLabels[workout.focus]}
          </p>
          <p className="text-[11px] font-mono text-[#9d9d9d] capitalize">{fitnessLevel} tier</p>
        </div>
        <p className="text-xs text-[#9d9d9d] mb-3">{workout.intensityNote}</p>
        <div className="flex gap-4 text-xs font-mono mb-3">
          <span className="text-[#e5e2e1]">
            <span style={{ color: secondaryThemeColor }}>{doneCount}</span>/{totalExercises} done
          </span>
          <span className="text-[#e5e2e1]">~{workout.estimatedTotalMinutes} min</span>
          <span className="text-[#e5e2e1]">{workout.totalXp} XP total</span>
        </div>
        {workout.focus !== 'rest' && (
          <button
            onClick={() => startStopwatch(`${focusLabels[workout.focus]} session`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider border"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            <span className="material-symbols-outlined text-sm">play_circle</span>
            Time This Session
          </button>
        )}
      </div>

      {workout.focus === 'rest' ? (
        <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-6 text-center text-sm text-[#9d9d9d]">
          Full rest. No training prescribed today — let adaptation happen.
        </div>
      ) : (
        <>
          {workout.warmup.length > 0 && (
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#666] mb-2">Warm-up</p>
              {workout.warmup.map((ex, i) => (
                <ExerciseRow key={ex.exerciseId + i} ex={ex} onToggle={() => onToggle('warmup', i)} themeColor={themeColor} />
              ))}
            </div>
          )}
          <div className="mb-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#666] mb-2">Main Workout</p>
            {workout.main.map((ex, i) => (
              <ExerciseRow key={ex.exerciseId + i} ex={ex} onToggle={() => onToggle('main', i)} themeColor={themeColor} />
            ))}
          </div>
          {workout.cooldown.length > 0 && (
            <div className="mb-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#666] mb-2">Cool-down</p>
              {workout.cooldown.map((ex, i) => (
                <ExerciseRow key={ex.exerciseId + i} ex={ex} onToggle={() => onToggle('cooldown', i)} themeColor={themeColor} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// =============================================================================
// ASSESSMENT
// =============================================================================
const numField = (
  label: string,
  value: number,
  onChange: (v: number) => void,
  unit?: string
) => (
  <div className="mb-3">
    <label className="text-[11px] font-mono uppercase tracking-wider text-[#9d9d9d] block mb-1">
      {label} {unit ? `(${unit})` : ''}
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-[#e5e2e1] focus:outline-none"
    />
  </div>
);

const AssessmentView: React.FC<{
  fitness: FitnessProfile;
  setFitness: React.Dispatch<React.SetStateAction<FitnessProfile>>;
  onDone: () => void;
  themeColor: string;
}> = ({ fitness, setFitness, onDone, themeColor }) => {
  const [form, setForm] = useState<Omit<AssessmentResult, 'date' | 'fitnessLevel'>>({
    maxPushups: 10,
    pullups: 0,
    chinups: 0,
    dips: 0,
    plankSeconds: 30,
    sidePlankSeconds: 20,
    hollowHoldSeconds: 15,
    hangingKneeRaises: 3,
    maxSquats: 15,
    bulgarianSplitSquats: 8,
    walkingLunges: 10,
    wallSitSeconds: 30,
    run1kmSeconds: 360,
    shoulderMobility: 5,
    hamstringFlexibility: 5,
    hipMobility: 5,
    ankleMobility: 5,
  });

  const set = <K extends keyof typeof form>(k: K, v: number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    const level = determineFitnessLevel({ ...form, date: '', fitnessLevel: 'beginner' });
    const result: AssessmentResult = { ...form, date: new Date().toISOString(), fitnessLevel: level };
    setFitness((prev) => ({
      ...prev,
      latestAssessment: result,
      assessmentHistory: [...prev.assessmentHistory, result],
      weeklyPlan: generateWeeklyPlan(level),
    }));
    onDone();
  };

  return (
    <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
      <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
        Baseline Fitness Assessment
      </p>
      <p className="text-xs text-[#9d9d9d] mb-4">
        Do each test with good form and record your max. This calibrates every workout the engine generates.
      </p>

      <p className="text-[11px] font-mono uppercase text-[#666] mb-2">Upper Body</p>
      {numField('Max Push-ups', form.maxPushups, (v) => set('maxPushups', v))}
      {numField('Pull-ups', form.pullups, (v) => set('pullups', v))}
      {numField('Chin-ups', form.chinups, (v) => set('chinups', v))}
      {numField('Dips', form.dips, (v) => set('dips', v))}

      <p className="text-[11px] font-mono uppercase text-[#666] mb-2 mt-4">Core</p>
      {numField('Plank Hold', form.plankSeconds, (v) => set('plankSeconds', v), 'sec')}
      {numField('Side Plank Hold', form.sidePlankSeconds, (v) => set('sidePlankSeconds', v), 'sec')}
      {numField('Hollow Hold', form.hollowHoldSeconds, (v) => set('hollowHoldSeconds', v), 'sec')}
      {numField('Hanging Knee Raises', form.hangingKneeRaises, (v) => set('hangingKneeRaises', v))}

      <p className="text-[11px] font-mono uppercase text-[#666] mb-2 mt-4">Lower Body</p>
      {numField('Max Squats', form.maxSquats, (v) => set('maxSquats', v))}
      {numField('Bulgarian Split Squats', form.bulgarianSplitSquats, (v) => set('bulgarianSplitSquats', v))}
      {numField('Walking Lunges', form.walkingLunges, (v) => set('walkingLunges', v))}
      {numField('Wall Sit', form.wallSitSeconds, (v) => set('wallSitSeconds', v), 'sec')}

      <p className="text-[11px] font-mono uppercase text-[#666] mb-2 mt-4">Cardio</p>
      {numField('1km Run Time', form.run1kmSeconds || 0, (v) => set('run1kmSeconds', v), 'sec')}

      <p className="text-[11px] font-mono uppercase text-[#666] mb-2 mt-4">Mobility (self-rate 0-10)</p>
      {numField('Shoulder Mobility', form.shoulderMobility, (v) => set('shoulderMobility', v))}
      {numField('Hamstring Flexibility', form.hamstringFlexibility, (v) => set('hamstringFlexibility', v))}
      {numField('Hip Mobility', form.hipMobility, (v) => set('hipMobility', v))}
      {numField('Ankle Mobility', form.ankleMobility, (v) => set('ankleMobility', v))}

      <button
        onClick={handleSubmit}
        className="w-full mt-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold"
        style={{ background: themeColor, color: '#050505' }}
      >
        Submit Assessment
      </button>
    </div>
  );
};

// =============================================================================
// WEEKLY VIEW
// =============================================================================
const WeeklyView: React.FC<{
  fitness: FitnessProfile;
  setFitness: React.Dispatch<React.SetStateAction<FitnessProfile>>;
  themeColor: string;
}> = ({ fitness, setFitness, themeColor }) => {
  const [minutes, setMinutes] = useState(fitness.availableMinutesPerDay);

  const equipmentOptions: { id: FitnessProfile['availableEquipment'][number]; label: string }[] = [
    { id: 'pullup_bar', label: 'Pull-up Bar' },
    { id: 'resistance_bands', label: 'Resistance Bands' },
    { id: 'dip_bars', label: 'Dip Bars' },
    { id: 'jump_rope', label: 'Jump Rope' },
    { id: 'backpack', label: 'Backpack (loading)' },
  ];

  const toggleEquipment = (eq: (typeof equipmentOptions)[number]['id']) => {
    setFitness((prev) => ({
      ...prev,
      availableEquipment: prev.availableEquipment.includes(eq)
        ? prev.availableEquipment.filter((e) => e !== eq)
        : [...prev.availableEquipment, eq],
    }));
  };

  return (
    <div>
      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Weekly Split
        </p>
        {fitness.weeklyPlan.map((d) => (
          <div key={d.day} className="flex justify-between items-center py-2 border-b border-[#181818] last:border-0">
            <span className="text-sm text-[#e5e2e1] font-mono">{d.day}</span>
            <span className="text-xs font-mono" style={{ color: themeColor }}>
              {focusLabels[d.focus]}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Equipment On Hand
        </p>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((eq) => (
            <button
              key={eq.id}
              onClick={() => toggleEquipment(eq.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border"
              style={{
                borderColor: fitness.availableEquipment.includes(eq.id) ? themeColor : '#222',
                color: fitness.availableEquipment.includes(eq.id) ? themeColor : '#9d9d9d',
              }}
            >
              {eq.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#666] mt-2">Floor space & bodyweight always available. Unselected equipment triggers automatic exercise substitution.</p>
      </div>

      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Daily Time Budget
        </p>
        <input
          type="range"
          min={15}
          max={90}
          step={5}
          value={minutes}
          onChange={(e) => {
            const v = Number(e.target.value);
            setMinutes(v);
            setFitness((prev) => ({ ...prev, availableMinutesPerDay: v }));
          }}
          className="w-full"
        />
        <p className="text-sm text-[#e5e2e1] font-mono mt-1">{minutes} minutes / day</p>
      </div>
    </div>
  );
};

// =============================================================================
// SKILLS PROGRESSION
// =============================================================================
const SkillsProgressionView: React.FC<{
  fitness: FitnessProfile;
  setFitness: React.Dispatch<React.SetStateAction<FitnessProfile>>;
  addXp: (amount: number) => void;
  themeColor: string;
  accentColor: string;
}> = ({ fitness, setFitness, addXp, themeColor, accentColor }) => {
  const advanceMilestone = (skillId: string) => {
    setFitness((prev) => ({
      ...prev,
      skillProgressions: prev.skillProgressions.map((s) => {
        if (s.id !== skillId) return s;
        if (s.currentMilestoneIndex >= s.milestones.length - 1) return s;
        addXp(150);
        return { ...s, currentMilestoneIndex: s.currentMilestoneIndex + 1, currentValue: 0 };
      }),
    }));
  };

  return (
    <div className="space-y-3">
      {fitness.skillProgressions.map((skill) => {
        const milestone = skill.milestones[skill.currentMilestoneIndex];
        const isMaxed = skill.currentMilestoneIndex >= skill.milestones.length - 1;
        const locked =
          skill.prerequisiteId &&
          !fitness.skillProgressions.find((s) => s.id === skill.prerequisiteId && s.currentMilestoneIndex >= s.milestones.length - 1);

        return (
          <div
            key={skill.id}
            className="bg-[#0c0c0c] border rounded-xl p-4"
            style={{ borderColor: locked ? '#1c1c1c' : '#222', opacity: locked ? 0.5 : 1 }}
          >
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-[#e5e2e1]">{skill.title}</p>
              <span className="text-[10px] font-mono uppercase" style={{ color: accentColor }}>
                {skill.currentMilestoneIndex + 1}/{skill.milestones.length}
              </span>
            </div>
            <p className="text-xs text-[#9d9d9d] mb-2">{skill.description}</p>
            {locked ? (
              <p className="text-[11px] font-mono text-[#666]">
                Locked — master prerequisite skill first
              </p>
            ) : (
              <>
                <p className="text-xs font-mono mb-2" style={{ color: themeColor }}>
                  Current goal: {milestone.title}
                </p>
                <div className="w-full h-1.5 rounded-full bg-[#1c1c1c] mb-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((skill.currentMilestoneIndex + 1) / skill.milestones.length) * 100}%`,
                      background: themeColor,
                    }}
                  />
                </div>
                {!isMaxed ? (
                  <button
                    onClick={() => advanceMilestone(skill.id)}
                    className="text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    Mark Milestone Hit (+150 XP)
                  </button>
                ) : (
                  <p className="text-[11px] font-mono uppercase" style={{ color: secondaryColorFallback(themeColor) }}>
                    Skill Mastered
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

function secondaryColorFallback(c: string) {
  return c;
}

// =============================================================================
// RECOVERY
// =============================================================================
const RecoveryView: React.FC<{
  fitness: FitnessProfile;
  setFitness: React.Dispatch<React.SetStateAction<FitnessProfile>>;
  themeColor: string;
}> = ({ fitness, setFitness, themeColor }) => {
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [muscleSoreness, setMuscleSoreness] = useState(2);
  const [stressLevel, setStressLevel] = useState(2);

  const today = new Date().toISOString().slice(0, 10);
  const alreadyLogged = fitness.recoveryLogs.find((r) => r.date === today);

  const slider = (label: string, val: number, setter: (v: number) => void, max = 5) => (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <label className="text-[11px] font-mono uppercase tracking-wider text-[#9d9d9d]">{label}</label>
        <span className="text-xs font-mono" style={{ color: themeColor }}>{val}</span>
      </div>
      <input type="range" min={1} max={max} value={val} onChange={(e) => setter(Number(e.target.value))} className="w-full" />
    </div>
  );

  const submit = () => {
    const recoveryScore = calculateRecoveryScore({ sleepHours, sleepQuality, energyLevel, muscleSoreness, stressLevel });
    const log: RecoveryLog = { date: today, sleepHours, sleepQuality, energyLevel, muscleSoreness, stressLevel, recoveryScore };
    setFitness((prev) => ({
      ...prev,
      recoveryLogs: [...prev.recoveryLogs.filter((r) => r.date !== today), log],
      // force regeneration of today's workout with fresh recovery data
      workoutHistory: prev.workoutHistory.filter((w) => w.date !== today),
    }));
  };

  return (
    <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
      <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
        Daily Recovery Check-in
      </p>
      {alreadyLogged && (
        <p className="text-xs mb-3 font-mono" style={{ color: themeColor }}>
          Logged today — score {alreadyLogged.recoveryScore}/100. Resubmitting updates it.
        </p>
      )}
      {slider('Sleep Hours', sleepHours, setSleepHours, 10)}
      {slider('Sleep Quality', sleepQuality, setSleepQuality)}
      {slider('Energy Level', energyLevel, setEnergyLevel)}
      {slider('Muscle Soreness', muscleSoreness, setMuscleSoreness)}
      {slider('Stress Level', stressLevel, setStressLevel)}
      <button
        onClick={submit}
        className="w-full mt-2 py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold"
        style={{ background: themeColor, color: '#050505' }}
      >
        Log Recovery
      </button>

      {fitness.recoveryLogs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#1c1c1c]">
          <p className="text-[11px] font-mono uppercase text-[#666] mb-2">Recent Scores</p>
          {fitness.recoveryLogs.slice(-5).reverse().map((r) => (
            <div key={r.date} className="flex justify-between text-xs font-mono py-1">
              <span className="text-[#9d9d9d]">{r.date}</span>
              <span style={{ color: themeColor }}>{r.recoveryScore}/100</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// PHYSICAL PROFILE
// =============================================================================
const PhysicalProfileView: React.FC<{
  fitness: FitnessProfile;
  setFitness: React.Dispatch<React.SetStateAction<FitnessProfile>>;
  themeColor: string;
}> = ({ fitness, setFitness, themeColor }) => {
  const latest = fitness.measurements[fitness.measurements.length - 1];
  const [form, setForm] = useState<Omit<BodyMeasurements, 'date'>>({
    height: latest?.height || 175,
    weight: latest?.weight || 70,
    bodyFatPct: latest?.bodyFatPct,
    restingHeartRate: latest?.restingHeartRate,
    waist: latest?.waist,
    chest: latest?.chest,
    shoulders: latest?.shoulders,
    hips: latest?.hips,
    armLeft: latest?.armLeft,
    armRight: latest?.armRight,
    forearmLeft: latest?.forearmLeft,
    forearmRight: latest?.forearmRight,
    thighLeft: latest?.thighLeft,
    thighRight: latest?.thighRight,
    calfLeft: latest?.calfLeft,
    calfRight: latest?.calfRight,
  });

  const set = <K extends keyof typeof form>(k: K, v: number) => setForm((p) => ({ ...p, [k]: v }));

  const bmi = calculateBMI(form.height, form.weight);

  const saveMeasurement = () => {
    const entry: BodyMeasurements = { ...form, date: new Date().toISOString() };
    setFitness((prev) => ({ ...prev, measurements: [...prev.measurements, entry] }));
  };

  const handlePhotoUpload = (angle: ProgressPhoto['angle'], file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const photo: ProgressPhoto = {
        id: `photo-${Date.now()}`,
        date: new Date().toISOString(),
        angle,
        dataUrl: reader.result as string,
      };
      setFitness((prev) => ({ ...prev, photos: [...prev.photos, photo] }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Physical Profile
        </p>
        <div className="grid grid-cols-2 gap-x-3">
          {numField('Height', form.height, (v) => set('height', v), 'cm')}
          {numField('Weight', form.weight, (v) => set('weight', v), 'kg')}
          {numField('Body Fat', form.bodyFatPct || 0, (v) => set('bodyFatPct', v), '%')}
          {numField('Resting HR', form.restingHeartRate || 0, (v) => set('restingHeartRate', v), 'bpm')}
          {numField('Waist', form.waist || 0, (v) => set('waist', v), 'cm')}
          {numField('Chest', form.chest || 0, (v) => set('chest', v), 'cm')}
          {numField('Shoulders', form.shoulders || 0, (v) => set('shoulders', v), 'cm')}
          {numField('Hips', form.hips || 0, (v) => set('hips', v), 'cm')}
          {numField('Arm L', form.armLeft || 0, (v) => set('armLeft', v), 'cm')}
          {numField('Arm R', form.armRight || 0, (v) => set('armRight', v), 'cm')}
          {numField('Forearm L', form.forearmLeft || 0, (v) => set('forearmLeft', v), 'cm')}
          {numField('Forearm R', form.forearmRight || 0, (v) => set('forearmRight', v), 'cm')}
          {numField('Thigh L', form.thighLeft || 0, (v) => set('thighLeft', v), 'cm')}
          {numField('Thigh R', form.thighRight || 0, (v) => set('thighRight', v), 'cm')}
          {numField('Calf L', form.calfLeft || 0, (v) => set('calfLeft', v), 'cm')}
          {numField('Calf R', form.calfRight || 0, (v) => set('calfRight', v), 'cm')}
        </div>
        <p className="text-xs font-mono text-[#9d9d9d] mb-3">BMI: <span style={{ color: themeColor }}>{bmi}</span></p>
        <button
          onClick={saveMeasurement}
          className="w-full py-3 rounded-lg font-mono text-xs uppercase tracking-wider font-bold"
          style={{ background: themeColor, color: '#050505' }}
        >
          Save Measurement Entry
        </button>
      </div>

      <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4 mb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
          Progress Photos
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['front', 'side', 'back'] as const).map((angle) => {
            const photosForAngle = fitness.photos.filter((p) => p.angle === angle);
            const latestPhoto = photosForAngle[photosForAngle.length - 1];
            return (
              <label key={angle} className="cursor-pointer">
                <div className="aspect-[3/4] rounded-lg border border-dashed border-[#333] bg-[#0a0a0a] flex items-center justify-center overflow-hidden mb-1">
                  {latestPhoto ? (
                    <img src={latestPhoto.dataUrl} alt={angle} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-2xl text-[#444]">add_a_photo</span>
                  )}
                </div>
                <p className="text-[10px] text-center font-mono uppercase text-[#9d9d9d]">{angle}</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(angle, file);
                  }}
                />
              </label>
            );
          })}
        </div>
        <p className="text-[10px] text-[#666] mt-2">Stored locally on this device only.</p>
      </div>

      {fitness.measurements.length > 0 && (
        <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
          <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
            History
          </p>
          {fitness.measurements.slice(-6).reverse().map((m, i) => (
            <div key={i} className="flex justify-between text-xs font-mono py-1 border-b border-[#181818] last:border-0">
              <span className="text-[#9d9d9d]">{new Date(m.date).toLocaleDateString()}</span>
              <span className="text-[#e5e2e1]">{m.weight}kg · BMI {calculateBMI(m.height, m.weight)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
