import React, { useState } from 'react';
import { Post, Story, User } from '../types';
import { MoreIcon, SparkBoltIcon, CommentIcon, SaveIcon, ShareIcon, MessageCircleIcon } from './Icons';
import { TrendingHashtagSidebar } from './TrendingHashtagSidebar';

const FeedVideoPlayer: React.FC<{ mediaUrl: string }> = ({ mediaUrl }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
        <img 
          src={mediaUrl} 
          alt="" 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }} 
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-[10px] font-bold text-slate-300 bg-black/70 px-3 py-1 rounded-full border border-slate-800 font-mono">
            ▶ Video Stream Preview
          </span>
        </div>
      </div>
    );
  }

  return (
    <video 
      src={mediaUrl} 
      autoPlay 
      loop 
      muted 
      playsInline 
      onError={() => setHasError(true)}
      className="w-full h-full object-cover"
    />
  );
};

const ExpandableTagline: React.FC<{ title: string; tagline: string; author: string }> = ({ title, tagline, author }) => {
  const [expanded, setExpanded] = useState(false);

  // Clean title & tagline from prefix tags
  const cleanTitle = title.replace(/\[(POST|REEL|Milestone|Spark Lab)\]/gi, '').trim();
  const cleanTagline = tagline.replace(/\[(POST|REEL|Milestone|Spark Lab)\]/gi, '').trim();

  const isLong = cleanTagline.length > 50;

  return (
    <div className="px-3.5 py-2 text-left space-y-0.5 border-t border-slate-800/40 bg-slate-950/20">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-black text-white">@{author}</span>
        <h4 className="text-xs font-bold text-sky-400 font-mono">{cleanTitle}</h4>
      </div>
      <p className={`text-[11px] themed-subtext leading-relaxed ${!expanded ? 'line-clamp-1' : ''}`}>
        {cleanTagline}
      </p>
      {isLong && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-[10px] text-orange-400 font-extrabold hover:underline"
        >
          {expanded ? 'Show Less' : 'Read More...'}
        </button>
      )}
    </div>
  );
};

