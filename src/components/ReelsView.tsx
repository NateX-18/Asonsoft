import React, { useRef, useEffect, useState } from 'react';
import { Post, User } from '../types';
import { SparkBoltIcon, CommentIcon, ShareIcon } from './Icons';

interface ReelsViewProps {
  posts: Post[];
  activeReelIndex: number;
  setActiveReelIndex: (index: number | null) => void;
  currentUser: User;
  handleVibeSingleTap: (postId: string | number) => void;
  handleVibePressStart: (postId: string | number, e: any) => void;
  handleVibePressEnd: (postId: string | number) => void;
  vibePressingPostId: string | number | null;
  vibePressValue: number;
  handleXPSingleTap: (postId: string | number) => void;
  setCommentModalPost: (post: Post | null) => void;
  handleOpenUserProfile: (username: string) => void;
  triggerAlertNotification: (msg: string) => void;
}

// Interactive Reel Video Component with Progress Slider & Error Fallback
const ReelVideoPlayer: React.FC<{ mediaUrl: string; isActive: boolean }> = ({ mediaUrl, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && !hasError) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, hasError]);

  const handleReloadVideo = () => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Video reload failed:", err);
          setHasError(true);
        });
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  };

  if (hasError) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4 z-20">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-3xl shadow-xl">
          ⚠️
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-white">Media Playback Error</h4>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">The video stream failed to load or experienced a network interrupt.</p>
        </div>
        <button
          onClick={handleReloadVideo}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs rounded-full shadow-lg active:scale-95 transition-all flex items-center space-x-2"
        >
          <span>🔄 Reload Video</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      <video
        ref={videoRef}
        src={mediaUrl}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        onError={() => setHasError(true)}
        onCanPlay={() => setHasError(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlayPause}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Mute/Unmute Overlay Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-16 right-4 z-30 p-2 bg-black/60 text-white rounded-full border border-slate-700/80 backdrop-blur-sm active:scale-95 transition-all text-xs"
        title={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? '🔇 Muted' : '🔊 Sound On'}
      </button>

      {/* Video Progress Slider Bar */}
      <div className="absolute bottom-16 inset-x-5 z-30 space-y-1 bg-black/60 p-2 rounded-xl backdrop-blur-sm border border-slate-800/60">
        <div className="flex items-center justify-between text-[8px] text-slate-300 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span className="text-orange-400 font-bold">Video Scrubber</span>
          <span>{formatTime(duration || 30)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-orange-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
      </div>
    </div>
  );
};

