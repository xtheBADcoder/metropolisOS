import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Cpu,
  Layers,
  Terminal,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { SecurityIncident, CameraFeed } from '../types/metropolis';

interface MetropolisAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  initialIncident?: SecurityIncident | null;
  activeCamera?: CameraFeed;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const MetropolisAIAssistant: React.FC<MetropolisAIAssistantProps> = ({
  isOpen,
  onClose,
  initialIncident,
  activeCamera,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Greetings. I am the Metropolis Analytics Operations Copilot. I analyze real-time video analytics, sensor fusion streams (LiDAR/Radar), Metropolis TensorRT pipelines, dual-licensing compliance, and GitHub CLA contributor verifications. How can I assist you?",
      timestamp: '10:46 AM',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // If prompted with an incident, auto-ask about it
  useEffect(() => {
    if (initialIncident) {
      const prompt = `Analyze security incident #${initialIncident.id}: "${initialIncident.title}" at ${initialIncident.location}. Provide recommended Metropolis pipeline adjustments, sensor verification, and dispatch protocol.`;
      handleUserSubmit(prompt);
    }
  }, [initialIncident]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleUserSubmit = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputValue('');
    setIsLoading(true);

    try {
      let aiText = '';

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          incident: initialIncident,
          activeCamera,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        aiText = data.text || 'Response received from Metropolis Copilot.';
      } else {
        aiText = generateDomainExpertResponse(textToSend, activeCamera, initialIncident);
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('Server call returned error, using fallback:', err);
      const fallbackText = generateDomainExpertResponse(textToSend, activeCamera, initialIncident);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDomainExpertResponse = (
    query: string,
    cam?: CameraFeed,
    inc?: SecurityIncident | null
  ) => {
    const q = query.toLowerCase();

    if (q.includes('breach') || q.includes('incident') || q.includes('tripwire') || q.includes('gate 04')) {
      return `### Tactical Incident Triage Protocol: Gate 04 Perimeter
**1. DeepStream Pipeline Verification:**
- Primary Model: \`PeopleNet v2.6 (TensorRT FP8)\` locked at 59.8 FPS with 18.2ms latency.
- Event Trigger: Object #101 traversed boundary coordinate \`{x: 15, y: 70}\` into restricted corridor.
- Cross-Verification: Ouster OS1 LiDAR confirmed point cloud reflection cluster at range **34.2m** moving at **4.8 km/h**.

**2. Automated Action Protocol:**
- Dispatch Drone Patrol \`drone-skyeye\` to hover coordinate (ETA 18 seconds).
- Trigger strobe audible siren at Gate 04 Stanchion #2.
- Log audit event with SHA-256 tamper-proof video frame hash.`;
    }

    if (q.includes('license') || q.includes('agpl') || q.includes('commercial')) {
      return `### Metropolis Platform Dual-Licensing Architecture
**Why Dual Licensing?**
- **GNU AGPLv3 (Community Open Source):** Under Section 13, any organization offering Metropolis as a network service (SaaS or networked IVA stream) must make the complete source code available. Ideal for researchers, academics, and pure open-source builders.
- **Commercial Enterprise License:** Grants exemption from AGPLv3 copyleft. Enables closed-source proprietary extensions, embedding inside OEM hardware appliances, 24/7 dedicated enterprise engineering SLAs, and classified air-gapped datacenter rollouts.`;
    }

    if (q.includes('cla') || q.includes('contributor') || q.includes('pr')) {
      return `### Contributor License Agreement (CLA) Governance
**Key Clauses in Metropolis CLA v2.1:**
- **Dual-Licensing Sublicense:** Authors grant the Metropolis project the legal right to distribute their contribution under both GNU AGPLv3 and the commercial license.
- **Patent Grant:** Contributor licenses patents that read on the contributed code to prevent submarine patent litigation.
- **GitHub Bot Automation:** The \`metropolis-cla-bot\` automatically verifies incoming PRs against our database before CI allows merging.`;
    }

    return `### Metropolis Telemetry Analysis
- **Cluster Status:** All 4 nodes (Jetson AGX Orin, RTX 6000 Ada, DGX H100) operating at nominal thermals (<64°C).
- **Triton Engine:** Average latency across FP8 pipelines is **2.36 ms** with zero dropped frame buffers.
- **Sensor Alignment:** LiDAR and 77GHz Radar timestamps are synchronized with sub-millisecond precision.`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#0A0E15]/80 backdrop-blur-2xl border-l border-white/[0.09] shadow-[-20px_0_50px_rgba(0,0,0,0.7)] z-50 flex flex-col">
      {/* Drawer Header with glass styling */}
      <div className="p-4 bg-white/[0.03] backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center space-x-3">


          <div className="p-2 rounded-xl bg-[#76B900]/15 text-[#88D600] border border-[#76B900]/30 shadow-[0_0_12px_rgba(118,185,0,0.2)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>Metropolis Copilot</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-[#88D600] border border-[#76B900]/40">
                ACTIVE
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">DeepStream & Sensor Fusion AI Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-4 py-2.5 bg-black/20 border-b border-white/[0.06] flex space-x-2 overflow-x-auto text-[11px] font-mono scrollbar-none">
        <button
          onClick={() => handleUserSubmit('Analyze Gate 04 perimeter breach and sensor correlation')}
          className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white whitespace-nowrap border border-white/[0.08] backdrop-blur-md transition-colors"
        >
          Gate 04 Breach Analysis
        </button>
        <button
          onClick={() => handleUserSubmit('Explain AGPLv3 vs Commercial Enterprise dual license')}
          className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white whitespace-nowrap border border-white/[0.08] backdrop-blur-md transition-colors"
        >
          Dual License Details
        </button>
        <button
          onClick={() => handleUserSubmit('Why is CLA required for dual-licensed GitHub repos?')}
          className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white whitespace-nowrap border border-white/[0.08] backdrop-blur-md transition-colors"
        >
          CLA Legal Framework
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${
              m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 backdrop-blur-md ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/[0.08] text-[#88D600] border border-[#76B900]/30 shadow-[0_0_10px_rgba(118,185,0,0.1)]'
              }`}
            >
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed backdrop-blur-md ${
                m.sender === 'user'
                  ? 'bg-blue-600/90 text-white rounded-tr-none shadow-md'
                  : 'bg-white/[0.04] border border-white/[0.08] text-gray-200 rounded-tl-none whitespace-pre-wrap shadow-lg'
              }`}
            >
              <div className="text-[11px] font-mono text-gray-400 mb-1 flex items-center justify-between">
                <span>{m.sender === 'user' ? 'Operations Officer' : 'Metropolis Copilot'}</span>
                <span>{m.timestamp}</span>
              </div>
              <div className="text-xs leading-relaxed">{m.text}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 p-2">
            <Loader2 className="w-4 h-4 text-[#76B900] animate-spin" />
            <span>Analyzing DeepStream pipelines & telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className="p-4 bg-white/[0.02] backdrop-blur-md border-t border-white/[0.08]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSubmit();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about DeepStream, CLA, or sensor data..."
            className="flex-1 bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#76B900] hover:bg-[#88D600] disabled:opacity-40 text-black font-bold transition-all shadow-[0_0_12px_rgba(118,185,0,0.3)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