interface HomeFeedProps {
  posts: Post[];
  stories: Story[];
  currentUser: User;
  followingList?: string[];
  handleToggleFollow?: (username: string) => void;
  setSelectedStoryIndex: (index: number | null) => void;
  setCurrentSlideIndex: (index: number) => void;
  setStoryTimerProgress: (progress: number) => void;
  handleOpenUserProfile: (username: string) => void;
  handleThreeDotsClick: (post: Post) => void;
  handleVibeSingleTap: (postId: string | number) => void;
  handleVibePressStart: (postId: string | number, e: any) => void;
  handleVibePressEnd: (postId: string | number) => void;
  vibePressingPostId: string | number | null;
  handleXPSingleTap: (postId: string | number) => void;
  savedPosts: (string | number)[];
  setSavedPosts: (posts: (string | number)[]) => void;
  setCommentModalPost: (post: Post | null) => void;
  setActiveReelIndex: (index: number) => void;
  onDirectMessageUser: (username: string) => void;
  triggerAlertNotification: (msg: string) => void;
  onReloadAlgorithm?: () => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  posts,
  stories,
  currentUser,
  followingList = [],
  handleToggleFollow,
  setSelectedStoryIndex,
  setCurrentSlideIndex,
  setStoryTimerProgress,
  handleOpenUserProfile,
  handleThreeDotsClick,
  handleVibeSingleTap,
  handleVibePressStart,
  handleVibePressEnd,
  vibePressingPostId,
  handleXPSingleTap,
  savedPosts,
  setSavedPosts,
  setCommentModalPost,
  setActiveReelIndex,
  onDirectMessageUser,
  triggerAlertNotification,
  onReloadAlgorithm
}) => {
  const [playingMediaId, setPlayingMediaId] = useState<string | number | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [showTrendingMobile, setShowTrendingMobile] = useState<boolean>(false);

  const displayPosts = selectedHashtag
    ? posts.filter(post => {
        const query = selectedHashtag.replace('#', '').toLowerCase();
        return (
          post.projectTitle.toLowerCase().includes(query) ||
          post.tagline.toLowerCase().includes(query) ||
          (post.track && post.track.toLowerCase().includes(query)) ||
          post.author.toLowerCase().includes(query)
        );
      })
    : posts;

  const handleSelectHashtag = (tag: string) => {
    setSelectedHashtag(tag);
    triggerAlertNotification(`📈 Filtered feed by high-velocity topic: ${tag}`);
  };

  const handleClearHashtag = () => {
    setSelectedHashtag(null);
    triggerAlertNotification(`✨ Cleared topic filter. Showing all Home Feed sparks.`);
  };

  return (
    <div className="fade-in">
      {/* VibeSpark Feed Refresh Algorithm Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b themed-border backdrop-blur-sm">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 font-mono">VibeSpark Feed Algorithm</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTrendingMobile(!showTrendingMobile)}
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full transition-all border flex items-center space-x-1 active:scale-95 ${
              showTrendingMobile || selectedHashtag
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>📈 Trending</span>
            {selectedHashtag && <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>}
          </button>

          {onReloadAlgorithm && (
            <button
              onClick={() => {
                onReloadAlgorithm();
                triggerAlertNotification("✨ Feed algorithm refreshed! Surfacing new sparks & trending posts.");
              }}
              className="text-[10px] font-bold text-slate-200 hover:text-slate-950 bg-slate-800 hover:bg-orange-500 px-3 py-1 rounded-full transition-all border border-slate-700/80 flex items-center space-x-1 active:scale-95 shadow-sm"
            >
              <span>🔄 Reload</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile/Toggleable Trending Sidebar Widget */}
      {showTrendingMobile && (
        <div className="p-3 bg-slate-950/90 border-b themed-border animate-fade">
          <TrendingHashtagSidebar 
            posts={posts}
            selectedHashtag={selectedHashtag}
            onSelectHashtag={handleSelectHashtag}
            onClearHashtag={handleClearHashtag}
          />
        </div>
      )}

      {/* Desktop Layout Split Grid: Posts + Trending Sidebar */}
      <div className="p-3 lg:grid lg:grid-cols-3 lg:gap-4">
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-4">
            <TrendingHashtagSidebar 
              posts={posts}
              selectedHashtag={selectedHashtag}
              onSelectHashtag={handleSelectHashtag}
              onClearHashtag={handleClearHashtag}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">

      {/* Stories / Milestones Section */}
      <section className="px-3 py-3 bg-slate-900/20 border rounded-2xl themed-border">
        <h3 className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mb-2 px-1 text-left">Active Milestones</h3>
        <div className="flex space-x-3 overflow-x-auto scrollbar-none">
          <div 
            onClick={() => triggerAlertNotification("Upload your story slide in Spark Labs!")}
            className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
          >
            <div className="relative p-[2px] rounded-full border-2 border-dashed border-orange-500 bg-slate-950 flex items-center justify-center w-12 h-12">
              <img src={currentUser.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover opacity-60 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-orange-500 bg-slate-950/80 rounded-full px-1.5 shadow">+</span>
              </div>
            </div>
            <span className="text-[9px] text-orange-400 font-black truncate max-w-[56px]">Add Mine</span>
          </div>

          {stories.map((story, sIdx) => (
            <div 
              key={story.id} 
              onClick={() => {
                setSelectedStoryIndex(sIdx);
                setCurrentSlideIndex(0);
                setStoryTimerProgress(0);
              }}
              className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              <div className={`p-[2px] rounded-full border-2 bg-slate-950 ${
                story.watched ? 'border-slate-700' : 'border-sky-400'
              }`}>
                <img src={story.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <span className="text-[9px] themed-text truncate max-w-[56px] text-center font-bold">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Home Feed Posts */}
      <div className="space-y-4 pt-2">
        {displayPosts.length === 0 ? (
          <div className="p-8 bg-slate-900/40 rounded-2xl border themed-border text-center space-y-3">
            <span className="text-3xl">🔍</span>
            <p className="text-xs font-black themed-text">No sparks match topic "{selectedHashtag}"</p>
            <button
              onClick={handleClearHashtag}
              className="px-4 py-2 bg-orange-500 text-slate-950 font-black text-xs rounded-full shadow"
            >
              Clear Topic Filter
            </button>
          </div>
        ) : (
          displayPosts.map((post, index) => {
          const isUserFollowing = followingList.includes(post.author);
          const isSelf = post.author === currentUser.username;

          return (
            <article 
              key={post.id} 
              className="bg-slate-900/20 border-y pb-4 overflow-hidden themed-border transition-all hover:bg-slate-900/40"
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-2">
                  <div 
                    onClick={() => handleOpenUserProfile(post.author)}
                    className={`p-[1.5px] rounded-full border-2 cursor-pointer ${post.trackColor || 'border-orange-500'}`}
                  >
                    <img src={post.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p 
                        onClick={() => handleOpenUserProfile(post.author)}
                        className="text-xs font-bold themed-text cursor-pointer hover:underline"
                      >
                        @{post.author}
                      </p>

                      {/* FOLLOW / FOLLOWING BUTTON ON FEED POSTS */}
                      {!isSelf && handleToggleFollow && (
                        <button
                          onClick={() => handleToggleFollow(post.author)}
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border transition-all ${
                            isUserFollowing
                              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-red-950/40 hover:text-red-400'
                              : 'bg-orange-500 text-slate-950 border-orange-400 hover:bg-orange-400 shadow-sm'
                          }`}
                        >
                          {isUserFollowing ? 'Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold bg-slate-800 px-1 py-0.5 rounded">
                      {post.track || 'spark'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {!isSelf && (
                    <button 
                      onClick={() => onDirectMessageUser(post.author)}
                      className="p-1.5 text-sky-400 hover:bg-sky-950/40 rounded-full"
                      title={`Message @${post.author}`}
                    >
                      <MessageCircleIcon />
                    </button>
                  )}
                  <button onClick={() => handleThreeDotsClick(post)} className="text-slate-400 p-1">
                    <MoreIcon />
                  </button>
                </div>
              </div>

            {/* Interactive Media Container */}
            <div 
              className="relative w-full aspect-video bg-black overflow-hidden group cursor-pointer"
              onClick={() => setActiveReelIndex(index)}
            >
              {post?.mediaType === 'audio' ? (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center space-y-2 p-4">
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-6 bg-purple-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-10 bg-sky-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-14 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                    <span className="w-1.5 h-8 bg-pink-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                  <span className="text-3xl">🎙️</span>
                  <p className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">Playing Audio Wave Stream</p>
                </div>
              ) : post?.mediaType === 'video' ? (
                <FeedVideoPlayer mediaUrl={post.mediaUrl} />
              ) : (
                <img src={post.mediaUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span className="text-xs text-white font-extrabold tracking-wider bg-orange-500/90 px-3.5 py-1.5 rounded-full uppercase shadow-lg">⚡ Open Immersive Reels</span>
              </div>
            </div>

            {/* Title & Tagline Caption (Placed below media like Instagram) */}
            <ExpandableTagline title={post.projectTitle} tagline={post.tagline} author={post.author} />

            {/* Post Bottom Action Bar */}
            <div className="flex items-center justify-between px-3 pt-3 border-t themed-border mt-3 bg-slate-900/10">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleVibeSingleTap(post.id)}
                  onMouseDown={(e) => handleVibePressStart(post.id, e)}
                  onMouseUp={() => handleVibePressEnd(post.id)}
                  onTouchStart={(e) => handleVibePressStart(post.id, e)}
                  onTouchEnd={() => handleVibePressEnd(post.id)}
                  className={`flex items-center space-x-1.5 p-1.5 rounded-full relative transition-all ${
                    post.userVibed ? 'text-orange-500 font-black scale-110' : 'text-slate-400 hover:text-orange-400'
                  }`}
                  title="Vibe post (Hold for Supernova Vibe!)"
                >
                  <SparkBoltIcon filled={post.userVibed} />
                  <span className="text-xs font-bold">{post.vibes}</span>
                  {vibePressingPostId === post.id && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-400 animate-ping"></div>
                  )}
                </button>

                <button onClick={() => setCommentModalPost(post)} className="flex items-center space-x-1 text-slate-400 hover:text-white">
                  <CommentIcon />
                  <span className="text-xs font-mono">{post.comments.length}</span>
                </button>
              </div>

              <div className="flex items-center space-x-3.5">
                <button 
                  onClick={() => handleXPSingleTap(post.id)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-sky-400 transition-all"
                >
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                    post.userXPBoosted ? 'bg-sky-500 text-slate-950 font-black' : 'bg-sky-950 text-sky-400'
                  }`}>+XP</span>
                  <span className="text-xs font-black">{post.xpBoosts}</span>
                </button>

                <button 
                  onClick={() => {
                    if (savedPosts.includes(post.id)) {
                      setSavedPosts(savedPosts.filter(id => id !== post.id));
                    } else {
                      setSavedPosts([...savedPosts, post.id]);
                      triggerAlertNotification("Saved post to your bookmarks!");
                    }
                  }} 
                  className="p-1.5 text-slate-400 hover:text-white transition-all"
                >
                  <SaveIcon active={savedPosts.includes(post.id)} />
                </button>

                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/?post=${post.id}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(url);
                    }
                    triggerAlertNotification(`🔗 Post link copied to clipboard! (${url})`);
                  }} 
                  className="p-1.5 text-slate-400 hover:text-white transition-all active:scale-90"
                  title="Share Post Link"
                >
                  <ShareIcon />
                </button>
              </div>
            </div>
          </article>
        );
      })
      )}
      </div>
      </div>
      </div>
    </div>
  );
};
