import {
  AssessmentResult,
  DailyWorkout,
  Equipment,
  ExerciseDef,
  FitnessLevel,
  FitnessProfile,
  RecoveryLog,
  WeeklyPlanDay,
  WorkoutExercise,
} from '../types';
import { exerciseLibrary, getExercisesByPattern } from '../data/exerciseLibrary';

// ---------------------------------------------------------------------------
// BMI
// ---------------------------------------------------------------------------
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

// ---------------------------------------------------------------------------
// FITNESS LEVEL SCORING
// Each metric is scored 0-4 (beginner..elite) against rough population norms
// for an adult male; the overall level is the rounded weighted average.
// ---------------------------------------------------------------------------
function scoreMetric(value: number, thresholds: number[]): number {
  // thresholds = [noviceMin, intermediateMin, advancedMin, eliteMin]
  let score = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) score = i + 1;
  }
  return score; // 0-4
}

const LEVELS: FitnessLevel[] = ['beginner', 'novice', 'intermediate', 'advanced', 'elite'];

export function determineFitnessLevel(a: AssessmentResult): FitnessLevel {
  const scores: number[] = [
    scoreMetric(a.maxPushups, [10, 20, 35, 50]),
    scoreMetric(a.pullups, [1, 5, 10, 18]),
    scoreMetric(a.plankSeconds, [30, 60, 120, 180]),
    scoreMetric(a.maxSquats, [15, 30, 50, 70]),
    scoreMetric(a.wallSitSeconds, [30, 60, 100, 150]),
    scoreMetric(a.hangingKneeRaises, [3, 8, 15, 25]),
  ];
  if (a.run1kmSeconds) {
    // faster = better; invert by scoring against ceilings
    const t = a.run1kmSeconds;
    let s = 0;
    if (t <= 330) s = 4;
    else if (t <= 390) s = 3;
    else if (t <= 450) s = 2;
    else if (t <= 540) s = 1;
    scores.push(s);
  }
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  const idx = Math.min(4, Math.max(0, Math.round(avg)));
  return LEVELS[idx];
}

export function fitnessLevelToTierCeiling(level: FitnessLevel): number {
  switch (level) {
    case 'beginner':
      return 3;
    case 'novice':
      return 5;
    case 'intermediate':
      return 6;
    case 'advanced':
      return 8;
    case 'elite':
      return 10;
  }
}

export function fitnessLevelToTierFloor(level: FitnessLevel): number {
  switch (level) {
    case 'beginner':
      return 1;
    case 'novice':
      return 2;
    case 'intermediate':
      return 3;
    case 'advanced':
      return 5;
    case 'elite':
      return 7;
  }
}

// ---------------------------------------------------------------------------
// RECOVERY SCORE (0-100)
// ---------------------------------------------------------------------------
export function calculateRecoveryScore(log: Omit<RecoveryLog, 'recoveryScore' | 'date'>): number {
  const sleepScore = Math.min(1, log.sleepHours / 8) * 35; // up to 35 pts
  const sleepQualScore = (log.sleepQuality / 5) * 20; // up to 20
  const energyScore = (log.energyLevel / 5) * 20; // up to 20
  const sorenessScore = ((5 - log.muscleSoreness) / 4) * 15; // up to 15, inverted
  const stressScore = ((5 - log.stressLevel) / 4) * 10; // up to 10, inverted
  const total = sleepScore + sleepQualScore + energyScore + sorenessScore + stressScore;
  return Math.round(Math.max(0, Math.min(100, total)));
}

// ---------------------------------------------------------------------------
// WEEKLY SPLIT
// ---------------------------------------------------------------------------
export function generateWeeklyPlan(level: FitnessLevel): WeeklyPlanDay[] {
  if (level === 'beginner' || level === 'novice') {
    return [
      { day: 'Mon', focus: 'push' },
      { day: 'Tue', focus: 'mobility' },
      { day: 'Wed', focus: 'pull' },
      { day: 'Thu', focus: 'active_recovery' },
      { day: 'Fri', focus: 'legs' },
      { day: 'Sat', focus: 'cardio' },
      { day: 'Sun', focus: 'rest' },
    ];
  }
  if (level === 'intermediate') {
    return [
      { day: 'Mon', focus: 'push' },
      { day: 'Tue', focus: 'pull' },
      { day: 'Wed', focus: 'legs' },
      { day: 'Thu', focus: 'core' },
      { day: 'Fri', focus: 'mobility' },
      { day: 'Sat', focus: 'cardio' },
      { day: 'Sun', focus: 'rest' },
    ];
  }
  // advanced / elite
  return [
    { day: 'Mon', focus: 'push' },
    { day: 'Tue', focus: 'pull' },
    { day: 'Wed', focus: 'legs' },
    { day: 'Thu', focus: 'core' },
    { day: 'Fri', focus: 'push' },
    { day: 'Sat', focus: 'pull' },
    { day: 'Sun', focus: 'active_recovery' },
  ];
}

