export interface User {
  id: string | number;
  username: string;
  fullname: string;
  bio: string;
  avatarUrl: string;
  level: number;
  xp: number;
  followersCount: number;
  followingCount?: number;
  vibesReceived: number;
  disciplineColor: string;
  tagline?: string;
  projects: Array<{
    id: string | number;
    title: string;
    type: string;
    vibes: number;
  }>;
  achievements: Array<{
    title: string;
    desc: string;
  }>;
}

export interface Comment {
  id?: string | number;
  user: string;
  text: string;
  timestamp?: string;
}

export interface Post {
  id: string | number;
  author: string;
  avatar: string;
  track: 'tech' | 'music' | 'eco' | 'design' | 'code';
  trackColor: string;
  projectTitle: string;
  tagline: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio' | 'text';
  vibes: number;
  xpBoosts: number;
  userVibed: boolean;
  userXPBoosted: boolean;
  isFollowing?: boolean;
  collaborators?: string[];
  comments: Comment[];
  createdAt?: string;
}

export interface GalleryItem {
  id: string | number;
  title: string;
  img: string;
  vibes: number;
  xpBoosts?: number;
  type: string;
  author: string;
  avatar?: string;
  description?: string;
}

export interface LabProject {
  id: string | number;
  title: string;
  type: 'Design' | 'Code' | 'Music/Lyrics' | 'Eco Campaign' | 'Audio' | 'Hardware' | 'AI' | string;
  public: boolean;
  code?: string;
  lyrics?: string;
  campaignGoal?: number;
  campaignProgress?: number;
  imageUrl?: string;
  createdAt?: string;
}

export interface Challenge {
  id: string | number;
  title: string;
  entries: number;
  reward: string;
  creator: string;
  desc: string;
  deadline: string;
  techstack: string;
  requiredLabType: 'image' | 'code' | 'lyrics' | 'campaign';
  starterTemplate?: string;
}

export interface ChatMessage {
  id: string | number;
  sender: string;
  text: string;
  time: string;
  mediaUrl?: string;
  voiceNoteUrl?: string;
  reactions?: Record<string, number>;
}

export interface Chat {
  id: string | number;
  name: string;
  avatar?: string;
  lastMsg: string;
  time: string;
  unread?: number;
  messages: ChatMessage[];
  isBuddy?: boolean;
}

export interface GroupChat {
  id: string | number;
  name: string;
  logo: string;
  desc: string;
  isAdmin: boolean;
  capacity?: number;
  unread?: number;
  messages: ChatMessage[];
  members?: string[];
  includesBuddy?: boolean;
}

export interface NotificationItem {
  id: string | number;
  user: string;
  desc: string;
  type: 'vibe' | 'xp' | 'fork' | 'chat' | 'challenge' | 'follow';
  time: string;
  targetTab?: string;
  targetId?: string | number;
}

export interface StorySlide {
  id: string | number;
  mediaType: 'image' | 'audio' | 'text';
  mediaUrl: string;
  text: string;
}

export interface Story {
  id: string | number;
  name: string;
  avatar: string;
  watched: boolean;
  slides: StorySlide[];
}
