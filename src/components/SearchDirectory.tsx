import React, { useState } from 'react';
import { Post, LabProject, Challenge } from '../types';
import { MessageCircleIcon } from './Icons';

interface SearchDirectoryProps {
  followersList: any[];
  posts: Post[];
  labProjects: LabProject[];
  challenges: Challenge[];
  handleOpenUserProfile: (username: string) => void;
  onDirectMessageUser: (username: string) => void;
  setActiveReelIndex: (index: number) => void;
  setActiveTab: (tab: string) => void;
}

export const SearchDirectory: React.FC<SearchDirectoryProps> = ({
  followersList,
  posts,
  labProjects,
  challenges,
  handleOpenUserProfile,
  onDirectMessageUser,
  setActiveReelIndex,
  setActiveTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState('all');

  const query = searchQuery.toLowerCase().trim();

  // Filter accounts
  const filteredAccounts = followersList.filter(acc => 
    acc.name.toLowerCase().includes(query) || acc.bio.toLowerCase().includes(query) || (acc.fullname && acc.fullname.toLowerCase().includes(query))
  );

  // Filter posts
  const filteredPosts = posts.filter(p => 
    p.projectTitle.toLowerCase().includes(query) || p.tagline.toLowerCase().includes(query) || p.author.toLowerCase().includes(query)
  );

  // Filter labs
  const filteredLabs = labProjects.filter(l => 
    l.title.toLowerCase().includes(query) || l.type.toLowerCase().includes(query)
  );

  // Filter challenges
  const filteredChallenges = challenges.filter(c => 
    c.title.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query) || c.techstack.toLowerCase().includes(query)
  );

  return (
    <div className="p-4 space-y-4 fade-in text-left">
      <div className="border-b pb-2 themed-border">
        <h3 className="text-sm font-black themed-text">🧭 Dynamic Search Engine</h3>
        <p className="text-[9px] themed-subtext">Find creators, projects, code labs, and hackathons</p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search accounts, #solar, code, music, challenges..." 
          className="w-full bg-slate-900 border rounded-xl py-2 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 themed-border pr-8"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'accounts', label: '👥 Creators' },
          { id: 'posts', label: '📰 Sparks & Posts' },
          { id: 'labs', label: '🧪 Spark Labs' },
          { id: 'challenges', label: '🏆 Challenges' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryTab(cat.id)}
            className={`py-1 px-3 text-[9px] uppercase font-black rounded-full shrink-0 transition-all ${
              categoryTab === cat.id ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* SEARCH RESULTS DISPLAY */}
      <div className="space-y-4 pt-1">
        {/* 1. ACCOUNTS RESULTS */}
        {(categoryTab === 'all' || categoryTab === 'accounts') && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-orange-400">Creators ({filteredAccounts.length})</h4>
            {filteredAccounts.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No matching creators found.</p>
            ) : (
              filteredAccounts.map((acc) => (
                <div 
                  key={acc.id} 
                  className="p-2.5 bg-slate-900 rounded-xl border flex items-center justify-between hover:border-orange-500/40 transition-all themed-card"
                >
                  <div 
                    onClick={() => handleOpenUserProfile(acc.name)}
                    className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0"
                  >
                    <img src={acc.img} alt="" className={`w-9 h-9 rounded-full object-cover ring-2 ${acc.disciplineColor}`} />
                    <div className="truncate">
                      <p className="text-xs font-bold themed-text truncate">@{acc.name}</p>
                      <p className="text-[9px] themed-subtext truncate">{acc.bio}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <button 
                      onClick={() => onDirectMessageUser(acc.name)}
                      className="p-1.5 bg-sky-500/20 text-sky-400 hover:bg-sky-500 text-slate-950 rounded-full font-bold transition-all"
                      title={`Message @${acc.name}`}
                    >
                      <MessageCircleIcon />
                    </button>
                    <button 
                      onClick={() => handleOpenUserProfile(acc.name)}
                      className="text-[10px] text-orange-400 font-bold hover:underline"
                    >
                      Profile →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. POSTS & SPARKS RESULTS */}
        {(categoryTab === 'all' || categoryTab === 'posts') && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-sky-400">Sparks & Posts ({filteredPosts.length})</h4>
            {filteredPosts.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No matching posts found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    onClick={() => setActiveReelIndex(index)}
                    className="p-2 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer hover:border-sky-400 transition-all space-y-1.5"
                  >
                    <img src={post.mediaUrl} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <p className="text-[10px] font-bold text-white truncate">{post.projectTitle}</p>
                    <span className="text-[8px] text-orange-400 font-bold block">@{post.author} • ⚡{post.vibes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. SPARK LABS RESULTS */}
        {(categoryTab === 'all' || categoryTab === 'labs') && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-purple-400">Spark Labs Projects ({filteredLabs.length})</h4>
            {filteredLabs.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No matching labs found.</p>
            ) : (
              filteredLabs.map((lab) => (
                <div 
                  key={lab.id}
                  onClick={() => setActiveTab('sparklabs')}
                  className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-400"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🧪</span>
                    <div>
                      <p className="text-xs font-bold text-white">{lab.title}</p>
                      <span className="text-[8px] text-purple-400 font-bold uppercase">{lab.type} Lab</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-sky-400 font-bold">Open Lab ➔</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. CHALLENGES RESULTS */}
        {(categoryTab === 'all' || categoryTab === 'challenges') && (
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-amber-400">Challenges ({filteredChallenges.length})</h4>
            {filteredChallenges.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No matching challenges found.</p>
            ) : (
              filteredChallenges.map((chal) => (
                <div 
                  key={chal.id}
                  onClick={() => setActiveTab('challenges')}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-400"
                >
                  <div>
                    <p className="text-xs font-black text-white">{chal.title}</p>
                    <p className="text-[9px] text-slate-400">{chal.reward}</p>
                  </div>
                  <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    Join
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
