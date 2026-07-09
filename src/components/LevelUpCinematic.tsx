import React, { useEffect, useState } from 'react';

interface LevelUpCinematicProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  themeColor: string;
}

export const LevelUpCinematic: React.FC<LevelUpCinematicProps> = ({
  isOpen,
  onClose,
  newLevel,
  themeColor,
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-hidden animate-fadeIn">
      {/* Cinematic Cyber Grid Backdrop */}
      <div className="absolute inset-0 z-0 opacity-10 flex flex-wrap gap-4 p-4 pointer-events-none">
        {Array.from({ length: 120 }).map((_, i) => (
          <div key={i} className="w-12 h-12 border border-[#a5e7ff]/20 rounded-sm" />
        ))}
      </div>

      {/* Cybernetic Neon Particle Sparks */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => {
          const delay = Math.random() * 5;
          const left = Math.random() * 100;
          const size = Math.random() * 6 + 2;
          return (
            <div
              key={i}
              className="absolute bottom-0 rounded-full animate-float-spark"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: themeColor,
                boxShadow: `0 0 10px ${themeColor}`,
                animationDelay: `${delay}s`,
                animationDuration: `${Math.random() * 6 + 4}s`,
              }}
            />
          );
        })}
      </div>

      <div className={`relative z-10 w-full max-w-lg text-center space-y-8 transition-all duration-1000 ${
        showContent ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
      }`}>
        {/* Animated Icon */}
        <div className="relative inline-flex items-center justify-center w-28 h-28">
          <div 
            className="absolute inset-0 animate-spin-slow opacity-30"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              border: `3px solid ${themeColor}`,
              transform: 'rotate(45deg)'
            }}
          />
          <div 
            className="absolute inset-2 animate-pulse"
            style={{
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              background: `radial-gradient(circle, ${themeColor}aa 0%, transparent 80%)`
            }}
          />
          <span 
            className="material-symbols-outlined text-5xl font-bold relative z-10"
            style={{ 
              color: themeColor,
              filter: `drop-shadow(0 0 10px ${themeColor})`
            }}
          >
            military_tech
          </span>
        </div>

        {/* Level Up Banner Heading */}
        <div className="space-y-2">
          <h1 
            className="font-display text-5xl md:text-6xl font-extrabold tracking-tighter uppercase select-none"
            style={{ 
              color: themeColor,
              filter: `drop-shadow(0 0 15px ${themeColor}cc)`
            }}
          >
            LEVEL UP!
          </h1>
          <p className="font-mono text-xs text-[#bbc9cf] tracking-[0.3em] uppercase">
            SYSTEM CALIBRATING ADVANCED PARAMETERS
          </p>
        </div>

        {/* Level change indicators */}
        <div className="flex items-center justify-center gap-6 py-4 px-8 bg-[#131313]/50 border border-[#3c494e]/20 rounded-2xl max-w-sm mx-auto">
          <div className="text-right">
            <span className="font-mono text-[9px] text-[#bbc9cf] uppercase block">Previous</span>
            <span className="font-display text-3xl font-bold opacity-40">LV. {Math.max(1, newLevel - 1).toString().padStart(2, '0')}</span>
          </div>
          <span className="material-symbols-outlined text-2xl text-[#bbc9cf] animate-pulse">
            double_arrow
          </span>
          <div className="text-left">
            <span className="font-mono text-[9px] text-[#bbc9cf] uppercase block" style={{ color: themeColor }}>Active</span>
            <span className="font-display text-3xl font-bold" style={{ color: themeColor }}>LV. {newLevel.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Unlocked rewards list */}
        <div className="space-y-4 max-w-sm mx-auto text-left">
          <h3 className="font-mono text-[9px] tracking-widest text-[#bbc9cf] uppercase font-bold text-center">
            REWARDS UNLOCKED
          </h3>
          <div className="space-y-2 font-sans text-xs">
            <div className="flex items-center gap-3 p-3 bg-[#2a2a2a]/40 border-l-2 rounded-r-lg" style={{ borderLeftColor: themeColor }}>
              <span className="material-symbols-outlined text-lg" style={{ color: themeColor }}>add_moderator</span>
              <div>
                <span className="font-bold text-[#e5e2e1] block">+5 Attribute Points</span>
                <span className="text-[10px] text-[#bbc9cf]">Allocated to reserve calibration ledger.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#2a2a2a]/40 border-l-2 rounded-r-lg" style={{ borderLeftColor: themeColor }}>
              <span className="material-symbols-outlined text-lg" style={{ color: themeColor }}>vpn_key</span>
              <div>
                <span className="font-bold text-[#e5e2e1] block">D-Rank Requirements Unlocked</span>
                <span className="text-[10px] text-[#bbc9cf]">Core upgrades available in skill channels.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Continue trigger */}
        <button
          onClick={onClose}
          className="px-10 py-4 font-mono text-xs tracking-widest font-bold uppercase transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-2xl relative group"
          style={{ 
            backgroundColor: themeColor, 
            color: '#003543',
            boxShadow: `0 0 25px ${themeColor}`
          }}
        >
          CONTINUE ASCENSION
        </button>
      </div>
    </div>
  );
};