export const ReelsView: React.FC<ReelsViewProps> = ({
  posts,
  activeReelIndex,
  setActiveReelIndex,
  currentUser,
  handleVibeSingleTap,
  handleVibePressStart,
  handleVibePressEnd,
  vibePressingPostId,
  vibePressValue,
  handleXPSingleTap,
  setCommentModalPost,
  handleOpenUserProfile,
  triggerAlertNotification
}) => {
  const reelsContainerRef = useRef<HTMLDivElement>(null);
  const [centeredIndex, setCenteredIndex] = useState<number>(activeReelIndex ?? 0);

  useEffect(() => {
    if (activeReelIndex !== null) {
      setCenteredIndex(activeReelIndex);
    }
  }, [activeReelIndex]);

  useEffect(() => {
    const container = reelsContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const indexStr = entry.target.getAttribute('data-reel-index');
            if (indexStr !== null) {
              const idx = parseInt(indexStr, 10);
              setCenteredIndex(idx);
              if (idx !== activeReelIndex) {
                setActiveReelIndex(idx);
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.6, 0.8]
      }
    );

    const cardElements = container.querySelectorAll('[data-reel-index]');
    cardElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [posts.length, activeReelIndex]);

  useEffect(() => {
    if (reelsContainerRef.current && activeReelIndex !== null) {
      const container = reelsContainerRef.current;
      const targetElement = container.children[activeReelIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, []);

  const handleReelsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index >= 0 && index < posts.length && index !== activeReelIndex) {
      setActiveReelIndex(index);
    }
  };

  return (
    <div className="absolute inset-0 z-[80] bg-black text-left flex flex-col justify-between overflow-hidden animate-fade">
      <div 
        ref={reelsContainerRef}
        onScroll={handleReelsScroll}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {posts.map((post, idx) => (
          <div 
            key={post.id} 
            data-reel-index={idx}
            className="snap-start snap-always w-full h-[100dvh] min-h-[100dvh] relative flex items-center justify-center bg-slate-950 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {post?.mediaType === 'audio' ? (
                <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-center space-y-3 max-w-[80%] z-10">
                  <div className="flex justify-center items-center space-x-1.5 py-2">
                    <span className="w-2 h-8 bg-purple-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-14 bg-sky-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-20 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2 h-10 bg-pink-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                  <span className="text-4xl">🎙️</span>
                  <p className="text-xs text-sky-400 font-mono tracking-widest uppercase">Vibe Audio Wave Stream</p>
                </div>
              ) : post?.mediaType === 'video' ? (
                <ReelVideoPlayer mediaUrl={post.mediaUrl} isActive={centeredIndex === idx} />
              ) : (
                <img src={post.mediaUrl} alt="" className="w-full h-full object-cover opacity-95 pointer-events-none" />
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40 z-10 pointer-events-none"></div>

            {/* Meta Info: Bottom Left Corner */}
            <div className="absolute bottom-6 left-5 z-20 space-y-2 max-w-[70%] text-left">
              <span className="text-[8px] uppercase tracking-widest bg-orange-500 text-slate-950 font-black px-2 py-0.5 rounded-full inline-block">
                {post.track} Spark
              </span>
              <h4 className="text-sm font-black text-white drop-shadow">{post.projectTitle}</h4>
              <p className="text-xs text-slate-200 leading-relaxed drop-shadow-sm">{post.tagline}</p>
              <p 
                onClick={() => {
                  handleOpenUserProfile(post.author);
                  setActiveReelIndex(null);
                }}
                className="text-[11px] text-orange-400 font-extrabold cursor-pointer hover:underline inline-block drop-shadow-sm"
              >
                @{post.author}
              </p>
            </div>

            {/* Vertical Actions Stack: Right Side */}
            <div className="absolute right-4 bottom-6 flex flex-col items-center space-y-4 z-20">
              <div 
                onClick={() => {
                  handleOpenUserProfile(post.author);
                  setActiveReelIndex(null);
                }}
                className="p-[1.5px] bg-slate-950 rounded-full border-2 border-orange-500 cursor-pointer active:scale-90 transition-transform"
              >
                <img src={post.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
              </div>

              {/* Spark Charger with long-press logic */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleVibeSingleTap(post.id)}
                  onMouseDown={(e) => handleVibePressStart(post.id, e)}
                  onMouseUp={() => handleVibePressEnd(post.id)}
                  onTouchStart={(e) => handleVibePressStart(post.id, e)}
                  onTouchEnd={() => handleVibePressEnd(post.id)}
                  className={`p-3 rounded-full relative transition-all ${
                    post.userVibed ? 'bg-orange-500 text-slate-950 font-black' : 'bg-slate-950/85 text-white border border-slate-800'
                  }`}
                >
                  <SparkBoltIcon filled={post.userVibed} />
                  {vibePressingPostId === post.id && (
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-yellow-400 animate-ping" style={{ width: `${vibePressValue}%` }}></span>
                  )}
                </button>
                <span className="text-[10px] text-white font-mono mt-1 font-bold drop-shadow-md">{post.vibes}</span>
              </div>

              {/* XP Boost */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleXPSingleTap(post.id)}
                  className={`p-3 rounded-full ${
                    post.userXPBoosted ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-950/85 text-white border border-slate-800'
                  }`}
                >
                  <span className="text-[9px] font-bold font-mono">+XP</span>
                </button>
                <span className="text-[10px] text-white font-mono mt-1 font-bold drop-shadow-md">{post.xpBoosts}</span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button onClick={() => setCommentModalPost(post)} className="p-3 bg-slate-950/85 border border-slate-800 text-white rounded-full">
                  <CommentIcon />
                </button>
                <span className="text-[10px] text-white font-mono mt-1 font-bold drop-shadow-md">{post.comments.length}</span>
              </div>

              {/* Share */}
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/?reel=${post.id}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url);
                  }
                  triggerAlertNotification(`🔗 Reel link copied to clipboard!`);
                }} 
                className="p-3 bg-slate-950/85 border border-slate-800 text-white rounded-full active:scale-90 transition-transform"
                title="Share Reel Link"
              >
                <ShareIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Floating Header */}
      <div className="fixed top-4 inset-x-0 px-5 flex items-center justify-between z-[90] pointer-events-none">
        <button 
          onClick={() => setActiveReelIndex(null)}
          className="bg-black/80 text-white font-extrabold text-xs py-2 px-4 rounded-full border border-slate-700/80 backdrop-blur-md pointer-events-auto active:scale-95 transition-all shadow-xl hover:bg-orange-500 hover:text-slate-950"
        >
          ← Back to Feed
        </button>
        <span className="text-[10px] text-white/90 font-black uppercase tracking-widest bg-black/70 py-1.5 px-3.5 rounded-full backdrop-blur-md border border-slate-800 drop-shadow font-mono">
          Vibe Reels ⚡
        </span>
        <div className="w-12"></div>
      </div>

      {/* Swipe indicator */}
      <div className="absolute bottom-1 inset-x-0 h-10 flex items-center justify-center z-10 pointer-events-none bg-gradient-to-t from-black to-transparent">
        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-black animate-pulse">
          Swipe up/down to explore
        </span>
      </div>
    </div>
  );
};
