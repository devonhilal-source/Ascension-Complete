import React from 'react';
import { CharacterStats, SystemPreferences } from '../types';

interface ProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CharacterStats;
  setStats: React.Dispatch<React.SetStateAction<CharacterStats>>;
  preferences: SystemPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<SystemPreferences>>;
  themeColor: string;
  secondaryThemeColor: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  isOpen,
  onClose,
  stats,
  setStats,
  preferences,
  setPreferences,
  themeColor,
  secondaryThemeColor,
}) => {
  if (!isOpen) return null;

  const themesList = [
    { id: 'classic' as const, label: 'Luxury Gold', color: '#D4AF37', accent: '#FFF3B0' },
    { id: 'system' as const, label: 'Imp Emerald', color: '#52B788', accent: '#D8F3DC' },
    { id: 'rage' as const, label: 'Roy Crimson', color: '#9E2A2B', accent: '#FFF3B0' },
    { id: 'stealth' as const, label: 'Platinum Dark', color: '#E5E5E5', accent: '#FFFFFF' },
    { id: 'legend' as const, label: 'Radiant Auric', color: '#FFB300', accent: '#FFF3B0' },
  ];

  const handleStatChange = (key: keyof CharacterStats, value: any) => {
    setStats((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePreferenceChange = (key: keyof SystemPreferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex justify-center py-10 px-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 md:p-8 space-y-8 text-left border relative overflow-hidden"
           style={{ borderColor: `${themeColor}33` }}>
        {/* Decorative Circuit corner */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[120px]" style={{ color: themeColor }}>settings_suggest</span>
        </div>

        {/* Title Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#3c494e]/20">
          <div>
            <span className="font-mono text-[10px] tracking-widest font-bold uppercase" style={{ color: themeColor }}>
              CHARACTER SHEETS
            </span>
            <h2 className="font-display text-2xl font-extrabold text-[#e5e2e1] tracking-tight">
              Baseline Calibration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-[#bbc9cf] hover:text-white transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Section 1: Character Metadata */}
        <section className="space-y-4">
          <h3 className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase font-bold">
            IDENTITY CARD
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Agent Codename</label>
              <input
                type="text"
                value={stats.name}
                onChange={(e) => handleStatChange('name', e.target.value)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none focus:border-cyan-400"
                style={{ focusBorderColor: themeColor } as React.CSSProperties}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Current Title</label>
              <input
                type="text"
                value={stats.title}
                onChange={(e) => handleStatChange('title', e.target.value)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
              />
            </div>
          </div>

          {/* Physical specifications */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Height (cm)</label>
              <input
                type="number"
                value={stats.height}
                onChange={(e) => handleStatChange('height', parseInt(e.target.value) || 0)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Weight (kg)</label>
              <input
                type="number"
                value={stats.weight}
                onChange={(e) => handleStatChange('weight', parseInt(e.target.value) || 0)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Age (years)</label>
              <input
                type="number"
                value={stats.age}
                onChange={(e) => handleStatChange('age', parseInt(e.target.value) || 0)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Tracking baseline */}
        <section className="space-y-4">
          <h3 className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase font-bold">
            TRACKING BASELINE CONFIG
          </h3>

          {/* Theme selection preview grid */}
          <div className="space-y-2">
            <label className="text-xs text-[#bbc9cf] font-mono block">System Theme Protocol</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {themesList.map((t) => {
                const isSelected = preferences.themeProtocol === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handlePreferenceChange('themeProtocol', t.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      isSelected ? 'bg-[#2a2a2a]' : 'bg-[#1c1b1b] opacity-70 hover:opacity-100'
                    }`}
                    style={{ borderColor: isSelected ? t.color : '#3c494e/30' }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ 
                        backgroundColor: t.color,
                        boxShadow: isSelected ? `0 0 10px ${t.color}` : 'none'
                      }} 
                    />
                    <span className="font-mono text-[9px] font-bold text-[#e5e2e1]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Body Type */}
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Body Composition</label>
              <select
                value={stats.bodyType}
                onChange={(e) => handleStatChange('bodyType', e.target.value)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
              >
                <option value="lean">Lean Profile</option>
                <option value="average">Standard Average</option>
                <option value="athletic">Athletic Tier</option>
                <option value="bulk">Hypertrophy Bulk</option>
              </select>
            </div>

            {/* Studying focus level */}
            <div className="space-y-1">
              <label className="text-xs text-[#bbc9cf] font-mono">Study Intensity Level</label>
              <select
                value={stats.studyLevel}
                onChange={(e) => handleStatChange('studyLevel', e.target.value)}
                className="w-full bg-[#1c1b1b] border border-[#3c494e]/30 rounded-lg px-3 py-2 text-[#e5e2e1] focus:outline-none"
              >
                <option value="low">Low baseline focus (1-2 hours)</option>
                <option value="medium">Balanced focus (2-4 hours)</option>
                <option value="high">Elite high focus (4+ hours)</option>
              </select>
            </div>
          </div>

          {/* Daily intensity block picker */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-[#bbc9cf]">
              <span>Daily Target Intensity</span>
              <span style={{ color: themeColor }}>{stats.dailyIntensity} hours/day</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => {
                const isActive = i < stats.dailyIntensity;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleStatChange('dailyIntensity', i + 1)}
                    className="flex-1 h-8 rounded-md transition-all duration-300 border focus:outline-none cursor-pointer"
                    style={{
                      backgroundColor: isActive ? themeColor : 'transparent',
                      borderColor: isActive ? themeColor : '#3c494e/30',
                      boxShadow: isActive ? `0 0 10px ${themeColor}66` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Preference Toggles */}
        <section className="space-y-4">
          <h3 className="font-mono text-[10px] tracking-wider text-[#bbc9cf] uppercase font-bold">
            SYSTEM TELEMETRY CONTROLS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3 bg-[#131313] border border-[#3c494e]/20 rounded-xl">
              <div>
                <span className="font-bold block text-[#e5e2e1]">Daily Sync Alerts</span>
                <span className="text-[10px] text-[#bbc9cf]">Reminders for quests</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifyDailyQuests}
                onChange={(e) => handlePreferenceChange('notifyDailyQuests', e.target.checked)}
                className="rounded cursor-pointer focus:ring-0 text-[#00fe87] bg-transparent"
                style={{ color: themeColor }}
              />
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between p-3 bg-[#131313] border border-[#3c494e]/20 rounded-xl">
              <div>
                <span className="font-bold block text-[#e5e2e1]">Streak Guard</span>
                <span className="text-[10px] text-[#bbc9cf]">Notify on high risk</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifyStreakAlerts}
                onChange={(e) => handlePreferenceChange('notifyStreakAlerts', e.target.checked)}
                className="rounded cursor-pointer focus:ring-0 text-[#00fe87] bg-transparent"
                style={{ color: themeColor }}
              />
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-3 bg-[#131313] border border-[#3c494e]/20 rounded-xl">
              <div>
                <span className="font-bold block text-[#e5e2e1]">Protocol Synapses</span>
                <span className="text-[10px] text-[#bbc9cf]">System version logs</span>
              </div>
              <input
                type="checkbox"
                checked={preferences.notifySystemUpdates}
                onChange={(e) => handlePreferenceChange('notifySystemUpdates', e.target.checked)}
                className="rounded cursor-pointer focus:ring-0 text-[#00fe87] bg-transparent"
                style={{ color: themeColor }}
              />
            </div>
          </div>
        </section>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[#3c494e]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3.5 font-mono text-[11px] tracking-widest font-bold uppercase rounded-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            style={{ backgroundColor: themeColor, color: '#003543' }}
          >
            SAVING SYNAPTIC LEDGER
          </button>
        </div>
      </div>
    </div>
  );
};
