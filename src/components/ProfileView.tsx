import React, { useState, useRef, useEffect } from 'react';
import { User, Post } from '../types';
import { MessageCircleIcon } from './Icons';
import { subscribeToUserProfile, followUserInFirestore } from '../services/firebase';

interface ProfileViewProps {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  viewedUserProfile: any | null;
  setViewedUserProfile: (user: any) => void;
  posts: Post[];
  followersList: any[];
  setFollowersList: React.Dispatch<React.SetStateAction<any[]>>;
  followingList: any[];
  setFollowingList: React.Dispatch<React.SetStateAction<any[]>>;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  onDirectMessageUser: (username: string) => void;
  setActiveReelIndex: (index: number) => void;
  setIsAuthenticated: (auth: boolean) => void;
  triggerAlertNotification: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  setCurrentUser,
  viewedUserProfile,
  setViewedUserProfile,
  posts,
  followersList,
  setFollowersList,
  followingList,
  setFollowingList,
  currentTheme,
  setCurrentTheme,
  onDirectMessageUser,
  setActiveReelIndex,
  setIsAuthenticated,
  triggerAlertNotification
}) => {
  const [profileSectionTab, setProfileSectionTab] = useState('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSection, setSettingsSection] = useState('main');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  // Hidden Avatar File Input Ref
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Bio & Profile Edit States
  const [bioEdit, setBioEdit] = useState(currentUser.bio);
  const [fullnameEdit, setFullnameEdit] = useState(currentUser.fullname);
  const [avatarUrlEdit, setAvatarUrlEdit] = useState(currentUser.avatarUrl);

  // Settings States
  const [parentLock, setParentLock] = useState(true);
  const [videoAutoplay, setVideoAutoplay] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const targetUser = viewedUserProfile || {
    name: currentUser.username,
    fullname: currentUser.fullname,
    bio: currentUser.bio,
    img: currentUser.avatarUrl,
    disciplineColor: currentUser.disciplineColor,
    isSelf: true,
    followersCount: currentUser.followersCount ?? 0,
    vibeCount: currentUser.vibesReceived ?? 0,
    xpLevel: currentUser.level ?? 1,
    xp: currentUser.xp ?? 0,
    projects: currentUser.projects || [],
    achievements: currentUser.achievements || []
  };

  const isSelf = !viewedUserProfile || viewedUserProfile.isSelf || viewedUserProfile.name === currentUser.username;

  // Real-time Firestore Listener for Live Profile Updates & Followers Count
  useEffect(() => {
    const userIdToSubscribe = currentUser.id;
    if (userIdToSubscribe) {
      const unsub = subscribeToUserProfile(userIdToSubscribe, (liveData) => {
        if (liveData) {
          setCurrentUser(prev => ({
            ...prev,
            followersCount: liveData.followersCount ?? 0,
            followingCount: liveData.followingCount ?? 0,
            vibesReceived: liveData.vibesReceived ?? prev.vibesReceived
          }));
        }
      });
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    }
  }, [currentUser.id]);

  // Handle Profile Avatar Click File Pick
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAvatar = event.target.result as string;
          setAvatarUrlEdit(newAvatar);
          setCurrentUser(prev => ({ ...prev, avatarUrl: newAvatar }));
          triggerAlertNotification("📸 Profile picture updated successfully!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileSettings = () => {
    setCurrentUser(prev => ({
      ...prev,
      bio: bioEdit,
      fullname: fullnameEdit,
      avatarUrl: avatarUrlEdit
    }));
    setShowSettings(false);
    setSettingsSection('main');
    triggerAlertNotification("✨ Profile details successfully updated!");
  };

  return (
    <div className="fade-in text-left">
      {/* Hidden File Picker for Avatar Upload */}
      <input 
        type="file" 
        ref={avatarFileInputRef} 
        accept="image/*" 
        onChange={handleAvatarFileUpload} 
        className="hidden" 
      />

      {/* PROFILE HEADER */}
      <div className="p-4 flex flex-col items-center justify-center bg-slate-900/40 border-b themed-border text-center">
        <div 
          onClick={() => {
            if (isSelf) {
              avatarFileInputRef.current?.click();
            }
          }}
          className={`relative group ${isSelf ? 'cursor-pointer' : ''}`}
          title={isSelf ? "Click to change profile picture" : ""}
        >
          <img 
            src={targetUser.img || targetUser.avatarUrl} 
            alt="" 
            className={`w-20 h-20 rounded-full object-cover ring-4 ${targetUser.disciplineColor || 'ring-orange-500'} p-1 shadow-xl transition-all ${
              isSelf ? 'group-hover:brightness-75' : ''
            }`} 
          />
          {isSelf && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xl">📷</span>
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-orange-500 text-slate-950 text-[8px] font-extrabold px-2 py-0.5 rounded-full shadow">
            LVL {targetUser.xpLevel || targetUser.level || 1}
          </span>
        </div>
        
        <h3 className="text-sm font-black themed-text mt-3 font-mono">
          @{targetUser.name || targetUser.username}
        </h3>

        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
          {targetUser.fullname}
        </p>

        <p className="text-[10px] themed-subtext max-w-[260px] leading-relaxed mt-1">
          {targetUser.bio}
        </p>

        {/* Stats Grid */}
        <div 
          onClick={() => setShowFollowersModal(true)}
          className="grid grid-cols-3 gap-2 w-full mt-4 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80 cursor-pointer hover:bg-slate-900/50 transition-all shadow-inner"
        >
          <div className="text-center">
            <p className="text-xs font-black text-white">
              {targetUser.followersCount ?? 0}
            </p>
            <span className="text-[8px] uppercase font-bold text-slate-500 block">Followers</span>
          </div>

          <div className="text-center border-x themed-border">
            <p className="text-xs font-black text-sky-400 font-mono">
              {targetUser.xp ?? currentUser.xp ?? 0}
            </p>
            <span className="text-[8px] uppercase font-bold text-slate-500 block">XP Earned</span>
          </div>

          <div className="text-center">
            <p className="text-xs font-black text-orange-400 font-mono">
              ⚡{targetUser.vibesReceived ?? targetUser.vibeCount ?? 0}
            </p>
            <span className="text-[8px] uppercase font-bold text-slate-500 block">Vibes Got</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center space-x-2 mt-3.5 w-full">
          {isSelf ? (
            <button 
              onClick={() => setShowSettings(true)} 
              className="flex-1 py-1.5 px-4 bg-slate-900 hover:bg-slate-800 border themed-border rounded-full text-[10px] font-bold themed-text shadow-sm"
            >
              ⚙️ Edit Bio & Settings
            </button>
          ) : (
            <>
              <button 
                onClick={() => triggerAlertNotification(`Follow status updated for @${targetUser.name}`)}
                className="flex-1 py-1.5 px-4 bg-orange-500 hover:bg-orange-400 text-slate-950 text-[10px] font-black rounded-full shadow-lg transition-all"
              >
                + Follow
              </button>

              <button 
                onClick={() => onDirectMessageUser(targetUser.name || targetUser.username)}
                className="py-1.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-black rounded-full flex items-center space-x-1 shadow-lg transition-all"
              >
                <MessageCircleIcon />
                <span>Message</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b themed-border bg-slate-950/80">
        {[
          { id: 'posts', label: '📰 Grid Sparks' },
          { id: 'projects', label: '📐 Projects' },
          { id: 'achievements', label: '🏆 Badges' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setProfileSectionTab(tab.id)}
            className={`flex-1 py-2 text-[9px] uppercase font-black transition-all ${
              profileSectionTab === tab.id ? 'border-b-2 border-orange-500 text-orange-400 font-bold' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION CONTENTS */}
      <div className="p-3">
        {profileSectionTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((p, idx) => (
              <div 
                key={p.id ? `profile_post_${p.id}_${idx}` : `profile_post_idx_${idx}`} 
                onClick={() => setActiveReelIndex(idx)}
                className="relative aspect-square bg-slate-950 rounded-lg overflow-hidden border border-slate-800 cursor-pointer group"
              >
                <img src={p.mediaUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition-all">
                  <span className="text-[9px] text-white font-extrabold">⚡{p.vibes} Vibes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {profileSectionTab === 'projects' && (
          <div className="space-y-2 text-left">
            {(targetUser.projects || []).map((p: any, idx: number) => (
              <div key={p.id ? `proj_${p.id}_${idx}` : `proj_idx_${idx}`} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between themed-card">
                <div>
                  <p className="text-xs font-extrabold themed-text">{p.title}</p>
                  <span className="text-[8px] text-sky-400 font-bold uppercase">{p.type}</span>
                </div>
                <span className="text-xs font-mono text-orange-400 font-bold">⚡{p.vibes}</span>
              </div>
            ))}
          </div>
        )}

        {profileSectionTab === 'achievements' && (
          <div className="space-y-2 text-left">
            {(targetUser.achievements || []).map((a: any, idx: number) => (
              <div key={`achieve_${a.id || idx}`} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 themed-card">
                <p className="text-xs font-black themed-text">{a.title}</p>
                <p className="text-[9px] themed-subtext mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL PAGE FOLLOWERS / FOLLOWING OVERLAY MODAL */}
      {showFollowersModal && (
        <div className="absolute inset-0 z-[95] flex flex-col themed-bg animate-fade">
          {/* Header */}
          <div className="pt-8 px-4 pb-3 bg-slate-900 border-b flex items-center justify-between themed-border">
            <div className="flex space-x-6">
              <button 
                onClick={() => setFollowersModalTab('followers')}
                className={`text-sm font-black pb-1 relative transition-all ${followersModalTab === 'followers' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400'}`}
              >
                Followers ({followersList.length})
              </button>
              <button 
                onClick={() => setFollowersModalTab('following')}
                className={`text-sm font-black pb-1 relative transition-all ${followersModalTab === 'following' ? 'text-orange-400 border-b-2 border-orange-500' : 'text-slate-400'}`}
              >
                Following ({followingList.length})
              </button>
            </div>
            <button 
              onClick={() => setShowFollowersModal(false)} 
              className="text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-full font-bold shadow transition-all"
            >
              ✕ Back
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left">
            {(followersModalTab === 'followers' ? followersList : followingList).map((u, uIdx) => {
              const isFollowingUser = followingList.some(item => item.id === u.id || item.name === u.name);

              const handleToggleFollow = () => {
                if (isFollowingUser) {
                  // Unfollow user
                  const updatedFollowing = followingList.filter(item => item.id !== u.id && item.name !== u.name);
                  if (setFollowingList) setFollowingList(updatedFollowing);
                  setCurrentUser(prev => ({
                    ...prev,
                    followingCount: Math.max(0, (prev.followingCount || 1) - 1)
                  }));
                  triggerAlertNotification(`Unfollowed @${u.name}`);
                } else {
                  // Follow user
                  const newFollowingUser = {
                    id: u.id || 'f_' + Date.now(),
                    name: u.name,
                    bio: u.bio || 'Creator on VibeSpark',
                    img: u.img || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'
                  };
                  if (setFollowingList) setFollowingList([...followingList, newFollowingUser]);
                  setCurrentUser(prev => ({
                    ...prev,
                    followingCount: (prev.followingCount || 0) + 1
                  }));
                  triggerAlertNotification(`Started following @${u.name}! 🎉`);
                }
              };

              return (
                <div key={u.id ? `f_user_${u.id}_${uIdx}` : `f_user_${u.name || uIdx}_${uIdx}`} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-2xl border themed-border shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img src={u.img} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500/30" />
                    <div>
                      <p className="text-xs font-black themed-text">@{u.name}</p>
                      <p className="text-[10px] themed-subtext line-clamp-1">{u.bio}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleToggleFollow}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-full transition-all shadow-sm ${
                        isFollowingUser 
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border themed-border' 
                          : 'bg-orange-500 hover:bg-orange-400 text-slate-950'
                      }`}
                    >
                      {isFollowingUser ? 'Unfollow' : '+ Follow'}
                    </button>

                    <button 
                      onClick={() => {
                        setShowFollowersModal(false);
                        onDirectMessageUser(u.name);
                      }}
                      className="p-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-full font-bold transition-all"
                      title="Direct Message"
                    >
                      <MessageCircleIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="absolute inset-0 z-[90] flex flex-col justify-between themed-bg animate-fade">
          <div className="pt-8 px-4 pb-3 bg-slate-900 border-b flex items-center justify-between themed-border">
            <div>
              <h3 className="text-xs font-black themed-text font-mono">System Configuration</h3>
              <span className="text-[8px] themed-subtext uppercase tracking-widest font-black">VibeSpark Platform Suite</span>
            </div>
            <button onClick={() => { setShowSettings(false); setSettingsSection('main'); }} className="text-slate-300 text-[10px] bg-slate-800 px-3 py-1 rounded-full font-bold">
              Exit Settings
            </button>
          </div>

          {settingsSection === 'main' ? (
            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-left">
              <button onClick={() => setSettingsSection('bio')} className="w-full py-2.5 bg-slate-900 border rounded-xl text-left px-4 text-xs font-bold themed-text themed-border block hover:border-orange-500">
                ✏️ Edit Profile & Bio
              </button>

              <button onClick={() => setSettingsSection('appearance')} className="w-full py-2.5 bg-slate-900 border rounded-xl text-left px-4 text-xs font-bold themed-text themed-border block hover:border-sky-400">
                🎨 Appearance & Themes
              </button>

              <button onClick={() => setSettingsSection('privacy')} className="w-full py-2.5 bg-slate-900 border rounded-xl text-left px-4 text-xs font-bold themed-text themed-border block hover:border-purple-400">
                🔒 Privacy & Visibility Settings
              </button>

              <button onClick={() => setSettingsSection('notifications')} className="w-full py-2.5 bg-slate-900 border rounded-xl text-left px-4 text-xs font-bold themed-text themed-border block hover:border-amber-400">
                🔔 Notifications & Sound Alerts
              </button>

              <button onClick={() => setSettingsSection('security')} className="w-full py-2.5 bg-slate-900 border rounded-xl text-left px-4 text-xs font-bold themed-text themed-border block hover:border-emerald-400">
                🛡️ Parental Shield & Safety Lock
              </button>
              
              <div className="border-t themed-border my-3"></div>
              <button 
                onClick={() => { 
                  setShowSettings(false); 
                  setIsAuthenticated(false); 
                  triggerAlertNotification("Signed out safely.");
                }} 
                className="w-full py-2.5 bg-red-950/40 text-red-400 text-xs font-black rounded-xl border border-red-900/50 block text-center"
              >
                🚪 Logout Session
              </button>
            </div>
          ) : settingsSection === 'bio' ? (
            <div className="flex-1 p-4 space-y-3.5 text-left">
              <button onClick={() => setSettingsSection('main')} className="text-xs text-sky-400 font-bold">← Back to settings</button>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Full Name</label>
                  <input 
                    type="text"
                    value={fullnameEdit}
                    onChange={(e) => setFullnameEdit(e.target.value)}
                    className="w-full bg-slate-900 border rounded-xl p-2 text-xs text-slate-200 themed-border"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Biography</label>
                  <textarea 
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                    className="w-full bg-slate-900 border rounded-xl p-3 text-xs text-slate-200 resize-none h-20 themed-border"
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Avatar Image URL</label>
                  <input 
                    type="text"
                    value={avatarUrlEdit}
                    onChange={(e) => setAvatarUrlEdit(e.target.value)}
                    className="w-full bg-slate-900 border rounded-xl p-2 text-xs text-slate-200 themed-border"
                  />
                </div>

                <button onClick={handleSaveProfileSettings} className="w-full py-2 bg-sky-500 text-slate-950 text-xs font-black rounded-xl">
                  Save Changes
                </button>
              </div>
            </div>
          ) : settingsSection === 'appearance' ? (
            <div className="flex-1 p-4 space-y-4 text-left">
              <button onClick={() => setSettingsSection('main')} className="text-xs text-sky-400 font-bold">← Back to settings</button>
              <div className="p-3 bg-slate-900 border rounded-xl space-y-3 themed-card">
                <p className="text-xs font-bold themed-text">Select Theme Preset</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'dark', label: '🌙 Dark Slate' },
                    { id: 'light', label: '☀️ Light Clean' },
                    { id: 'neon', label: '👾 Neon Cyber' },
                    { id: 'classic', label: '⚙️ Classic Red' },
                    { id: 'frosted', label: '❄️ Frosted Glass' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTheme(t.id);
                        triggerAlertNotification(`Theme switched to ${t.label}!`);
                      }}
                      className={`py-2 px-2 text-[10px] rounded-xl border font-bold transition-all ${
                        currentTheme === t.id ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-md' : 'bg-slate-950 text-slate-300 themed-border'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : settingsSection === 'privacy' ? (
            <div className="flex-1 p-4 space-y-4 text-left">
              <button onClick={() => setSettingsSection('main')} className="text-xs text-sky-400 font-bold">← Back to settings</button>
              <div className="p-3 bg-slate-900 border rounded-xl space-y-3.5 themed-card">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold themed-text">Public Creator Profile</p>
                    <span className="text-[9px] themed-subtext block">Allow anyone to view your published Spark Labs</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={publicProfile} 
                    onChange={(e) => {
                      setPublicProfile(e.target.checked);
                      triggerAlertNotification(e.target.checked ? "🔓 Profile set to Public" : "🔒 Profile set to Private");
                    }}
                    className="w-4 h-4 accent-orange-500 cursor-pointer" 
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <div>
                    <p className="font-bold themed-text">Allow Direct Messages</p>
                    <span className="text-[9px] themed-subtext block">Accept messages from other creators</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={allowDirectMessages} 
                    onChange={(e) => {
                      setAllowDirectMessages(e.target.checked);
                      triggerAlertNotification(e.target.checked ? "💬 Direct messages enabled" : "💬 Direct messages disabled");
                    }}
                    className="w-4 h-4 accent-orange-500 cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          ) : settingsSection === 'notifications' ? (
            <div className="flex-1 p-4 space-y-4 text-left">
              <button onClick={() => setSettingsSection('main')} className="text-xs text-sky-400 font-bold">← Back to settings</button>
              <div className="p-3 bg-slate-900 border rounded-xl space-y-3.5 themed-card">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold themed-text">Push & Vibe Alerts</p>
                    <span className="text-[9px] themed-subtext block">Get notified when creators Vibe your posts</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushNotifications} 
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer" 
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <div>
                    <p className="font-bold themed-text">Sound FX & Synth Audio</p>
                    <span className="text-[9px] themed-subtext block">Play sound effects on interaction</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={soundEffects} 
                    onChange={(e) => setSoundEffects(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer" 
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <div>
                    <p className="font-bold themed-text">Video Autoplay in Feed</p>
                    <span className="text-[9px] themed-subtext block">Automatically play videos on feed scroll</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={videoAutoplay} 
                    onChange={(e) => {
                      setVideoAutoplay(e.target.checked);
                      triggerAlertNotification(e.target.checked ? "🎥 Video autoplay enabled" : "🎥 Video autoplay disabled");
                    }}
                    className="w-4 h-4 accent-orange-500 cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 space-y-4 text-left">
              <button onClick={() => setSettingsSection('main')} className="text-xs text-sky-400 font-bold">← Back to settings</button>
              <div className="p-3 bg-slate-900 border rounded-xl space-y-3 themed-card">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold themed-text font-mono">🛡️ Strict Parental Shield</p>
                    <span className="text-[9px] themed-subtext block">Locks direct messaging to trusted contacts</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={parentLock} 
                    onChange={(e) => setParentLock(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
