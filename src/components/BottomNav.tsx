import React from 'react';

type TabType = 'status' | 'quests' | 'fitness' | 'learning' | 'skills' | 'data';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  themeColor: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  themeColor,
}) => {
  const tabs = [
    { id: 'status' as TabType, label: 'Status', icon: 'person' },
    { id: 'quests' as TabType, label: 'Quests', icon: 'assignment_late' },
    { id: 'fitness' as TabType, label: 'Fitness', icon: 'fitness_center' },
    { id: 'learning' as TabType, label: 'Learn', icon: 'school' },
    { id: 'skills' as TabType, label: 'Skills', icon: 'account_tree' },
    { id: 'data' as TabType, label: 'Data', icon: 'analytics' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-5 pt-2 bg-[#0c0c0c]/90 backdrop-blur-xl border-t border-[#222222] shadow-2xl rounded-t-xl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 focus:outline-none min-w-[70px] active:scale-90"
            style={{
              color: isActive ? themeColor : '#9d9d9d',
              textShadow: isActive ? `0 0 10px ${themeColor}44` : 'none',
            }}
          >
            <div
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors duration-200 ${
                isActive ? 'bg-[#181818]' : 'bg-transparent'
              }`}
              style={{
                boxShadow: isActive ? `inset 0 0 12px ${themeColor}1a` : 'none',
              }}
            >
              <span 
                className="material-symbols-outlined text-2xl transition-transform duration-200"
                style={{ 
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
                }}
              >
                {tab.icon}
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider mt-1 font-bold">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
