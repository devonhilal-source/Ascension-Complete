import React, { useState } from 'react';
import { SkillNode } from '../types';

interface SkillsTabProps {
  skills: SkillNode[];
  setSkills: React.Dispatch<React.SetStateAction<SkillNode[]>>;
  addXp: (amount: number) => void;
  themeColor: string;
  secondaryThemeColor: string; // green
  accentColor: string; // purple
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  skills,
  setSkills,
  addXp,
  themeColor,
  secondaryThemeColor,
  accentColor,
}) => {
  const [activeCategory, setActiveCategory] = useState<'technology' | 'fitness' | 'mind' | 'knowledge'>('technology');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  // Filter skills by category
  const filteredSkills = skills.filter((s) => s.category === activeCategory);

  // Default select first available or mastered skill if none selected
  const activeSkill = 
    filteredSkills.find((s) => s.id === selectedSkillId) || 
    filteredSkills.find((s) => s.status === 'available') || 
    filteredSkills[0];

  const handleSelectSkill = (skillId: string) => {
    const target = skills.find((s) => s.id === skillId);
    if (target && target.status !== 'locked') {
      setSelectedSkillId(skillId);
    }
  };

  const handleStudySkill = () => {
    if (!activeSkill || activeSkill.status === 'locked' || activeSkill.status === 'mastered') return;

    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === activeSkill.id) {
          const updatedXp = s.currentXp + 100;
          const isMastered = updatedXp >= s.targetXp;
          
          if (isMastered) {
            addXp(350); // Award character 350 XP on skill mastery
            
            // Also, unlock any child nodes!
            setTimeout(() => {
              unlockChildNodes(s.id);
            }, 100);

            return {
              ...s,
              currentXp: s.targetXp,
              status: 'mastered' as const,
            };
          }
          return {
            ...s,
            currentXp: updatedXp,
          };
        }
        return s;
      })
    );
  };

  const unlockChildNodes = (parentSkillId: string) => {
    setSkills((prev) =>
      prev.map((s) => {
        if (s.parentId === parentSkillId && s.status === 'locked') {
          return {
            ...s,
            status: 'available' as const,
            currentXp: 0
          };
        }
        return s;
      })
    );
  };

  // Find tier groups for tree rendering
  const rootNode = filteredSkills.find((s) => !s.parentId);
  const tier1Nodes = filteredSkills.filter((s) => s.parentId === rootNode?.id);
  
  // Tier 2 nodes depend on Tier 1
  const tier2Nodes = filteredSkills.filter(
    (s) => s.parentId && s.parentId !== rootNode?.id
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-32 text-center">
      {/* Category Sector Tabs */}
      <section className="mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex justify-center gap-6 min-w-max pb-2 border-b border-[#3c494e]/10">
          {[
            { id: 'technology' as const, label: 'TECHNOLOGY', icon: 'biotech' },
            { id: 'fitness' as const, label: 'FITNESS', icon: 'fitness_center' },
            { id: 'mind' as const, label: 'MIND', icon: 'psychology' },
            { id: 'knowledge' as const, label: 'KNOWLEDGE', icon: 'menu_book' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedSkillId(null);
                }}
                className="flex flex-col items-center gap-1 pb-2 px-3 border-b-2 transition-all group focus:outline-none"
                style={{
                  borderColor: isActive ? themeColor : 'transparent',
                }}
              >
                <span 
                  className={`material-symbols-outlined transition-colors text-xl ${
                    isActive ? 'text-white' : 'text-[#859399] group-hover:text-white'
                  }`}
                  style={{ color: isActive ? themeColor : undefined }}
                >
                  {cat.icon}
                </span>
                <span 
                  className={`font-mono text-[10px] font-bold tracking-widest transition-colors ${
                    isActive ? 'text-white' : 'text-[#859399] group-hover:text-white'
                  }`}
                  style={{ color: isActive ? themeColor : undefined }}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Skill Tree Visualizer Diagram */}
      <section className="relative flex flex-col items-center py-6 min-h-[400px]">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 z-0 opacity-10 flex justify-center pointer-events-none">
          <div className="w-[1px] h-full border-l border-dashed border-[#a5e7ff]" />
          <div className="w-64 h-full border-x border-dashed border-[#a5e7ff]" />
        </div>

        {/* ROOT NODE (TIER 0) */}
        {rootNode && (
          <div className="relative z-10 flex flex-col items-center mb-16">
            <button
              onClick={() => handleSelectSkill(rootNode.id)}
              className={`w-20 h-20 flex items-center justify-center transition-all duration-300 relative focus:outline-none ${
                activeSkill?.id === rootNode.id ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            >
              <div 
                className="absolute inset-0 transition-colors"
                style={{ backgroundColor: rootNode.status === 'mastered' ? secondaryThemeColor : themeColor }}
              />
              <div 
                className="w-[74px] h-[74px] bg-[#201f1f] flex items-center justify-center"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                <span 
                  className="material-symbols-outlined text-3xl font-bold"
                  style={{ 
                    color: rootNode.status === 'mastered' ? secondaryThemeColor : themeColor,
                    fontVariationSettings: "'FILL' 1"
                  }}
                >
                  {rootNode.icon}
                </span>
              </div>
            </button>
            <div className="mt-2">
              <span className="font-mono text-[8px] font-bold tracking-widest" style={{ color: secondaryThemeColor }}>
                {rootNode.status.toUpperCase()}
              </span>
              <p className="text-sm font-bold text-[#e5e2e1]">{rootNode.title}</p>
            </div>

            {/* Circuit Lines Downward */}
            <div className="absolute top-20 bottom-[-64px] w-[1px] bg-gradient-to-b from-[#00fe87]/40 to-[#a5e7ff]/40 z-0 pointer-events-none" />
          </div>
        )}

        {/* TIER 1 BRANCHES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl relative z-10">
          {tier1Nodes.map((node) => {
            const isSelected = activeSkill?.id === node.id;
            const isLocked = node.status === 'locked';
            const isMastered = node.status === 'mastered';
            const nodeColor = isMastered ? secondaryThemeColor : (isLocked ? '#3c494e' : themeColor);

            return (
              <div key={node.id} className="flex flex-col items-center relative pt-8">
                {/* Connector line to child */}
                {node.id === 'tech-linux' && (
                  <div className="absolute bottom-[-64px] w-[1px] h-16 bg-[#00fe87]/30 z-0 pointer-events-none" />
                )}

                <button
                  onClick={() => handleSelectSkill(node.id)}
                  disabled={isLocked}
                  className={`w-16 h-16 flex items-center justify-center transition-all duration-300 relative focus:outline-none ${
                    isLocked ? 'cursor-not-allowed opacity-50' : (isSelected ? 'scale-115' : 'hover:scale-108')
                  }`}
                  style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                >
                  <div 
                    className="absolute inset-0 transition-colors"
                    style={{ backgroundColor: nodeColor }}
                  />
                  <div 
                    className="w-[60px] h-[60px] bg-[#1c1b1b] flex items-center justify-center"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    <span 
                      className="material-symbols-outlined text-2xl"
                      style={{ 
                        color: nodeColor,
                        fontVariationSettings: isMastered ? "'FILL' 1" : "'FILL' 0"
                      }}
                    >
                      {node.icon}
                    </span>
                  </div>
                </button>

                <div className="mt-2 text-center">
                  <span className="font-mono text-[8px] font-bold tracking-wider" style={{ color: nodeColor }}>
                    {node.status.toUpperCase()}
                  </span>
                  <p className={`text-xs font-bold ${isLocked ? 'text-[#bbc9cf]/40' : 'text-[#e5e2e1]'}`}>
                    {node.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TIER 2 SUB-BRANCHES */}
        {tier2Nodes.length > 0 && (
          <div className="mt-16 grid grid-cols-1 w-full max-w-4xl justify-items-center relative z-10">
            {tier2Nodes.map((node) => {
              const isSelected = activeSkill?.id === node.id;
              const isLocked = node.status === 'locked';
              const isMastered = node.status === 'mastered';
              const nodeColor = isMastered ? secondaryThemeColor : (isLocked ? '#3c494e' : themeColor);

              return (
                <div key={node.id} className="flex flex-col items-center">
                  <button
                    onClick={() => handleSelectSkill(node.id)}
                    disabled={isLocked}
                    className={`w-16 h-16 flex items-center justify-center transition-all duration-300 relative focus:outline-none ${
                      isLocked ? 'cursor-not-allowed opacity-50' : (isSelected ? 'scale-115' : 'hover:scale-108')
                    }`}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    <div 
                      className="absolute inset-0 transition-colors"
                      style={{ backgroundColor: nodeColor }}
                    />
                    <div 
                      className="w-[60px] h-[60px] bg-[#1c1b1b] flex items-center justify-center"
                      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                      <span 
                        className="material-symbols-outlined text-2xl"
                        style={{ 
                          color: nodeColor,
                          fontVariationSettings: isMastered ? "'FILL' 1" : "'FILL' 0"
                        }}
                      >
                        {node.icon}
                      </span>
                    </div>
                  </button>

                  <div className="mt-2 text-center">
                    <span className="font-mono text-[8px] font-bold tracking-wider" style={{ color: nodeColor }}>
                      {node.status.toUpperCase()}
                    </span>
                    <p className={`text-xs font-bold ${isLocked ? 'text-[#bbc9cf]/40' : 'text-[#e5e2e1]'}`}>
                      {node.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Skill Details Preview Card */}
      {activeSkill && (
        <section className="text-left animate-slideDown">
          <div className="glass-panel p-6 rounded-xl relative overflow-hidden border-t-2"
               style={{ borderTopColor: activeSkill.status === 'mastered' ? secondaryThemeColor : themeColor }}>
            {/* Ambient scanline overlay */}
            <div className="absolute inset-0 scanline-effect opacity-10 pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 flex-1">
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color: themeColor }}>
                  {activeSkill.status === 'mastered' ? 'SKILL FULLY SYNCHRONIZED' : 'CURRENT SKILL TARGET'}
                </span>
                <h2 className="font-display text-xl font-extrabold text-[#e5e2e1]">
                  {activeSkill.title}
                </h2>
                <p className="text-xs text-[#bbc9cf] max-w-lg leading-relaxed">{activeSkill.description}</p>
              </div>

              {/* Progress metrics */}
              {activeSkill.status !== 'locked' && (
                <div className="w-full md:w-auto min-w-[200px] space-y-2">
                  <div className="flex justify-between items-end font-mono text-[10px] text-[#bbc9cf]">
                    <span>PROGRESS INTEGRATION</span>
                    <span className="font-bold" style={{ color: activeSkill.status === 'mastered' ? secondaryThemeColor : themeColor }}>
                      {activeSkill.currentXp} / {activeSkill.targetXp} XP
                    </span>
                  </div>

                  {/* Progressive Bar Gauge */}
                  <div className="h-4 bg-[#0e0e0e] rounded-sm p-[2px] flex gap-[2px]">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const limit = (i + 1) * 10;
                      const activePercentage = (activeSkill.currentXp / activeSkill.targetXp) * 100;
                      const isActive = activePercentage >= limit;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-[1px] transition-all duration-300"
                          style={{
                            backgroundColor: isActive 
                              ? (activeSkill.status === 'mastered' ? secondaryThemeColor : themeColor) 
                              : '#2a2a2a',
                            boxShadow: isActive 
                              ? `0 0 6px ${activeSkill.status === 'mastered' ? secondaryThemeColor : themeColor}aa` 
                              : 'none'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Resume Protocol Study Button */}
            {activeSkill.status !== 'locked' && activeSkill.status !== 'mastered' ? (
              <button
                onClick={handleStudySkill}
                className="mt-6 w-full py-3.5 font-mono text-[11px] tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 cursor-pointer shadow-lg"
                style={{ 
                  backgroundColor: themeColor, 
                  color: '#003543',
                  boxShadow: `0 0 15px ${themeColor}33`
                }}
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                ENGAGE INTENSE COGNITIVE PROTOCOL (+100 SKILL XP)
              </button>
            ) : activeSkill.status === 'mastered' ? (
              <div className="mt-6 w-full py-3.5 border font-mono text-[11px] tracking-widest font-bold uppercase text-center rounded select-none"
                   style={{ borderColor: `${secondaryThemeColor}55`, color: secondaryThemeColor, backgroundColor: `${secondaryThemeColor}11` }}>
                ✓ PROTOCOL PERMANENTLY UNLOCKED IN THE HYPER-SPHERE
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
};
