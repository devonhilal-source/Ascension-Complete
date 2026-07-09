import React, { useState } from 'react';
import { CharacterStats, Achievement, SkillNode, Quest } from '../types';
import { useTimer } from '../context/TimerContext';

const QuickTimerLauncher: React.FC<{ themeColor: string; secondaryThemeColor: string }> = ({ themeColor, secondaryThemeColor }) => {
  const { startPomodoro, startStopwatch, startCountdown, timer } = useTimer();
  const [customMinutes, setCustomMinutes] = useState(10);

  if (timer) return null; // widget already shows an active timer

  return (
    <div className="bg-[#0c0c0c] border border-[#222] rounded-xl p-4">
      <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: themeColor }}>
        Quick Timers
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => startPomodoro({ label: 'Focus Session', totalMinutes: 25, workMinutes: 25, breakMinutes: 5 })}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-mono uppercase tracking-wider"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          <span className="material-symbols-outlined text-base">timer</span>
          Pomodoro 25/5
        </button>
        <button
          onClick={() => startStopwatch('Stopwatch')}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-xs font-mono uppercase tracking-wider"
          style={{ borderColor: secondaryThemeColor, color: secondaryThemeColor }}
        >
          <span className="material-symbols-outlined text-base">av_timer</span>
          Stopwatch
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={180}
          value={customMinutes}
          onChange={(e) => setCustomMinutes(Number(e.target.value))}
          className="w-20 bg-[#0a0a0a] border border-[#222] rounded-lg px-2 py-2 text-sm text-[#e5e2e1] focus:outline-none"
        />
        <span className="text-xs text-[#9d9d9d] font-mono">min</span>
        <button
          onClick={() => startCountdown(customMinutes * 60, 'Countdown')}
          className="flex-1 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-bold"
          style={{ background: themeColor, color: '#050505' }}
        >
          Start Countdown
        </button>
      </div>
    </div>
  );
};

interface StatusTabProps {
  stats: CharacterStats;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  achievements: Achievement[];
  skills: SkillNode[];
  activeUrgentQuest: Quest | null;
  onCompleteUrgentQuest: () => void;
  themeColor: string;
  secondaryThemeColor: string; // tertiary green e.g. #00fe87
  accentColor: string; // purple e.g. #dfb7ff
  attributePoints: number;
  setAttributePoints: React.Dispatch<React.SetStateAction<number>>;
  onGoToTab: (tab: 'quests' | 'skills' | 'data') => void;
}

