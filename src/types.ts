export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  status: 'synced' | 'pending' | 'completed';
  type: 'daily' | 'weekly' | 'monthly';
  category: 'technology' | 'fitness' | 'mind' | 'knowledge' | 'finance';
  durationMinutes?: number;
  currentProgress?: number;
  targetProgress?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeType: 'gold' | 'silver' | 'bronze' | 'purple' | 'locked';
  icon: string;
  status: 'earned' | 'locked';
}

export interface SkillNode {
  id: string;
  title: string;
  description: string;
  status: 'mastered' | 'available' | 'locked';
  icon: string;
  category: 'technology' | 'fitness' | 'mind' | 'knowledge';
  xpGain: number;
  targetXp: number;
  currentXp: number;
  parentId?: string; // For connection drawing
}

export interface CharacterStats {
  name: string;
  title: string;
  level: number;
  xp: number;
  targetXp: number;
  rank: string;
  streak: number;
  momentum: number;
  boost: number;
  
  // Attributes (0 to 100)
  str: number;
  end: number;
  int: number;
  knw: number;
  dis: number;
  foc: number;
  cha: number;
  com: number;
  fin: number;
  tec: number;

  // Physical data
  height: number;
  weight: number;
  age: number;
  bodyType: 'lean' | 'average' | 'athletic' | 'bulk';
  startingFitness: 'beginner' | 'intermediate' | 'advanced';
  studyLevel: 'low' | 'medium' | 'high';
  dailyIntensity: number; // 0 to 8 blocks
}

// ===================== FITNESS SYSTEM =====================

export type Equipment = 'none' | 'backpack' | 'pullup_bar' | 'resistance_bands' | 'dip_bars' | 'jump_rope';

export type FitnessLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'elite';

export interface BodyMeasurements {
  date: string; // ISO date
  height: number; // cm
  weight: number; // kg
  bodyFatPct?: number;
  restingHeartRate?: number;
  waist?: number;
  chest?: number;
  shoulders?: number;
  hips?: number;
  armLeft?: number;
  armRight?: number;
  forearmLeft?: number;
  forearmRight?: number;
  thighLeft?: number;
  thighRight?: number;
  calfLeft?: number;
  calfRight?: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  angle: 'front' | 'side' | 'back';
  dataUrl: string; // stored in localStorage as base64
}

export interface AssessmentResult {
  date: string;
  maxPushups: number;
  inclinePushups?: number;
  kneePushups?: number;
  pullups: number;
  chinups: number;
  dips: number;
  plankSeconds: number;
  sidePlankSeconds: number;
  hollowHoldSeconds: number;
  hangingKneeRaises: number;
  maxSquats: number;
  bulgarianSplitSquats: number;
  walkingLunges: number;
  wallSitSeconds: number;
  verticalJumpCm?: number;
  run1kmSeconds?: number;
  run2kmSeconds?: number;
  recoveryHeartRateDrop?: number;
  shoulderMobility: number;
  hamstringFlexibility: number;
  hipMobility: number;
  ankleMobility: number;
  fitnessLevel: FitnessLevel;
}

export interface RecoveryLog {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  energyLevel: number;
  muscleSoreness: number;
  stressLevel: number;
  recoveryScore: number;
}

export type MovementPattern = 'push' | 'pull' | 'legs' | 'core' | 'mobility' | 'cardio' | 'full_body';

export interface ExerciseVariant {
  name: string;
  equipmentRequired: Equipment[];
  difficultyTier: number;
}

export interface ExerciseDef {
  id: string;
  name: string;
  pattern: MovementPattern;
  difficultyTier: number;
  defaultSets: number;
  defaultReps?: string;
  defaultDurationSeconds?: number;
  restSeconds: number;
  tempo?: string;
  statGains: Partial<Record<'str' | 'end' | 'foc', number>>;
  xpBase: number;
  alternatives: ExerciseVariant[];
  cue?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps?: string;
  durationSeconds?: number;
  restSeconds: number;
  tempo?: string;
  difficultyTier: number;
  estimatedMinutes: number;
  xp: number;
  statGains: Partial<Record<'str' | 'end' | 'foc', number>>;
  completed?: boolean;
}

export interface DailyWorkout {
  date: string;
  focus: 'push' | 'pull' | 'legs' | 'core' | 'mobility' | 'cardio' | 'active_recovery' | 'rest';
  warmup: WorkoutExercise[];
  main: WorkoutExercise[];
  cooldown: WorkoutExercise[];
  estimatedTotalMinutes: number;
  totalXp: number;
  intensityNote: string;
  completed?: boolean;
}

export interface SkillMilestone {
  id: string;
  title: string;
  requirement: string;
  targetValue: number;
  unit: 'reps' | 'seconds' | 'binary';
}

export interface SkillProgression {
  id: string;
  title: string;
  category: 'push' | 'pull' | 'core' | 'legs' | 'static';
  description: string;
  prerequisiteId?: string;
  milestones: SkillMilestone[];
  currentMilestoneIndex: number;
  currentValue: number;
}

export interface WeeklyPlanDay {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  focus: DailyWorkout['focus'];
}

export interface FitnessProfile {
  measurements: BodyMeasurements[];
  photos: ProgressPhoto[];
  latestAssessment?: AssessmentResult;
  assessmentHistory: AssessmentResult[];
  recoveryLogs: RecoveryLog[];
  workoutHistory: DailyWorkout[];
  skillProgressions: SkillProgression[];
  weeklyPlan: WeeklyPlanDay[];
  availableEquipment: Equipment[];
  availableMinutesPerDay: number;
}

// ===================== LEARNING SYSTEM =====================

export type LearningSubject = 'linux' | 'python' | 'networking' | 'cybersecurity' | 'ctf' | 'web';

export interface LearningResource {
  name: string;
  platform: string;
  url?: string;
}

export interface LearningTopic {
  id: string;
  subject: LearningSubject;
  title: string;
  subtopics: string[];
  objective: string;
  difficultyTier: number; // 1-10
  estimatedMinutes: number;
  prerequisiteId?: string;
  resource: LearningResource;
  practicalExercise: string;
  miniChallenge: string;
  xpBase: number;
  relatedSkillIds: string[]; // maps to SkillNode ids in initialSkills
}

export interface LearningSession {
  topicId: string;
  subject: LearningSubject;
  title: string;
  subtopics: string[];
  objective: string;
  difficultyTier: number;
  estimatedMinutes: number;
  resource: LearningResource;
  practicalExercise: string;
  miniChallenge: string;
  xp: number;
  relatedSkillIds: string[];
  completed?: boolean;
}

export interface DailyLearningPlan {
  date: string;
  sessions: LearningSession[];
  totalMinutes: number;
  totalXp: number;
  completed?: boolean;
}

export interface LearningProfile {
  completedTopicIds: string[];
  planHistory: DailyLearningPlan[];
  availableMinutesPerDay: number;
  focusSubjects: LearningSubject[]; // subjects actively being cycled through
  streak: number;
}

export interface SystemPreferences {
  themeProtocol: 'classic' | 'system' | 'rage' | 'stealth' | 'legend';
  themeIntensity: 'minimal' | 'balanced' | 'heavy';
  animationLevel: 1 | 2 | 3; // stable, dynamic, overdrive
  notifyDailyQuests: boolean;
  notifyStreakAlerts: boolean;
  notifySystemUpdates: boolean;
}
