import React from 'react';

interface HeaderProps {
  tabTitle: string;
  rank: string;
  level: number;
  onAvatarClick: () => void;
  themeColor: string;
}

export const Header: React.FC<HeaderProps> = ({
  tabTitle,
  rank,
  level,
  onAvatarClick,
  themeColor,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 md:px-16 py-3 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-[#222222]">
      <div className="flex items-center gap-3">
        <button
          onClick={onAvatarClick}
          className="relative w-10 h-10 flex items-center justify-center focus:outline-none hover:scale-105 active:scale-95 transition-transform"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
        >
          {/* Border with theme glow */}
          <div 
            className="absolute inset-0 transition-colors"
            style={{ backgroundColor: themeColor }}
          />
          <div className="w-[36px] h-[36px] bg-[#0c0c0c] overflow-hidden relative z-10"
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <img
              alt="Player Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp9myWy9wkcbYLic12svSyCVi0YYv_q457Ta6if7ZxH_BSPvdq4hRQHCEy-MWl0vdQhAvjFrYnTcz6aHtNlnQExNgYYoC8en7CU67twgwCPLeouJ160tXL23DW71bVU3Q9SciT3c-z8AzvuXJp5ZHufYHvNiNOofOpRqYBm8-csGbKhpO6NZBrSmtMSU95wrgVtNf63JA7o0erN155RY0GOrRoM9RjNoMy5uPGDjf0UorDEHyQq_OUjfBjUoRef7unRRyoD0KMZrg"
            />
          </div>
        </button>
        <div>
          <h1 
            className="font-display text-lg md:text-xl font-extrabold tracking-tighter transition-colors"
            style={{ color: themeColor }}
          >
            {tabTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end justify-center font-mono text-[10px] text-[#9d9d9d]">
          <span className="font-bold">LVL {level.toString().padStart(2, '0')}</span>
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: themeColor }}>RANK {rank}</span>
        </div>
        <button 
          className="p-1 rounded-full text-[#9d9d9d] hover:text-[#e5e2e1] transition-colors relative"
          style={{ '--hover-color': themeColor } as React.CSSProperties}
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
        </button>
      </div>
    </header>
  );
};
