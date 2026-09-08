import React, { useState } from 'react';
import { Challenge } from '../types';

interface ChallengesViewProps {
  challenges: Challenge[];
  setActiveTab: (tab: string) => void;
  setActiveLabSubtab: (subtab: string) => void;
  triggerAlertNotification: (msg: string) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  setActiveTab,
  setActiveLabSubtab,
  triggerAlertNotification
}) => {
  const [selectedChallengeModal, setSelectedChallengeModal] = useState<Challenge | null>(null);

  const handleJoinChallenge = (chal: Challenge) => {
    setSelectedChallengeModal(chal);
  };

  const handleAcceptAndLaunchInLabs = () => {
    if (!selectedChallengeModal) return;

    const chal = selectedChallengeModal;
    // Set required lab tab
    setActiveLabSubtab(chal.requiredLabType);
    setActiveTab('sparklabs');
    setSelectedChallengeModal(null);

    triggerAlertNotification(`🚀 Challenge "${chal.title}" joined! All starter files loaded in Spark Labs!`);
  };

  return (
    <div className="p-4 space-y-4 fade-in text-left">
      <div className="border-b pb-2.5 themed-border flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black themed-text font-mono">🏆 Spark Challenges Hub</h3>
          <p className="text-[9px] themed-subtext">NXT Tech Industries Hackathons & Contests</p>
        </div>
        <span className="text-[8px] uppercase tracking-widest font-black text-orange-400 bg-orange-950/40 border border-orange-800/40 py-1 px-2.5 rounded-full shadow-inner">
          Active Matches
        </span>
      </div>

      {/* CREATE MILESTONE / CHALLENGE BAR WITH '+' BUTTON */}
      <div 
        onClick={() => {
          setActiveTab('create');
          triggerAlertNotification("➕ Opening Create Milestone & Challenge Creator!");
        }}
        className="p-3 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-sky-500/10 border border-orange-500/40 rounded-2xl flex items-center justify-between cursor-pointer hover:border-orange-400 transition-all shadow-md active:scale-98"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
            +
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Create New Challenge / Milestone Bar</h4>
            <p className="text-[9px] text-slate-400">Launch a community challenge or post a project milestone</p>
          </div>
        </div>
        <span className="text-xs font-black text-orange-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          Open Form ➔
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-sky-950 via-slate-950 to-purple-950 border border-sky-500/30 text-left space-y-1 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 h-16 w-16 bg-sky-500/10 rounded-full blur-2xl"></div>
        <span className="text-[8px] uppercase font-black tracking-widest text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded inline-block">NXT Moto</span>
        <p className="text-xs italic font-extrabold text-slate-100 mt-1">"Driven by ambition to break the barrier to the Future."</p>
        <p className="text-[9px] text-slate-400 mt-0.5">Participate in our regional energy & hardware hackathons to secure funding.</p>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {challenges.map(chal => (
          <div key={chal.id} className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 themed-card relative hover:border-orange-500/50 transition-all">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-black text-white max-w-[70%]">{chal.title}</h4>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                chal.deadline === 'Expired' ? 'bg-slate-950 text-slate-500' : 'bg-orange-500 text-slate-950'
              }`}>
                {chal.deadline}
              </span>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-normal">{chal.desc}</p>

            <div className="flex items-center space-x-2 text-[9px] text-sky-400 font-mono font-bold">
              <span>Stack: {chal.techstack}</span>
              <span>• {chal.entries} Entries</span>
            </div>

            <div className="flex justify-between items-center text-[9px] pt-2 border-t border-slate-800/60">
              <div>
                <span className="text-slate-500 font-bold block text-[8px] uppercase">Reward Pool</span>
                <span className="text-sky-400 font-extrabold">{chal.reward}</span>
              </div>
              <button 
                onClick={() => {
                  if (chal.deadline === 'Expired') {
                    triggerAlertNotification("This contest has concluded.");
                  } else {
                    handleJoinChallenge(chal);
                  }
                }}
                className={`py-1 px-3.5 rounded-full text-[9px] font-black ${
                  chal.deadline === 'Expired' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'themed-accent-bg text-slate-950 active:scale-95 transition-all shadow-md'
                }`}
              >
                {chal.deadline === 'Expired' ? 'Ended' : 'Join Challenge ➔'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CHALLENGE MODAL DETAILS */}
      {selectedChallengeModal && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/85 backdrop-blur-sm animate-fade">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-4 max-h-[85%] flex flex-col space-y-3.5 overflow-y-auto">
            <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] bg-orange-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  NXT Official Hackathon
                </span>
                <h3 className="text-sm font-black text-white mt-1">{selectedChallengeModal.title}</h3>
                <p className="text-[9px] text-slate-400">Created by {selectedChallengeModal.creator}</p>
              </div>
              <button onClick={() => setSelectedChallengeModal(null)} className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                Close
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-300 leading-relaxed text-[11px]">{selectedChallengeModal.desc}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[10px]">
                <div>
                  <span className="text-slate-500 font-bold block">REWARD</span>
                  <span className="text-sky-400 font-black">{selectedChallengeModal.reward}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">TARGET LAB TOOL</span>
                  <span className="text-amber-400 font-black uppercase">{selectedChallengeModal.requiredLabType} Lab</span>
                </div>
              </div>
            </div>

            {selectedChallengeModal.starterTemplate && (
              <div className="p-2.5 bg-black rounded-xl border border-slate-900 space-y-1">
                <span className="text-[8px] text-slate-500 uppercase font-mono font-bold block">Starter Template Preview</span>
                <pre className="text-[9px] text-emerald-400 font-mono overflow-x-auto max-h-24 leading-snug">
                  {selectedChallengeModal.starterTemplate}
                </pre>
              </div>
            )}

            <button 
              onClick={handleAcceptAndLaunchInLabs}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-widest shadow-xl active:scale-98 transition-all"
            >
              🚀 Accept & Launch in Spark Labs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
