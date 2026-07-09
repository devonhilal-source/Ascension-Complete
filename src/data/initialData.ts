import { Quest, Achievement, SkillNode, CharacterStats, SystemPreferences, FitnessProfile, LearningProfile } from '../types';
import { initialSkillProgressions } from './skillProgressions';
import { generateWeeklyPlan } from '../engine/fitnessEngine';

export const initialQuests: Quest[] = [
  {
    id: 'quest-sleep',
    title: 'Sleep Goal (8h)',
    description: 'Ensure 8 hours of restorative sleep logged in the ledger.',
    xp: 50,
    status: 'completed',
    type: 'daily',
    category: 'fitness',
    durationMinutes: 480
  },
  {
    id: 'quest-exercise',
    title: 'Exercise (0/1)',
    description: 'Complete daily high-intensity workout session.',
    xp: 120,
    status: 'pending',
    type: 'daily',
    category: 'fitness'
  },
  {
    id: 'quest-python',
    title: 'Study Python',
    description: 'Learn fundamental programming syntax and standard libraries.',
    xp: 200,
    status: 'pending',
    type: 'daily',
    category: 'technology',
    currentProgress: 1.3,
    targetProgress: 2 // 2 hours target
  },
  {
    id: 'quest-calisthenics',
    title: 'Calisthenics Session',
    description: 'Execute push-ups, squats, plank, and negative pull-ups routines.',
    xp: 250,
    status: 'pending',
    type: 'daily',
    category: 'fitness',
    durationMinutes: 45
  },
  {
    id: 'quest-bandit',
    title: 'OverTheWire - Bandit Levels 0 through 5',
    description: 'Conquer the baseline Linux security challenges.',
    xp: 400,
    status: 'pending',
    type: 'weekly',
    category: 'technology'
  },
  {
    id: 'quest-permissions',
    title: 'Mastery of Permissions (chmod, chown)',
    description: 'Confront and master directory permission ownership structures.',
    xp: 300,
    status: 'pending',
    type: 'weekly',
    category: 'technology'
  },
  {
    id: 'quest-streak',
    title: '30-Day Discipline',
    description: 'Maintain strict consistency cycle for 30 consecutive days.',
    xp: 500,
    status: 'pending',
    type: 'monthly',
    category: 'mind'
  },
  {
    id: 'quest-master-skills',
    title: 'Master 3 Skills',
    description: 'Upgrade any three skill trees to MASTERED status.',
    xp: 600,
    status: 'pending',
    type: 'monthly',
    category: 'knowledge'
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-first-blood',
    title: 'FIRST BLOOD',
    description: 'Complete first major quest',
    badgeType: 'gold',
    icon: 'military_tech',
    status: 'earned'
  },
  {
    id: 'ach-code-warrior',
    title: 'CODE WARRIOR',
    description: 'Master 5 logic skills',
    badgeType: 'silver',
    icon: 'terminal',
    status: 'earned'
  },
  {
    id: 'ach-discipline',
    title: '30-DAY DISCIPLINE',
    description: 'Daily login streak of 30',
    badgeType: 'bronze',
    icon: 'event_repeat',
    status: 'earned'
  },
  {
    id: 'ach-ascendant',
    title: 'ASCENDANT',
    description: 'Reach first rank-up',
    badgeType: 'purple',
    icon: 'auto_fix_high',
    status: 'earned'
  },
  {
    id: 'ach-locked-1',
    title: 'LOCKED',
    description: 'Achieve C-Rank status',
    badgeType: 'locked',
    icon: 'lock',
    status: 'locked'
  },
  {
    id: 'ach-locked-2',
    title: 'LOCKED',
    description: 'Complete 100 daily quests',
    badgeType: 'locked',
    icon: 'lock',
    status: 'locked'
  },
  {
    id: 'ach-locked-3',
    title: 'LOCKED',
    description: 'Master 10 distinct skills',
    badgeType: 'locked',
    icon: 'lock',
    status: 'locked'
  },
  {
    id: 'ach-locked-4',
    title: 'LOCKED',
    description: 'Reach Level 50',
    badgeType: 'locked',
    icon: 'lock',
    status: 'locked'
  }
];

