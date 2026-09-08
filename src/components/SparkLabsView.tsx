import React, { useState, useEffect, useRef } from 'react';
import { LabProject, User } from '../types';
import { ShareIcon, BackArrowIcon } from './Icons';

interface SparkLabsViewProps {
  labProjects: LabProject[];
  setLabProjects: React.Dispatch<React.SetStateAction<LabProject[]>>;
  currentUser: User;
  activeLabSubtab: string;
  setActiveLabSubtab: (subtab: string) => void;
  showCreateLabModal: boolean;
  setShowCreateLabModal: (show: boolean) => void;
  triggerAlertNotification: (msg: string) => void;
}

// Web Audio API Visualizer Overlay Component
const AudioVisualizerOverlay: React.FC<{ isPlaying: boolean; title: string }> = ({ isPlaying, title }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 28;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.15;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.abs(Math.sin(step + i * 0.35) * (canvas.height * 0.85)) + 4;
        const x = i * barWidth;
        const y = canvas.height - height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#38bdf8');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <div className="relative w-full h-16 bg-slate-950/90 rounded-xl overflow-hidden border border-purple-500/40 p-1.5 flex flex-col justify-between my-2 shadow-xl animate-fade">
      <div className="flex items-center justify-between px-1 text-[8px] font-mono text-purple-300">
        <span className="truncate max-w-[180px]">🎙️ WebAudio FFT Stream: {title}</span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>44.1kHz Live Analyser</span>
        </span>
      </div>
      <canvas ref={canvasRef} width={300} height={38} className="w-full h-9 object-cover rounded" />
    </div>
  );
};