const DOW_MAP: WeeklyPlanDay['day'][] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getTodayFocus(weeklyPlan: WeeklyPlanDay[], date: Date = new Date()): WeeklyPlanDay['focus'] {
  const dow = DOW_MAP[date.getDay()];
  const entry = weeklyPlan.find((d) => d.day === dow);
  return entry ? entry.focus : 'rest';
}

// ---------------------------------------------------------------------------
// VARIANT SELECTION (equipment-aware, difficulty-matched)
// ---------------------------------------------------------------------------
function pickVariant(exercise: ExerciseDef, targetTier: number, equipment: Equipment[]) {
  const usable = exercise.alternatives.filter((v) =>
    v.equipmentRequired.every((eq) => eq === 'none' || equipment.includes(eq))
  );
  const pool = usable.length > 0 ? usable : exercise.alternatives.filter((v) => v.equipmentRequired.length === 0);
  if (pool.length === 0) return { name: exercise.name, difficultyTier: exercise.difficultyTier };
  // pick closest tier without going over target, else the easiest available
  let best = pool[0];
  let bestDiff = Infinity;
  for (const v of pool) {
    if (v.difficultyTier <= targetTier) {
      const diff = targetTier - v.difficultyTier;
      if (diff < bestDiff) {
        bestDiff = diff;
        best = v;
      }
    }
  }
  if (bestDiff === Infinity) {
    // nothing at or below target tier; take the easiest
    best = pool.reduce((a, b) => (a.difficultyTier < b.difficultyTier ? a : b));
  }
  return best;
}

function toWorkoutExercise(
  exercise: ExerciseDef,
  targetTier: number,
  equipment: Equipment[],
  intensityMultiplier: number
): WorkoutExercise {
  const variant = pickVariant(exercise, targetTier, equipment);
  const sets = Math.max(1, Math.round(exercise.defaultSets * intensityMultiplier));
  const execSecondsPerSet = exercise.defaultDurationSeconds ?? 35; // rough time-under-tension estimate
  const totalSeconds = sets * (execSecondsPerSet + exercise.restSeconds);
  const estimatedMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const xp = Math.round(exercise.xpBase * sets * (0.5 + variant.difficultyTier / 10));

  return {
    exerciseId: exercise.id,
    name: variant.name,
    sets,
    reps: exercise.defaultDurationSeconds ? undefined : exercise.defaultReps,
    durationSeconds: exercise.defaultDurationSeconds,
    restSeconds: exercise.restSeconds,
    tempo: exercise.tempo,
    difficultyTier: variant.difficultyTier,
    estimatedMinutes,
    xp,
    statGains: exercise.statGains,
  };
}

// ---------------------------------------------------------------------------
// PROGRESSIVE OVERLOAD: derive today's target tier for a movement pattern
// from recent workout history + current recovery.
// ---------------------------------------------------------------------------
function deriveTargetTier(
  profile: FitnessProfile,
  pattern: string,
  levelCeiling: number,
  levelFloor: number,
  recoveryScore: number
): number {
  const recentSameFocus = profile.workoutHistory
    .filter((w) => w.focus === pattern && w.completed)
    .slice(-3);

  let tier = levelFloor + Math.floor((levelCeiling - levelFloor) / 2);

  if (recentSameFocus.length > 0) {
    const avgTierUsed =
      recentSameFocus.reduce((sum, w) => {
        const all = [...w.main];
        const avg = all.length > 0 ? all.reduce((s, e) => s + e.difficultyTier, 0) / all.length : tier;
        return sum + avg;
      }, 0) / recentSameFocus.length;
    tier = Math.round(avgTierUsed);
    // all recent sessions fully completed -> progress
    if (recentSameFocus.length >= 2 && recentSameFocus.every((w) => w.completed)) {
      tier += 1;
    }
  }

  // recovery gate
  if (recoveryScore < 40) tier -= 2;
  else if (recoveryScore < 60) tier -= 1;
  else if (recoveryScore > 85) tier += 1;

  return Math.min(levelCeiling, Math.max(levelFloor, tier));
}

