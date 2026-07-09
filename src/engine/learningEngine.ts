import { DailyLearningPlan, LearningProfile, LearningSession, LearningSubject, LearningTopic } from '../types';
import { learningRoadmap, getTopicsBySubject } from '../data/learningRoadmap';

export function isTopicUnlocked(topic: LearningTopic, completedTopicIds: string[]): boolean {
  if (!topic.prerequisiteId) return true;
  return completedTopicIds.includes(topic.prerequisiteId);
}

// Returns the next topic a person should study in a subject: first unlocked,
// not-yet-completed topic in the roadmap order (roadmap is authored in
// prerequisite order already).
export function getNextTopicForSubject(subject: LearningSubject, completedTopicIds: string[]): LearningTopic | null {
  const topics = getTopicsBySubject(subject);
  for (const t of topics) {
    if (completedTopicIds.includes(t.id)) continue;
    if (isTopicUnlocked(t, completedTopicIds)) return t;
    return null; // next topic in chain is locked behind an incomplete prerequisite
  }
  return null; // subject fully completed
}

export function subjectProgress(subject: LearningSubject, completedTopicIds: string[]): { done: number; total: number } {
  const topics = getTopicsBySubject(subject);
  const done = topics.filter((t) => completedTopicIds.includes(t.id)).length;
  return { done, total: topics.length };
}

function topicToSession(topic: LearningTopic, difficultyAdjust: number): LearningSession {
  return {
    topicId: topic.id,
    subject: topic.subject,
    title: topic.title,
    subtopics: topic.subtopics,
    objective: topic.objective,
    difficultyTier: Math.max(1, Math.min(10, topic.difficultyTier + difficultyAdjust)),
    estimatedMinutes: topic.estimatedMinutes,
    resource: topic.resource,
    practicalExercise: topic.practicalExercise,
    miniChallenge: topic.miniChallenge,
    xp: Math.round(topic.xpBase * (0.6 + topic.difficultyTier / 10)),
    relatedSkillIds: topic.relatedSkillIds,
  };
}

// Builds today's session list by round-robining across focus subjects,
// pulling each subject's next unlocked topic, until the time budget is spent
// or every subject is exhausted/locked.
export function generateDailyLearningPlan(
  profile: LearningProfile,
  date: Date = new Date(),
  missedYesterday = false
): DailyLearningPlan {
  const isoDate = date.toISOString().slice(0, 10);
  const budget = profile.availableMinutesPerDay;
  // if a session was missed recently, nudge difficulty down slightly and
  // favor review/repetition by allowing a touch more time on fewer subjects
  const difficultyAdjust = missedYesterday ? -1 : 0;

  const sessions: LearningSession[] = [];
  let usedMinutes = 0;
  const subjects = profile.focusSubjects.length > 0 ? profile.focusSubjects : (['linux', 'python', 'networking'] as LearningSubject[]);

  // track per-subject cursor so within one generation call we don't repeat
  const localCompleted = [...profile.completedTopicIds];

  let guard = 0;
  while (usedMinutes < budget && guard < 20) {
    guard++;
    let addedAny = false;
    for (const subject of subjects) {
      if (usedMinutes >= budget) break;
      const topic = getNextTopicForSubject(subject, localCompleted);
      if (!topic) continue;
      if (sessions.find((s) => s.topicId === topic.id)) continue; // already scheduled this run
      if (usedMinutes + topic.estimatedMinutes > budget && sessions.length > 0) continue;
      const session = topicToSession(topic, difficultyAdjust);
      sessions.push(session);
      usedMinutes += session.estimatedMinutes;
      addedAny = true;
    }
    if (!addedAny) break;
  }

  const totalXp = sessions.reduce((s, x) => s + x.xp, 0) + 20; // completion bonus
  return {
    date: isoDate,
    sessions,
    totalMinutes: usedMinutes,
    totalXp,
  };
}

export const ALL_SUBJECTS: LearningSubject[] = ['linux', 'python', 'networking', 'cybersecurity', 'ctf'];

export function overallRoadmapProgress(completedTopicIds: string[]): { done: number; total: number } {
  return { done: completedTopicIds.length, total: learningRoadmap.length };
}
