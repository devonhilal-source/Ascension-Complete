import { useState, useEffect, useMemo } from 'react';
import { Quest, Achievement, SkillNode, CharacterStats, SystemPreferences, FitnessProfile, LearningProfile } from './types';
import {
  initialQuests,
  initialAchievements,
  initialSkills,
  defaultCharacterStats,
  defaultPreferences,
  defaultFitnessProfile,
  defaultLearningProfile,
} from './data/initialData';
import { computeIntelligenceSnapshot } from './engine/intelligenceEngine';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { StatusTab } from './components/StatusTab';
import { QuestsTab } from './components/QuestsTab';
import { FitnessTab } from './components/FitnessTab';
import { LearningTab } from './components/LearningTab';
import { SkillsTab } from './components/SkillsTab';
import { DataTab } from './components/DataTab';
import { ProfileView } from './components/ProfileView';
import { LevelUpCinematic } from './components/LevelUpCinematic';
import { TimerProvider } from './context/TimerContext';
import { TimerWidget } from './components/TimerWidget';

export default function App() {
  return (
    <TimerProvider>
      <AppInner />
    </TimerProvider>
  );
}

function AppInner() {
  const [activeTab, setActiveTab] = useState<'status' | 'quests' | 'fitness' | 'learning' | 'skills' | 'data'>('status');
  const [profileOpen, setProfileOpen] = useState(false);
  const [levelUpOpen, setLevelUpOpen] = useState(false);

  // Core States
  const [stats, setStats] = useState<CharacterStats>(defaultCharacterStats);
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [skills, setSkills] = useState<SkillNode[]>(initialSkills);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [preferences, setPreferences] = useState<SystemPreferences>(defaultPreferences);
  const [attributePoints, setAttributePoints] = useState<number>(0);
  const [fitness, setFitness] = useState<FitnessProfile>(defaultFitnessProfile);
  const [learning, setLearning] = useState<LearningProfile>(defaultLearningProfile);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('asc_stats');
      const savedQuests = localStorage.getItem('asc_quests');
      const savedSkills = localStorage.getItem('asc_skills');
      const savedAchievements = localStorage.getItem('asc_achievements');
      const savedPrefs = localStorage.getItem('asc_prefs');
      const savedAttr = localStorage.getItem('asc_attr_points');
      const savedFitness = localStorage.getItem('asc_fitness');
      const savedLearning = localStorage.getItem('asc_learning');

      if (savedStats) setStats(JSON.parse(savedStats));
      if (savedQuests) setQuests(JSON.parse(savedQuests));
      if (savedSkills) setSkills(JSON.parse(savedSkills));
      if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
      if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
      if (savedAttr) setAttributePoints(parseInt(savedAttr) || 0);
      if (savedFitness) setFitness(JSON.parse(savedFitness));
      if (savedLearning) setLearning(JSON.parse(savedLearning));
    } catch (e) {
      console.error('Error hydrating RPG local storage states:', e);
    } finally {
      setIsInitialLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isInitialLoaded) return;
    try {
      localStorage.setItem('asc_stats', JSON.stringify(stats));
      localStorage.setItem('asc_quests', JSON.stringify(quests));
      localStorage.setItem('asc_skills', JSON.stringify(skills));
      localStorage.setItem('asc_achievements', JSON.stringify(achievements));
      localStorage.setItem('asc_prefs', JSON.stringify(preferences));
      localStorage.setItem('asc_attr_points', attributePoints.toString());
      localStorage.setItem('asc_fitness', JSON.stringify(fitness));
      localStorage.setItem('asc_learning', JSON.stringify(learning));
    } catch (e) {
      console.error('Error persisting RPG local storage states:', e);
    }
  }, [stats, quests, skills, achievements, preferences, attributePoints, fitness, learning, isInitialLoaded]);

  // Color Mapping based on Active Theme Protocol
  const getThemeColors = () => {
    switch (preferences.themeProtocol) {
      case 'system': // Imperial Emerald
        return {
          primary: '#52B788',
          secondary: '#2D6A4F',
          accent: '#D8F3DC',
        };
      case 'rage': // Royal Crimson
        return {
          primary: '#9E2A2B',
          secondary: '#E09F3E',
          accent: '#FFF3B0',
        };
      case 'stealth': // Platinum Obsidian
        return {
          primary: '#E5E5E5',
          secondary: '#4A4A4A',
          accent: '#FFFFFF',
        };
      case 'legend': // Radiant Auric
        return {
          primary: '#FFB300',
          secondary: '#CD7F32',
          accent: '#FFF3B0',
        };
      case 'classic': // Luxurious Gold (Default)
      default:
        return {
          primary: '#D4AF37',
          secondary: '#AA7C11',
          accent: '#FFF3B0',
        };
    }
  };

  const colors = getThemeColors();

  // Progressive XP Logic with level up triggers
  const addXp = (amount: number) => {
    setStats((prev) => {
      let currentXp = prev.xp + amount;
      let currentLevel = prev.level;
      let currentTarget = prev.targetXp;
      let triggeredLevelUp = false;

      if (currentXp < 0) currentXp = 0;

      while (currentXp >= currentTarget) {
        currentXp -= currentTarget;
        currentLevel += 1;
        currentTarget = 1000 + (currentLevel - 1) * 500; // Increment targets progressively
        triggeredLevelUp = true;
      }

      if (triggeredLevelUp) {
        // Award points
        setAttributePoints((prevPts) => prevPts + 5);
        // Display level up screen!
        setTimeout(() => {
          setLevelUpOpen(true);
        }, 100);
      }

      // Dynamically upgrade rank letter if they level past certain boundaries
      let currentRank = prev.rank;
      if (currentLevel >= 20) currentRank = 'B';
      else if (currentLevel >= 10) currentRank = 'C';
      else if (currentLevel >= 5) currentRank = 'D';

      return {
        ...prev,
        xp: currentXp,
        level: currentLevel,
        targetXp: currentTarget,
        rank: currentRank,
      };
    });
  };

  // Select first pending quest to showcase on Status dashboard as an urgent active objective
  const activeUrgentQuest = quests.find((q) => q.status === 'pending') || null;

  const handleCompleteUrgentQuest = () => {
    if (activeUrgentQuest) {
      setQuests((prev) =>
        prev.map((q) => (q.id === activeUrgentQuest.id ? { ...q, status: 'completed' } : q))
      );
      addXp(activeUrgentQuest.xp);
    }
  };

  // Cross-domain Intelligence Engine: reads fitness + learning + quest history
  // to compute real momentum/streak/boost and a daily coaching directive.
  const intelligence = useMemo(
    () => computeIntelligenceSnapshot(fitness, learning, quests, stats),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fitness, learning, quests]
  );

  useEffect(() => {
    if (!isInitialLoaded) return;
    if (stats.streak === intelligence.streak && stats.momentum === intelligence.momentum && stats.boost === intelligence.boost) return;
    setStats((prev) => ({ ...prev, streak: intelligence.streak, momentum: intelligence.momentum, boost: intelligence.boost }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intelligence.streak, intelligence.momentum, intelligence.boost, isInitialLoaded]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] flex flex-col relative selection:bg-cyan-500/30">
      {/* Top Cybernetic Nav Header */}
      <Header
        tabTitle={activeTab === 'status' ? 'SYSTEM STATUS' : activeTab === 'quests' ? 'OBJECTIVES LEDGER' : activeTab === 'fitness' ? 'CALISTHENICS ENGINE' : activeTab === 'learning' ? 'LEARNING PATHWAY' : activeTab === 'skills' ? 'NEURAL MATRIX' : 'SYSTEM ANALYTICS'}
        rank={stats.rank}
        level={stats.level}
        onAvatarClick={() => setProfileOpen(true)}
        themeColor={colors.primary}
      />

      {/* Main Tab content router */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 pt-20 pb-28 text-center relative z-10">
        {activeTab === 'status' && (
          <StatusTab
            stats={stats}
            setStats={setStats}
            achievements={achievements}
            skills={skills}
            activeUrgentQuest={activeUrgentQuest}
            onCompleteUrgentQuest={handleCompleteUrgentQuest}
            themeColor={colors.primary}
            secondaryThemeColor={colors.secondary}
            accentColor={colors.accent}
            attributePoints={attributePoints}
            setAttributePoints={setAttributePoints}
            onGoToTab={setActiveTab}
          />
        )}

        {activeTab === 'quests' && (
          <QuestsTab
            quests={quests}
            setQuests={setQuests}
            addXp={addXp}
            themeColor={colors.primary}
            secondaryThemeColor={colors.secondary}
          />
        )}

        {activeTab === 'fitness' && (
          <FitnessTab
            fitness={fitness}
            setFitness={setFitness}
            addXp={addXp}
            intelligence={intelligence}
            themeColor={colors.primary}
            secondaryThemeColor={colors.secondary}
            accentColor={colors.accent}
          />
        )}

        {activeTab === 'learning' && (
          <LearningTab
            learning={learning}
            setLearning={setLearning}
            addXp={addXp}
            intelligence={intelligence}
            themeColor={colors.primary}
            secondaryThemeColor={colors.secondary}
            accentColor={colors.accent}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab
            skills={skills}
            setSkills={setSkills}
            addXp={addXp}
            themeColor={colors.primary}
            secondaryThemeColor={colors.secondary}
            accentColor={colors.accent}
          />
        )}

        {activeTab === 'data' && (
          <DataTab
            stats={stats}
            quests={quests}
            skills={skills}
            intelligence={intelligence}
            themeColor={colors.primary}
            secondaryThemeColor={colors.secondary}
            accentColor={colors.accent}
          />
        )}
      </main>

      {/* Bottom Control Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        themeColor={colors.primary}
      />

      {/* Full Character Sheets Editor */}
      <ProfileView
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        stats={stats}
        setStats={setStats}
        preferences={preferences}
        setPreferences={setPreferences}
        themeColor={colors.primary}
        secondaryThemeColor={colors.secondary}
      />

      {/* Floating Timer Bar */}
      <TimerWidget themeColor={colors.primary} secondaryThemeColor={colors.secondary} />

      {/* Level Up Fullscreen Cinematic Modal */}
      <LevelUpCinematic
        isOpen={levelUpOpen}
        onClose={() => setLevelUpOpen(false)}
        newLevel={stats.level}
        themeColor={colors.primary}
      />
    </div>
  );
}
