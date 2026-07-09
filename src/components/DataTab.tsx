import React, { useState } from 'react';
import { CharacterStats, Quest, SkillNode } from '../types';
import { IntelligenceSnapshot } from '../engine/intelligenceEngine';

interface DataTabProps {
  stats: CharacterStats;
  quests: Quest[];
  skills: SkillNode[];
  intelligence: IntelligenceSnapshot;
  themeColor: string;
  secondaryThemeColor: string; // green #00fe87
  accentColor: string; // purple
}

export const DataTab: React.FC<DataTabProps> = ({
  stats,
  quests,
  skills,
  intelligence,
  themeColor,
  secondaryThemeColor,
  accentColor,
}) => {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Real last-7-days activity, driven by actual fitness + learning completion history.
  const weeklyXpData = intelligence.weeklyActivity.map((d) => ({ day: d.day, xp: d.xp, studyHrs: 0 }));

  const maxWeeklyXp = Math.max(1, ...weeklyXpData.map((d) => d.xp));

  // Habit consistency grid: last 30 real days, true if fitness or learning was engaged that day.
  const habitConsistency = intelligence.consistency30;

  const totalCompletedDays = habitConsistency.filter(Boolean).length;
  const totalDays = habitConsistency.length;
  const consistencyPercent = Math.round((totalCompletedDays / totalDays) * 100);

  // Sector breakdown averages
  const technologyXp = skills.filter((s) => s.category === 'technology').reduce((acc, s) => acc + s.currentXp, 0);
  const fitnessXp = skills.filter((s) => s.category === 'fitness').reduce((acc, s) => acc + s.currentXp, 0);
  const mindXp = skills.filter((s) => s.category === 'mind').reduce((acc, s) => acc + s.currentXp, 0);
  const knowledgeXp = skills.filter((s) => s.category === 'knowledge').reduce((acc, s) => acc + s.currentXp, 0);

  const totalSectorXp = technologyXp + fitnessXp + mindXp + knowledgeXp || 1;

  const techShare = Math.round((technologyXp / totalSectorXp) * 100);
  const fitShare = Math.round((fitnessXp / totalSectorXp) * 100);
  const mindShare = Math.round((mindXp / totalSectorXp) * 100);
  const knowShare = Math.round((knowledgeXp / totalSectorXp) * 100);

  return (
    <div className="space-y-8 animate-fadeIn pb-32 text-left">
      {/* Weekly XP Bar Chart */}
      <section className="glass-panel p-6 rounded-xl relative overflow-hidden">
        {/* Glowing visual indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: themeColor }} />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#bbc9cf]">REAL-TIME QUANT INDEX</span>
        </div>

        <div className="mb-6">
          <span className="font-mono text-[10px] tracking-widest text-[#bbc9cf] uppercase font-bold" style={{ color: themeColor }}>
            WEEKLY XP SPECTRUM
          </span>
          <h3 className="font-display text-lg font-bold text-[#e5e2e1] mt-0.5">
            Synchronized Neural Log
          </h3>
        </div>

        {/* The SVG/CSS Bar Chart Grid */}
        <div className="h-48 flex items-end gap-3 sm:gap-6 border-b border-[#3c494e]/30 pb-2 relative">
          {/* Chart Helper Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
            <div className="w-full border-t border-[#3c494e]/10 h-[1px]" />
            <div className="w-full border-t border-[#3c494e]/10 h-[1px]" />
            <div className="w-full border-t border-[#3c494e]/10 h-[1px]" />
            <div className="w-full border-t border-[#3c494e]/10 h-[1px]" />
          </div>

          {weeklyXpData.map((data, i) => {
            const heightPercent = Math.min((data.xp / maxWeeklyXp) * 100, 100);
            const isHovered = hoveredBarIndex === i;

            return (
              <div 
                key={data.day} 
                className="flex-1 flex flex-col items-center h-full justify-end relative z-10"
                onMouseEnter={() => setHoveredBarIndex(i)}
                onMouseLeave={() => setHoveredBarIndex(null)}
              >
                {/* Hover Tooltip details */}
                {isHovered && (
                  <div className="absolute bottom-full mb-2 bg-[#0e0e0e] border border-[#3c494e]/50 p-2 rounded-lg shadow-xl text-[9px] font-mono leading-normal w-24 text-center z-50 animate-fadeIn">
                    <p className="font-bold text-[#e5e2e1]">{data.day}</p>
                    <p className="text-emerald-400 mt-0.5">+{data.xp} XP</p>
                  </div>
                )}

                {/* Animated column pillar */}
                <div 
                  className="w-full max-w-[32px] rounded-t-sm transition-all duration-700 ease-out cursor-pointer relative group"
                  style={{ 
                    height: `${heightPercent}%`,
                    background: `linear-gradient(to top, ${themeColor}1a, ${themeColor})`,
                    boxShadow: isHovered ? `0 0 15px ${themeColor}aa` : `0 0 5px ${themeColor}22`
                  }}
                >
                  {/* Subtle inner accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/40 rounded-t-sm" />
                </div>

                <span className="font-mono text-[9px] text-[#bbc9cf] mt-2 font-bold tracking-wider">
                  {data.day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Habit Consistency Heatmap */}
      <section className="glass-panel p-6 rounded-xl relative overflow-hidden">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold" style={{ color: themeColor }}>
              DISCIPLINE HEATMAP
            </span>
            <h3 className="font-display text-lg font-bold text-[#e5e2e1] mt-0.5">
              30-Day Alignment Tracker
            </h3>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-semibold" style={{ color: secondaryThemeColor }}>
              {consistencyPercent}% CONSISTENCY
            </span>
          </div>
        </div>

        {/* 30 block contribution-like map */}
        <div className="grid grid-cols-10 gap-2.5 max-w-md">
          {habitConsistency.map((completed, i) => (
            <div
              key={i}
              className="aspect-square w-full rounded-[2px] transition-all duration-300 relative group"
              style={{
                backgroundColor: completed ? themeColor : '#181818',
                boxShadow: completed ? `0 0 8px ${themeColor}77` : 'none',
                opacity: completed ? 1 : 0.4
              }}
            >
              {/* Tooltip on grid item hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[#0e0e0e] border border-[#3c494e]/50 p-1.5 rounded shadow text-[8px] font-mono whitespace-nowrap z-40">
                Day {i + 1}: {completed ? 'ALL QUETS MET ✓' : 'MISSED CHANNELS'}
              </div>
            </div>
          ))}
        </div>

        {/* Map Key legends */}
        <div className="flex items-center gap-3 mt-4 text-[9px] font-mono text-[#bbc9cf]">
          <span>MISSED</span>
          <div className="w-2.5 h-2.5 bg-[#181818] rounded-[2px] opacity-40" />
          <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: themeColor }} />
          <span>ALIGNED</span>
        </div>
      </section>

      {/* Intelligence Briefing */}
      <section className="glass-panel p-6 rounded-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-lg" style={{ color: themeColor }}>psychology</span>
          <span className="font-mono text-[10px] tracking-widest uppercase font-bold" style={{ color: themeColor }}>
            INTELLIGENCE ENGINE BRIEFING
          </span>
        </div>
        <h3 className="font-display text-base font-bold text-[#e5e2e1] mb-3">{intelligence.headline}</h3>
        <ul className="space-y-1.5">
          {intelligence.reasons.map((r, i) => (
            <li key={i} className="text-xs text-[#bbc9cf] flex items-start gap-2">
              <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: themeColor }} />
              {r}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-3 gap-2 mt-4 font-mono text-center">
          <div className="bg-[#2a2a2a]/30 p-2 rounded">
            <span className="block text-[8px] text-[#bbc9cf] uppercase">Fitness 7d</span>
            <span className="text-xs font-bold text-[#e5e2e1]">{Math.round(intelligence.fitnessCompletionRate7 * 100)}%</span>
          </div>
          <div className="bg-[#2a2a2a]/30 p-2 rounded">
            <span className="block text-[8px] text-[#bbc9cf] uppercase">Learning 7d</span>
            <span className="text-xs font-bold text-[#e5e2e1]">{Math.round(intelligence.learningCompletionRate7 * 100)}%</span>
          </div>
          <div className="bg-[#2a2a2a]/30 p-2 rounded">
            <span className="block text-[8px] text-[#bbc9cf] uppercase">Recovery Avg</span>
            <span className="text-xs font-bold text-[#e5e2e1]">{intelligence.avgRecovery !== null ? `${intelligence.avgRecovery}/100` : '—'}</span>
          </div>
        </div>
      </section>

      {/* Sector Performance Breakdowns */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Momentum Metric Card */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#bbc9cf] uppercase font-bold">
              SYSTEM TREND INDEX
            </span>
            <h3 className="font-display text-2xl font-extrabold mt-2 text-emerald-400">
              {intelligence.momentum >= 1 ? '+' : ''}{Math.round(intelligence.momentum * 100 - 100)}% Efficiency
            </h3>
            <p className="text-xs text-[#bbc9cf] mt-1 leading-relaxed">
              Overall productivity momentum modifier is running at <span className="font-bold" style={{ color: themeColor }}>{intelligence.momentum}x</span> baseline, computed from recovery, streak, missed sessions, and quest completion.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6 font-mono text-center">
            <div className="bg-[#2a2a2a]/30 p-2.5 rounded">
              <span className="block text-[8px] text-[#bbc9cf] uppercase">STREAK</span>
              <span className="text-sm font-bold text-[#e5e2e1]">{intelligence.streak} DAYS</span>
            </div>
            <div className="bg-[#2a2a2a]/30 p-2.5 rounded">
              <span className="block text-[8px] text-[#bbc9cf] uppercase">XP BOOST</span>
              <span className="text-sm font-bold" style={{ color: themeColor }}>{intelligence.boost}x</span>
            </div>
            <div className="bg-[#2a2a2a]/30 p-2.5 rounded" style={{ color: secondaryThemeColor }}>
              <span className="block text-[8px] text-[#bbc9cf] uppercase">DIRECTIVE</span>
              <span className="text-sm font-bold uppercase">{intelligence.directive}</span>
            </div>
          </div>
        </div>

        {/* Sector Shares Progress bars */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden space-y-4">
          <div>
            <span className="font-mono text-[10px] tracking-widest text-[#bbc9cf] uppercase font-bold">
              ENERGY DISPERSION SECTORS
            </span>
            <h3 className="font-display text-base font-bold text-[#e5e2e1] mt-0.5">
              Sector Specializations
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {/* Tech */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-[#bbc9cf]">
                <span>TECHNOLOGY INDEX</span>
                <span className="font-bold" style={{ color: themeColor }}>{techShare}%</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${techShare}%`, backgroundColor: themeColor }} />
              </div>
            </div>

            {/* Fitness */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-[#bbc9cf]">
                <span>FITNESS & KINESTHESIS</span>
                <span className="font-bold" style={{ color: secondaryThemeColor }}>{fitShare}%</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${fitShare}%`, backgroundColor: secondaryThemeColor }} />
              </div>
            </div>

            {/* Mind */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-[#bbc9cf]">
                <span>MINDFULNESS & STOICISM</span>
                <span className="font-bold" style={{ color: accentColor }}>{mindShare}%</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${mindShare}%`, backgroundColor: accentColor }} />
              </div>
            </div>

            {/* Knowledge */}
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[10px] text-[#bbc9cf]">
                <span>KNOWLEDGE SYNTHESIS</span>
                <span className="font-bold text-amber-400">{knowShare}%</span>
              </div>
              <div className="h-2 w-full bg-[#0e0e0e] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${knowShare}%`, backgroundColor: '#f6c343' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