export const initialSkills: SkillNode[] = [
  // Technology Tab
  {
    id: 'tech-fundamentals',
    title: 'Fundamentals',
    description: 'Command line essentials, variables, control flows, and base algorithms.',
    status: 'mastered',
    icon: 'terminal',
    category: 'technology',
    xpGain: 1000,
    targetXp: 1000,
    currentXp: 1000
  },
  {
    id: 'tech-python',
    title: 'Python',
    description: 'Scripting, list comprehensions, automated flows, and data manipulation.',
    status: 'available',
    icon: 'code',
    category: 'technology',
    xpGain: 650,
    targetXp: 1000,
    currentXp: 650,
    parentId: 'tech-fundamentals'
  },
  {
    id: 'tech-linux',
    title: 'Linux',
    description: 'Bash environment, file permissions, daemon configurations, and shell scripting.',
    status: 'mastered',
    icon: 'computer',
    category: 'technology',
    xpGain: 1000,
    targetXp: 1000,
    currentXp: 1000,
    parentId: 'tech-fundamentals'
  },
  {
    id: 'tech-networking',
    title: 'Networking',
    description: 'Protocols, DNS architectures, subnets, socket communication, and routing tables.',
    status: 'locked',
    icon: 'lock',
    category: 'technology',
    xpGain: 0,
    targetXp: 1200,
    currentXp: 0,
    parentId: 'tech-linux'
  },
  {
    id: 'tech-sysadmin',
    title: 'SysAdmin',
    description: 'System processes management, user authentication, crontab setups, and services hosting.',
    status: 'available',
    icon: 'security',
    category: 'technology',
    xpGain: 400,
    targetXp: 1000,
    currentXp: 400,
    parentId: 'tech-linux'
  },

  // Fitness Tab
  {
    id: 'fit-basics',
    title: 'Bodyweight Basics',
    description: 'Push-ups, air squats, hollow body holds, and fundamental pull progressions.',
    status: 'mastered',
    icon: 'fitness_center',
    category: 'fitness',
    xpGain: 1000,
    targetXp: 1000,
    currentXp: 1000
  },
  {
    id: 'fit-calisthenics',
    title: 'Calisthenics I',
    description: 'Arch pull-ups, archer pushups, high-tension planks, and compound leg sets.',
    status: 'available',
    icon: 'sports_gymnastics',
    category: 'fitness',
    xpGain: 500,
    targetXp: 1000,
    currentXp: 500,
    parentId: 'fit-basics'
  },
  {
    id: 'fit-cardio',
    title: 'Cardio Endurance',
    description: 'Lactate threshold runs, aerobic intervals, and breathing pacing strategies.',
    status: 'mastered',
    icon: 'directions_run',
    category: 'fitness',
    xpGain: 1000,
    targetXp: 1000,
    currentXp: 1000,
    parentId: 'fit-basics'
  },
  {
    id: 'fit-weightlifting',
    title: 'Barbell Training',
    description: 'Deadlifts, squats, bench press form, and explosive mechanical force.',
    status: 'locked',
    icon: 'lock',
    category: 'fitness',
    xpGain: 0,
    targetXp: 1200,
    currentXp: 0,
    parentId: 'fit-basics'
  },

  // Mind Tab
  {
    id: 'mind-meditation',
    title: 'Meditation Focus',
    description: 'Breath awareness, single-point concentration, and thought separation states.',
    status: 'mastered',
    icon: 'self_improvement',
    category: 'mind',
    xpGain: 1000,
    targetXp: 1000,
    currentXp: 1000
  },
  {
    id: 'mind-stoicism',
    title: 'Stoic Principles',
    description: 'Dichotomy of control, voluntary discomfort, and perspective framing.',
    status: 'available',
    icon: 'psychology',
    category: 'mind',
    xpGain: 600,
    targetXp: 1000,
    currentXp: 600,
    parentId: 'mind-meditation'
  },
  {
    id: 'mind-palace',
    title: 'Memory Palace',
    description: 'Spatial association techniques, visual peg lists, and high-retention recall.',
    status: 'locked',
    icon: 'lock',
    category: 'mind',
    xpGain: 0,
    targetXp: 1000,
    currentXp: 0,
    parentId: 'mind-meditation'
  },

  // Knowledge Tab
  {
    id: 'know-reading',
    title: 'Speed Reading',
    description: 'Suppressing subvocalization, expansion of peripheral vision fields, and high comprehension tracking.',
    status: 'mastered',
    icon: 'menu_book',
    category: 'knowledge',
    xpGain: 1000,
    targetXp: 1000,
    currentXp: 1000
  },
  {
    id: 'know-synthesis',
    title: 'Advanced Synthesis',
    description: 'Active recall modeling, semantic connection graphs, and Feynman technique applications.',
    status: 'available',
    icon: 'hub',
    category: 'knowledge',
    xpGain: 350,
    targetXp: 1000,
    currentXp: 350,
    parentId: 'know-reading'
  },
  {
    id: 'know-writing',
    title: 'Deep Writing',
    description: 'Logical composition structures, persuasive framing rhetoric, and clarity modeling.',
    status: 'locked',
    icon: 'lock',
    category: 'knowledge',
    xpGain: 0,
    targetXp: 1200,
    currentXp: 0,
    parentId: 'know-reading'
  }
];

export const defaultCharacterStats: CharacterStats = {
  name: 'Sung Jin-Woo',
  title: 'The Awakened',
  level: 1,
  xp: 980,
  targetXp: 1000,
  rank: 'E',
  streak: 7,
  momentum: 1.2,
  boost: 1.5,
  
  // Base attributes
  str: 12,
  end: 8,
  int: 15,
  knw: 5,
  dis: 20,
  foc: 18,
  cha: 4,
  com: 11,
  fin: 7,
  tec: 9,

  // Physical data defaults
  height: 185,
  weight: 78,
  age: 24,
  bodyType: 'lean',
  startingFitness: 'intermediate',
  studyLevel: 'medium',
  dailyIntensity: 5
};

export const defaultFitnessProfile: FitnessProfile = {
  measurements: [],
  photos: [],
  latestAssessment: undefined,
  assessmentHistory: [],
  recoveryLogs: [],
  workoutHistory: [],
  skillProgressions: initialSkillProgressions,
  weeklyPlan: generateWeeklyPlan('intermediate'),
  availableEquipment: ['none', 'backpack'],
  availableMinutesPerDay: 45,
};

export const defaultLearningProfile: LearningProfile = {
  completedTopicIds: [],
  planHistory: [],
  availableMinutesPerDay: 60,
  focusSubjects: ['linux', 'python', 'networking'],
  streak: 0,
};

export const defaultPreferences: SystemPreferences = {
  themeProtocol: 'classic',
  themeIntensity: 'balanced',
  animationLevel: 2,
  notifyDailyQuests: true,
  notifyStreakAlerts: true,
  notifySystemUpdates: false
};
