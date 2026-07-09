import { FitnessProfile, LearningProfile, Quest, CharacterStats } from '../types';

export type Directive = 'push' | 'maintain' | 'deload' | 'recover';

export interface DayActivity {
  date: string;
  day: string; // 'MON' etc
  xp: number;
  fitnessActive: boolean;
  learningActive: boolean;
}

export interface IntelligenceSnapshot {
  momentum: number; // multiplier, e.g. 1.2
  boost: number; // XP multiplier tied to streak
  streak: number; // consecutive engaged days
  directive: Directive;
  headline: string;
  reasons: string[];
  weeklyActivity: DayActivity[];
  consistency30: boolean[]; // oldest first, 30 entries
  avgRecovery: number | null;
  missedSessions7: number;
  questCompletionRate: number;
  fitnessCompletionRate7: number;
  learningCompletionRate7: number;
}

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(isoDate(d));
  }
  return out;
}

function earnedFitnessXp(fitness: FitnessProfile, date: string): number {
  const w = fitness.workoutHistory.find((x) => x.date === date);
  if (!w) return 0;
  if (w.completed) return w.totalXp;
  const all = [...w.warmup, ...w.main, ...w.cooldown];
  return all.filter((e) => e.completed).reduce((s, e) => s + e.xp, 0);
}

function earnedLearningXp(learning: LearningProfile, date: string): number {
  const p = learning.planHistory.find((x) => x.date === date);
  if (!p) return 0;
  if (p.completed) return p.totalXp;
  return p.sessions.filter((s) => s.completed).reduce((s, sess) => s + sess.xp, 0);
}

function fitnessActiveOn(fitness: FitnessProfile, date: string): boolean {
  const w = fitness.workoutHistory.find((x) => x.date === date);
  if (!w) return false;
  if (w.focus === 'rest') return true; // prescribed rest counts as "on plan"
  return !!w.completed;
}

function learningActiveOn(learning: LearningProfile, date: string): boolean {
  const p = learning.planHistory.find((x) => x.date === date);
  if (!p) return false;
  if (p.sessions.length === 0) return true; // nothing scheduled, don't penalize
  return !!p.completed;
}

function computeWeeklyActivity(fitness: FitnessProfile, learning: LearningProfile): DayActivity[] {
  return lastNDates(7).map((date) => {
    const d = new Date(date + 'T00:00:00');
    return {
      date,
      day: DOW[d.getDay()],
      xp: earnedFitnessXp(fitness, date) + earnedLearningXp(learning, date),
      fitnessActive: fitnessActiveOn(fitness, date),
      learningActive: learningActiveOn(learning, date),
    };
  });
}

function computeConsistency30(fitness: FitnessProfile, learning: LearningProfile): boolean[] {
  return lastNDates(30).map((date) => fitnessActiveOn(fitness, date) || learningActiveOn(learning, date));
}

