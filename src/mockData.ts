import { User, Post, GalleryItem, LabProject, Challenge, Chat, GroupChat, NotificationItem, Story } from './types';

export const initialCurrentUser: User = {
  id: 'self',
  username: 'dev_phoenix_17',
  fullname: 'Phoenix Asher',
  tagline: '⚡ Building renewable IoT ecosystems to solve agricultural soil decay.',
  level: 7,
  xp: 4120,
  followersCount: 842,
  followingCount: 154,
  vibesReceived: 512,
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  disciplineColor: 'ring-sky-400 text-sky-400',
  bio: 'Hardware engineer & sustainability tech visionary. Working on solar-powered atmospheric water filters and soil telemetry units.',
  projects: [
    { id: 401, title: 'Smart-Grid Agriculture Solar Cell', type: 'Eco Grid', vibes: 412 },
    { id: 402, title: 'Deep Probe Moisture Firmware', type: 'Code', vibes: 238 }
  ],
  achievements: [
    { title: '☀️ Green Grid Master', desc: 'Deployed first functional community solar node.' },
    { title: '⚡ 500+ Cultural Vibes', desc: 'Respected globally across multiple hubs.' }
  ]
};

export const initialFollowersList = [
  { id: 1, name: 'cyber_spark', fullname: 'Kofi Mensah', bio: 'DIY hardware and Pi zero enthusiast', following: true, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80', disciplineColor: 'ring-sky-400', vibeCount: 890, xpLevel: 9 },
  { id: 2, name: 'audio_queen', fullname: 'Amina Bello', bio: 'Singing, guitar loops, and digital synths', following: false, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80', disciplineColor: 'ring-purple-400', vibeCount: 1420, xpLevel: 12 },
  { id: 3, name: 'josh_makes', fullname: 'Joshua Reed', bio: 'ESP32 automated greenhouses founder', following: true, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80', disciplineColor: 'ring-emerald-400', vibeCount: 340, xpLevel: 4 },
  { id: 4, name: 'ecosystem_teen', fullname: 'Zoe Vance', bio: 'Circular waste packaging and tech solutions', following: false, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80', disciplineColor: 'ring-green-400', vibeCount: 610, xpLevel: 6 }
];

export const initialFollowingList = [
  { id: 10, name: 'innovate_fast', fullname: 'Leo Zhang', bio: 'Fast 3D prototyping solutions creator', following: true, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80', disciplineColor: 'ring-amber-400', vibeCount: 120, xpLevel: 3 },
  { id: 11, name: 'solar_kid', fullname: 'Tariq Osei', bio: 'Converting scrap metal into thermal cells', following: true, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80', disciplineColor: 'ring-orange-400', vibeCount: 430, xpLevel: 5 }
];

export const initialPosts: Post[] = [
  {
    id: 1,
    author: 'cyber_spark',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    track: 'tech',
    trackColor: 'border-sky-400 text-sky-400',
    projectTitle: 'ESP32 Hydroponic Telemetry',
    tagline: 'Delivering live NPK soil calculations directly to Accra community gardens.',
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=450&q=80',
    mediaType: 'image',
    vibes: 142,
    xpBoosts: 84,
    userVibed: false,
    userXPBoosted: false,
    isFollowing: true,
    comments: [
      { user: 'dev_phoenix_17', text: 'This design is insane. How did you stabilize power fluctuations?' },
      { user: 'josh_makes', text: 'Love the relay schematic!' }
    ]
  },
  {
    id: 2,
    author: 'audio_queen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    track: 'music',
    trackColor: 'border-purple-400 text-purple-400',
    projectTitle: 'Ethereal - Sunset Horizon Live Track',
    tagline: 'Layering guitar visualizers with dynamic acoustic feedback tracks.',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    vibes: 318,
    xpBoosts: 156,
    userVibed: false,
    userXPBoosted: false,
    isFollowing: false,
    comments: [
      { user: 'dev_phoenix_17', text: 'Outstanding chord changes!' }
    ]
  },
  {
    id: 3,
    author: 'ecosystem_teen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
    track: 'tech',
    trackColor: 'border-emerald-400 text-emerald-400',
    projectTitle: 'ReGlass Composite Bricks',
    tagline: 'Hydraulic high-compression brick matrices from glass waste particles.',
    mediaUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&h=450&q=80',
    mediaType: 'image',
    vibes: 98,
    xpBoosts: 41,
    userVibed: false,
    userXPBoosted: false,
    isFollowing: false,
    comments: [
      { user: 'civil_innovator', text: 'I can help run load calculations.' }
    ]
  }
];

export const initialGalleryGridItems: GalleryItem[] = [
  {
    id: 501,
    title: 'Smart Atmospheric Water Generator v3.1',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=600&q=80',
    vibes: 582,
    xpBoosts: 210,
    type: 'lab',
    author: 'cyber_spark',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    description: 'Condensing atmospheric moisture into clean filtered drinking water powered by 12V solar array.'
  },
  {
    id: 502,
    title: 'Neon Cyber-Glove Schematic',
    img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&h=600&q=80',
    vibes: 419,
    xpBoosts: 180,
    type: 'standard',
    author: 'josh_makes',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    description: 'Haptic feedback wearable glove with embedded flex sensors for sign language translation.'
  },
  {
    id: 503,
    title: 'Analog Guitar FX Loop Pedal Circuit',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&h=600&q=80',
    vibes: 673,
    xpBoosts: 310,
    type: 'lab',
    author: 'audio_queen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
    description: 'Custom analog distortion & pitch shift pedal built using recycled components.'
  },
  {
    id: 504,
    title: 'Solar Tracker Dual-Axis Motor',
    img: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&h=600&q=80',
    vibes: 340,
    xpBoosts: 145,
    type: 'lab',
    author: 'dev_phoenix_17',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
    description: 'Automatic sun-tracking solar panel tilt mount controlled by micro-servos and light sensors.'
  }
];

export const initialLabProjects: LabProject[] = [
  { 
    id: 201, 
    title: 'Smart Farm Soil Relay Node', 
    type: 'Code', 
    public: true, 
    code: 'import machine\nimport time\nsoil = machine.ADC(26)\nwhile True:\n    val = soil.read_u16()\n    print("Telemetry: NPK moisture level checked ->", val)\n    time.sleep(1.0)' 
  },
  { 
    id: 202, 
    title: 'Accra Sunset Vocal Run', 
    type: 'Music/Lyrics', 
    public: false, 
    lyrics: 'V1: Gold light striking on the solar panel arrays\nChorus: Sparking up the vibe down in Accra bay' 
  }
];

export const initialChallenges: Challenge[] = [
  { 
    id: 1, 
    title: '🔋 Solar-Powered Utility Hack', 
    entries: 14, 
    reward: '150 XP + Green Tech Badge', 
    creator: '@dev_phoenix_17', 
    desc: 'Design a high-efficiency prototype powered fully by renewable light energy. Focused on clean telemetry arrays.',
    deadline: '4 days left',
    techstack: 'Hardware / MicroPython',
    requiredLabType: 'code',
    starterTemplate: '# MicroPython Solar Monitor Starter\nimport machine, time\nsolar_adc = machine.ADC(26)\nwhile True:\n    power_val = solar_adc.read_u16()\n    print("Solar Output (mW):", power_val * 0.05)\n    time.sleep(1)'
  },
  { 
    id: 2, 
    title: '⚡ NXT Future-Tech Mesh Build', 
    entries: 8, 
    reward: '300 XP + NXT Alpha Tier Badge', 
    creator: 'NXT Tech Industries', 
    desc: 'Create secure wireless communication nodes for solar-powered automated community shelters.',
    deadline: '9 days left',
    techstack: 'Firmware / ESP32 mesh',
    requiredLabType: 'code',
    starterTemplate: '// ESP32 Mesh Gateway Node\n#include <WiFi.h>\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println("NXT Mesh Node Online!");\n}'
  },
  { 
    id: 3, 
    title: '🎵 Sunrise Beat Loop Synthesis', 
    entries: 23, 
    reward: '200 XP + Sound Waves Badge', 
    creator: '@audio_queen', 
    desc: 'Compose a sunset hybrid lo-fi vibe track layered over high-vibe physical hardware filter visualizers.',
    deadline: '2 days left',
    techstack: 'Acoustic vocals / DAW loops',
    requiredLabType: 'lyrics',
    starterTemplate: '[00:01] Morning light rising over the solar array\n[00:05] Synths echoing far into Accra bay\n[00:09] Feel the pulse, feel the electric rhythm grow'
  }
];

export const initialChats: Chat[] = [
  { 
    id: 99, 
    name: 'Buddy - Gemini Co-Pilot 🤖', 
    lastMsg: 'Ask me anything about your music loops, code, or solar setups!', 
    time: 'Online', 
    isBuddy: true,
    messages: [
      { id: 1, sender: 'Buddy', text: 'Hey creator! I am Buddy, your live multi-disciplinary design co-pilot. Drop a project concept, lyric prompt, or hardware puzzle and let\'s spark some ideas! 🚀', time: 'Online' }
    ]
  },
  { 
    id: 1, 
    name: 'Sasha Vocalist 🎤', 
    lastMsg: 'Can you listen to this bridge acoustic loop?', 
    time: '08:12 PM', 
    messages: [
      { id: 1, sender: 'Sasha', text: 'Hey, did you review the acoustic backing tracks?', time: '8:00 PM' },
      { id: 2, sender: 'You', text: 'Listening now! Love the chord transitions.', time: '8:05 PM' },
      { id: 3, sender: 'Sasha', text: 'Can you listen to this bridge acoustic loop?', time: '8:12 PM' }
    ]
  }
];

export const initialGroups: GroupChat[] = [
  {
    id: 101,
    name: 'Accra Solar Hackers ☀️',
    logo: '🧪',
    desc: 'Building locally tailored micro-grids and backup power nodes for schools.',
    isAdmin: true,
    capacity: 35,
    unread: 4,
    includesBuddy: true,
    members: ['You', 'cyber_spark', 'josh_makes', 'Buddy'],
    messages: [
      { id: 1, sender: 'You', text: 'Just drafted the automatic relay switch schematic.', time: '09:20 AM' },
      { id: 2, sender: 'cyber_spark', text: 'Excellent! Let us test it in the Virtual Spark Lab this afternoon.', time: '09:22 AM' },
      { id: 3, sender: 'Buddy', text: '🤖 I checked your schematic! Remember to place a flyback diode across the relay coil to protect your ESP32 GPIO pin!', time: '09:23 AM' }
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  { id: 1, user: 'cyber_spark', desc: 'vibed your Solar Pi Drone V2 design!', type: 'vibe', time: '12 mins ago', targetTab: 'home', targetId: 1 },
  { id: 2, user: 'audio_queen', desc: 'boosted your portfolio with +50 XP!', type: 'xp', time: '1 hour ago', targetTab: 'profile' },
  { id: 3, user: 'josh_makes', desc: 'forked your Smart Farm code template.', type: 'fork', time: '3 hours ago', targetTab: 'sparklabs' }
];

export const initialStories: Story[] = [
  {
    id: 1,
    name: 'cyber_spark',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    watched: false,
    slides: [
      { id: 101, mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80', text: 'Solder terminal complete. Power rails read perfect 5.0V!' },
      { id: 102, mediaType: 'text', mediaUrl: '', text: 'Next step: Coding the wireless ESP32 mesh framework.' }
    ]
  },
  {
    id: 2,
    name: 'audio_queen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
    watched: false,
    slides: [
      { id: 201, mediaType: 'audio', mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80', text: 'Vibe acoustic vocals overlay session with Sasha 🎤' }
    ]
  }
];
