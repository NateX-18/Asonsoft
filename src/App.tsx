import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Post, GalleryItem, LabProject, Challenge, Chat, GroupChat, NotificationItem, Story 
} from './types';
import { 
  initialCurrentUser, initialFollowersList, initialFollowingList, initialPosts, 
  initialGalleryGridItems, initialLabProjects, initialChallenges, initialChats, 
  initialGroups, initialNotifications, initialStories 
} from './mockData';

import { Header } from './components/Header';
import { RotaryDial } from './components/RotaryDial';
import { Navigation } from './components/Navigation';
import { HomeFeed } from './components/HomeFeed';
import { GalleryView } from './components/GalleryView';
import { ReelsView } from './components/ReelsView';
import { SparkLabsView } from './components/SparkLabsView';
import { SearchDirectory } from './components/SearchDirectory';
import { ChallengesView } from './components/ChallengesView';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { NotificationsView } from './components/NotificationsView';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthPortal } from './components/AuthPortal';
import { SendIcon, ShareIcon } from './components/Icons';
import { 
  auth, 
  onAuthStateChanged, 
  ensureUserProfileInFirestore, 
  seedInitialNotificationsIfEmpty, 
  subscribeToNotifications 
} from './services/firebase';

export default function App() {
  // Splash & Onboarding
  const [showSplash, setShowSplash] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vibespark_authenticated') === 'true';
  });

  // App Theme
  const [currentTheme, setCurrentTheme] = useState<string>('dark');
  const [globalNotification, setGlobalNotification] = useState('');

  // Active Views & Navigation
  const [activeTab, setActiveTab] = useState('home');
  const [activeTrack, setActiveTrack] = useState('all');
  const [arcOpen, setArcOpen] = useState(false);

  // Rotary Dial Physics State
  const [rotaryAngle, setRotaryAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ cx: 0, cy: 0, startAngle: 0, baseAngle: 0 });

  // Data States
  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [galleryGridItems, setGalleryGridItems] = useState<GalleryItem[]>(initialGalleryGridItems);
  const [labProjects, setLabProjects] = useState<LabProject[]>(initialLabProjects);
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [groups, setGroups] = useState<GroupChat[]>(initialGroups);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Sync real-time Firebase notifications
  useEffect(() => {
    seedInitialNotificationsIfEmpty(initialNotifications);
    const unsub = subscribeToNotifications((liveNotifs) => {
      if (liveNotifs && liveNotifs.length > 0) {
        setNotifications(liveNotifs);
      }
    });

    // Check stored user session
    const storedUser = localStorage.getItem('vibespark_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn("Failed parsing stored user:", e);
      }
    }

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const liveProfile = await ensureUserProfileInFirestore(fbUser);
        if (liveProfile) {
          setCurrentUser(liveProfile as User);
          setIsAuthenticated(true);
          localStorage.setItem('vibespark_authenticated', 'true');
          localStorage.setItem('vibespark_user', JSON.stringify(liveProfile));
        }
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
      if (typeof unsubAuth === 'function') unsubAuth();
    };
  }, []);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [followersList, setFollowersList] = useState(initialFollowersList);
  const [followingList, setFollowingList] = useState(initialFollowingList);

  // Interactive Overlays & Modals
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [storyTimerProgress, setStoryTimerProgress] = useState(0);
  const [isStoryPaused, setIsStoryPaused] = useState<boolean>(false);
  const [lastReactionEmoji, setLastReactionEmoji] = useState<string | null>(null);
  const [screenShakeActive, setScreenShakeActive] = useState<boolean>(false);

  // Spark Labs Subtab
  const [activeLabSubtab, setActiveLabSubtab] = useState('image');
  const [showCreateLabModal, setShowCreateLabModal] = useState(false);

  // DM / Group Active Targets
  const [activeChatId, setActiveChatId] = useState<string | number | null>(null);
  const [activeGroupChatId, setActiveGroupChatId] = useState<string | number | null>(null);
  const [showGroupCreation, setShowGroupCreation] = useState(false);

  // User Profile Router
  const [viewedUserProfile, setViewedUserProfile] = useState<any | null>(null);
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<(string | number)[]>([]);

  // Post Options & Comment Modal
  const [threeDotsPost, setThreeDotsPost] = useState<Post | null>(null);
  const [commentModalPost, setCommentModalPost] = useState<Post | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Supernova Vibe & Spark FX
  const [vibePressingPostId, setVibePressingPostId] = useState<string | number | null>(null);
  const [vibePressValue, setVibePressValue] = useState(0);
  const pressTimerRef = useRef<any>(null);
  const [supernovaFlash, setSupernovaFlash] = useState(false);
  const [logoSparkActive, setLogoSparkActive] = useState(false);
  const [logoSparksList, setLogoSparksList] = useState<Array<{ id: number; angle: number; distance: number; color: string }>>([]);

  // Hall of Sparks Leaderboard states
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [rainbowTargetId, setRainbowTargetId] = useState<string | number | null>(null);

  // Clash Arena states
  const [clashMatchStarted, setClashMatchStarted] = useState(false);
  const [clashWinner, setClashWinner] = useState<string | null>(null);

  // Helper to open Buddy Chat directly when logo is tapped
  const openBuddyChat = () => {
    setActiveTab('chat');
    setActiveChatId(99);
    setArcOpen(false);
    setViewedUserProfile(null);
  };

  // Sync data with backend API endpoints on load
  useEffect(() => {
    const fetchServerData = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated && authData.user) {
            setIsAuthenticated(true);
            setCurrentUser(authData.user);
          }
        }

        const chatsRes = await fetch('/api/chats');
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json();
          if (chatsData.chats && chatsData.chats.length > 0) {
            setChats(chatsData.chats);
          }
        }

        const postsRes = await fetch('/api/posts');
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          if (postsData.posts && postsData.posts.length > 0) {
            setPosts(postsData.posts);
          }
        }

        const labsRes = await fetch('/api/labs');
        if (labsRes.ok) {
          const labsData = await labsRes.json();
          if (labsData.labs && labsData.labs.length > 0) {
            setLabProjects(labsData.labs);
          }
        }
      } catch (err) {
        console.warn("Backend data fetch warning:", err);
      } finally {
        setTimeout(() => {
          setShowSplash(false);
          const tooltipShown = localStorage.getItem('vibespark_rotary_tooltip_shown');
          if (!tooltipShown) {
            setShowTooltip(true);
          }
        }, 1800);
      }
    };

    fetchServerData();
  }, []);

  // Story Slides Progress Timer
  useEffect(() => {
    let interval: any;
    if (selectedStoryIndex !== null) {
      const activeStory = stories[selectedStoryIndex];
      if (!activeStory || !activeStory.slides || activeStory.slides.length === 0) {
        setSelectedStoryIndex(null);
        return;
      }
      interval = setInterval(() => {
        setStoryTimerProgress(prev => {
          if (isStoryPaused) {
            return prev;
          }
          if (prev >= 100) {
            if (currentSlideIndex < (activeStory.slides?.length || 1) - 1) {
              setCurrentSlideIndex(prevIdx => prevIdx + 1);
              return 0;
            } else {
              if (selectedStoryIndex < stories.length - 1) {
                setStories(prevStories => prevStories.map((st, sIdx) => 
                  sIdx === selectedStoryIndex ? { ...st, watched: true } : st
                ));
                setSelectedStoryIndex(prevIdx => prevIdx + 1);
                setCurrentSlideIndex(0);
                return 0;
              } else {
                setStories(prevStories => prevStories.map((st, sIdx) => 
                  sIdx === selectedStoryIndex ? { ...st, watched: true } : st
                ));
                setSelectedStoryIndex(null);
                setCurrentSlideIndex(0);
                return 0;
              }
            }
          }
          return prev + 4; 
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [selectedStoryIndex, currentSlideIndex, stories, isStoryPaused]);

  const triggerAlertNotification = (msg: string) => {
    setGlobalNotification(msg);
    setTimeout(() => {
      setGlobalNotification('');
    }, 3000);
  };

  // Rotary Dial Pointer Drag Handlers
  const handleDialPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clickAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    
    dragStartRef.current = { cx, cy, startAngle: clickAngle, baseAngle: rotaryAngle };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setShowTooltip(false); 
  };

  const handleDialPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const { cx, cy, startAngle, baseAngle } = dragStartRef.current;
    const currentAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const delta = currentAngle - startAngle;
    setRotaryAngle(baseAngle + delta);
  };

  const handleDialPointerUp = () => {
    setIsDragging(false);
  };

  // Logo Sparks FX
  const triggerLogoSparks = () => {
    setLogoSparkActive(true);
    const newSparks = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30) * (Math.PI / 180);
      const randomDist = 40 + Math.random() * 30;
      return {
        id: Date.now() + i,
        angle,
        distance: randomDist,
        color: i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#0284c7' : '#ef4444'
      };
    });
    setLogoSparksList(newSparks);
    setTimeout(() => {
      setLogoSparkActive(false);
      setLogoSparksList([]);
    }, 1200);
  };

  // Single Tap Vibe
  const handleVibeSingleTap = (postId: string | number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.author === currentUser.username) {
      triggerAlertNotification("🚫 You cannot vibe your own Spark posts!");
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isVibed = p.userVibed;
        return {
          ...p,
          userVibed: !isVibed,
          vibes: isVibed ? p.vibes - 1 : p.vibes + 1
        };
      }
      return p;
    }));
  };

  // Single Tap XP Boost
  const handleXPSingleTap = (postId: string | number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.author === currentUser.username) {
      triggerAlertNotification("🚫 You cannot XP boost your own Spark posts!");
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isBoosted = p.userXPBoosted;
        return {
          ...p,
          userXPBoosted: !isBoosted,
          xpBoosts: isBoosted ? p.xpBoosts - 1 : p.xpBoosts + 1
        };
      }
      return p;
    }));
  };

  // Long-press Supernova Vibe Haptics
  const handleVibePressStart = (postId: string | number, e: any) => {
    e.preventDefault();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.author === currentUser.username) {
      triggerAlertNotification("🚫 You cannot vibe your own Spark posts!");
      return;
    }

    setVibePressingPostId(postId);
    setVibePressValue(0);

    pressTimerRef.current = setInterval(() => {
      setVibePressValue(prev => {
        if (prev >= 100) {
          clearInterval(pressTimerRef.current);
          triggerSupernovaVibe(postId);
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  const handleVibePressEnd = (postId: string | number) => {
    clearInterval(pressTimerRef.current);
    if (vibePressingPostId === postId && vibePressValue > 0 && vibePressValue < 100) {
      const post = posts.find(p => p.id === postId);
      if (post && !post.userVibed) {
        handleVibeSingleTap(postId);
      }
    }
    setVibePressingPostId(null);
    setVibePressValue(0);
  };

  const triggerSupernovaVibe = (postId: string | number) => {
    setSupernovaFlash(true);
    setScreenShakeActive(true);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40, 60, 120]);
      } catch (e) {}
    }
    setTimeout(() => {
      setSupernovaFlash(false);
      setScreenShakeActive(false);
    }, 800);
    triggerAlertNotification("🔥 Supernova Spark Vibe (+10 Vibes) Activated!");

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, vibes: p.vibes + 10, userVibed: true };
      }
      return p;
    }));
  };

  // Quick Reaction to Story Slide via DM
  const handleQuickStoryReaction = (emoji: string) => {
    if (selectedStoryIndex === null) return;
    const activeStory = stories[selectedStoryIndex];
    if (!activeStory || !activeStory.slides) return;
    const activeSlide = activeStory.slides[currentSlideIndex] || activeStory.slides[0];
    if (!activeSlide) return;
    const storyAuthor = activeStory.name.replace('@', '');

    const reactionText = `Reacted ${emoji} to story slide: "${activeSlide.text || 'milestone'}"`;

    let existingChat = chats.find(c => c.name.toLowerCase().includes(storyAuthor.toLowerCase()));

    if (!existingChat) {
      existingChat = {
        id: Date.now(),
        name: `@${storyAuthor} 💬`,
        lastMsg: reactionText,
        time: 'Just now',
        messages: [
          { id: Date.now(), sender: currentUser.username, text: reactionText, time: 'Just now' }
        ]
      };
      setChats([existingChat, ...chats]);
    } else {
      const updatedChats = chats.map(c => {
        if (c.id === existingChat.id) {
          return {
            ...c,
            lastMsg: reactionText,
            time: 'Just now',
            messages: [
              ...c.messages,
              { id: Date.now(), sender: currentUser.username, text: reactionText, time: 'Just now' }
            ]
          };
        }
        return c;
      });
      setChats(updatedChats);
    }

    setLastReactionEmoji(emoji);
    setTimeout(() => setLastReactionEmoji(null), 1400);
    triggerAlertNotification(`Sent ${emoji} reaction to @${storyAuthor} in Direct Messages!`);
  };

  // Share Deep Link to Story Slide
  const handleShareStorySlide = () => {
    if (selectedStoryIndex === null) return;
    const activeStory = stories[selectedStoryIndex];
    if (!activeStory || !activeStory.slides) return;
    const activeSlide = activeStory.slides[currentSlideIndex] || activeStory.slides[0];
    if (!activeSlide) return;
    const url = `${window.location.origin}/?story=${activeStory.id}&slide=${activeSlide.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    triggerAlertNotification(`🔗 Deep link to @${activeStory.name}'s story copied! (${url})`);
  };

  // Open User Profile
  const handleOpenUserProfile = (username: string) => {
    const rawUsername = username.replace('@', '');
    if (rawUsername === currentUser.username || rawUsername === 'dev_phoenix_17') {
      setViewedUserProfile({
        name: currentUser.username,
        fullname: currentUser.fullname,
        bio: currentUser.bio,
        img: currentUser.avatarUrl,
        disciplineColor: currentUser.disciplineColor,
        isSelf: true,
        followersCount: currentUser.followersCount,
        vibeCount: currentUser.vibesReceived,
        xpLevel: currentUser.level,
        projects: currentUser.projects,
        achievements: currentUser.achievements
      });
    } else {
      const foundInFollowers = followersList.find(u => u.name === rawUsername);
      if (foundInFollowers) {
        setViewedUserProfile({
          ...foundInFollowers,
          isSelf: false,
          followersCount: 312,
          projects: [
            { id: 601, title: 'Collaborative Build Segment v1', type: 'Design', vibes: 198 }
          ],
          achievements: [
            { title: '🌟 Fast Starter', desc: 'Accrued 100 vibes in less than 24 hours.' }
          ]
        });
      } else {
        setViewedUserProfile({
          name: rawUsername,
          fullname: rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1),
          bio: 'Innovative VibeSpark creator sharing high-value vision sparks.',
          following: false,
          img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
          disciplineColor: 'ring-orange-400',
          isSelf: false,
          followersCount: 114,
          vibeCount: 204,
          xpLevel: 3,
          projects: [],
          achievements: []
        });
      }
    }
    setArcOpen(false);
    setActiveTab('profile');
  };

  // Direct Message Any User (Message Button Everywhere!)
  const handleToggleFollow = (username: string) => {
    const cleanUser = username.replace('@', '');
    setFollowingList(prev => {
      const isFollowing = prev.includes(cleanUser);
      if (isFollowing) {
        triggerAlertNotification(`Unfollowed @${cleanUser}`);
        return prev.filter(u => u !== cleanUser);
      } else {
        triggerAlertNotification(`🚀 Following @${cleanUser}!`);
        return [...prev, cleanUser];
      }
    });
  };

  const handleDirectMessageUser = (username: string) => {
    const rawUsername = username.replace('@', '');
    
    // Check if chat already exists
    let existingChat = chats.find(c => c.name.toLowerCase().includes(rawUsername.toLowerCase()));
    
    if (!existingChat) {
      existingChat = {
        id: Date.now(),
        name: `@${rawUsername} 💬`,
        lastMsg: 'Started a new conversation',
        time: 'Just now',
        messages: [
          { id: 1, sender: rawUsername, text: `Hey! Thanks for connecting on VibeSpark!`, time: 'Just now' }
        ]
      };
      setChats([existingChat, ...chats]);
    }

    setActiveChatId(existingChat.id);
    setActiveGroupChatId(null);
    setActiveTab('chat');
    triggerAlertNotification(`✉️ Opened direct chat with @${rawUsername}!`);
  };

  const handleThreeDotsClick = (post: Post) => {
    setThreeDotsPost(post);
  };

  const executePostBlock = (author: string) => {
    setBlockedAuthors([...blockedAuthors, author]);
    setThreeDotsPost(null);
    triggerAlertNotification(`🚫 All posts from @${author} have been blocked.`);
  };

  const activeFilteredPosts = posts.filter(p => !blockedAuthors.includes(p.author));

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 font-sans select-none antialiased transition-all duration-500 theme-${currentTheme} themed-bg`}>
      {/* Dynamic Theme Injector CSS */}
      <style>{`
        .theme-light {
          --bg-main: #ffffff;
          --bg-card: #ffffff;
          --border-primary: #e2e8f0;
          --text-primary: #000000;
          --text-secondary: #334155;
          --accent-primary: #f97316;
          --blur-style: none;
        }
        .theme-light, .theme-light * {
          border-color: var(--border-primary);
        }
        .theme-light .themed-bg, .theme-light {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .theme-light .themed-card, .theme-light .bg-slate-900, .theme-light .bg-slate-950 {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #e2e8f0 !important;
        }
        .theme-light .themed-text, .theme-light h1, .theme-light h2, .theme-light h3, .theme-light h4, .theme-light h5, .theme-light p, .theme-light span:not(.text-white) {
          color: #000000 !important;
        }
        .theme-light button {
          background-color: #f97316 !important;
          color: #ffffff !important;
        }
        .theme-light button:hover {
          background-color: #ea580c !important;
        }
        .theme-light input, .theme-light textarea, .theme-light select {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #cbd5e1 !important;
        }
        .theme-dark {
          --bg-main: #020617;
          --bg-card: #0f172a;
          --border-primary: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --accent-primary: #f97316;
          --blur-style: none;
        }
        .theme-neon {
          --bg-main: #000000;
          --bg-card: #05050a;
          --border-primary: #f43f5e;
          --text-primary: #22c55e;
          --text-secondary: #e2e8f0;
          --accent-primary: #d946ef;
          --blur-style: none;
        }
        .theme-classic {
          --bg-main: #0b0f19;
          --bg-card: #050811;
          --border-primary: #dc2626;
          --text-primary: #ffffff;
          --text-secondary: #94a3b8;
          --accent-primary: #f97316;
          --blur-style: none;
        }
        .theme-frosted {
          --bg-main: #1e1b4b;
          --bg-card: rgba(255, 255, 255, 0.08);
          --border-primary: rgba(255, 255, 255, 0.2);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.7);
          --accent-primary: #fb7185;
          --blur-style: blur(14px);
        }

        .themed-bg { background-color: var(--bg-main) !important; color: var(--text-primary) !important; }
        .themed-card { background: var(--bg-card) !important; border-color: var(--border-primary) !important; backdrop-filter: var(--blur-style); }
        .themed-text { color: var(--text-primary) !important; }
        .themed-subtext { color: var(--text-secondary) !important; }
        .themed-border { border-color: var(--border-primary) !important; }
        .themed-accent-bg { background-color: var(--accent-primary) !important; }

        @keyframes rainbowAura {
          0% { border-color: #f43f5e; box-shadow: 0 0 10px rgba(244, 63, 94, 0.6); }
          25% { border-color: #d946ef; box-shadow: 0 0 15px rgba(217, 70, 239, 0.7); }
          50% { border-color: #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.8); }
          75% { border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.7); }
          100% { border-color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.6); }
        }
        .rainbow-aura-active {
          animation: rainbowAura 3s linear infinite !important;
          border-width: 3px !important;
        }

        @keyframes flashAnim {
          0% { background: rgba(245, 158, 11, 0.4); opacity: 1; }
          100% { background: transparent; opacity: 0; }
        }
        .flash-active {
          animation: flashAnim 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        @keyframes screenShake {
          0% { transform: translate(0, 0) scale(1); }
          15% { transform: translate(-8px, 5px) scale(1.008) rotate(-0.5deg); }
          30% { transform: translate(8px, -5px) scale(1.008) rotate(0.5deg); }
          45% { transform: translate(-5px, 3px) scale(1.004) rotate(-0.3deg); }
          60% { transform: translate(5px, -2px) scale(1.004) rotate(0.3deg); }
          75% { transform: translate(-2px, 1px) scale(1.001); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .screen-shake-active {
          animation: screenShake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) !important;
        }
      `}</style>

      {/* Flash Supernova Overlay */}
      {supernovaFlash && (
        <div className="absolute inset-0 z-[100] pointer-events-none flash-active"></div>
      )}

      {/* Global Toast Banner */}
      {globalNotification && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-950 border border-orange-500 text-white font-black text-xs py-2 px-5 rounded-full shadow-2xl animate-bounce">
          {globalNotification}
        </div>
      )}

      {/* 1. SPLASH SCREEN */}
      {showSplash ? (
        <div className="fixed inset-0 bg-slate-950 flex flex-col justify-between items-center py-16 z-[100] animate-fade">
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-28 h-28 rounded-[32px] bg-gradient-to-tr from-orange-500 via-sky-400 to-red-500 p-[3px] shadow-2xl animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[29px] flex items-center justify-center shadow-lg">
                <svg className="w-16 h-16 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 via-sky-400 to-red-500 bg-clip-text text-transparent tracking-tight">
                VibeSpark
              </h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-extrabold">Creative Teen Platform & Spark Labs</p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
              <span className="text-[10px] text-slate-300 font-mono font-bold">Initializing VibeSpark Core...</span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Powered by</span>
            <span className="text-xs text-white font-extrabold tracking-tight bg-slate-900 px-4 py-2 rounded-full border border-slate-800 shadow-md">Asonsoft</span>
          </div>
        </div>
      ) : !isAuthenticated ? (
        /* 2. AUTHENTICATION PORTAL WITH GOOGLE & INSTAGRAM SIGN IN */
        <AuthPortal 
          setIsAuthenticated={setIsAuthenticated}
          setCurrentUser={setCurrentUser}
          triggerAlertNotification={triggerAlertNotification}
        />
      ) : (
        /* 3. MAIN FULL-WIDTH RESPONSIVE APPLICATION CONTAINER */
        <div className={`w-full max-w-4xl min-h-screen bg-slate-900 border-x border-slate-800 shadow-2xl flex flex-col relative overflow-hidden themed-bg themed-text md:ml-64 ${
          screenShakeActive ? 'screen-shake-active' : ''
        }`}>
          
          {/* Top Header */}
          <Header 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setArcOpen={setArcOpen}
            triggerLogoSparks={triggerLogoSparks}
            logoSparkActive={logoSparkActive}
            logoSparksList={logoSparksList}
            openBuddyChat={openBuddyChat}
            unreadNotificationsCount={notifications.length}
          />

          {/* MAIN CONTENT VIEW AREA */}
          <div className="flex-1 overflow-y-auto pb-24 scrollbar-none relative themed-bg themed-text">
            
            {/* VIEW: HOME FEED */}
            {activeTab === 'home' && (
              <HomeFeed 
                posts={activeFilteredPosts}
                stories={stories}
                currentUser={currentUser}
                followingList={followingList}
                handleToggleFollow={handleToggleFollow}
                activeTrack={activeTrack}
                setActiveTrack={setActiveTrack}
                setSelectedStoryIndex={setSelectedStoryIndex}
                setCurrentSlideIndex={setCurrentSlideIndex}
                setStoryTimerProgress={setStoryTimerProgress}
                handleOpenUserProfile={handleOpenUserProfile}
                handleThreeDotsClick={handleThreeDotsClick}
                handleVibeSingleTap={handleVibeSingleTap}
                handleVibePressStart={handleVibePressStart}
                handleVibePressEnd={handleVibePressEnd}
                vibePressingPostId={vibePressingPostId}
                handleXPSingleTap={handleXPSingleTap}
                savedPosts={savedPosts}
                setSavedPosts={setSavedPosts}
                setCommentModalPost={setCommentModalPost}
                setActiveReelIndex={setActiveReelIndex}
                onDirectMessageUser={handleDirectMessageUser}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: GALLERY WITH 5s AUTO SLIDESHOW & REEL PREVIEW */}
            {activeTab === 'gallery' && (
              <GalleryView 
                galleryItems={galleryGridItems}
                handleOpenUserProfile={handleOpenUserProfile}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: SPARK LABS INTERACTIVE CREATION SUITE */}
            {activeTab === 'sparklabs' && (
              <SparkLabsView 
                labProjects={labProjects}
                setLabProjects={setLabProjects}
                currentUser={currentUser}
                activeLabSubtab={activeLabSubtab}
                setActiveLabSubtab={setActiveLabSubtab}
                showCreateLabModal={showCreateLabModal}
                setShowCreateLabModal={setShowCreateLabModal}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: DYNAMIC SEARCH ENGINE */}
            {activeTab === 'search' && (
              <SearchDirectory 
                followersList={followersList}
                posts={posts}
                labProjects={labProjects}
                challenges={challenges}
                handleOpenUserProfile={handleOpenUserProfile}
                onDirectMessageUser={handleDirectMessageUser}
                setActiveReelIndex={setActiveReelIndex}
                setActiveTab={setActiveTab}
              />
            )}

            {/* VIEW: CHALLENGES & HACKATHONS HUB */}
            {activeTab === 'challenges' && (
              <ChallengesView 
                challenges={challenges}
                setActiveTab={setActiveTab}
                setActiveLabSubtab={setActiveLabSubtab}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: DIRECT MESSAGES & GROUP CHATS WITH BUDDY AI */}
            {activeTab === 'chat' && (
              <ChatView 
                chats={chats}
                setChats={setChats}
                groups={groups}
                setGroups={setGroups}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                activeGroupChatId={activeGroupChatId}
                setActiveGroupChatId={setActiveGroupChatId}
                showGroupCreation={showGroupCreation}
                setShowGroupCreation={setShowGroupCreation}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: HALL OF SPARKS LEADERBOARD */}
            {activeTab === 'hall' && (
              <div className="p-4 space-y-4 fade-in text-left">
                <div className="border-b pb-2 themed-border">
                  <h3 className="text-sm font-black themed-text">🏆 Hall of Sparks</h3>
                  <p className="text-[9px] themed-subtext">Global creator rankings and XP placement</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!leaderboardSearch.trim()) return;
                  const query = leaderboardSearch.toLowerCase().replace('@', '');
                  if (query === 'dev_phoenix_17' || query === currentUser.username.toLowerCase()) {
                    setRainbowTargetId('self');
                  } else {
                    const match = followersList.find(f => f.name.toLowerCase().includes(query));
                    if (match) setRainbowTargetId(match.id);
                  }
                }} className="flex space-x-1.5">
                  <input 
                    type="text" 
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    placeholder="Search creator placement..." 
                    className="flex-1 bg-slate-900 border rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none themed-border"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-sky-500 text-slate-950 text-xs font-black rounded-xl">Locate</button>
                </form>

                <div className="space-y-2 pt-1">
                  <div 
                    onClick={() => handleOpenUserProfile(currentUser.username)}
                    className={`p-3 bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                      rainbowTargetId === 'self' ? 'rainbow-aura-active' : 'themed-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-black text-amber-400 font-mono">#4</span>
                      <img src={currentUser.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-white">@{currentUser.username} (You)</p>
                        <p className="text-[8px] uppercase font-bold text-orange-400">Level {currentUser.level}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 font-mono font-bold">⚡{currentUser.vibesReceived} Vibes</span>
                  </div>

                  {followersList.map((u, idx) => (
                    <div 
                      key={u.id}
                      onClick={() => handleOpenUserProfile(u.name)}
                      className={`p-3 bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                        rainbowTargetId === u.id ? 'rainbow-aura-active' : 'themed-border'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-black text-slate-400 font-mono">#{idx + 5}</span>
                        <img src={u.img} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-white">@{u.name}</p>
                          <p className="text-[8px] uppercase font-bold text-slate-500">Level {u.xpLevel}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-bold">⚡{u.vibeCount} Vibes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW: CLASH ARENA */}
            {activeTab === 'clasharena' && (
              <div className="p-4 space-y-4 fade-in text-left">
                <div className="border-b pb-2 themed-border">
                  <h3 className="text-sm font-black themed-text">⚔️ Spark Clash Arena</h3>
                  <p className="text-[9px] themed-subtext">Live multi-discipline creative duet matchmaking</p>
                </div>

                {!clashMatchStarted ? (
                  <div className="p-6 bg-slate-900 border rounded-2xl text-center space-y-4 themed-card">
                    <span className="text-5xl animate-bounce inline-block">⚡</span>
                    <h4 className="text-xs font-black text-white">Initiate Live Creative Duet Battle</h4>
                    <button 
                      onClick={() => {
                        setClashMatchStarted(true);
                        setTimeout(() => setClashWinner('audio_queen'), 3000);
                      }} 
                      className="w-full py-2.5 themed-accent-bg text-slate-950 text-xs font-black rounded-xl uppercase tracking-widest shadow-lg active:scale-98"
                    >
                      Start Duet Match
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 h-44 border rounded-2xl overflow-hidden themed-border">
                      <div className="relative bg-slate-950 flex flex-col justify-end p-2.5">
                        <span className="absolute top-2 left-2 text-[8px] bg-sky-950 text-sky-400 font-bold px-1.5 py-0.5 rounded uppercase">Beat Maker</span>
                        <p className="text-[10px] font-black text-white">@audio_queen</p>
                      </div>

                      <div className="relative bg-slate-900 flex flex-col justify-end p-2.5">
                        <span className="absolute top-2 left-2 text-[8px] bg-orange-950 text-orange-400 font-bold px-1.5 py-0.5 rounded uppercase">Hardware Solderer</span>
                        <p className="text-[10px] font-black text-white">@cyber_spark</p>
                      </div>
                    </div>

                    {clashWinner ? (
                      <div className="p-3 bg-slate-950 border border-yellow-500/40 rounded-xl text-center space-y-2 themed-border">
                        <h4 className="text-xs font-black text-yellow-400">🏆 CLASH WINNER DECLARED!</h4>
                        <p className="text-[11px] text-white">@{clashWinner} won the match with high community votes!</p>
                        <button onClick={() => setClashMatchStarted(false)} className="px-4 py-1 bg-slate-900 text-xs rounded font-bold text-slate-300">New Battle</button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-sky-400 animate-pulse text-center font-mono">Clashing metrics live...</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: USER PROFILE PAGE */}
            {activeTab === 'profile' && (
              <ProfileView 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                viewedUserProfile={viewedUserProfile}
                setViewedUserProfile={setViewedUserProfile}
                posts={posts}
                followersList={followersList}
                setFollowersList={setFollowersList}
                followingList={followingList}
                setFollowingList={setFollowingList}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                onDirectMessageUser={handleDirectMessageUser}
                setActiveReelIndex={setActiveReelIndex}
                setIsAuthenticated={setIsAuthenticated}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: CLICKABLE NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <NotificationsView 
                notifications={notifications}
                setActiveTab={setActiveTab}
                setActiveReelIndex={setActiveReelIndex}
                onDirectMessageUser={handleDirectMessageUser}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

            {/* VIEW: PUBLISH SHOWCASE / POST MODAL */}
            {activeTab === 'create' && (
              <CreatePostModal 
                posts={posts}
                setPosts={setPosts}
                challenges={challenges}
                setChallenges={setChallenges}
                labProjects={labProjects}
                setLabProjects={setLabProjects}
                setGalleryGridItems={setGalleryGridItems}
                setStories={setStories}
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                triggerAlertNotification={triggerAlertNotification}
              />
            )}

          </div>

          {/* ROTARY SPARK DIAL NAVIGATION OVERLAY */}
          {arcOpen && (
            <RotaryDial 
              rotaryAngle={rotaryAngle}
              isDragging={isDragging}
              handleDialPointerDown={handleDialPointerDown}
              handleDialPointerMove={handleDialPointerMove}
              handleDialPointerUp={handleDialPointerUp}
              setActiveTab={setActiveTab}
              setActiveTrack={setActiveTrack}
              setArcOpen={setArcOpen}
            />
          )}

          {/* TOOLTIP DIRECTLY OVER DIAL ANCHOR */}
          {showTooltip && (
            <div className="absolute bottom-[84px] left-1/2 -translate-x-1/2 z-[60] bg-slate-950 border border-orange-500 p-2.5 rounded-xl shadow-2xl flex flex-col items-center text-center max-w-[200px] animate-bounce">
              <span className="text-xl">👇</span>
              <p className="text-[9px] font-extrabold text-orange-400 uppercase tracking-widest mt-1">Press to Explore</p>
              <p className="text-[8px] text-slate-300 mt-0.5 leading-snug">Tap the center dial button to open Spark Labs, Leaderboards and NXT tech challenges!</p>
              <button 
                onClick={() => {
                  setShowTooltip(false);
                  localStorage.setItem('vibespark_rotary_tooltip_shown', 'true');
                }} 
                className="mt-1 text-[8px] bg-slate-800 text-white px-2 py-0.5 rounded font-black active:scale-95 transition-all"
              >
                Got it!
              </button>
            </div>
          )}

          {/* STICKY BOTTOM NAVIGATION BAR */}
          <Navigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setActiveTrack={setActiveTrack}
            arcOpen={arcOpen}
            setArcOpen={setArcOpen}
            setViewedUserProfile={setViewedUserProfile}
          />

          {/* FULL-SCREEN INSTAGRAM/TikTok STYLE REELS OVERLAY */}
          {activeReelIndex !== null && (
            <ReelsView 
              posts={posts}
              activeReelIndex={activeReelIndex}
              setActiveReelIndex={setActiveReelIndex}
              currentUser={currentUser}
              handleVibeSingleTap={handleVibeSingleTap}
              handleVibePressStart={handleVibePressStart}
              handleVibePressEnd={handleVibePressEnd}
              vibePressingPostId={vibePressingPostId}
              vibePressValue={vibePressValue}
              handleXPSingleTap={handleXPSingleTap}
              setCommentModalPost={setCommentModalPost}
              handleOpenUserProfile={handleOpenUserProfile}
              triggerAlertNotification={triggerAlertNotification}
            />
          )}

          {/* THREE-DOT POST OPTIONS PANEL */}
          {threeDotsPost && (
            <div className="absolute inset-x-0 bottom-0 z-[95] bg-slate-950/95 backdrop-blur-md rounded-t-[32px] p-4 border-t border-slate-800 space-y-3 flex flex-col text-left animate-fade">
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto"></div>
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest text-center">Post Options</h4>
              
              <button onClick={() => { setThreeDotsPost(null); triggerAlertNotification("Post flagged for moderation review."); }} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-xs text-white rounded-xl text-left px-4 font-bold">🚨 Report Post</button>
              <button onClick={() => { setThreeDotsPost(null); triggerAlertNotification("Downloading schematic blueprint..."); }} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-xs text-white rounded-xl text-left px-4 font-bold">📥 Download Media / Schematic</button>
              <button onClick={() => executePostBlock(threeDotsPost.author)} className="w-full py-2.5 bg-red-950/40 hover:bg-red-900 text-xs text-red-400 rounded-xl text-left px-4 font-black">🚫 Block @{threeDotsPost.author}</button>
              <button onClick={() => setThreeDotsPost(null)} className="w-full py-2 bg-slate-800 text-xs text-slate-300 rounded-xl font-bold uppercase mt-2 text-center">Close Panel</button>
            </div>
          )}

          {/* COMMENT MODAL SHEET */}
          {commentModalPost && (
            <div className="absolute inset-0 z-[95] flex flex-col justify-end bg-slate-950/85 text-left animate-fade">
              <div className="bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-4 max-h-[65%] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-2 border-slate-800 mb-3">
                    <span className="text-xs font-black text-white">Sparks feedback comments ({commentModalPost.comments.length})</span>
                    <button onClick={() => setCommentModalPost(null)} className="text-xs text-slate-400 font-bold">Close</button>
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-none">
                    {commentModalPost.comments.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No comments yet. Be the first to spark a reply!</p>
                    ) : (
                      commentModalPost.comments.map((c, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-950 rounded-xl text-xs border border-slate-800/80">
                          <span className="font-bold text-orange-400">@{c.user}: </span>
                          <span className="text-slate-300">{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCommentText.trim()) {
                        setPosts(prev => prev.map(p => {
                          if (p.id === commentModalPost.id) {
                            return { ...p, comments: [...p.comments, { user: currentUser.username, text: newCommentText }] };
                          }
                          return p;
                        }));
                        setNewCommentText('');
                        setCommentModalPost(null);
                        triggerAlertNotification("Comment published!");
                      }
                    }}
                    placeholder="Contribute feedback..." 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-full py-1.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                  <button 
                    onClick={() => {
                      if (!newCommentText.trim()) return;
                      setPosts(prev => prev.map(p => {
                        if (p.id === commentModalPost.id) {
                          return { ...p, comments: [...p.comments, { user: currentUser.username, text: newCommentText }] };
                        }
                        return p;
                      }));
                      setNewCommentText('');
                      setCommentModalPost(null);
                      triggerAlertNotification("Comment published!");
                    }}
                    className="p-2.5 bg-orange-500 text-slate-950 rounded-full font-bold active:scale-90"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STORY / MILESTONE VIEWER */}
          {selectedStoryIndex !== null && stories[selectedStoryIndex] && (
            (() => {
              const activeStory = stories[selectedStoryIndex];
              const activeSlide = activeStory?.slides?.[currentSlideIndex] || activeStory?.slides?.[0];

              return (
                <div 
                  onMouseDown={() => setIsStoryPaused(true)}
                  onMouseUp={() => setIsStoryPaused(false)}
                  onTouchStart={() => setIsStoryPaused(true)}
                  onTouchEnd={() => setIsStoryPaused(false)}
                  onMouseLeave={() => setIsStoryPaused(false)}
                  className="fixed inset-0 z-[95] bg-slate-950 flex flex-col justify-between text-left animate-fade select-none max-h-[100dvh] h-[100dvh] overflow-hidden p-2"
                >
                  {/* Floating Emoji FX */}
                  {lastReactionEmoji && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                      <span className="text-7xl animate-bounce drop-shadow-2xl">{lastReactionEmoji}</span>
                    </div>
                  )}

                  <div className="pt-2 px-3 flex flex-col space-y-2 z-30">
                    {/* Smooth Spring-Based Transition Progress Bars */}
                    <div className="flex space-x-1 w-full">
                      {(activeStory?.slides || []).map((slide, sIdx) => {
                        let progressWidth = '0%';
                        if (sIdx < currentSlideIndex) {
                          progressWidth = '100%';
                        } else if (sIdx === currentSlideIndex) {
                          progressWidth = `${storyTimerProgress}%`;
                        }
                        return (
                          <div key={slide.id} className="flex-1 h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-400 rounded-full" 
                              style={{ 
                                width: progressWidth,
                                transition: 'width 200ms cubic-bezier(0.34, 1.56, 0.64, 1)' 
                              }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={activeStory.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-orange-500/40" />
                        <div>
                          <span className="text-xs font-bold text-white">@{activeStory.name}</span>
                          <p className="text-[9px] text-slate-400">
                            Slide {currentSlideIndex + 1} of {activeStory.slides?.length || 1}
                          </p>
                        </div>

                        {isStoryPaused && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center space-x-1 animate-pulse">
                            <span>⏸️ Paused</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Share Button for Deep Link */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareStorySlide();
                          }}
                          className="text-xs text-orange-400 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 px-2.5 py-1 rounded-full font-bold flex items-center space-x-1 transition-all active:scale-95"
                          title="Share Story Deep Link"
                        >
                          <ShareIcon />
                          <span>Share</span>
                        </button>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setStories(prevStories => prevStories.map((st, sIdx) => 
                              sIdx === selectedStoryIndex ? { ...st, watched: true } : st
                            ));
                            setSelectedStoryIndex(null);
                            setIsStoryPaused(false);
                          }} 
                          className="text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-full font-bold border border-slate-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-2 relative max-h-[55vh] my-auto overflow-hidden">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentSlideIndex > 0) {
                          setCurrentSlideIndex(prev => prev - 1);
                          setStoryTimerProgress(0);
                        } else if (selectedStoryIndex > 0) {
                          setSelectedStoryIndex(prev => prev - 1);
                          setCurrentSlideIndex(0);
                          setStoryTimerProgress(0);
                        }
                      }}
                      className="absolute left-0 inset-y-0 w-1/4 z-20 cursor-pointer"
                    ></div>

                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (currentSlideIndex < (activeStory?.slides?.length || 1) - 1) {
                          setCurrentSlideIndex(prev => prev + 1);
                          setStoryTimerProgress(0);
                        } else if (selectedStoryIndex < stories.length - 1) {
                          setSelectedStoryIndex(prev => prev + 1);
                          setCurrentSlideIndex(0);
                          setStoryTimerProgress(0);
                        } else {
                          setSelectedStoryIndex(null);
                        }
                      }}
                      className="absolute right-0 inset-y-0 w-1/4 z-20 cursor-pointer"
                    ></div>

                    {activeSlide?.mediaType === 'image' && activeSlide?.mediaUrl && (
                      <img src={activeSlide.mediaUrl} alt="" className="max-h-[48vh] w-auto max-w-full object-contain rounded-2xl pointer-events-none shadow-2xl border border-slate-800" />
                    )}

                    {activeSlide?.mediaType === 'audio' && (
                      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl text-center space-y-2 max-w-[85%] pointer-events-none shadow-2xl">
                        <span className="text-4xl animate-bounce inline-block">🎙️</span>
                        <p className="text-xs text-sky-400 font-mono tracking-widest uppercase">Acoustic Vocal Demo playing...</p>
                      </div>
                    )}

                    {activeSlide?.text && (
                      <p className="text-xs sm:text-sm text-center text-white font-medium mt-2 px-3 z-10 bg-black/50 backdrop-blur-sm py-1.5 rounded-xl border border-white/10 max-w-[90%]">
                        "{activeSlide.text}"
                      </p>
                    )}
                  </div>

                  {/* Quick Reactions Emoji Bar */}
                  <div className="pb-3 px-3 z-30 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-1">
                    <p className="text-[9px] font-bold text-slate-400 text-center mb-1 uppercase tracking-wider">
                      Quick React to @{activeStory.name}
                    </p>
                    <div className="flex items-center justify-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-full max-w-xs mx-auto shadow-xl">
                      {['🔥', '⚡', '❤️', '🚀', '👏', '💯', '🎉', '🤯'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickStoryReaction(emoji);
                          }}
                          className="text-lg sm:text-xl hover:scale-125 active:scale-95 transition-transform p-0.5"
                          title={`Send ${emoji} reaction to author`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
          )}

        </div>
      )}
    </div>
  );
}
