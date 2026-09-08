import React, { useState } from 'react';
import { Post, User, GalleryItem, Challenge, Story, LabProject } from '../types';
import { BackArrowIcon } from './Icons';
import { createPostInFirestore, createChallengeInFirestore } from '../services/firebase';

interface CreatePostModalProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  challenges?: Challenge[];
  setChallenges?: React.Dispatch<React.SetStateAction<Challenge[]>>;
  labProjects?: LabProject[];
  setLabProjects?: React.Dispatch<React.SetStateAction<LabProject[]>>;
  setGalleryGridItems?: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  setStories?: React.Dispatch<React.SetStateAction<Story[]>>;
  currentUser: User;
  setActiveTab: (tab: string) => void;
  triggerAlertNotification: (msg: string) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  posts,
  setPosts,
  challenges,
  setChallenges,
  labProjects,
  setLabProjects,
  setGalleryGridItems,
  setStories,
  currentUser,
  setActiveTab,
  triggerAlertNotification
}) => {
  const [newPostType, setNewPostType] = useState<'Post' | 'Milestone' | 'Challenge' | 'Reel' | 'Lab Showcase'>('Post');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Challenge form fields
  const [challengeReward, setChallengeReward] = useState('$250 + 500 XP');
  const [challengeLabType, setChallengeLabType] = useState<'code' | 'audio' | 'design' | 'interactive'>('code');
  const [challengeStack, setChallengeStack] = useState('Python / Web API');

  // Milestone form fields
  const [milestoneCategory, setMilestoneCategory] = useState('Hardware Prototype');
  const [milestoneCompletionBadge, setMilestoneCompletionBadge] = useState('🏆 Phase 1 Complete');

  // Reel form fields
  const [reelTrackName, setReelTrackName] = useState('NXT Bassline Vibe #4');

  // Lab Showcase form fields
  const [labCategory, setLabCategory] = useState<'code' | 'audio' | 'design' | 'interactive'>('code');
  const [labSnippet, setLabSnippet] = useState('// MicroPython Solar Code\nimport machine\nprint("Sensor Online")');

  // Collaborators
  const [collaboratorInput, setCollaboratorInput] = useState('');

  const parseCollaborators = () => {
    if (!collaboratorInput.trim()) return [];
    return collaboratorInput
      .split(',')
      .map(c => c.trim().replace(/^@/, ''))
      .filter(Boolean);
  };
  const [attachedFileType, setAttachedFileType] = useState<'text' | 'image' | 'video' | 'audio'>('image');
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string>('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=450&q=80');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setAttachedFileType('video');
      } else if (file.type.startsWith('audio/')) {
        setAttachedFileType('audio');
      } else {
        setAttachedFileType('image');
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewMediaUrl(event.target.result as string);
          triggerAlertNotification(`📁 ${file.type.split('/')[0].toUpperCase()} loaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiAutocompleteSpark = async () => {
    if (!newTitle.trim() && !newDescription.trim()) {
      triggerAlertNotification("✍️ Draft a title or concept first so Buddy can assist!");
      return;
    }

    setIsAiGenerating(true);
    try {
      const prompt = `Review this draft title: "${newTitle}" and concept: "${newDescription}". Write a short catchy tagline and 3 trendy youth hashtags (e.g. #solar #hardware #vibespark). Keep it short!`;
      const response = await fetch('/api/buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.text) {
        setNewDescription(prev => prev ? `${prev}\n\n🤖 Buddy Spark:\n${data.text}` : data.text);
        triggerAlertNotification("🔮 Buddy Auto-Spark Applied!");
      }
    } catch (err) {
      setNewDescription(prev => `${prev}\n\n🏷️ #renewable #future #hardware`);
      triggerAlertNotification("🔮 Tagline and hashtags added!");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      triggerAlertNotification("⚠️ Please enter a title!");
      return;
    }

    if (newPostType === 'Challenge') {
      const newChal: Challenge = {
        id: Date.now(),
        title: newTitle,
        creator: currentUser.username,
        desc: newDescription || 'Community Hackathon Challenge',
        reward: challengeReward,
        deadline: '7 Days Left',
        entries: 0,
        requiredLabType: challengeLabType,
        techstack: challengeStack,
        starterTemplate: `# Spark Challenge Template\ndef solution():\n    print("Build your solution in Spark Labs!")`
      };

      try {
        await createChallengeInFirestore(newChal);
      } catch (err) {
        console.warn("Firestore save warning:", err);
      }

      if (setChallenges) {
        setChallenges(prev => [newChal, ...prev]);
      }

      setNewTitle('');
      setNewDescription('');
      setActiveTab('challenges');
      triggerAlertNotification('🏆 Challenge Created and Published to Challenges Hub!');
      return;
    }

    // Milestone post
    if (newPostType === 'Milestone') {
      const milestonePost: Post = {
        id: Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatarUrl,
        track: 'tech',
        trackColor: 'border-emerald-400 text-emerald-400',
        projectTitle: newTitle,
        tagline: `${milestoneCompletionBadge} • ${newDescription || 'Milestone achieved in VibeSpark!'}`,
        mediaUrl: previewMediaUrl,
        mediaType: attachedFileType,
        vibes: 1,
        xpBoosts: 25,
        userVibed: true,
        userXPBoosted: true,
        isFollowing: false,
        collaborators: parseCollaborators(),
        comments: []
      };

      try {
        await createPostInFirestore(milestonePost);
      } catch (err) {
        console.warn("Firestore save warning:", err);
      }

      setPosts([milestonePost, ...posts]);
      setNewTitle('');
      setNewDescription('');
      setActiveTab('home');
      triggerAlertNotification('🎯 Milestone Published to Stories & Home Feed!');
      return;
    }

    if (newPostType === 'Lab Showcase') {
      const newLab: LabProject = {
        id: Date.now(),
        title: newTitle,
        type: labCategory === 'code' ? 'Code' : labCategory === 'audio' ? 'Audio' : labCategory === 'design' ? 'Design' : 'AI',
        public: true,
        imageUrl: previewMediaUrl,
        code: labSnippet
      };

      if (setLabProjects) {
        setLabProjects(prev => [newLab, ...prev]);
      }

      const labPost: Post = {
        id: Date.now(),
        author: currentUser.username,
        avatar: currentUser.avatarUrl,
        track: 'tech',
        trackColor: 'border-sky-400 text-sky-400',
        projectTitle: newTitle,
        tagline: `${newDescription || 'Interactive Spark Lab Blueprint created!'}`,
        mediaUrl: previewMediaUrl,
        mediaType: attachedFileType,
        vibes: 1,
        xpBoosts: 15,
        userVibed: true,
        userXPBoosted: true,
        isFollowing: false,
        collaborators: parseCollaborators(),
        comments: []
      };

      try {
        await createPostInFirestore(labPost);
      } catch (err) {
        console.warn("Firestore save warning:", err);
      }

      setPosts([labPost, ...posts]);
      setNewTitle('');
      setNewDescription('');
      setActiveTab('sparklabs');
      triggerAlertNotification('🧪 Spark Lab Published & Added to Creation Suite!');
      return;
    }

    // Reel or Regular Post
    const newCreatedPost: Post = {
      id: Date.now(),
      author: currentUser.username,
      avatar: currentUser.avatarUrl,
      track: newPostType === 'Reel' ? 'music' : 'tech',
      trackColor: newPostType === 'Reel' ? 'border-purple-400 text-purple-400' : 'border-sky-400 text-sky-400',
      projectTitle: newTitle,
      tagline: newPostType === 'Reel' ? `🎵 ${reelTrackName} • ${newDescription}` : (newDescription || 'Brand new VibeSpark innovation.'),
      mediaUrl: previewMediaUrl,
      mediaType: newPostType === 'Reel' ? 'video' : attachedFileType,
      vibes: 1,
      xpBoosts: 10,
      userVibed: true,
      userXPBoosted: false,
      isFollowing: false,
      collaborators: parseCollaborators(),
      comments: []
    };

    try {
      await createPostInFirestore(newCreatedPost);
    } catch (err) {
      console.warn("Firestore save warning:", err);
    }

    setPosts([newCreatedPost, ...posts]);

    if (setGalleryGridItems) {
      const galleryItem: GalleryItem = {
        id: Date.now() + 10,
        title: newTitle,
        img: previewMediaUrl,
        vibes: 1,
        xpBoosts: 10,
        type: newPostType.toLowerCase(),
        author: currentUser.username,
        avatar: currentUser.avatarUrl,
        description: newDescription
      };
      setGalleryGridItems(prev => [galleryItem, ...prev]);
    }

    setNewTitle('');
    setNewDescription('');
    setActiveTab('home');
    triggerAlertNotification(`🚀 ${newPostType} Published Successfully!`);
  };

  return (
    <div className="p-4 fade-in text-left">
      <div className="flex items-center space-x-2 border-b pb-2 themed-border mb-4">
        <button onClick={() => setActiveTab('home')} className="text-slate-300 p-1">
          <BackArrowIcon />
        </button>
        <h3 className="text-sm font-black themed-text">
          Publish Creator Content
        </h3>
      </div>

      {/* Select Content Type Form */}
      <div className="grid grid-cols-5 gap-1 mb-4">
        {(['Post', 'Milestone', 'Challenge', 'Reel', 'Lab Showcase'] as const).map(type => (
          <button 
            key={type} 
            type="button"
            onClick={() => setNewPostType(type)} 
            className={`py-1.5 px-1 text-[8px] font-extrabold rounded transition-all truncate ${
              newPostType === type ? 'themed-accent-bg text-slate-950 font-black shadow-md' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreateContent} className="space-y-3.5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] uppercase tracking-widest text-slate-500 font-extrabold">
            {newPostType} Builder
          </span>
          
          <button
            type="button"
            onClick={handleAiAutocompleteSpark}
            disabled={isAiGenerating}
            className={`text-[8px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 transition-all ${
              isAiGenerating 
                ? 'bg-purple-950 text-purple-400 animate-pulse' 
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md active:scale-95'
            }`}
          >
            <span>{isAiGenerating ? 'Thinking...' : '🔮 Spark (Buddy AI)'}</span>
          </button>
        </div>

        {/* CUSTOM FORM LAYOUT ACCORDING TO CONTENT TYPE */}
        {newPostType === 'Challenge' && (
          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Reward Pool</label>
              <input 
                type="text" 
                value={challengeReward}
                onChange={(e) => setChallengeReward(e.target.value)}
                placeholder="e.g. $500 + 1000 XP"
                className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Target Spark Lab</label>
                <select 
                  value={challengeLabType}
                  onChange={(e: any) => setChallengeLabType(e.target.value)}
                  className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
                >
                  <option value="code">⚡ MicroPython & Code Lab</option>
                  <option value="audio">🎵 Audio & Beat Studio</option>
                  <option value="design">🔌 Circuit & Schematic Lab</option>
                  <option value="interactive">🤖 AI Blueprint Generator</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Tech Stack</label>
                <input 
                  type="text" 
                  value={challengeStack}
                  onChange={(e) => setChallengeStack(e.target.value)}
                  placeholder="e.g. ESP32 / Web Audio"
                  className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {newPostType === 'Milestone' && (
          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-emerald-500/30">
            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider block">🎯 Milestone Story Configuration</span>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Milestone Category</label>
                <select 
                  value={milestoneCategory}
                  onChange={(e) => setMilestoneCategory(e.target.value)}
                  className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
                >
                  <option value="Hardware Prototype">🔌 Hardware Prototype</option>
                  <option value="Song Release">🎵 Track/Song Release</option>
                  <option value="Code Architecture">💻 Code Architecture</option>
                  <option value="Hackathon Victory">🏆 Hackathon Victory</option>
                  <option value="AI Model Test">🤖 AI Model Test</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Badge Tag</label>
                <input 
                  type="text" 
                  value={milestoneCompletionBadge}
                  onChange={(e) => setMilestoneCompletionBadge(e.target.value)}
                  placeholder="e.g. Phase 1 Complete"
                  className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {newPostType === 'Reel' && (
          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-purple-500/30">
            <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider block">🎥 Immersive Reel & Audio Clip</span>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Audio Track / Sound Name</label>
              <input 
                type="text" 
                value={reelTrackName}
                onChange={(e) => setReelTrackName(e.target.value)}
                placeholder="e.g. Original Synth Beat #2"
                className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
              />
            </div>
          </div>
        )}

        {newPostType === 'Lab Showcase' && (
          <div className="space-y-3 p-3 bg-slate-950 rounded-2xl border border-sky-500/30">
            <span className="text-[9px] text-sky-400 font-black uppercase tracking-wider block">🧪 Spark Lab Blueprint</span>
            <div>
              <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Lab Category</label>
              <select 
                value={labCategory}
                onChange={(e: any) => setLabCategory(e.target.value)}
                className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none themed-border font-bold"
              >
                <option value="code">⚡ MicroPython & Embedded Code</option>
                <option value="audio">🎵 Audio & Synth Waveform</option>
                <option value="design">🔌 Circuit & Schematic Diagram</option>
                <option value="interactive">🤖 AI Blueprint Spec</option>
              </select>
            </div>

            <div>
              <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Code or Schematic Snippet</label>
              <textarea 
                value={labSnippet}
                onChange={(e) => setLabSnippet(e.target.value)}
                className="w-full bg-black border border-slate-800 rounded-xl p-2.5 text-[10px] text-emerald-400 font-mono resize-none h-20"
              />
            </div>
          </div>
        )}

        {/* Media Upload Box */}
        <div className="space-y-2">
          <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold">Attach Media / Visual Asset</label>
          <div className="flex items-center space-x-2">
            <label className="flex-1 cursor-pointer bg-slate-900 border border-dashed border-slate-700 hover:border-orange-500 py-2.5 px-3 rounded-xl text-xs text-center text-slate-300 font-bold">
              <span>📁 Select Media File (Image, Video, Audio)</span>
              <input type="file" accept="image/*,video/*,audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {previewMediaUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
              <img src={previewMediaUrl} alt="Preview" className="w-full h-full object-cover" />
              <span className="absolute bottom-2 right-2 bg-slate-950/80 text-[8px] text-orange-400 px-2 py-0.5 rounded font-mono font-bold">
                Media Loaded
              </span>
            </div>
          )}
        </div>

        {/* Title & Description Inputs */}
        <input 
          type="text" 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder={`Title for your ${newPostType}...`} 
          className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 themed-border focus:outline-none focus:border-orange-500" 
        />
        
        <textarea 
          value={newDescription} 
          onChange={(e) => setNewDescription(e.target.value)} 
          placeholder={`Describe your ${newPostType} concept, specifications, or lyrics...`} 
          className="w-full bg-slate-900 border rounded-xl p-3 text-xs text-slate-200 resize-none h-20 themed-border focus:outline-none focus:border-orange-500" 
        />

        {/* Tag Multiple Project Collaborators */}
        <div>
          <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">
            🤝 Tag Project Collaborators (comma-separated handles)
          </label>
          <input 
            type="text" 
            value={collaboratorInput} 
            onChange={(e) => setCollaboratorInput(e.target.value)} 
            placeholder="e.g. sasha_vibe, tech_sam, dev_phoenix" 
            className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 themed-border focus:outline-none focus:border-orange-500" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-widest shadow-xl active:scale-98 transition-all"
        >
          🚀 Publish {newPostType}
        </button>
      </form>
    </div>
  );
};


