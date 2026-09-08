import React, { useState } from 'react';
import { Chat, GroupChat } from '../types';
import { SendIcon, BackArrowIcon, MoreIcon, PlusIcon } from './Icons';
import { saveChatMessageInFirestore, saveGroupMessageInFirestore, createGroupInFirestore } from '../services/firebase';

interface ChatViewProps {
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  groups: GroupChat[];
  setGroups: React.Dispatch<React.SetStateAction<GroupChat[]>>;
  activeChatId: string | number | null;
  setActiveChatId: (id: string | number | null) => void;
  activeGroupChatId: string | number | null;
  setActiveGroupChatId: (id: string | number | null) => void;
  showGroupCreation: boolean;
  setShowGroupCreation: (show: boolean) => void;
  triggerAlertNotification: (msg: string) => void;
}

interface BuddyResponseProps {
  text: string;
  mediaUrl?: string;
  triggerAlertNotification: (msg: string) => void;
}

const BuddyResponseContainer: React.FC<BuddyResponseProps> = ({ text, mediaUrl, triggerAlertNotification }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean text by removing asterisks and hashes for neat clean output
  const cleanText = text.replace(/[\*#]/g, '');

  const handleCopy = (contentToCopy: string, label: string) => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    triggerAlertNotification(`📋 Copied ${label} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      triggerAlertNotification('🔊 Speech synthesis is not supported on this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanSpeechText = cleanText.replace(/```[\s\S]*?```/g, 'Code block skipped.');
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const containsCode = text.includes('```') || text.includes('def ') || text.includes('import ') || text.includes('function ') || text.includes('const ') || text.includes('<html');
  const containsSteps = text.includes('1.') || text.includes('2.') || text.toLowerCase().includes('step 1') || text.includes('\n- ');

  if (containsCode) {
    const codeMatch = text.match(/```(?:\w+)?\n?([\s\S]*?)```/) || [null, cleanText];
    const codeText = codeMatch[1] || cleanText;

    return (
      <div className="w-full bg-slate-950 border border-purple-500/40 rounded-2xl overflow-hidden text-xs my-1 shadow-xl">
        <div className="bg-purple-950/80 px-3 py-1.5 flex items-center justify-between border-b border-purple-500/30">
          <span className="text-[9px] font-mono font-black text-purple-300 uppercase tracking-widest flex items-center space-x-1">
            <span>💻 CODE BLUEPRINT</span>
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleSpeak}
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-purple-200 px-2 py-0.5 rounded font-black active:scale-95 transition-all border border-purple-500/30"
            >
              {isSpeaking ? '⏹ Stop Voice' : '🔊 Read Aloud'}
            </button>
            <button
              onClick={() => handleCopy(codeText, 'Code')}
              className="text-[9px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded font-black active:scale-95 transition-all"
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>
          </div>
        </div>
        <pre className="p-3 font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60">
          {codeText}
        </pre>
      </div>
    );
  }

  if (containsSteps) {
    return (
      <div className="w-full bg-slate-900 border border-sky-500/40 rounded-2xl p-3 text-xs my-1 space-y-2 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest flex items-center space-x-1">
            <span>📝 STEP-BY-STEP SOLUTION</span>
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleSpeak}
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-sky-300 px-2 py-0.5 rounded font-black active:scale-95 border border-sky-500/30"
            >
              {isSpeaking ? '⏹ Stop Voice' : '🔊 Read Aloud'}
            </button>
            <button
              onClick={() => handleCopy(cleanText, 'Steps')}
              className="text-[9px] bg-sky-600 hover:bg-sky-500 text-white px-2 py-0.5 rounded font-black active:scale-95 transition-all"
            >
              {copied ? '✓ Copied!' : '📋 Copy Steps'}
            </button>
          </div>
        </div>
        <div className="space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
          {cleanText.split('\n').filter(line => line.trim()).map((line, i) => (
            <p key={i} className={line.match(/^(\d+\.|Step|-)/) ? "font-semibold text-sky-300" : "text-slate-300 pl-2"}>
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (mediaUrl) {
    return (
      <div className="w-full bg-slate-950 border border-purple-500/40 rounded-2xl overflow-hidden my-1 space-y-2 p-2 shadow-xl">
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest">🎨 GENERATED VISUAL ATTACHMENT</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleSpeak}
              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-purple-200 px-2 py-0.5 rounded font-black active:scale-95 border border-purple-500/30"
            >
              {isSpeaking ? '⏹ Stop Voice' : '🔊 Read Aloud'}
            </button>
            <button
              onClick={() => handleCopy(mediaUrl, 'Image Link')}
              className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded font-black active:scale-95"
            >
              {copied ? '✓ Copied!' : '🔗 Copy Image Link'}
            </button>
          </div>
        </div>
        <img src={mediaUrl} alt="Buddy visual" className="w-full max-h-56 object-cover rounded-xl border border-slate-800" />
        <p className="text-[11px] text-slate-300 px-1 leading-snug">{cleanText}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3 text-xs my-1 space-y-2 shadow-xl">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1">
        <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest">🤖 BUDDY EXPLANATION</span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleSpeak}
            className="text-[9px] bg-slate-800 hover:bg-slate-700 text-purple-200 px-2 py-0.5 rounded font-black active:scale-95 border border-purple-500/30"
          >
            {isSpeaking ? '⏹ Stop Voice' : '🔊 Read Aloud'}
          </button>
          <button
            onClick={() => handleCopy(cleanText, 'Answer')}
            className="text-[9px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-0.5 rounded font-black active:scale-95 transition-all"
          >
            {copied ? '✓ Copied!' : '📋 Copy Text'}
          </button>
        </div>
      </div>
      <p className="text-purple-100 text-[11px] leading-relaxed whitespace-pre-wrap">{cleanText}</p>
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({
  chats,
  setChats,
  groups,
  setGroups,
  activeChatId,
  setActiveChatId,
  activeGroupChatId,
  setActiveGroupChatId,
  showGroupCreation,
  setShowGroupCreation,
  triggerAlertNotification
}) => {
  const [typedMessage, setTypedMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showChatTools, setShowChatTools] = useState(false);
  const [selectedMediaFile, setSelectedMediaFile] = useState<string | null>(null);

  // Group creation modal states
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Call Buddy AI via server endpoint
  const askBuddyAI = async (userPrompt: string, systemPrompt?: string): Promise<{ text: string; mediaUrl?: string }> => {
    try {
      const response = await fetch('/api/buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, systemInstruction: systemPrompt })
      });
      if (!response.ok) throw new Error("Buddy server endpoint offline");
      const data = await response.json();
      return {
        text: data.text || "I'm right here! Let's spark a new concept! 🚀",
        mediaUrl: data.mediaUrl
      };
    } catch (err) {
      console.warn("Falling back to local Buddy response:", err);
      return {
        text: `Hey creator! 🚀 Regarding your input: "That's an awesome idea! You can test this in Spark Labs or share it as a Reel for feedback!" 🤖`
      };
    }
  };

  // Handle direct message send
  const handleSendMessage = async () => {
    if (!typedMessage.trim() && !selectedMediaFile) return;
    if (activeChatId === null) return;

    const textToSend = typedMessage;
    const mediaToSend = selectedMediaFile;
    setTypedMessage('');
    setSelectedMediaFile(null);

    const userMsg = {
      id: Date.now(),
      sender: 'You',
      text: textToSend,
      time: 'Now',
      mediaUrl: mediaToSend || undefined
    };

    // Optimistically update client state
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, userMsg],
          lastMsg: `You: ${textToSend || 'Sent Media'}`,
          time: 'Now'
        };
      }
      return c;
    }));

    // Handle Firestore Chat persistence
    try {
      await saveChatMessageInFirestore(activeChatId, userMsg);
    } catch (e) {
      console.warn("Firestore save chat msg warning:", e);
    }

    // Post to server for persistent storage and Buddy response
    try {
      if (activeChatId === 99 || activeChatId === 'buddy') {
        setIsAiTyping(true);
      }

      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          sender: 'You',
          mediaUrl: mediaToSend || undefined
        })
      });

      if (activeChatId === 99 || activeChatId === 'buddy') {
        setIsAiTyping(false);
      }

      if (res.ok) {
        const data = await res.json();
        if (data.chat) {
          setChats(prev => prev.map(c => (c.id === data.chat.id || (c.id === 99 && data.chat.id === 99)) ? data.chat : c));
          return;
        }
      }
    } catch (err) {
      console.warn("Server message save error fallback:", err);
      if (activeChatId === 99 || activeChatId === 'buddy') {
        setIsAiTyping(false);
      }
    }

    // Fallback client Buddy reply if offline
    if (activeChatId === 99 || activeChatId === 'buddy') {
      setIsAiTyping(true);
      const aiReplyObj = await askBuddyAI(textToSend);
      setIsAiTyping(false);

      const buddyReplyMsg = { 
        id: Date.now() + 1, 
        sender: 'Buddy', 
        text: aiReplyObj.text || "I am here to assist you!", 
        time: 'Now',
        mediaUrl: aiReplyObj.mediaUrl 
      };

      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, buddyReplyMsg],
            lastMsg: aiReplyObj.text,
            time: 'Now'
          };
        }
        return c;
      }));

      saveChatMessageInFirestore(activeChatId, buddyReplyMsg);
    }
  };

  // Handle Group message send (supports @Buddy calls!)
  const handleSendGroupMessage = async () => {
    if (!typedMessage.trim() && !selectedMediaFile) return;
    if (activeGroupChatId === null) return;

    const textToSend = typedMessage;
    const mediaToSend = selectedMediaFile;
    setTypedMessage('');
    setSelectedMediaFile(null);

    const userMsg = {
      id: Date.now(),
      sender: 'You',
      text: textToSend,
      time: 'Now',
      mediaUrl: mediaToSend || undefined
    };

    setGroups(prev => prev.map(g => {
      if (g.id === activeGroupChatId) {
        return {
          ...g,
          messages: [...g.messages, userMsg]
        };
      }
      return g;
    }));

    saveGroupMessageInFirestore(activeGroupChatId, userMsg);

    // Check if message mentions @Buddy or asks Buddy
    if (textToSend.toLowerCase().includes('@buddy') || textToSend.toLowerCase().includes('buddy')) {
      setIsAiTyping(true);
      const buddyReplyObj = await askBuddyAI(
        `In a group chat, the user asks: "${textToSend}". Provide a quick helpful tip for the team!`,
        "You are Buddy, the AI co-pilot in a VibeSpark group chat. Respond concisely as @Buddy without asterisks or hashes."
      );
      setIsAiTyping(false);

      const groupBuddyMsg = { 
        id: Date.now() + 2, 
        sender: 'Buddy', 
        text: `🤖 ${buddyReplyObj.text}`, 
        time: 'Now',
        mediaUrl: buddyReplyObj.mediaUrl
      };

      setGroups(prev => prev.map(g => {
        if (g.id === activeGroupChatId) {
          return {
            ...g,
            messages: [...g.messages, groupBuddyMsg]
          };
        }
        return g;
      }));

      saveGroupMessageInFirestore(activeGroupChatId, groupBuddyMsg);
    }
  };

  // Create new Group Chat
  const handleCreateGroupChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;

    const newGroup: GroupChat = {
      id: Date.now(),
      name: `${newGroupTitle} ☀️`,
      logo: '🧪',
      desc: newGroupDesc || 'Collaborative co-op workspace.',
      isAdmin: true,
      unread: 0,
      includesBuddy: true,
      members: ['You', 'Buddy'],
      messages: [
        { id: 1, sender: 'Buddy', text: '🤖 Welcome to your new Co-op Group! I am Buddy, your group AI co-pilot! Mention @Buddy anytime to get quick answers!', time: 'Now' }
      ]
    };

    createGroupInFirestore(newGroup);
    setGroups([newGroup, ...groups]);
    setNewGroupTitle('');
    setNewGroupDesc('');
    setShowGroupCreation(false);
    triggerAlertNotification('🌐 Created new Group Co-op with Buddy AI!');
  };

  const currentChat = chats.find(c => c.id === activeChatId);
  const currentGroup = groups.find(g => g.id === activeGroupChatId);

  return (
    <div className="fade-in relative h-full text-left">
      {/* DIRECT MESSAGES LIST VIEW */}
      {activeChatId === null && activeGroupChatId === null && (
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2 themed-border">
            <div>
              <h3 className="text-sm font-black themed-text">Messages & Co-op Hub</h3>
              <p className="text-[9px] themed-subtext">Secure DMs with Buddy AI & squad chats</p>
            </div>
            <button 
              onClick={() => setShowGroupCreation(true)}
              className="py-1 px-3 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 font-black text-[10px] rounded-full flex items-center space-x-1 shadow"
            >
              <PlusIcon />
              <span>New Group</span>
            </button>
          </div>

          {/* DMs List */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-orange-400">Direct Messages</h4>
            {chats.map(chat => (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3 border rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all themed-card hover:border-orange-500/40 ${
                  chat.isBuddy || chat.id === 99 ? 'border-purple-500/50 bg-purple-950/20' : ''
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow ${
                    chat.isBuddy || chat.id === 99 ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white' : 'bg-slate-800 text-orange-400 border border-slate-700'
                  }`}>
                    {chat.isBuddy || chat.id === 99 ? '🤖' : chat.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold themed-text flex items-center space-x-1">
                      <span>{chat.name}</span>
                      {(chat.isBuddy || chat.id === 99) && (
                        <span className="text-[8px] bg-purple-900 text-purple-200 px-1.5 py-0.5 rounded font-black uppercase">AI Co-pilot</span>
                      )}
                    </p>
                    <p className="text-[10px] themed-subtext max-w-[180px] truncate">{chat.lastMsg}</p>
                  </div>
                </div>
                <span className="text-[8px] text-slate-500 font-mono">{chat.time}</span>
              </div>
            ))}
          </div>

          {/* Suggested Conversations (Unchatted Users) */}
          {(() => {
            const existingNames = chats.map(c => c.name.toLowerCase().replace('@', ''));
            const suggested = [
              { username: 'sasha_vibe', name: 'Sasha Vibe', avatar: '🎙️', role: 'Vocalist & Beatmaker' },
              { username: 'tech_sam', name: 'Sam Tech', avatar: '🔌', role: 'Hardware & Circuits' },
              { username: 'eco_maya', name: 'Maya Eco', avatar: '🌱', role: 'Bio-tech Innovator' },
              { username: 'cyber_dexter', name: 'Dexter Code', avatar: '⚡', role: 'Full-stack & AI' },
              { username: 'quantum_zoe', name: 'Zoe Quantum', avatar: '✨', role: 'Generative Design' }
            ].filter(u => !existingNames.includes(u.username.toLowerCase()) && !existingNames.includes(u.name.toLowerCase()));

            if (suggested.length === 0) return null;

            return (
              <div className="space-y-2 pt-1">
                <h4 className="text-[10px] uppercase tracking-widest font-black text-sky-400 flex items-center space-x-1">
                  <span>💡 Suggested Conversations</span>
                </h4>
                <div className="space-y-2">
                  {suggested.map(user => (
                    <div 
                      key={user.username} 
                      className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-sky-500/40 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-base border border-slate-700">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center space-x-1">
                            <span>{user.name}</span>
                            <span className="text-[9px] text-slate-400 font-normal">@{user.username}</span>
                          </p>
                          <p className="text-[9px] text-sky-400 font-mono">{user.role}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const newChatId = Date.now();
                          const newChatObj: Chat = {
                            id: newChatId,
                            name: user.name,
                            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
                            lastMsg: `Hey @${user.username}! Let's collaborate on a Spark! 🚀`,
                            time: 'Just now',
                            messages: [
                              { id: 1, sender: user.name, text: `Hey creator! Excited to connect with you on VibeSpark! 🚀`, time: 'Just now' }
                            ]
                          };
                          setChats(prev => [newChatObj, ...prev]);
                          setActiveChatId(newChatId);
                          triggerAlertNotification(`💬 Started a new conversation with @${user.username}!`);
                        }}
                        className="px-3 py-1 bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-slate-950 font-black text-[10px] rounded-full border border-sky-500/40 transition-all active:scale-95"
                      >
                        + Start Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Groups List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-sky-400">Group Co-ops ({groups.length})</h4>
            {groups.map(g => (
              <div 
                key={g.id} 
                onClick={() => setActiveGroupChatId(g.id)}
                className="p-3 bg-slate-900 border rounded-2xl flex items-center justify-between cursor-pointer hover:border-sky-500/40 active:scale-98 transition-all themed-card"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-bold text-sm">
                    {g.logo}
                  </div>
                  <div>
                    <p className="text-xs font-bold themed-text flex items-center space-x-1.5">
                      <span>{g.name}</span>
                      {g.isAdmin && <span className="text-[8px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded uppercase font-black">Admin</span>}
                    </p>
                    <p className="text-[10px] themed-subtext max-w-[180px] truncate">{g.desc}</p>
                  </div>
                </div>
                <span className="text-[9px] text-purple-400 font-bold font-mono">+Buddy</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE DM CONVERSATION */}
      {activeChatId !== null && currentChat && (
        <div className="flex flex-col h-[650px] themed-bg animate-fade">
          <div className="p-3 bg-slate-900 border-b flex items-center justify-between themed-border">
            <button onClick={() => setActiveChatId(null)} className="text-xs text-sky-400 font-bold flex items-center space-x-1">
              <BackArrowIcon />
              <span>Back</span>
            </button>

            <div className="text-center">
              <p className="text-xs font-bold themed-text flex items-center space-x-1">
                <span>{currentChat.name}</span>
              </p>
              <span className="text-[8px] text-emerald-400 font-bold uppercase">Active Encrypted Channel</span>
            </div>

            <button onClick={() => setShowChatTools(!showChatTools)} className="text-slate-400 p-1">
              <MoreIcon />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-none">
            {currentChat.messages.map((m, idx) => (
              <div key={m.id || idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                {m.sender === 'Buddy' || m.sender === 'Zephyr AI' ? (
                  <BuddyResponseContainer 
                    text={m.text} 
                    mediaUrl={m.mediaUrl} 
                    triggerAlertNotification={triggerAlertNotification} 
                  />
                ) : (
                  <div className={`p-2.5 rounded-2xl text-xs max-w-[80%] space-y-1 ${
                    m.sender === 'You' 
                      ? 'themed-accent-bg text-slate-950 font-bold rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    <p className="text-[8px] opacity-75 uppercase font-black">{m.sender}</p>
                    <p className="leading-relaxed">{m.text}</p>
                    {m.mediaUrl && (
                      <img src={m.mediaUrl} alt="" className="w-full max-h-36 object-cover rounded-lg mt-1 border border-slate-700" />
                    )}
                  </div>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs rounded-2xl">
                  Buddy is thinking... 🤖
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-slate-900 border-t flex items-center space-x-2 themed-border">
            <input 
              type="text" 
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={currentChat.isBuddy || currentChat.id === 99 ? "Ask Buddy AI hardware & code ideas..." : "Type message..."} 
              className="flex-1 bg-slate-950 border rounded-full py-1.5 px-3.5 text-xs text-slate-200 focus:outline-none themed-border"
            />
            <button onClick={handleSendMessage} className="p-2.5 themed-accent-bg text-slate-950 rounded-full font-bold active:scale-90">
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE GROUP CHAT CONVERSATION */}
      {activeGroupChatId !== null && currentGroup && (
        <div className="flex flex-col h-[650px] themed-bg animate-fade">
          <div className="p-3 bg-slate-900 border-b flex items-center justify-between themed-border">
            <div className="flex items-center space-x-2">
              <button onClick={() => setActiveGroupChatId(null)} className="text-slate-400 p-1">
                <BackArrowIcon />
              </button>
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs border border-slate-700">
                {currentGroup.logo}
              </div>
              <div>
                <p className="text-xs font-bold themed-text leading-tight">{currentGroup.name}</p>
                <span className="text-[8px] text-purple-400 uppercase font-black">Includes @Buddy AI</span>
              </div>
            </div>

            <button onClick={() => triggerAlertNotification("Group member settings opened")} className="p-1 text-slate-400">
              <MoreIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-none">
            {currentGroup.messages.map((m, idx) => (
              <div key={m.id || idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                {m.sender === 'Buddy' ? (
                  <BuddyResponseContainer 
                    text={m.text} 
                    mediaUrl={m.mediaUrl} 
                    triggerAlertNotification={triggerAlertNotification} 
                  />
                ) : (
                  <div className={`p-2.5 max-w-[80%] rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'You' 
                      ? 'themed-accent-bg text-slate-950 rounded-tr-none font-bold' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    <p className="text-[8px] text-slate-400 font-black mb-0.5">{m.sender}</p>
                    <p>{m.text}</p>
                  </div>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="p-2 bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs rounded-xl">
                  Buddy is crafting a team response... 🤖
                </div>
              </div>
            )}
          </div>

          {/* Quick Ask Buddy Button */}
          <div className="px-3 py-1 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[9px]">
            <span className="text-slate-400 font-bold">💡 Mention <span className="text-purple-400">@Buddy</span> to ask AI co-pilot</span>
            <button 
              onClick={() => {
                setTypedMessage("@Buddy How can we optimize our energy efficiency?");
              }}
              className="text-purple-400 font-black hover:underline"
            >
              + Ask Buddy
            </button>
          </div>

          {/* Group Input */}
          <div className="p-2.5 bg-slate-900 border-t flex items-center space-x-2 themed-border">
            <input 
              type="text" 
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendGroupMessage()}
              placeholder="Type team broadcast or mention @Buddy..." 
              className="flex-1 bg-slate-950 border rounded-full py-1.5 px-3.5 text-xs text-slate-200 focus:outline-none themed-border" 
            />
            <button onClick={handleSendGroupMessage} className="p-2.5 themed-accent-bg text-slate-950 rounded-full font-bold">
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showGroupCreation && (
        <div className="absolute inset-0 z-50 flex flex-col p-4 overflow-y-auto themed-bg text-left animate-fade">
          <div className="flex items-center justify-between border-b pb-3 mb-4 themed-border">
            <h3 className="text-xs font-black themed-text">Assemble New Co-op Group</h3>
            <button onClick={() => setShowGroupCreation(false)} className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold">Close</button>
          </div>

          <form onSubmit={handleCreateGroupChatSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Group Name</label>
              <input 
                type="text" 
                value={newGroupTitle} 
                onChange={(e) => setNewGroupTitle(e.target.value)} 
                placeholder="e.g. Accra Solar Hackers" 
                className="w-full bg-slate-900 border rounded-xl py-2 px-3 text-xs text-slate-200 themed-border" 
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Group Goal / Description</label>
              <textarea 
                value={newGroupDesc} 
                onChange={(e) => setNewGroupDesc(e.target.value)} 
                placeholder="A squad dedicated to building micro-grids..." 
                className="w-full bg-slate-900 border rounded-xl p-3 text-xs text-slate-200 resize-none h-20 themed-border" 
              />
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-purple-300 block">🤖 Buddy AI Included</span>
              <p className="text-[9px] text-slate-400 leading-snug">Buddy will join as an active AI co-pilot inside this team workspace.</p>
            </div>
            
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 text-xs font-extrabold rounded-xl uppercase tracking-widest shadow-lg">
              Assemble Co-op
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