// ---------------------------------------------------------------------------
// MAIN GENERATOR
// ---------------------------------------------------------------------------
export function generateDailyWorkout(
  profile: FitnessProfile,
  fitnessLevel: FitnessLevel,
  focusOverride?: DailyWorkout['focus'],
  date: Date = new Date()
): DailyWorkout {
  const focus = focusOverride ?? getTodayFocus(profile.weeklyPlan, date);
  const isoDate = date.toISOString().slice(0, 10);

  const latestRecovery = profile.recoveryLogs[profile.recoveryLogs.length - 1];
  const recoveryScore = latestRecovery ? latestRecovery.recoveryScore : 70;

  if (focus === 'rest') {
    return {
      date: isoDate,
      focus,
      warmup: [],
      main: [],
      cooldown: [],
      estimatedTotalMinutes: 0,
      totalXp: 30,
      intensityNote: 'Full rest day. Recovery drives your next gains as much as training does.',
    };
  }

  const ceiling = fitnessLevelToTierCeiling(fitnessLevel);
  const floor = fitnessLevelToTierFloor(fitnessLevel);
  const equipment: Equipment[] = profile.availableEquipment.length > 0 ? profile.availableEquipment : ['none'];
  const availableMinutes = profile.availableMinutesPerDay || 45;

  // recovery-scaled intensity multiplier (sets)
  let intensityMultiplier = 1;
  let intensityNote = 'Standard intensity. Full sets prescribed.';
  if (recoveryScore < 40) {
    intensityMultiplier = 0.6;
    intensityNote = 'Recovery is low. Volume cut by ~40%: prioritize form over output today.';
  } else if (recoveryScore < 60) {
    intensityMultiplier = 0.8;
    intensityNote = 'Recovery is moderate. Volume slightly reduced.';
  } else if (recoveryScore > 85) {
    intensityMultiplier = 1.15;
    intensityNote = 'Recovery is excellent. Slight volume boost to capitalize on it.';
  }

  // ---- warmup (always mobility, ~10% of time budget, min 4 min) ----
  const warmupMinutes = Math.max(4, Math.round(availableMinutes * 0.12));
  const warmupPool = getExercisesByPattern('mobility');
  const warmup: WorkoutExercise[] = [];
  let usedWarmup = 0;
  for (const ex of warmupPool) {
    if (usedWarmup >= warmupMinutes) break;
    const we = toWorkoutExercise(ex, 1, equipment, 1);
    warmup.push(we);
    usedWarmup += we.estimatedMinutes;
    if (warmup.length >= 4) break;
  }

  // ---- cooldown (~10% of time, stretches) ----
  const cooldownMinutes = Math.max(3, Math.round(availableMinutes * 0.1));
  const cooldownPool = getExercisesByPattern('mobility').slice().reverse();
  const cooldown: WorkoutExercise[] = [];
  let usedCooldown = 0;
  for (const ex of cooldownPool) {
    if (usedCooldown >= cooldownMinutes) break;
    const we = toWorkoutExercise(ex, 1, equipment, 1);
    cooldown.push(we);
    usedCooldown += we.estimatedMinutes;
    if (cooldown.length >= 3) break;
  }

  // ---- main block ----
  const mainMinutesBudget = Math.max(10, availableMinutes - usedWarmup - usedCooldown);
  let mainPatterns: string[] = [];
  if (focus === 'active_recovery') mainPatterns = ['mobility', 'core'];
  else if (focus === 'cardio') mainPatterns = ['cardio', 'core'];
  else mainPatterns = [focus];

  const candidateExercises: ExerciseDef[] = mainPatterns.flatMap((p) => getExercisesByPattern(p));
  const main: WorkoutExercise[] = [];
  let usedMain = 0;
  const targetTier = deriveTargetTier(profile, focus, ceiling, floor, recoveryScore);
  const mult = focus === 'active_recovery' ? Math.min(intensityMultiplier, 0.7) : intensityMultiplier;

  for (const ex of candidateExercises) {
    if (usedMain >= mainMinutesBudget) break;
    const we = toWorkoutExercise(ex, targetTier, equipment, mult);
    if (usedMain + we.estimatedMinutes > mainMinutesBudget && main.length >= 3) break;
    main.push(we);
    usedMain += we.estimatedMinutes;
  }
  // guarantee at least 3 main movements if budget allows
  if (main.length < 3) {
    for (const ex of exerciseLibrary.filter((e) => mainPatterns.includes(e.pattern))) {
      if (main.find((m) => m.exerciseId === ex.id)) continue;
      main.push(toWorkoutExercise(ex, targetTier, equipment, mult));
      if (main.length >= 3) break;
    }
  }

  const allExercises = [...warmup, ...main, ...cooldown];
  const totalXp = allExercises.reduce((s, e) => s + e.xp, 0) + 20; // completion bonus
  const estimatedTotalMinutes = usedWarmup + usedMain + usedCooldown;

  return {
    date: isoDate,
    focus,
    warmup,
    main,
    cooldown,
    estimatedTotalMinutes,
    totalXp,
    intensityNote,
  };
}

export function calculateSorenessAdjustedFocus(
  plannedFocus: DailyWorkout['focus'],
  recoveryScore: number
): DailyWorkout['focus'] {
  if (recoveryScore < 30 && plannedFocus !== 'rest') {
    return 'active_recovery';
  }
  return plannedFocus;
}