export const SparkLabsView: React.FC<SparkLabsViewProps> = ({
  labProjects,
  setLabProjects,
  currentUser,
  activeLabSubtab,
  setActiveLabSubtab,
  showCreateLabModal,
  setShowCreateLabModal,
  triggerAlertNotification
}) => {
  // --- 1. PHOTO / IMAGE LAB STATES ---
  const [imgBrightness, setImgBrightness] = useState(100);
  const [imgContrast, setImgContrast] = useState(100);
  const [imgSaturation, setImgSaturation] = useState(100);
  const [imgBlur, setImgBlur] = useState(0);
  const [imgHue, setImgHue] = useState(0);
  const [imgActiveFilter, setImgActiveFilter] = useState('none');
  const [imgSticker, setImgSticker] = useState<string | null>(null);
  const [imgTextOverlay, setImgTextOverlay] = useState('VIBESPARK CREATOR');
  const [imgSampleUrl, setImgSampleUrl] = useState('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80');

  // --- 2. CODE IDE LAB STATES ---
  const [selectedCodeTemplate, setSelectedCodeTemplate] = useState('micropython');
  const [writtenCode, setWrittenCode] = useState(
    'import machine\nimport time\nsoil = machine.ADC(26)\nled = machine.Pin(15, machine.Pin.OUT)\n\nwhile True:\n    val = soil.read_u16()\n    print("Moisture Telemetry ->", val)\n    if val < 20000:\n        led.value(1)\n    else:\n        led.value(0)\n    time.sleep(0.5)'
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [ledPinActive, setLedPinActive] = useState(false);
  const [sensorValue, setSensorValue] = useState(18420);
  const [codeConsole, setCodeConsole] = useState<string[]>([
    'System Ready. Select target chip & click "Compile & Run".'
  ]);

  // --- 3. AUDIO / BEAT STUDIO LAB STATES ---
  const [audioBpm, setAudioBpm] = useState(120);
  const [audioWaveform, setAudioWaveform] = useState<OscillatorType>('sine');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- 4. CIRCUIT DIAGRAM LAB STATES ---
  const [circuitComponents, setCircuitComponents] = useState<string[]>([
    'ESP32 MCU Board',
    'Solar Cell 5V',
    'OLED Display 128x64'
  ]);

  // --- 5. CREATE NEW LAB FORM MODAL STATES ---
  const [newLabTitle, setNewLabTitle] = useState('');
  const [newLabType, setNewLabType] = useState<'Code' | 'Audio' | 'Design' | 'Hardware' | 'AI'>('Code');
  const [newLabDesc, setNewLabDesc] = useState('');
  const [newLabPublic, setNewLabPublic] = useState(true);
  const [newLabSnippet, setNewLabSnippet] = useState('');

  // Privacy toggles state for existing labs
  const [privacyToggles, setPrivacyToggles] = useState<Record<string | number, boolean>>({});
  const [activeVisualizerLabId, setActiveVisualizerLabId] = useState<string | number | null>(null);

  // Audio Playback Pad Trigger
  const playPadSound = (freq: number, type: OscillatorType = 'sine') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Web Audio API unavailable:", e);
    }
  };

  const runCodeCompilation = () => {
    setIsCompiling(true);
    setCodeConsole(prev => [...prev, '>>> Compiling MicroPython / Hardware Target...']);
    setTimeout(() => {
      setLedPinActive(true);
      const newMoisture = Math.floor(Math.random() * 30000) + 10000;
      setSensorValue(newMoisture);
      setCodeConsole(prev => [
        ...prev,
        '>>> Target core: ESP32-WROOM-32 (240MHz)',
        `>>> ADC Pin 26 Telemetry: ${newMoisture} u16`,
        `>>> GPIO Pin 15 LED State: ${newMoisture < 20000 ? 'HIGH (Pump On)' : 'LOW (Moisture OK)'}`,
        '>>> Output voltage: 3.3V GPIO stable.',
        '>>> Execution completed with return code 0.'
      ]);
      setIsCompiling(false);
      triggerAlertNotification("⚡ Code compiled and hardware simulated!");
    }, 1000);
  };

  const loadCodeTemplate = (template: string) => {
    setSelectedCodeTemplate(template);
    if (template === 'micropython') {
      setWrittenCode('import machine\nimport time\nsoil = machine.ADC(26)\nled = machine.Pin(15, machine.Pin.OUT)\n\nwhile True:\n    val = soil.read_u16()\n    print("Moisture Telemetry ->", val)\n    time.sleep(0.5)');
    } else if (template === 'arduino') {
      setWrittenCode('void setup() {\n  Serial.begin(115200);\n  pinMode(15, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(15, HIGH);\n  delay(500);\n  digitalWrite(15, LOW);\n  delay(500);\n}');
    } else if (template === 'audio') {
      setWrittenCode('const ctx = new AudioContext();\nconst osc = ctx.createOscillator();\nosc.type = "sawtooth";\nosc.frequency.value = 440;\nosc.connect(ctx.destination);\nosc.start();');
    } else {
      setWrittenCode('// AI Prompt Blueprint Engine\nasync function generateBlueprint() {\n  return "Solar-Powered Smart Planter Microchip Spec v1.0";\n}');
    }
  };

  const handleCreateLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabTitle.trim()) {
      triggerAlertNotification("⚠️ Please enter a Lab title!");
      return;
    }

    const createdLab: LabProject = {
      id: Date.now(),
      title: newLabTitle,
      type: newLabType,
      public: newLabPublic,
      imageUrl: imgSampleUrl,
      code: newLabSnippet || writtenCode
    };

    setLabProjects([createdLab, ...labProjects]);
    setShowCreateLabModal(false);
    setNewLabTitle('');
    setNewLabDesc('');
    setNewLabSnippet('');
    triggerAlertNotification("🚀 New Spark Lab created & published to collection!");
  };

  const handleTogglePrivacy = (projectId: string | number) => {
    setPrivacyToggles(prev => {
      const nextState = !prev[projectId];
      triggerAlertNotification(nextState ? "🔒 Project set to Private" : "🔓 Project set to Public");
      return { ...prev, [projectId]: nextState };
    });
  };

  const handleCopyShareLink = (projectId: string | number) => {
    const mockUrl = `https://vibespark.app/lab/${projectId}`;
    try {
      navigator.clipboard.writeText(mockUrl);
    } catch (err) {
      const tempInput = document.createElement('input');
      tempInput.value = mockUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    }
    triggerAlertNotification("📋 Lab share link copied!");
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImgSampleUrl(event.target.result as string);
          triggerAlertNotification("📷 Photo loaded into Image Lab!");
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 space-y-4 fade-in text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b pb-3 border-slate-800">
        <div className="flex items-center space-x-3">
          <img 
            src={currentUser.avatarUrl} 
            alt="" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-orange-500" 
          />
          <div>
            <h3 className="text-sm font-black text-white">Spark Creation Labs</h3>
            <p className="text-[9px] text-slate-400">Integrated Youth Prototyping & Media Suite</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateLabModal(true)}
          className="py-1.5 px-3 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 text-[10px] font-black rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          + Create Lab
        </button>
      </div>

      {/* Lab Category Navigation Subtabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
        {[
          { id: 'image', label: '📷 Image FX' },
          { id: 'code', label: '💻 Hardware IDE' },
          { id: 'audio', label: '🎵 Audio Beat' },
          { id: 'circuit', label: '🔌 Circuit Wire' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveLabSubtab(tab.id)}
            className={`py-1.5 text-[9px] uppercase font-black rounded-lg transition-all ${
              activeLabSubtab === tab.id ? 'themed-accent-bg text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. IMAGE & VISUAL FX STUDIO LAB */}
      {activeLabSubtab === 'image' && (
        <div className="space-y-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 themed-card">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-white">📷 Photo Filter & Watermark Studio</h4>
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold py-1 px-2.5 rounded-lg border border-slate-700">
              📁 Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleCustomImageUpload} />
            </label>
          </div>

          <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            <img 
              src={imgSampleUrl} 
              alt="Preview"
              style={{
                filter: `brightness(${imgBrightness}%) contrast(${imgContrast}%) saturate(${imgSaturation}%) blur(${imgBlur}px) hue-rotate(${imgHue}deg) ${
                  imgActiveFilter === 'vintage' ? 'sepia(80%)' : 
                  imgActiveFilter === 'neon' ? 'hue-rotate(180deg) saturate(220%)' :
                  imgActiveFilter === 'monochrome' ? 'grayscale(100%)' : 'none'
                }`
              }}
              className="w-full h-full object-cover transition-all"
            />

            {/* Sticker Stamp */}
            {imgSticker && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl animate-bounce drop-shadow-lg">
                {imgSticker}
              </div>
            )}

            {/* Text Overlay */}
            {imgTextOverlay && (
              <div className="absolute bottom-3 inset-x-0 text-center">
                <span className="text-xs font-black text-amber-400 bg-black/80 px-3 py-1 rounded-full tracking-widest border border-amber-500/50 shadow-lg font-mono">
                  {imgTextOverlay}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
            <div>
              <div className="flex justify-between">
                <span>Brightness</span>
                <span>{imgBrightness}%</span>
              </div>
              <input type="range" min="50" max="150" value={imgBrightness} onChange={(e) => setImgBrightness(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>

            <div>
              <div className="flex justify-between">
                <span>Contrast</span>
                <span>{imgContrast}%</span>
              </div>
              <input type="range" min="50" max="150" value={imgContrast} onChange={(e) => setImgContrast(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>

            <div>
              <div className="flex justify-between">
                <span>Saturation</span>
                <span>{imgSaturation}%</span>
              </div>
              <input type="range" min="50" max="200" value={imgSaturation} onChange={(e) => setImgSaturation(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>

            <div>
              <div className="flex justify-between">
                <span>Hue Shift</span>
                <span>{imgHue}°</span>
              </div>
              <input type="range" min="0" max="360" value={imgHue} onChange={(e) => setImgHue(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Watermark Caption</label>
            <input 
              type="text" 
              value={imgTextOverlay}
              onChange={(e) => setImgTextOverlay(e.target.value)}
              placeholder="Add watermark tagline..." 
              className="w-full bg-slate-950 border border-slate-800 text-[10px] py-1.5 px-3 rounded-xl text-slate-200"
            />
          </div>

          <div className="flex space-x-1.5">
            <button onClick={() => setImgActiveFilter('vintage')} className={`flex-1 py-1 text-[9px] font-bold rounded border ${imgActiveFilter === 'vintage' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-amber-500 border-slate-800'}`}>Vintage</button>
            <button onClick={() => setImgActiveFilter('neon')} className={`flex-1 py-1 text-[9px] font-bold rounded border ${imgActiveFilter === 'neon' ? 'bg-pink-500 text-slate-950' : 'bg-slate-950 text-pink-500 border-slate-800'}`}>Neon Glow</button>
            <button onClick={() => setImgActiveFilter('monochrome')} className={`flex-1 py-1 text-[9px] font-bold rounded border ${imgActiveFilter === 'monochrome' ? 'bg-purple-500 text-slate-950' : 'bg-slate-950 text-purple-400 border-slate-800'}`}>B&W Mono</button>
            <button onClick={() => setImgActiveFilter('none')} className="py-1 px-2 text-[9px] font-bold rounded bg-slate-950 text-slate-400 border border-slate-800">Reset</button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <div className="flex space-x-1">
              {['⚡', '🎨', '🌱', '🚀', '💡'].map(st => (
                <button key={st} onClick={() => setImgSticker(st)} className="p-1.5 text-sm bg-slate-950 rounded border border-slate-800 hover:bg-slate-800">{st}</button>
              ))}
              <button onClick={() => setImgSticker(null)} className="p-1 text-[9px] bg-slate-950 rounded border border-slate-800 text-red-400">Clear</button>
            </div>
          </div>

          <button 
            onClick={() => {
              const newLab: LabProject = {
                id: Date.now(),
                title: imgTextOverlay || 'Visual Design Spark',
                type: 'Design',
                public: true,
                imageUrl: imgSampleUrl
              };
              setLabProjects([newLab, ...labProjects]);
              triggerAlertNotification("🎨 Photo FX Design saved to Spark Labs!");
            }}
            className="w-full py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider active:scale-98"
          >
            Save Design to Spark Labs
          </button>
        </div>
      )}

      {/* 2. MICROPYTHON & EMBEDDED HARDWARE CODE LAB */}
      {activeLabSubtab === 'code' && (
        <div className="space-y-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 themed-card">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white">💻 MicroPython & Embedded Chip IDE</h4>
            <select 
              value={selectedCodeTemplate}
              onChange={(e) => loadCodeTemplate(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-[9px] p-1.5 rounded-lg text-orange-400 font-bold focus:outline-none"
            >
              <option value="micropython">MicroPython ESP32 / Pico</option>
              <option value="arduino">Arduino C++ Pin Output</option>
              <option value="audio">Web Audio Synth Script</option>
              <option value="ai">AI Model Specs Generator</option>
            </select>
          </div>

          {/* Virtual Hardware Simulator Pinout Box */}
          <div className="p-3 bg-black border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${ledPinActive ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse' : 'bg-slate-800'}`}></span>
              <div>
                <p className="text-[10px] font-black text-white">ESP32 GPIO Pin 15 LED</p>
                <p className="text-[8px] text-slate-400 font-mono">Status: {ledPinActive ? 'HIGH (3.3V Output)' : 'LOW (0V Idle)'}</p>
              </div>
            </div>

            <div className="text-right font-mono text-[9px]">
              <span className="text-sky-400 font-bold block">Telemetry: {sensorValue} u16</span>
              <span className="text-slate-500 text-[8px]">Power: 3.3V Regulated</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={writtenCode}
              onChange={(e) => setWrittenCode(e.target.value)}
              className="w-full bg-slate-950 text-[10px] p-3 text-emerald-400 font-mono rounded-xl h-44 resize-none border border-slate-800 focus:outline-none focus:border-emerald-500/80 leading-relaxed"
            />
          </div>

          <button
            onClick={runCodeCompilation}
            disabled={isCompiling}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider active:scale-98 transition-all"
          >
            {isCompiling ? 'Compiling Hardware Target...' : '▶ Run Hardware Code Simulation'}
          </button>

          <div className="p-3 bg-black border border-slate-900 rounded-xl font-mono text-[9px] text-slate-400 space-y-1">
            <p className="font-bold text-white border-b border-slate-900 pb-1 uppercase tracking-wider">Terminal Log Output</p>
            {codeConsole.map((log, idx) => (
              <p key={idx} className={log.includes('Status') || log.includes('Telemetry') || log.includes('HIGH') ? 'text-emerald-400' : 'text-slate-300'}>
                &gt; {log}
              </p>
            ))}
          </div>

          <button 
            onClick={() => {
              const newLab: LabProject = {
                id: Date.now(),
                title: 'Custom Embedded Code',
                type: 'Code',
                public: true,
                code: writtenCode
              };
              setLabProjects([newLab, ...labProjects]);
              triggerAlertNotification("💻 Code project saved into Spark Labs!");
            }}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            Save Code to My Labs
          </button>
        </div>
      )}

      {/* 3. AUDIO & BEAT STUDIO LAB */}
      {activeLabSubtab === 'audio' && (
        <div className="space-y-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 themed-card">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-white">🎵 Web Audio Synth & Beat Studio</h4>
            <span className="text-[9px] text-purple-400 font-mono font-bold">BPM: {audioBpm}</span>
          </div>

          {/* Sound Pad Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Kick Drum', freq: 60, type: 'sine' as OscillatorType, color: 'from-orange-500 to-red-600' },
              { name: 'Snare Hit', freq: 180, type: 'triangle' as OscillatorType, color: 'from-purple-500 to-indigo-600' },
              { name: 'Hi-Hat Cymbal', freq: 800, type: 'square' as OscillatorType, color: 'from-sky-400 to-blue-600' },
              { name: 'Synth Lead (A4)', freq: 440, type: 'sawtooth' as OscillatorType, color: 'from-emerald-400 to-teal-600' },
              { name: 'Bass Drop (C2)', freq: 130, type: 'sawtooth' as OscillatorType, color: 'from-pink-500 to-rose-600' },
              { name: 'Chime Note (E5)', freq: 659, type: 'sine' as OscillatorType, color: 'from-amber-400 to-yellow-600' }
            ].map((pad, idx) => (
              <button
                key={idx}
                onClick={() => playPadSound(pad.freq, pad.type)}
                className={`h-20 bg-gradient-to-br ${pad.color} rounded-2xl flex flex-col items-center justify-center p-2 text-slate-950 font-black shadow-lg active:scale-95 transition-transform hover:brightness-110`}
              >
                <span className="text-lg">🔊</span>
                <span className="text-[9px] uppercase tracking-wider text-center">{pad.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>BPM Tempo Control</span>
              <span>{audioBpm} BPM</span>
            </div>
            <input 
              type="range" 
              min="80" 
              max="160" 
              value={audioBpm} 
              onChange={(e) => setAudioBpm(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-3">
            <span>Waveform Type:</span>
            <div className="flex space-x-1">
              {(['sine', 'square', 'sawtooth', 'triangle'] as OscillatorType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setAudioWaveform(type)}
                  className={`px-2 py-1 rounded text-[8px] uppercase font-bold ${audioWaveform === type ? 'bg-purple-500 text-slate-950' : 'bg-slate-950 text-slate-400'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => {
              const newLab: LabProject = {
                id: Date.now(),
                title: `Beat Studio Synth (${audioBpm} BPM)`,
                type: 'Audio',
                public: true
              };
              setLabProjects([newLab, ...labProjects]);
              triggerAlertNotification("🎵 Audio synth track saved to Spark Labs!");
            }}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl uppercase tracking-wider active:scale-98"
          >
            Save Beat Track to My Labs
          </button>
        </div>
      )}

      {/* 4. CIRCUIT & HARDWARE SCHEMATIC LAB */}
      {activeLabSubtab === 'circuit' && (
        <div className="space-y-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 themed-card">
          <h4 className="text-xs font-black text-white">🔌 Interactive Circuit Schematic Router</h4>
          
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-[9px] text-slate-400 uppercase font-mono font-bold">Active Circuit Nodes Connected</p>
            
            <div className="space-y-2">
              {circuitComponents.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-400 font-bold">Node #{idx + 1}:</span>
                    <span className="text-white font-bold">{comp}</span>
                  </div>
                  <button 
                    onClick={() => setCircuitComponents(circuitComponents.filter((_, i) => i !== idx))}
                    className="text-[9px] text-red-400 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-1 pt-1">
              {['DHT22 Sensor', '3.3V Regulator', 'RGB LED Pin', 'Buzzer Alarm'].map(addComp => (
                <button
                  key={addComp}
                  onClick={() => {
                    if (!circuitComponents.includes(addComp)) {
                      setCircuitComponents([...circuitComponents, addComp]);
                      triggerAlertNotification(`Connected ${addComp} node!`);
                    }
                  }}
                  className="flex-1 py-1 px-1 bg-slate-800 hover:bg-slate-700 text-sky-400 text-[8px] font-bold rounded-lg truncate"
                >
                  + {addComp}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-black border border-emerald-900/60 rounded-xl text-[9px] font-mono text-emerald-400 space-y-1">
            <p className="font-bold text-white uppercase">Electrical Power Audit</p>
            <p>&gt; Total Load Current: 145 mA @ 5.0V</p>
            <p>&gt; Est. Battery Life (2000mAh): ~13.7 Hours continuous</p>
            <p>&gt; Short Circuit Check: PASSED (0 Faults)</p>
          </div>

          <button 
            onClick={() => {
              const newLab: LabProject = {
                id: Date.now(),
                title: 'Hardware Schematic Design',
                type: 'Hardware',
                public: true
              };
              setLabProjects([newLab, ...labProjects]);
              triggerAlertNotification("🔌 Circuit schematic saved to Spark Labs!");
            }}
            className="w-full py-2 bg-sky-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider active:scale-98"
          >
            Save Circuit Schematic
          </button>
        </div>
      )}

      {/* CREATE NEW LAB FORM MODAL OVERLAY */}
      {showCreateLabModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-fade text-left">
            <div className="flex items-center justify-between border-b pb-2 border-slate-800">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Create New Spark Lab Tool</h3>
              <button onClick={() => setShowCreateLabModal(false)} className="text-xs text-slate-400 font-bold">✕ Close</button>
            </div>

            <form onSubmit={handleCreateLabSubmit} className="space-y-3">
              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Lab Title</label>
                <input 
                  type="text" 
                  value={newLabTitle}
                  onChange={(e) => setNewLabTitle(e.target.value)}
                  placeholder="e.g. Solar Hardware Controller v2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Lab Category</label>
                  <select 
                    value={newLabType}
                    onChange={(e: any) => setNewLabType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-orange-400 font-bold focus:outline-none"
                  >
                    <option value="Code">💻 MicroPython Code</option>
                    <option value="Audio">🎵 Audio Beat Studio</option>
                    <option value="Design">🎨 Photo FX Design</option>
                    <option value="Hardware">🔌 Circuit Wire</option>
                    <option value="AI">🤖 AI Blueprint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Privacy State</label>
                  <select 
                    value={newLabPublic ? 'public' : 'private'}
                    onChange={(e) => setNewLabPublic(e.target.value === 'public')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-emerald-400 font-bold focus:outline-none"
                  >
                    <option value="public">🔓 Public (Showcase)</option>
                    <option value="private">🔒 Private (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Description / Spec</label>
                <textarea 
                  value={newLabDesc}
                  onChange={(e) => setNewLabDesc(e.target.value)}
                  placeholder="Explain your lab project objective, components, or tools..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 h-20 resize-none focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[8px] uppercase tracking-widest text-slate-500 font-bold mb-1">Starter Code / Snippet</label>
                <textarea 
                  value={newLabSnippet}
                  onChange={(e) => setNewLabSnippet(e.target.value)}
                  placeholder="// Paste starter code or schematic spec..."
                  className="w-full bg-black border border-slate-800 rounded-xl p-2.5 text-[10px] text-emerald-400 font-mono h-20 resize-none focus:outline-none"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-slate-950 text-xs font-black rounded-xl uppercase tracking-widest shadow-xl active:scale-98 transition-all"
              >
                🚀 Create & Publish Lab
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Saved Lab Projects Collection */}
      <div className="space-y-2 pt-2">
        <h4 className="text-[10px] uppercase tracking-widest font-black text-orange-500 font-mono">My Spark Labs Projects Collection</h4>
        {labProjects.map(proj => (
          <div key={proj.id} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">🧪</span>
                <div>
                  <p className="text-xs font-bold text-white">{proj.title}</p>
                  <span className="text-[8px] text-sky-400 font-bold uppercase">{proj.type}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setActiveVisualizerLabId(activeVisualizerLabId === proj.id ? null : proj.id)}
                  className={`py-1 px-2 text-[8px] font-black rounded-lg border transition-all ${
                    activeVisualizerLabId === proj.id 
                      ? 'bg-purple-600 text-white border-purple-400 shadow' 
                      : 'bg-purple-950/40 text-purple-300 border-purple-800/40 hover:bg-purple-900/50'
                  }`}
                  title="Toggle Web Audio FFT Visualizer Overlay"
                >
                  {activeVisualizerLabId === proj.id ? '⏸ Stop FFT' : '🎙️ WebAudio FFT'}
                </button>

                <button 
                  onClick={() => handleTogglePrivacy(proj.id)}
                  className={`py-1 px-2 text-[8px] font-black rounded-lg border ${
                    privacyToggles[proj.id] 
                      ? 'bg-red-950/40 text-red-400 border-red-900/40' 
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                  }`}
                >
                  {privacyToggles[proj.id] ? '🔒 Private' : '🔓 Public'}
                </button>

                <button 
                  onClick={() => handleCopyShareLink(proj.id)}
                  className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-white"
                  title="Copy Share Link"
                >
                  <ShareIcon />
                </button>
              </div>
            </div>

            {/* Web Audio API Visualizer Overlay */}
            <AudioVisualizerOverlay isPlaying={activeVisualizerLabId === proj.id} title={proj.title} />
          </div>
        ))}
      </div>
    </div>
  );
};
