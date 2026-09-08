import React from 'react';
import { PlusIcon, LightningIcon } from './Icons';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setArcOpen: (open: boolean) => void;
  triggerLogoSparks: () => void;
  logoSparkActive: boolean;
  logoSparksList: Array<{ id: number; angle: number; distance: number; color: string }>;
  openBuddyChat: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  setArcOpen,
  triggerLogoSparks,
  logoSparkActive,
  logoSparksList,
  openBuddyChat,
  unreadNotificationsCount = 0
}) => {
  const handleLogoClick = () => {
    triggerLogoSparks();
    openBuddyChat();
  };

  return (
    <header className="py-3 px-4 sm:px-6 flex items-center justify-between border-b bg-slate-900/90 backdrop-blur-md z-40 themed-border themed-bg sticky top-0">
      <button 
        onClick={() => { setActiveTab('create'); setArcOpen(false); }}
        className={`p-2 rounded-full transition-all active:scale-90 ${activeTab === 'create' ? 'themed-accent-bg text-slate-950' : 'hover:bg-slate-800 text-slate-300'}`}
        title="Publish Spark Showcase"
      >
        <PlusIcon />
      </button>

      <div 
        className="relative cursor-pointer flex items-center space-x-2 group px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 hover:border-orange-500/60 transition-all shadow-sm" 
        onClick={handleLogoClick} 
        title="Tap VibeSpark Logo to Open Buddy AI Chat! 🤖"
      >
        <span className={`text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-sky-400 to-red-500 bg-clip-text text-transparent select-none transition-all duration-300 ${
          logoSparkActive ? 'scale-110 blur-[0.3px] brightness-125' : ''
        }`}>
          VibeSpark
        </span>
        <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1 group-hover:bg-orange-500 group-hover:text-slate-950 transition-all">
          <span>🤖</span>
          <span className="hidden sm:inline">Buddy AI</span>
        </span>

        {logoSparksList.map(spark => (
          <span
            key={spark.id}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: spark.color,
              boxShadow: `0 0 8px ${spark.color}`,
              transform: `translate(calc(-50% + ${Math.cos(spark.angle) * spark.distance}px), calc(-50% + ${Math.sin(spark.angle) * spark.distance}px)) scale(1.5)`,
              transition: 'all 1.2s cubic-bezier(0.1, 0.8, 0.2, 1)',
              opacity: 0,
            }}
          />
        ))}
      </div>

      <button 
        onClick={() => { setActiveTab('notifications'); setArcOpen(false); }}
        className={`p-2 rounded-full transition-all active:scale-90 relative ${activeTab === 'notifications' ? 'themed-accent-bg text-slate-950' : 'hover:bg-slate-800 text-red-500'}`}
        title="Notifications"
      >
        <LightningIcon />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-slate-950 animate-ping"></span>
        )}
      </button>
    </header>
  );
};