function computeStreak(fitness: FitnessProfile, learning: LearningProfile): number {
  const today = new Date();
  let streak = 0;
  // if today has no data yet, don't break the streak on today — start checking from today, allow it to be empty
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = isoDate(d);
    const fActive = fitnessActiveOn(fitness, date);
    const lActive = learningActiveOn(learning, date);
    const hasAnyData = fitness.workoutHistory.some((w) => w.date === date) || learning.planHistory.some((p) => p.date === date);
    if (i === 0 && !hasAnyData) continue; // today not logged yet, skip without breaking
    if (fActive || lActive) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function computeAvgRecovery(fitness: FitnessProfile, n = 3): number | null {
  const logs = fitness.recoveryLogs.slice(-n);
  if (logs.length === 0) return null;
  return Math.round(logs.reduce((s, l) => s + l.recoveryScore, 0) / logs.length);
}

function computeMissedSessions7(fitness: FitnessProfile, learning: LearningProfile): number {
  const dates = lastNDates(7).filter((d) => d !== isoDate(new Date())); // exclude today, still in progress
  let missed = 0;
  for (const date of dates) {
    const w = fitness.workoutHistory.find((x) => x.date === date);
    if (w && w.focus !== 'rest' && !w.completed) missed++;
    const p = learning.planHistory.find((x) => x.date === date);
    if (p && p.sessions.length > 0 && !p.completed) missed++;
  }
  return missed;
}

function completionRate7(activeFn: (date: string) => boolean, scheduledFn: (date: string) => boolean): number {
  const dates = lastNDates(7).filter((d) => d !== isoDate(new Date()));
  const scheduled = dates.filter(scheduledFn);
  if (scheduled.length === 0) return 1;
  const completed = scheduled.filter(activeFn);
  return Math.round((completed.length / scheduled.length) * 100) / 100;
}

function computeQuestCompletionRate(quests: Quest[]): number {
  if (quests.length === 0) return 1;
  const completed = quests.filter((q) => q.status === 'completed').length;
  return Math.round((completed / quests.length) * 100) / 100;
}

export function computeIntelligenceSnapshot(
  fitness: FitnessProfile,
  learning: LearningProfile,
  quests: Quest[],
  _stats: CharacterStats
): IntelligenceSnapshot {
  const weeklyActivity = computeWeeklyActivity(fitness, learning);
  const consistency30 = computeConsistency30(fitness, learning);
  const streak = computeStreak(fitness, learning);
  const avgRecovery = computeAvgRecovery(fitness);
  const missedSessions7 = computeMissedSessions7(fitness, learning);
  const questCompletionRate = computeQuestCompletionRate(quests);

  const fitnessCompletionRate7 = completionRate7(
    (date) => fitnessActiveOn(fitness, date),
    (date) => {
      const w = fitness.workoutHistory.find((x) => x.date === date);
      return !!w && w.focus !== 'rest';
    }
  );
  const learningCompletionRate7 = completionRate7(
    (date) => learningActiveOn(learning, date),
    (date) => {
      const p = learning.planHistory.find((x) => x.date === date);
      return !!p && p.sessions.length > 0;
    }
  );

  // ---- momentum ----
  let momentum = 1.0;
  const reasons: string[] = [];

  if (avgRecovery !== null) {
    if (avgRecovery > 80) {
      momentum += 0.15;
      reasons.push(`Recovery is excellent, averaging ${avgRecovery}/100 over recent check-ins.`);
    } else if (avgRecovery < 40) {
      momentum -= 0.25;
      reasons.push(`Recovery is low, averaging ${avgRecovery}/100 — the body needs a break.`);
    } else if (avgRecovery < 60) {
      momentum -= 0.1;
      reasons.push(`Recovery is moderate at ${avgRecovery}/100.`);
    }
  }

  if (streak >= 7) {
    momentum += 0.2;
    reasons.push(`${streak}-day engagement streak is driving strong momentum.`);
  } else if (streak >= 3) {
    momentum += 0.1;
    reasons.push(`${streak}-day streak building steadily.`);
  } else if (streak === 0) {
    reasons.push('No active streak right now — restarting today counts.');
  }

  if (missedSessions7 >= 3) {
    momentum -= 0.2;
    reasons.push(`${missedSessions7} sessions missed in the last 7 days across fitness and learning.`);
  } else if (missedSessions7 >= 1) {
    momentum -= 0.05;
    reasons.push(`${missedSessions7} session missed this week — not a pattern yet.`);
  }

  if (questCompletionRate > 0.7) {
    momentum += 0.1;
    reasons.push(`Quest completion rate is strong at ${Math.round(questCompletionRate * 100)}%.`);
  } else if (questCompletionRate < 0.3 && quests.length > 0) {
    momentum -= 0.1;
    reasons.push(`Quest completion rate has dropped to ${Math.round(questCompletionRate * 100)}%, a proxy for university workload pressure.`);
  }

  momentum = Math.round(Math.max(0.5, Math.min(2.0, momentum)) * 100) / 100;

  const boost = streak >= 14 ? 2 : streak >= 7 ? 1.5 : streak >= 3 ? 1.2 : 1.0;

  // ---- directive ----
  let directive: Directive = 'maintain';
  let headline = 'Steady state. Standard intensity across fitness and learning today.';

  if ((avgRecovery !== null && avgRecovery < 40) || missedSessions7 >= 3) {
    directive = 'recover';
    headline = 'Pull back today. Recovery and consistency are both signaling a lighter load.';
  } else if (momentum >= 1.3 && (avgRecovery === null || avgRecovery >= 70)) {
    directive = 'push';
    headline = 'Momentum is strong. Difficulty is being nudged up across both engines today.';
  } else if (momentum < 0.85) {
    directive = 'deload';
    headline = 'Momentum has dipped. Volume is being trimmed to rebuild consistency before pushing again.';
  }

  if (reasons.length === 0) {
    reasons.push('Not enough history yet — log a few days of workouts and study sessions for sharper calibration.');
  }

  return {
    momentum,
    boost,
    streak,
    directive,
    headline,
    reasons,
    weeklyActivity,
    consistency30,
    avgRecovery,
    missedSessions7,
    questCompletionRate,
    fitnessCompletionRate7,
    learningCompletionRate7,
  };
}
