import React, { useState } from 'react';
import { Quest } from '../types';

interface QuestsTabProps {
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  addXp: (amount: number) => void;
  themeColor: string;
  secondaryThemeColor: string; // e.g. green #00fe87
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
  quests,
  setQuests,
  addXp,
  themeColor,
  secondaryThemeColor,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Custom quest form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'technology' | 'fitness' | 'mind' | 'knowledge' | 'finance'>('technology');
  const [newXp, setNewXp] = useState(100);
  const [newHasProgress, setNewHasProgress] = useState(false);
  const [newTargetProgress, setNewTargetProgress] = useState(2);

  // Filtered quests
  const filteredQuests = quests.filter((q) => q.type === activeTab);

  // Calculate completion rate
  const completedCount = filteredQuests.filter((q) => q.status === 'completed').length;
  const totalCount = filteredQuests.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // SVG progress ring settings
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  const handleToggleComplete = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          const isCompleting = q.status !== 'completed';
          if (isCompleting) {
            // Trigger particle flash & add XP
            addXp(q.xp);
            return { ...q, status: 'completed' as const };
          } else {
            // Undo complete
            addXp(-q.xp);
            return { ...q, status: 'pending' as const };
          }
        }
        return q;
      })
    );
  };

  const handleAddProgress = (questId: string, amount: number) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.currentProgress !== undefined && q.targetProgress !== undefined) {
          const updatedProgress = Math.min(q.currentProgress + amount, q.targetProgress);
          const isNowCompleted = updatedProgress >= q.targetProgress;
          
          if (isNowCompleted && q.status !== 'completed') {
            addXp(q.xp);
            return {
              ...q,
              currentProgress: updatedProgress,
              status: 'completed' as const
            };
          }
          return {
            ...q,
            currentProgress: updatedProgress
          };
        }
        return q;
      })
    );
  };

  const handleDeleteQuest = (questId: string) => {
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: newTitle,
      description: `User defined objective to calibrate ${newCategory.toUpperCase()} parameters.`,
      xp: newXp,
      status: 'pending',
      type: activeTab,
      category: newCategory,
      currentProgress: newHasProgress ? 0 : undefined,
      targetProgress: newHasProgress ? newTargetProgress : undefined,
    };

    setQuests((prev) => [...prev, newQuest]);
    
    // Reset form states
    setNewTitle('');
    setNewXp(100);
    setNewHasProgress(false);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-32">
      {/* Progress Ring Gauge */}
      <section className="flex flex-col items-center py-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              className="text-[#2a2a2a] stroke-current"
              cx="50"
              cy="50"
              fill="transparent"
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Foreground Circle */}
            <circle
              className="transition-all duration-700 ease-out"
              style={{
                stroke: themeColor,
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                filter: `drop-shadow(0 0 8px ${themeColor}66)`,
              }}
              cx="50"
              cy="50"
              fill="transparent"
              r={radius}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-[9px] text-[#bbc9cf] uppercase tracking-wider font-semibold">
              COMPLETION
            </span>
            <span className="font-display text-4xl font-extrabold" style={{ color: themeColor }}>
              {completionRate}%
            </span>
          </div>
          {/* Ambient Glow */}
          <div 
            className="absolute inset-0 blur-3xl opacity-20 -z-10 rounded-full transition-colors"
            style={{ backgroundColor: themeColor }}
          />
        </div>

        <div className="mt-4 px-4 py-1.5 bg-[#2a2a2a]/50 border border-[#3c494e]/30 rounded-full select-none">
          <span className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color: secondaryThemeColor }}>
            PROTOCOL: ACTIVE
          </span>
        </div>
      </section>

      {/* Quest Category / Interval Selector */}
      <nav className="flex justify-center gap-4 border-b border-[#3c494e]/20 pb-1">
        {(['daily', 'weekly', 'monthly'] as const).map((interval) => {
          const isActive = activeTab === interval;
          return (
            <button
              key={interval}
              onClick={() => {
                setActiveTab(interval);
                setShowAddForm(false);
              }}
              className="flex flex-col items-center focus:outline-none px-4 py-2 transition-all font-mono"
            >
              <span 
                className={`text-xs font-bold tracking-widest transition-colors ${
                  isActive ? 'text-[#e5e2e1]' : 'text-[#859399]'
                }`}
                style={{ color: isActive ? themeColor : undefined }}
              >
                {interval.toUpperCase()}
              </span>
              <div 
                className="h-[2px] w-8 mt-2 rounded-full transition-all duration-300"
                style={{ backgroundColor: isActive ? themeColor : 'transparent' }}
              />
            </button>
          );
        })}
      </nav>

      {/* Initialize New Objective Trigger */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-4 border-2 border-dashed border-[#3c494e]/30 rounded-xl flex items-center justify-center gap-2 hover:bg-[#201f1f]/50 hover:border-[#a5e7ff]/30 transition-all text-[#bbc9cf] hover:text-[#e5e2e1]"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span className="font-mono text-[10px] tracking-widest font-bold uppercase">
            INITIALIZE NEW OBJECTIVE
          </span>
        </button>
      )}

      {/* Quest Creation Form */}
      {showAddForm && (
        <form onSubmit={handleCreateQuest} className="glass-panel p-6 rounded-xl border border-[#3c494e]/30 text-left space-y-4 animate-slideDown">
          <div className="flex justify-between items-center pb-2 border-b border-[#3c494e]/20">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: themeColor }}>
              Initialize Custom Objective
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-[#bbc9cf] hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="space-y-1">
              <label className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase">Objective Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Completed morning deadlifts"
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:ring-1 focus:ring-offset-0 focus:outline-none"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase">Category Sector</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
                >
                  <option value="technology">Technology</option>
                  <option value="fitness">Fitness</option>
                  <option value="mind">Mind</option>
                  <option value="knowledge">Knowledge</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase">XP Reward</label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={newXp}
                  onChange={(e) => setNewXp(parseInt(e.target.value) || 50)}
                  className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
                />
              </div>
            </div>

            {/* Checkbox for custom progressive tracked inputs */}
            <div className="flex items-center gap-2 pt-2">
              <input
                id="hasProgress"
                type="checkbox"
                checked={newHasProgress}
                onChange={(e) => setNewHasProgress(e.target.checked)}
                className="bg-[#1c1b1b] border-[#3c494e]/30 rounded text-[#00fe87] focus:ring-0 cursor-pointer"
                style={{ color: themeColor }}
              />
              <label htmlFor="hasProgress" className="font-mono text-[10px] text-[#bbc9cf] uppercase cursor-pointer select-none">
                Enable Progressive Tracking (e.g. Hours/Sets)
              </label>
            </div>

            {newHasProgress && (
              <div className="space-y-1 animate-slideDown">
                <label className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase">Target Goal Units (e.g. Hours / Reps)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={newTargetProgress}
                  onChange={(e) => setNewTargetProgress(parseInt(e.target.value) || 2)}
                  className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 font-mono text-[11px] tracking-widest font-bold uppercase rounded-lg text-center cursor-pointer transition-transform hover:scale-[1.01] active:scale-98"
            style={{ backgroundColor: themeColor, color: '#003543' }}
          >
            CONFIRM PROTOCOL CALIBRATION
          </button>
        </form>
      )}

      {/* Quests Listing */}
      <div className="space-y-3">
        {filteredQuests.length === 0 ? (
          <div className="glass-panel p-6 rounded-xl text-center text-[#bbc9cf] text-sm">
            All protocols fully synchronized. No pending objectives in this sector.
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const isCompleted = quest.status === 'completed';
            const hasProgress = quest.currentProgress !== undefined && quest.targetProgress !== undefined;

            return (
              <div
                key={quest.id}
                className="glass-panel rounded-xl p-4 flex items-center justify-between border-l-4 transition-all duration-300 relative overflow-hidden group hover:translate-x-1"
                style={{
                  borderLeftColor: isCompleted ? secondaryThemeColor : themeColor,
                  borderBottom: `1px solid ${themeColor}1a`
                }}
              >
                {/* Completed subtle sweep effect */}
                {isCompleted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00fe87]/5 via-transparent to-transparent pointer-events-none" />
                )}

                {/* Left Toggle and Information */}
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleToggleComplete(quest.id)}
                    className="focus:outline-none hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div 
                      className="w-6 h-6 border-2 flex items-center justify-center rounded-sm transition-all"
                      style={{ 
                        borderColor: isCompleted ? secondaryThemeColor : themeColor,
                        backgroundColor: isCompleted ? secondaryThemeColor : 'transparent'
                      }}
                    >
                      {isCompleted && (
                        <span className="material-symbols-outlined font-bold text-xs text-[#131313]">
                          check
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="text-left flex-1 max-w-lg pr-4">
                    <h3 
                      className={`text-sm md:text-base font-bold transition-all ${
                        isCompleted ? 'line-through opacity-50 text-[#e5e2e1]' : 'text-[#e5e2e1]'
                      }`}
                    >
                      {quest.title}
                    </h3>
                    <p className="font-mono text-[9px] uppercase tracking-wider mt-0.5" style={{ color: isCompleted ? secondaryThemeColor : '#bbc9cf' }}>
                      {quest.category} // STATUS: {isCompleted ? 'SYNCED' : 'PENDING'}
                    </p>

                    {/* Progress tracking bars */}
                    {hasProgress && !isCompleted && (
                      <div className="space-y-1.5 mt-3 w-full">
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#bbc9cf]">
                          <span>CALIBRATION PROGRESS</span>
                          <span className="font-bold" style={{ color: themeColor }}>
                            {quest.currentProgress} / {quest.targetProgress} units
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0e0e0e] rounded-full overflow-hidden relative">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(quest.currentProgress! / quest.targetProgress!) * 100}%`,
                              backgroundColor: themeColor,
                              boxShadow: `0 0 6px ${themeColor}aa`
                            }}
                          />
                        </div>
                        {/* Incremental Study Button */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAddProgress(quest.id, 0.25)}
                            className="px-2 py-1 bg-[#2a2a2a] text-[9px] font-mono rounded hover:bg-[#353534] text-[#e5e2e1] focus:outline-none"
                          >
                            +15m
                          </button>
                          <button
                            onClick={() => handleAddProgress(quest.id, 0.5)}
                            className="px-2 py-1 bg-[#2a2a2a] text-[9px] font-mono rounded hover:bg-[#353534] text-[#e5e2e1] focus:outline-none"
                          >
                            +30m
                          </button>
                          <button
                            onClick={() => handleAddProgress(quest.id, 1)}
                            className="px-2 py-1 bg-[#2a2a2a] text-[9px] font-mono rounded hover:bg-[#353534] text-[#e5e2e1] focus:outline-none"
                          >
                            +1h
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right actions: XP value & Delete */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span 
                      className="font-mono text-sm md:text-base font-bold transition-all"
                      style={{ color: isCompleted ? secondaryThemeColor : themeColor }}
                    >
                      +{quest.xp} XP
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteQuest(quest.id)}
                    className="p-1.5 text-[#bbc9cf]/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
                    title="Purge objective"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
