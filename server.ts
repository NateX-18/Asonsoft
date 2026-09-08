import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

async function generateGeminiContentWithFallback(client: GoogleGenAI, prompt: string, systemInstruction?: string): Promise<string> {
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const modelName of modelsToTry) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are Buddy, the friendly AI Creator Co-pilot for VibeSpark. Provide clean, clear, step-by-step answers without asterisks or hash symbols!"
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} call fallback:`, err?.status || err?.message || err);
    }
  }
  return "";
}

// In-memory persistent server data store
let currentUserSession: any = {
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

let isAuthenticatedSession = true;

let serverChats: any[] = [
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

let serverPosts: any[] = [
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
    mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&h=450&q=80',
    mediaType: 'video',
    vibes: 318,
    xpBoosts: 156,
    userVibed: false,
    userXPBoosted: false,
    isFollowing: false,
    comments: [
      { user: 'dev_phoenix_17', text: 'Outstanding chord changes!' }
    ]
  }
];

let serverLabs: any[] = [
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // AUTH API ENDPOINTS
  app.get("/api/auth/me", (_req, res) => {
    if (isAuthenticatedSession) {
      res.json({ authenticated: true, user: currentUserSession });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post("/api/auth/signin", (req, res) => {
    const { username, password, oauthProvider } = req.body;
    const finalUsername = username ? (username.includes('@') ? username.split('@')[0] : username) : 'creator';
    
    currentUserSession = {
      ...currentUserSession,
      username: finalUsername,
      fullname: oauthProvider ? `${oauthProvider} Verified Creator` : `${finalUsername.charAt(0).toUpperCase() + finalUsername.slice(1)}`
    };
    isAuthenticatedSession = true;
    res.json({ success: true, user: currentUserSession });
  });

  app.post("/api/auth/signup", (req, res) => {
    const { username, fullname, bio } = req.body;
    currentUserSession = {
      ...currentUserSession,
      username: username ? username.replace('@', '') : 'new_creator',
      fullname: fullname || 'New VibeSpark Creator',
      bio: bio || 'Innovative VibeSpark creator.'
    };
    isAuthenticatedSession = true;
    res.json({ success: true, user: currentUserSession });
  });

  app.post("/api/auth/logout", (_req, res) => {
    isAuthenticatedSession = false;
    res.json({ success: true });
  });

  // CHATS API ENDPOINTS (Saved Buddy AI & User Chats)
  app.get("/api/chats", (_req, res) => {
    res.json({ chats: serverChats });
  });

  app.post("/api/chats", (req, res) => {
    const { name, isBuddy } = req.body;
    const newChat = {
      id: Date.now(),
      name: name || 'New Conversation',
      lastMsg: 'Chat started',
      time: 'Just now',
      isBuddy: !!isBuddy,
      messages: []
    };
    serverChats.unshift(newChat);
    res.json({ chat: newChat });
  });

  app.post("/api/chats/:id/messages", async (req, res) => {
    const chatId = req.params.id === 'buddy' || req.params.id === '99' ? 99 : Number(req.params.id);
    const { text, sender, mediaUrl } = req.body;

    let chat = serverChats.find(c => c.id === chatId);
    if (!chat) {
      if (chatId === 99) {
        chat = {
          id: 99,
          name: 'Buddy - Gemini Co-Pilot 🤖',
          lastMsg: 'Ask me anything!',
          time: 'Online',
          isBuddy: true,
          messages: []
        };
        serverChats.unshift(chat);
      } else {
        return res.status(404).json({ error: "Chat not found" });
      }
    }

    const userMsg = {
      id: Date.now(),
      sender: sender || 'You',
      text,
      time: 'Just now',
      mediaUrl
    };
    chat.messages.push(userMsg);
    chat.lastMsg = `${userMsg.sender}: ${text || 'Sent media'}`;
    chat.time = 'Just now';

    // If Buddy Chat, invoke Buddy AI and append reply
    let aiReplyText = '';
    if (chat.isBuddy || chatId === 99) {
      const client = getGenAIClient();
      if (client) {
        aiReplyText = await generateGeminiContentWithFallback(
          client,
          text,
          "You are Buddy, the friendly, inspiring AI Creator Co-pilot for VibeSpark. Give structured, short, motivating, and expert answers for tech, code, music, and hardware projects! Use emojis generously!"
        );
      }

      if (!aiReplyText) {
        aiReplyText = `Hey creator! 🚀 Loved your message: "${text.slice(0, 30)}...". Let me know if you need help generating code, drafting lyrics, or building telemetry schematics! 🤖⚡`;
      }

      const buddyReplyMsg = {
        id: Date.now() + 1,
        sender: 'Buddy',
        text: aiReplyText,
        time: 'Just now'
      };
      chat.messages.push(buddyReplyMsg);
      chat.lastMsg = aiReplyText;
    }

    res.json({ chat });
  });

  // POSTS API ENDPOINTS
  app.get("/api/posts", (_req, res) => {
    res.json({ posts: serverPosts });
  });

  app.post("/api/posts", (req, res) => {
    const newPost = {
      id: Date.now(),
      ...req.body,
      vibes: req.body.vibes || 1,
      xpBoosts: req.body.xpBoosts || 10,
      comments: req.body.comments || []
    };
    serverPosts.unshift(newPost);
    res.json({ post: newPost });
  });

  app.post("/api/posts/:id/vibe", (req, res) => {
    const postId = Number(req.params.id);
    const post = serverPosts.find(p => p.id === postId);
    if (post) {
      post.userVibed = !post.userVibed;
      post.vibes = post.userVibed ? post.vibes + 1 : Math.max(0, post.vibes - 1);
    }
    res.json({ post });
  });

  app.post("/api/posts/:id/comment", (req, res) => {
    const postId = Number(req.params.id);
    const { user, text } = req.body;
    const post = serverPosts.find(p => p.id === postId);
    if (post) {
      post.comments.push({ user, text });
    }
    res.json({ post });
  });

  // LABS API ENDPOINTS
  app.get("/api/labs", (_req, res) => {
    res.json({ labs: serverLabs });
  });

  app.post("/api/labs", (req, res) => {
    const newLab = { id: Date.now(), ...req.body };
    serverLabs.unshift(newLab);
    res.json({ lab: newLab });
  });

  // PROFILE API ENDPOINT
  app.put("/api/user/profile", (req, res) => {
    currentUserSession = { ...currentUserSession, ...req.body };
    res.json({ user: currentUserSession });
  });

  // API endpoint for Buddy AI Co-pilot
  app.post("/api/buddy", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const lowerPrompt = prompt.toLowerCase();
      const isImageReq = lowerPrompt.includes("image") || lowerPrompt.includes("draw") || lowerPrompt.includes("picture") || lowerPrompt.includes("photo") || lowerPrompt.includes("generate an image") || lowerPrompt.includes("make an image");

      if (isImageReq) {
        const cleanImgPrompt = prompt.replace(/(generate|draw|create|make|show me)\s*(an?|a)?\s*(image|picture|photo)?\s*(of)?/gi, '').trim() || prompt;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanImgPrompt)}?width=600&height=400&nologo=true`;
        return res.json({
          text: `Here is the visual you requested for "${cleanImgPrompt}":`,
          mediaUrl: imageUrl
        });
      }

      const client = getGenAIClient();
      if (client) {
        const defaultSys = "You are Buddy, the friendly, inspiring, and multi-disciplinary AI Co-pilot for VibeSpark. Answer any question clearly (general knowledge, hardware, code, music, science, advice, or ideas). CRITICAL: Do NOT use asterisks (*) or hash symbols (#) in your text. Keep formatting neat, clean, and elegant!";
        const textResult = await generateGeminiContentWithFallback(client, prompt, systemInstruction || defaultSys);
        if (textResult) {
          const cleanText = textResult.replace(/[\*#]/g, '');
          return res.json({ text: cleanText });
        }
      }

      // Fallback clean Buddy responses if API key is unconfigured or rate limited
      const cleanPromptSnippet = prompt.slice(0, 40).replace(/[\*#]/g, '');
      const fallbackResponses = [
        `Hey creator! I am Buddy, your VibeSpark co-pilot. Regarding "${cleanPromptSnippet}...": That is an incredible concept. Have you considered adding telemetry logs or an interactive audio feedback loop? Keep pushing your creative boundaries! ⚡`,
        `Boom! Love where you are going with this! You can test this blueprint right inside Spark Labs. Try pairing it with an ESP32 or MicroPython script for maximum vibes! 🧪`,
        `Awesome Spark idea! Let us level this up: add a clean tagline, tag your track, and publish it to the Gallery. Need help drafting code or lyrics? I am here! 🤖`
      ];
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return res.json({ text: randomFallback });
    } catch (err: any) {
      console.error("Error in /api/buddy endpoint:", err);
      return res.status(500).json({ error: err.message || "Server error" });
    }
  });

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "VibeSpark API", buddy: "Active" });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VibeSpark server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
