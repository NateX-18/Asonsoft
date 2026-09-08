import React from 'react';
import { HomeIcon, SearchIcon, CrossedSparksXIcon, TrophyIcon, ProfileIcon, SparkBoltIcon, MessageCircleIcon, PlusIcon } from './Icons';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveTrack: (track: string) => void;
  arcOpen: boolean;
  setArcOpen: (open: boolean) => void;
  setViewedUserProfile: (user: any) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  setActiveTrack,
  arcOpen,
  setArcOpen,
  setViewedUserProfile
}) => {
  return (
    <>
      {/* MOBILE FIXED BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-slate-900/95 border-t flex items-center justify-between px-6 pb-2 z-50 themed-border themed-bg shadow-2xl backdrop-blur-md">
        <button 
          onClick={() => { setActiveTab('home'); setActiveTrack('all'); setArcOpen(false); setViewedUserProfile(null); }} 
          className={`p-2 transition-all ${activeTab === 'home' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          title="Home Feed"
        >
          <HomeIcon active={activeTab === 'home'} />
        </button>

        <button 
          onClick={() => { setActiveTab('search'); setArcOpen(false); setViewedUserProfile(null); }} 
          className={`p-2 transition-all ${activeTab === 'search' ? 'text-sky-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          title="Search Directory"
        >
          <SearchIcon active={activeTab === 'search'} />
        </button>

        <div className="relative">
          <button
            onClick={() => setArcOpen(!arcOpen)}
            className={`w-14 h-14 -mt-6 rounded-full bg-slate-950 border-4 flex items-center justify-center transition-all ${arcOpen ? 'scale-110 border-orange-500' : 'border-slate-700 hover:border-orange-400'}`}
            title="Open Quick Actions"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-sky-400 to-red-500 flex items-center justify-center text-slate-950 transition-transform ${arcOpen ? 'rotate-45' : ''}`}>
              <CrossedSparksXIcon />
            </div>
          </button>
        </div>

        <button 
          onClick={() => { setActiveTab('challenges'); setArcOpen(false); setViewedUserProfile(null); }} 
          className={`p-2 transition-all ${activeTab === 'challenges' ? 'text-orange-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          title="Challenges & Hackathons"
        >
          <TrophyIcon active={activeTab === 'challenges'} />
        </button>

        <button 
          onClick={() => { setViewedUserProfile(null); setActiveTab('profile'); setArcOpen(false); }} 
          className={`p-2 transition-all ${activeTab === 'profile' ? 'text-orange-500 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          title="User Profile"
        >
          <ProfileIcon active={activeTab === 'profile'} />
        </button>
      </nav>

      {/* DESKTOP RESPONSIVE VERTICAL SIDEBAR MENU */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 flex-col justify-between p-5 z-50 themed-bg themed-border shadow-2xl">
        <div className="space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-sky-400 to-red-500 p-[2px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-orange-400">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight font-mono">VibeSpark</h1>
              <span className="text-[9px] text-orange-400 font-extrabold uppercase tracking-widest block">Creator Platform</span>
            </div>
          </div>

          {/* Navigation Links List */}
          <div className="space-y-1.5">
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest px-2 mb-2">Main Navigation</p>
            
            <button
              onClick={() => { setActiveTab('home'); setActiveTrack('all'); setViewedUserProfile(null); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <HomeIcon active={activeTab === 'home'} />
              <span>Home Feed</span>
            </button>

            <button
              onClick={() => { setActiveTab('search'); setViewedUserProfile(null); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'search' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <SearchIcon active={activeTab === 'search'} />
              <span>Search & Directory</span>
            </button>

            <button
              onClick={() => { setActiveTab('sparklabs'); setViewedUserProfile(null); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'sparklabs' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <SparkBoltIcon />
              <span>Spark Labs</span>
            </button>

            <button
              onClick={() => { setActiveTab('challenges'); setViewedUserProfile(null); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'challenges' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <TrophyIcon active={activeTab === 'challenges'} />
              <span>Challenges & NXT</span>
            </button>

            <button
              onClick={() => { setActiveTab('chat'); setViewedUserProfile(null); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'chat' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <MessageCircleIcon />
              <span>Buddy AI & Chat</span>
            </button>

            <button
              onClick={() => { setViewedUserProfile(null); setActiveTab('profile'); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'profile' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <ProfileIcon active={activeTab === 'profile'} />
              <span>My Profile</span>
            </button>
          </div>

          {/* Rotary Dial Quick Action Options List */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest px-2 mb-2">Rotary Dial Features</p>
            
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-900 hover:text-orange-400 transition-all ${activeTab === 'leaderboard' ? 'bg-slate-900 text-orange-400 border border-orange-500/40' : ''}`}
            >
              <span>🏆 Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveTab('audioengine')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-900 hover:text-sky-400 transition-all ${activeTab === 'audioengine' ? 'bg-slate-900 text-sky-400 border border-sky-500/40' : ''}`}
            >
              <span>🎹 Audio Wave Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('clasharena')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-900 hover:text-pink-400 transition-all ${activeTab === 'clasharena' ? 'bg-slate-900 text-pink-400 border border-pink-500/40' : ''}`}
            >
              <span>⚔️ Duet Clash Arena</span>
            </button>
          </div>
        </div>

        {/* Create Post Action Button on Desktop Sidebar */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('create')}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <PlusIcon />
            <span>Create New Spark</span>
          </button>
        </div>
      </aside>
    </>
  );
};

