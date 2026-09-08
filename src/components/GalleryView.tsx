import React, { useState, useEffect, useRef } from 'react';
import { GalleryItem } from '../types';
import { SparkBoltIcon, ShareIcon, BackArrowIcon } from './Icons';

interface GalleryViewProps {
  galleryItems: GalleryItem[];
  handleOpenUserProfile: (username: string) => void;
  triggerAlertNotification: (msg: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  galleryItems,
  handleOpenUserProfile,
  triggerAlertNotification
}) => {
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(galleryItems);
  const [autoTimerProgress, setAutoTimerProgress] = useState(0);

  useEffect(() => {
    setItems(galleryItems);
  }, [galleryItems]);

  // Auto transition every 5 seconds when preview modal is active
  useEffect(() => {
    let interval: any;
    if (selectedGalleryIndex !== null) {
      interval = setInterval(() => {
        setAutoTimerProgress(prev => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 2; // updates progress over 50 steps (5 seconds)
        });
      }, 100);
    } else {
      setAutoTimerProgress(0);
    }
    return () => clearInterval(interval);
  }, [selectedGalleryIndex]);

  useEffect(() => {
    if (autoTimerProgress >= 100) {
      setSelectedGalleryIndex(curr => (curr !== null && curr < items.length - 1 ? curr + 1 : 0));
      setAutoTimerProgress(0);
    }
  }, [autoTimerProgress, items.length]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keyboard Arrow Key Navigation for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedGalleryIndex === null) return;
      if (e.key === 'ArrowRight') {
        setSelectedGalleryIndex(prev => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
        setAutoTimerProgress(0);
      } else if (e.key === 'ArrowLeft') {
        setSelectedGalleryIndex(prev => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
        setAutoTimerProgress(0);
      } else if (e.key === 'Escape') {
        setSelectedGalleryIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryIndex, items.length]);

  // Touch Swipe Gesture Navigation for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || selectedGalleryIndex === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;

    if (diffX < -40) {
      // Swiped Left -> Next Item
      setSelectedGalleryIndex(prev => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
      setAutoTimerProgress(0);
    } else if (diffX > 40) {
      // Swiped Right -> Previous Item
      setSelectedGalleryIndex(prev => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
      setAutoTimerProgress(0);
    }
    setTouchStartX(null);
  };

  // Increment Vibe Logic on Every Press
  const handleVibe = (id: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newVibes = item.vibes + 1;
        triggerAlertNotification("⚡ +1 Vibe added!");
        return { ...item, vibes: newVibes, userVibed: true };
      }
      return item;
    }));
  };

  // Increment XP Boost Logic on Every Press
  const handleXPBoost = (id: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const currentXP = item.xpBoosts || 120;
        const newXP = currentXP + 15;
        triggerAlertNotification("🚀 +15 XP Boosted!");
        return { ...item, xpBoosts: newXP, userXPBoosted: true };
      }
      return item;
    }));
  };

  return (
    <div className="p-4 space-y-4 fade-in text-left">
      <div className="flex items-center justify-between border-b pb-2 themed-border">
        <div>
          <h3 className="text-sm font-black themed-text">🔥 High-Vibe Gallery</h3>
          <p className="text-[9px] themed-subtext">Visual discovery showcases & auto-slideshows</p>
        </div>
      </div>

      {/* Grid of gallery items */}
      <div className="grid grid-cols-3 gap-1.5">
        {items.map((item, idx) => (
          <div 
            key={item.id}
            onClick={() => {
              setSelectedGalleryIndex(idx);
              setAutoTimerProgress(0);
            }}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border cursor-pointer hover:scale-95 duration-200 transition-all themed-border group"
          >
            <img src={item.img} alt="" className="w-full h-full object-cover" />
            
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1 flex items-center justify-between text-[8px] text-slate-300">
              <span className="truncate">@{item.author}</span>
              <span className="text-orange-400 font-bold">⚡{item.vibes}</span>
            </div>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="text-[9px] text-white font-extrabold bg-orange-500/90 px-2 py-0.5 rounded-full">
                Preview ➔
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* HORIZONTAL SWIPE / 5-SECOND AUTO TRANSITION FULLSCREEN GALLERY VIEWER */}
      {selectedGalleryIndex !== null && (
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-0 z-[90] bg-black text-left flex flex-col justify-between overflow-hidden animate-fade"
        >
          
          {/* Top Progress Bar */}
          <div className="absolute top-8 inset-x-0 px-4 z-40 space-y-2">
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-100"
                style={{ width: `${autoTimerProgress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedGalleryIndex(null)}
                className="bg-black/60 text-white font-extrabold text-xs py-1 px-3 rounded-full border border-slate-700/80 backdrop-blur-sm active:scale-95 transition-all flex items-center space-x-1"
              >
                <BackArrowIcon />
                <span>Close</span>
              </button>

              <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-orange-500/30 font-mono">
                {selectedGalleryIndex + 1} / {items.length} Auto-Reel
              </span>
            </div>
          </div>

          {/* Main Media Carousel Area */}
          <div className="relative flex-1 flex items-center justify-center bg-slate-950 overflow-hidden">
            
            {/* Left / Right Click Nav Overlays */}
            <button 
              onClick={() => {
                setSelectedGalleryIndex(prev => (prev !== null && prev > 0 ? prev - 1 : items.length - 1));
                setAutoTimerProgress(0);
              }}
              className="absolute left-3 z-30 w-10 h-10 rounded-full bg-black/60 text-white font-bold flex items-center justify-center border border-slate-700 active:scale-90"
            >
              ❮
            </button>

            <button 
              onClick={() => {
                setSelectedGalleryIndex(prev => (prev !== null && prev < items.length - 1 ? prev + 1 : 0));
                setAutoTimerProgress(0);
              }}
              className="absolute right-3 z-30 w-10 h-10 rounded-full bg-black/60 text-white font-bold flex items-center justify-center border border-slate-700 active:scale-90"
            >
              ❯
            </button>

            {/* Current Image */}
            <img 
              src={items[selectedGalleryIndex].img} 
              alt="" 
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50 pointer-events-none"></div>

            {/* Side Buttons Stack (Vibe, XP, Profile, Share) */}
            <div className="absolute right-4 bottom-24 z-30 flex flex-col items-center space-y-4">
              
              {/* Profile Pic */}
              <div 
                onClick={() => {
                  handleOpenUserProfile(items[selectedGalleryIndex].author);
                  setSelectedGalleryIndex(null);
                }}
                className="p-[2px] bg-slate-950 rounded-full border-2 border-orange-500 cursor-pointer active:scale-90 transition-transform"
                title={`View @${items[selectedGalleryIndex].author}`}
              >
                <img 
                  src={items[selectedGalleryIndex].avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"} 
                  alt="" 
                  className="w-10 h-10 rounded-full object-cover" 
                />
              </div>

              {/* Vibe Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleVibe(items[selectedGalleryIndex].id)}
                  className="p-3 bg-orange-500 text-slate-950 rounded-full shadow-lg active:scale-90 transition-all font-bold"
                >
                  <SparkBoltIcon filled={true} />
                </button>
                <span className="text-[10px] text-white font-mono mt-1 font-bold">
                  {items[selectedGalleryIndex].vibes}
                </span>
              </div>

              {/* +XP Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleXPBoost(items[selectedGalleryIndex].id)}
                  className="p-3 bg-sky-500 text-slate-950 rounded-full shadow-lg active:scale-90 transition-all font-black text-xs font-mono"
                >
                  +XP
                </button>
                <span className="text-[10px] text-white font-mono mt-1 font-bold">
                  {items[selectedGalleryIndex].xpBoosts || 120}
                </span>
              </div>

              {/* Share Button */}
              <button 
                onClick={() => triggerAlertNotification("Gallery Spark copied! Share link generated.")}
                className="p-3 bg-slate-900/90 text-white rounded-full border border-slate-700 active:scale-90 transition-all"
              >
                <ShareIcon />
              </button>
            </div>

            {/* Bottom Left Description Section */}
            <div className="absolute bottom-6 left-5 z-30 max-w-[70%] text-left space-y-1.5">
              <span className="text-[8px] uppercase tracking-widest bg-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full inline-block">
                {items[selectedGalleryIndex].type} Spark
              </span>

              <h4 className="text-sm font-black text-white drop-shadow">
                {items[selectedGalleryIndex].title}
              </h4>

              <p className="text-xs text-slate-200 leading-relaxed drop-shadow-sm">
                {items[selectedGalleryIndex].description || "High-Vibe showcase project created in VibeSpark Labs."}
              </p>

              <p 
                onClick={() => {
                  handleOpenUserProfile(items[selectedGalleryIndex].author);
                  setSelectedGalleryIndex(null);
                }}
                className="text-[11px] text-orange-400 font-extrabold cursor-pointer hover:underline inline-block drop-shadow-sm"
              >
                @{items[selectedGalleryIndex].author}
              </p>
            </div>
          </div>

          {/* Swipe indicator */}
          <div className="h-8 bg-black flex items-center justify-center">
            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black animate-pulse">
              Auto-scrolling 5s • Tap arrows or swipe to navigate
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
