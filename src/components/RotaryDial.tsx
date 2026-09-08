import React from 'react';

interface RotaryDialProps {
  rotaryAngle: number;
  isDragging: boolean;
  handleDialPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleDialPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  handleDialPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  setActiveTab: (tab: string) => void;
  setActiveTrack: (track: string) => void;
  setArcOpen: (open: boolean) => void;
}

export const RotaryDial: React.FC<RotaryDialProps> = ({
  rotaryAngle,
  isDragging,
  handleDialPointerDown,
  handleDialPointerMove,
  handleDialPointerUp,
  setActiveTab,
  setActiveTrack,
  setArcOpen
}) => {
  const bubbles = [
    { id: 'chats', label: '✉️', rot: 0, tab: 'chat', text: 'Chats' },
    { id: 'groups', label: '🌐', rot: 36, tab: 'groups', text: 'Groups' },
    { id: 'tech', label: '💻', rot: 72, tab: 'home', text: 'Tech Feed' },
    { id: 'music', label: '🎤', rot: 108, tab: 'home', text: 'Creative' },
    { id: 'sparklabs', label: '🧪', rot: 144, tab: 'sparklabs', text: 'Spark Labs' },
    { id: 'challenges', label: '🏆', rot: 180, tab: 'challenges', text: 'Contests' },
    { id: 'gallery', label: '🔥', rot: 216, tab: 'gallery', text: 'Gallery' },
    { id: 'hall', label: '👑', rot: 252, tab: 'hall', text: 'Leaderboard' },
    { id: 'clasharena', label: '⚔️', rot: 300, tab: 'clasharena', text: 'Clash Arena' }
  ];

  return (
    <div className="absolute bottom-[72px] inset-x-0 h-[220px] bg-slate-950/95 border-t rounded-t-[36px] z-50 flex flex-col justify-between p-3.5 shadow-2xl backdrop-blur-md animate-fade themed-border themed-bg">
      <div className="flex items-center justify-between border-b pb-1 themed-border">
        <span className="text-[9px] uppercase tracking-widest font-black text-orange-400 font-mono">Rotary Spark Dial</span>
        <span className="text-[8px] themed-subtext uppercase tracking-widest font-black">Hold & Spin to Navigate</span>
      </div>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden h-24">
        <div 
          onPointerDown={handleDialPointerDown}
          onPointerMove={handleDialPointerMove}
          onPointerUp={handleDialPointerUp}
          style={{ transform: `rotate(${rotaryAngle}deg)`, transition: isDragging ? 'none' : 'transform 0.4s ease' }}
          className="w-44 h-44 rounded-full border flex items-center justify-center relative bg-slate-900 mt-16 cursor-grab active:cursor-grabbing touch-none select-none themed-border"
        >
          {bubbles.map((bubble) => {
            const rad = (bubble.rot * Math.PI) / 180;
            const x = Math.cos(rad) * 62;
            const y = Math.sin(rad) * 62;

            return (
              <div
                key={bubble.id}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${-rotaryAngle}deg)`,
                  position: 'absolute',
                }}
                className="flex flex-col items-center justify-center"
              >
                <button
                  onClick={() => {
                    if (bubble.id === 'tech' || bubble.id === 'music') {
                      setActiveTrack(bubble.id);
                      setActiveTab('home');
                    } else {
                      setActiveTab(bubble.tab);
                    }
                    setArcOpen(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-950 font-black shadow-md themed-accent-bg active:scale-90 transition-transform"
                >
                  {bubble.label}
                </button>
                <span className="text-[7px] text-white font-extrabold tracking-tight mt-0.5 bg-slate-950/80 rounded px-1 whitespace-nowrap">
                  {bubble.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