export const StatusTab: React.FC<StatusTabProps> = ({
  stats,
  setStats,
  achievements,
  skills,
  activeUrgentQuest,
  onCompleteUrgentQuest,
  themeColor,
  secondaryThemeColor,
  accentColor,
  attributePoints,
  setAttributePoints,
  onGoToTab,
}) => {
  const [selectedRewardModal, setSelectedRewardModal] = useState(false);
  const [hoveredAchievementId, setHoveredAchievementId] = useState<string | null>(null);

  // Calculate dynamic requirements
  const masteredSkillsCount = skills.filter((s) => s.status === 'mastered').length;
  const isLevelReqMet = stats.level >= 10;
  const isSkillsReqMet = masteredSkillsCount >= 3;

  // Attributes list
  const attributes = [
    { key: 'str' as keyof CharacterStats, label: 'STR', name: 'Strength' },
    { key: 'end' as keyof CharacterStats, label: 'END', name: 'Endurance' },
    { key: 'int' as keyof CharacterStats, label: 'INT', name: 'Intelligence' },
    { key: 'knw' as keyof CharacterStats, label: 'KNW', name: 'Knowledge' },
    { key: 'dis' as keyof CharacterStats, label: 'DIS', name: 'Discipline' },
    { key: 'foc' as keyof CharacterStats, label: 'FOC', name: 'Focus' },
    { key: 'cha' as keyof CharacterStats, label: 'CHA', name: 'Charisma' },
    { key: 'com' as keyof CharacterStats, label: 'COM', name: 'Combat' },
    { key: 'fin' as keyof CharacterStats, label: 'FIN', name: 'Finance' },
    { key: 'tec' as keyof CharacterStats, label: 'TEC', name: 'Technology' },
  ];

  const handleAllocatePoint = (key: keyof CharacterStats) => {
    if (attributePoints > 0) {
      setStats((prev) => ({
        ...prev,
        [key]: (prev[key] as number) + 1,
      }));
      setAttributePoints((prev) => prev - 1);
    }
  };

  // Progress Bar rendering (20 blocks)
  const totalBlocks = 20;
  const currentProgressPercent = Math.min((stats.xp / stats.targetXp) * 100, 100);
  const activeBlocksCount = Math.floor((currentProgressPercent / 100) * totalBlocks);

  return (
    <div className="space-y-8 animate-fadeIn pb-32">
      <QuickTimerLauncher themeColor={themeColor} secondaryThemeColor={secondaryThemeColor} />

      {/* Current Rank Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-6">
          {/* Decorative Glow */}
          <div 
            className="absolute inset-0 blur-[120px] rounded-full opacity-20 pointer-events-none transition-all duration-500"
            style={{ backgroundColor: themeColor }}
          />
          
          <div className="relative w-48 h-56 flex items-center justify-center">
            {/* Hexagonal Emblem Frames */}
            <div 
              className="absolute inset-0 transition-all duration-500 duration-700 animate-spin-slow opacity-40"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                border: `2px solid ${themeColor}`,
                transform: 'rotate(90deg)',
              }}
            />
            <div 
              className="absolute inset-2 transition-all duration-500 opacity-20"
              style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                border: `1px solid ${themeColor}`,
                transform: 'rotate(-45deg)',
              }}
            />
            
            {/* Rank Text */}
            <span 
              className="font-display text-[120px] leading-none select-none transition-colors"
              style={{ 
                color: themeColor,
                filter: `drop-shadow(0 0 15px ${themeColor}66)`
              }}
            >
              {stats.rank}
            </span>
            
            {/* Badge */}
            <div 
              className="absolute -bottom-2 px-4 py-1 font-mono text-[10px] tracking-widest font-bold shadow-lg"
              style={{ backgroundColor: themeColor, color: '#003543' }}
            >
              RANK
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="font-mono text-xs text-[#bbc9cf] tracking-[0.2em] uppercase opacity-75">
              INITIATE PROTOCOL
            </p>
            <p className="font-display text-xl font-bold mt-1 text-[#e5e2e1]">
              RANK LEVEL: {stats.level.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Ascension Progress & Requirements */}
        <div className="md:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-xl border-t-2 relative overflow-hidden"
               style={{ borderTopColor: themeColor }}>
            {/* Scanline Sweep */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#a5e7ff]/30 to-transparent animate-scan pointer-events-none" />

            <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="font-display text-lg font-bold" style={{ color: themeColor }}>
                  ASCENSION PROGRESS
                </h2>
                <p className="font-sans text-xs text-[#bbc9cf]">
                  Synchronizing data toward <span className="font-bold uppercase" style={{ color: accentColor }}>D RANK</span>
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold" style={{ color: secondaryThemeColor }}>
                  {Math.round(currentProgressPercent)}%
                </span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="flex gap-1 h-3 mb-6 bg-[#0e0e0e] rounded-sm p-[2px]">
              {Array.from({ length: totalBlocks }).map((_, i) => {
                const isActive = i < activeBlocksCount;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-[1px] transition-all duration-500"
                    style={{
                      backgroundColor: isActive ? themeColor : '#2a2a2a',
                      boxShadow: isActive ? `0 0 6px ${themeColor}aa` : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Rank Requirements Checklist */}
            <div className="space-y-3">
              <h3 className="font-mono text-[10px] tracking-wider text-[#bbc9cf] font-bold">
                RANK REQUIREMENTS
              </h3>
              
              <div className="space-y-2">
                {/* Level Req */}
                <div 
                  onClick={() => onGoToTab('quests')}
                  className="flex items-center justify-between p-3 bg-[#2a2a2a]/40 rounded-lg border-l-2 transition-all hover:bg-[#2a2a2a]/70 cursor-pointer"
                  style={{ borderLeftColor: isLevelReqMet ? secondaryThemeColor : '#3c494e' }}
                >
                  <span className="text-sm font-medium">Reach Level 10</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#bbc9cf] mr-1">
                      {stats.level}/10
                    </span>
                    {isLevelReqMet ? (
                      <span className="material-symbols-outlined text-sm font-bold" style={{ color: secondaryThemeColor, fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm text-[#859399]">
                        pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills Req */}
                <div 
                  onClick={() => onGoToTab('skills')}
                  className="flex items-center justify-between p-3 bg-[#2a2a2a]/40 rounded-lg border-l-2 transition-all hover:bg-[#2a2a2a]/70 cursor-pointer"
                  style={{ borderLeftColor: isSkillsReqMet ? secondaryThemeColor : '#3c494e' }}
                >
                  <span className="text-sm font-medium">Master 3 Skills</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#bbc9cf] mr-1">
                      {masteredSkillsCount}/3
                    </span>
                    {isSkillsReqMet ? (
                      <span className="material-symbols-outlined text-sm font-bold" style={{ color: secondaryThemeColor, fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-sm text-[#859399]">
                        pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Attributes points allocation banner */}
      {attributePoints > 0 && (
        <section className="glass-panel p-4 rounded-xl border border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#131313] to-[#201f1f] animate-pulse"
                 style={{ borderColor: themeColor }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl" style={{ color: themeColor }}>
              add_moderator
            </span>
            <div className="text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#e5e2e1]">
                {attributePoints} Attribute Points Available!
              </h3>
              <p className="text-xs text-[#bbc9cf]">
                Allocate points to your combat and cognitive stats below.
              </p>
            </div>
          </div>
          <div className="font-mono text-xs font-bold uppercase px-3 py-1.5 rounded" style={{ backgroundColor: themeColor, color: '#003543' }}>
            MANUAL CALIBRATION PROTOCOL ACTIVE
          </div>
        </section>
      )}

      {/* Combat & Cognitive Attributes Grid */}
      <section className="space-y-3">
        <h2 className="font-mono text-[10px] tracking-widest text-[#bbc9cf] uppercase px-1 font-bold">
          COMBAT & COGNITIVE ATTRIBUTES
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {attributes.map((attr) => {
            const currentVal = stats[attr.key] as number;
            // Calculate a color weighting
            const progressWidth = Math.min((currentVal / 30) * 100, 100);

            return (
              <div 
                key={attr.key}
                className="glass-panel p-3 rounded-xl space-y-3 hover:scale-105 active:scale-98 transition-all group duration-300 relative overflow-hidden"
                style={{
                  borderBottom: `2px solid ${themeColor}1a`
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <span className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase group-hover:text-[#e5e2e1] transition-colors">
                      {attr.label}
                    </span>
                    <span className="block text-[8px] text-[#859399] tracking-tighter capitalize">
                      {attr.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold font-semibold transition-colors" style={{ color: themeColor }}>
                    LV. {currentVal.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-[#0e0e0e] rounded-full overflow-hidden relative">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${progressWidth}%`,
                      backgroundColor: themeColor,
                      boxShadow: `0 0 10px ${themeColor}aa`
                    }}
                  />
                </div>

                {/* Allocate Plus Button */}
                {attributePoints > 0 && (
                  <button
                    onClick={() => handleAllocatePoint(attr.key)}
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs hover:scale-110 active:scale-90 transition-transform focus:outline-none"
                    style={{ backgroundColor: themeColor, color: '#003543' }}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Urgent Quest Banner */}
      {activeUrgentQuest && (
        <section 
          onClick={() => onGoToTab('quests')}
          className="glass-panel rounded-xl p-4 flex items-center justify-between border transition-all duration-300 cursor-pointer hover:scale-[1.01] hover:border-[#00fe87]/50"
          style={{ borderColor: `${secondaryThemeColor}44` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center border animate-pulse"
                 style={{ backgroundColor: `${secondaryThemeColor}11`, borderColor: `${secondaryThemeColor}33` }}>
              <span className="material-symbols-outlined font-bold text-2xl" style={{ color: secondaryThemeColor }}>
                priority_high
              </span>
            </div>
            <div className="text-left">
              <div className="font-mono text-[9px] tracking-widest font-bold" style={{ color: secondaryThemeColor }}>
                ACTIVE URGENT QUEST
              </div>
              <div className="text-sm font-bold text-[#e5e2e1] group-hover:text-white">
                {activeUrgentQuest.title}
              </div>
              <p className="text-xs text-[#bbc9cf] line-clamp-1">{activeUrgentQuest.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-[10px] text-[#859399] tracking-wider uppercase">INITIATE LINK</span>
            <span className="material-symbols-outlined text-lg" style={{ color: secondaryThemeColor }}>
              chevron_right
            </span>
          </div>
        </section>
      )}

      {/* Achievement Vault Gallery */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-display text-base font-bold text-[#e5e2e1] tracking-tight">
            ACHIEVEMENT VAULT
          </h2>
          <span className="font-mono text-[10px] text-[#bbc9cf] uppercase">
            COLLECTED: {achievements.filter((a) => a.status === 'earned').length} / {achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {achievements.map((ach) => {
            const isEarned = ach.status === 'earned';
            
            // Get gradient depending on rank
            let badgeBg = 'from-gray-700 to-gray-900 border-[#859399] text-[#859399]';
            if (isEarned) {
              if (ach.badgeType === 'gold') badgeBg = 'from-yellow-400 to-yellow-700 border-yellow-500 text-yellow-500';
              else if (ach.badgeType === 'silver') badgeBg = 'from-gray-300 to-gray-500 border-gray-300 text-gray-300';
              else if (ach.badgeType === 'bronze') badgeBg = 'from-amber-600 to-amber-900 border-amber-500 text-amber-500';
              else if (ach.badgeType === 'purple') badgeBg = `from-[#9d05ff] to-[#dfb7ff] border-[${accentColor}] text-[${accentColor}]`;
            }

            return (
              <div
                key={ach.id}
                onMouseEnter={() => setHoveredAchievementId(ach.id)}
                onMouseLeave={() => setHoveredAchievementId(null)}
                className={`glass-panel p-3 rounded-xl flex flex-col items-center text-center group cursor-pointer transition-all duration-300 relative ${
                  isEarned ? 'hover:border-[#e5e2e1]/40' : 'opacity-40 grayscale'
                }`}
                style={{
                  borderTopColor: isEarned && ach.badgeType === 'purple' ? accentColor : undefined,
                  boxShadow: isEarned && ach.badgeType === 'purple' ? `0 0 10px ${accentColor}33` : 'none'
                }}
              >
                <div 
                  className={`w-12 h-12 p-[2px] mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-115`}
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    background: isEarned 
                      ? (ach.badgeType === 'purple' ? `linear-gradient(135deg, ${accentColor}, #9d05ff)` : 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))')
                      : '#2a2a2a',
                  }}
                >
                  <div 
                    className="w-full h-full bg-[#201f1f] flex items-center justify-center"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    <span 
                      className={`material-symbols-outlined text-xl`}
                      style={{ 
                        color: isEarned 
                          ? (ach.badgeType === 'purple' ? accentColor : undefined)
                          : '#859399',
                        fontVariationSettings: isEarned ? "'FILL' 1" : "'FILL' 0"
                      }}
                    >
                      {ach.icon}
                    </span>
                  </div>
                </div>

                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#e5e2e1] truncate w-full">
                  {ach.title}
                </p>

                {/* Tooltip description */}
                {hoveredAchievementId === ach.id && (
                  <div className="absolute bottom-full mb-2 w-48 bg-[#0e0e0e]/95 border border-[#3c494e]/50 p-2 rounded-lg shadow-xl z-50 text-[10px] text-left leading-normal animate-fadeIn text-[#e5e2e1]">
                    <div className="font-bold uppercase mb-1" style={{ color: isEarned ? themeColor : '#859399' }}>
                      {ach.title}
                    </div>
                    {ach.description}
                    <div className="mt-1 font-mono text-[8px] text-[#859399] uppercase">
                      Status: {isEarned ? 'UNLOCKED' : 'LOCKED'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Trophy Detail Callout */}
      <section className="glass-panel rounded-xl p-6 relative overflow-hidden border border-[#a5e7ff]/10">
        <div className="absolute -top-10 -right-6 opacity-[0.03] text-[200px] pointer-events-none select-none">
          <span className="material-symbols-outlined text-[200px]">rewarded_ads</span>
        </div>

        <div className="max-w-xl space-y-4 text-left relative z-10">
          <div className="inline-block px-3 py-1 bg-[#00fe87]/10 border border-[#00fe87]/30 rounded text-[#00fe87] font-mono text-[10px] tracking-wider font-bold">
            PREMIUM REWARD AVAILABLE
          </div>
          <h3 className="font-display text-xl font-bold tracking-tight text-[#e5e2e1]">
            Legacy of the Initiates
          </h3>
          <p className="text-xs md:text-sm text-[#bbc9cf] leading-relaxed">
            Attaining <span className="font-bold" style={{ color: accentColor }}>D Rank</span> unlocks the exclusive{' '}
            <span className="font-bold" style={{ color: themeColor }}>Obsidian Core</span> equipment slot and the{' '}
            <span className="font-bold" style={{ color: accentColor }}>'System Glitch'</span> visual aura.
          </p>
          <button 
            onClick={() => setSelectedRewardModal(true)}
            className="px-6 py-2.5 font-mono text-[11px] tracking-widest font-bold uppercase transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95 focus:outline-none"
            style={{ 
              backgroundColor: themeColor, 
              color: '#003543',
              boxShadow: `0 0 15px ${themeColor}55`
            }}
          >
            VIEW REWARDS
          </button>
        </div>
      </section>

      {/* View Rewards Modal */}
      {selectedRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-6 text-left border relative overflow-hidden"
               style={{ borderColor: `${themeColor}44` }}>
            <button 
              onClick={() => setSelectedRewardModal(false)}
              className="absolute top-4 right-4 text-[#bbc9cf] hover:text-white focus:outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="space-y-1">
              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: themeColor }}>
                System Ledger
              </span>
              <h3 className="font-display text-lg font-bold text-[#e5e2e1]">
                Ascension Rewards Table
              </h3>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="border-b border-[#3c494e]/30 pb-3 flex justify-between items-center">
                <div>
                  <span className="font-bold" style={{ color: accentColor }}>E Rank (Current)</span>
                  <p className="text-[#bbc9cf] text-[11px]">Unlocks starting skill matrix branches.</p>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE</span>
              </div>
              <div className="border-b border-[#3c494e]/30 pb-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#e5e2e1]">D Rank (Next Tier)</span>
                  <p className="text-[#bbc9cf] text-[11px]">Unlocks Obsidian Core slots & 'System Glitch' aura.</p>
                </div>
                <span className="font-mono text-[10px] text-[#859399] bg-[#2a2a2a] px-2 py-0.5 rounded">LOCKED</span>
              </div>
              <div className="border-b border-[#3c494e]/30 pb-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#e5e2e1]">C Rank (Advanced)</span>
                  <p className="text-[#bbc9cf] text-[11px]">Unlocks dual-path automation and coven triggers.</p>
                </div>
                <span className="font-mono text-[10px] text-[#859399] bg-[#2a2a2a] px-2 py-0.5 rounded">LOCKED</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRewardModal(false)}
              className="w-full py-3 font-mono text-[11px] tracking-widest font-bold uppercase rounded-lg text-center"
              style={{ backgroundColor: themeColor, color: '#003543' }}
            >
              ACKNOWLEDGE PROTOCOL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
