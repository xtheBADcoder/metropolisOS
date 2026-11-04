import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Target,
  ShieldAlert,
  Sliders,
  X,
} from 'lucide-react';
import { CameraFeed, SecurityIncident } from '../types/metropolis';

interface VlmSearchResult {
  prompt: string;
  matched: boolean;
  confidence: number;
  label: string;
  bbox: { x: number; y: number; width: number; height: number };
  depthMeters: number;
  anomalyDetected: boolean;
  attributes: string[];
}

interface VlmSearchOverlayProps {
  activeCamera: CameraFeed;
  onDispatchToAgent?: (prompt: string, result: VlmSearchResult) => void;
  onFlagIncident?: (incident: SecurityIncident) => void;
}

const SAMPLE_VLM_PROMPTS = [
  'Worker without hard hat near transformer bank',
  'Red forklift exceeding 15 km/h near perimeter gate',
  'Unattended package or luggage on walkway',
  'Person attempting perimeter fence breach',
  'Spill or fluid leak on manufacturing line',
];

export const VlmSearchOverlay: React.FC<VlmSearchOverlayProps> = ({
  activeCamera,
  onDispatchToAgent,
  onFlagIncident,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<VlmSearchResult | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [showThresholdSlider, setShowThresholdSlider] = useState<boolean>(false);

  const handleExecuteVlmSearch = (textToSearch?: string) => {
    const promptText = (textToSearch || query).trim();
    if (!promptText) return;

    setIsSearching(true);
    setSearchResult(null);

    // Simulate real-time edge zero-shot VLM inference latency
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      let matched = true;
      let label = 'Grounding Detected';
      let confidence = 0.88 + Math.random() * 0.1;
      let anomalyDetected = false;
      let attributes = ['Zero-Shot Prompt', 'Edge Grounding', 'NVDEC Decoded'];
      let bbox = { x: 32, y: 28, width: 24, height: 42 };
      let depthMeters = 8.4;

      if (lower.includes('hard hat') || lower.includes('worker') || lower.includes('safety')) {
        label = 'Safety Violation: Unshielded Operator';
        confidence = 0.942;
        anomalyDetected = true;
        attributes = ['Missing PPE', 'Zone 2 Substation', 'Velocity: 0.8 m/s'];
        bbox = { x: 42, y: 35, width: 18, height: 38 };
        depthMeters = 6.2;
      } else if (lower.includes('forklift') || lower.includes('speed') || lower.includes('vehicle')) {
        label = 'Dynamic Vehicle: Logistics Forklift';
        confidence = 0.915;
        anomalyDetected = lower.includes('exceed') || lower.includes('speed');
        attributes = ['Velocity: 16.4 km/h', 'Overspeed Alert', 'Heavy Machinery'];
        bbox = { x: 22, y: 44, width: 34, height: 32 };
        depthMeters = 11.5;
      } else if (lower.includes('package') || lower.includes('bag') || lower.includes('unattended')) {
        label = 'Static Object: Unattended Parcel';
        confidence = 0.893;
        anomalyDetected = true;
        attributes = ['Dwell Time: > 8 min', 'High Threat Index', 'Thermal Normal'];
        bbox = { x: 62, y: 68, width: 14, height: 16 };
        depthMeters = 4.1;
      } else if (lower.includes('fence') || lower.includes('breach') || lower.includes('perimeter')) {
        label = 'Intrusion: Perimeter Geofence Violation';
        confidence = 0.967;
        anomalyDetected = true;
        attributes = ['Zone 1 Boundary', 'Rapid Acceleration', 'Infrared Tagged'];
        bbox = { x: 12, y: 18, width: 22, height: 50 };
        depthMeters = 14.8;
      } else {
        label = `VLM Grounding: ${promptText.slice(0, 24)}`;
        confidence = 0.865;
        attributes = ['Open-Vocabulary Match', 'Confidence Passed'];
        bbox = { x: 38, y: 40, width: 26, height: 36 };
      }

      setSearchResult({
        prompt: promptText,
        matched,
        confidence,
        label,
        bbox,
        depthMeters,
        anomalyDetected,
        attributes,
      });
      setIsSearching(false);
    }, 750);
  };

  const handleDispatchAgent = () => {
    if (!searchResult || !onDispatchToAgent) return;
    onDispatchToAgent(searchResult.prompt, searchResult);
  };

  const handleCreateIncidentFromVlm = () => {
    if (!searchResult || !onFlagIncident) return;
    const newInc: SecurityIncident = {
      id: `inc-vlm-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      severity: searchResult.anomalyDetected ? 'critical' : 'medium',
      title: searchResult.label,
      description: `VLM Open-Vocabulary Detection for prompt "${searchResult.prompt}". Spatial depth: ${searchResult.depthMeters}m. Attributes: ${searchResult.attributes.join(', ')}.`,
      location: activeCamera.zone,
      cameraId: activeCamera.id,
      cameraName: activeCamera.name,
      status: 'active',
      detectedBy: 'VLM Grounding DINO + YOLO-World',
      tags: ['VLM', 'Zero-Shot', 'Semantic Grounding'],
    };
    onFlagIncident(newInc);
  };

  return (
    <div className="bg-[#0B0F17]/90 backdrop-blur-xl border border-white/[0.09] rounded-2xl p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#76B900]/15 border border-[#76B900]/30 text-[#88D600]">
            <Sparkles className="w-4 h-4 text-[#76B900]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide flex items-center space-x-1.5">
              <span>Open-Vocabulary VLM Semantic Grounding</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                ZERO-SHOT
              </span>
            </h3>
            <p className="text-[10px] text-gray-400 font-mono">
              Natural language visual object and scene reasoning via Grounding DINO + YOLO-World
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowThresholdSlider((prev) => !prev)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Adjust Confidence Threshold"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Threshold Slider Dropdown */}
      {showThresholdSlider && (
        <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08] text-xs font-mono space-y-1.5">
          <div className="flex justify-between text-gray-300">
            <span>Confidence Threshold:</span>
            <span className="text-[#88D600] font-bold">{Math.round(confidenceThreshold * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.95"
            step="0.05"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full accent-[#76B900] cursor-pointer"
          />
        </div>
      )}

      {/* Search Input Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteVlmSearch()}
            placeholder="Describe what to detect in natural language (e.g. 'worker without helmet near forklift')..."
            className="w-full pl-9 pr-3 py-2 bg-black/50 text-white placeholder-gray-500 border border-white/[0.1] rounded-xl text-xs font-mono focus:outline-none focus:border-[#76B900] transition-colors"
          />
        </div>

        <button
          onClick={() => handleExecuteVlmSearch()}
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 bg-gradient-to-r from-[#76B900]/25 to-emerald-950/40 hover:from-[#76B900]/35 hover:to-emerald-900/50 text-[#88D600] border border-[#76B900]/40 rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50 flex items-center space-x-1.5 shadow-[0_0_12px_rgba(118,185,0,0.15)]"
        >
          {isSearching ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[#76B900] border-t-transparent rounded-full animate-spin" />
              <span>Scanning Stream...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Ground Scene</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Prompt Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
        <span className="text-gray-500">Presets:</span>
        {SAMPLE_VLM_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(prompt);
              handleExecuteVlmSearch(prompt);
            }}
            className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/[0.06] transition-colors truncate max-w-[220px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Grounding Results Card */}
      {searchResult && (
        <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.1] space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {searchResult.anomalyDetected ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#88D600]" />
              )}
              <span className="font-bold text-white text-xs">{searchResult.label}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#76B900]/20 text-[#88D600] border border-[#76B900]/40">
                {(searchResult.confidence * 100).toFixed(1)}% Match
              </span>
            </div>

            <button
              onClick={() => setSearchResult(null)}
              className="text-gray-500 hover:text-gray-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-white/[0.03] p-2 rounded-lg border border-white/[0.05]">
            <div>
              <span className="text-gray-500 block">Estimated Depth:</span>
              <span className="text-white font-bold">{searchResult.depthMeters}m (Stereo/LiDAR)</span>
            </div>
            <div>
              <span className="text-gray-500 block">Bounding Box:</span>
              <span className="text-white font-bold">
                [{searchResult.bbox.x}%, {searchResult.bbox.y}%, {searchResult.bbox.width}x{searchResult.bbox.height}]
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500 block">Semantic Attributes:</span>
              <span className="text-cyan-300 font-semibold truncate block">
                {searchResult.attributes.join(' • ')}
              </span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <button
              onClick={handleCreateIncidentFromVlm}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center space-x-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Log Incident</span>
            </button>

            <button
              onClick={handleDispatchAgent}
              className="px-3 py-1.5 bg-[#76B900]/20 hover:bg-[#76B900]/30 text-[#88D600] border border-[#76B900]/40 rounded-lg text-xs font-mono font-bold transition-colors flex items-center space-x-1.5 shadow-[0_0_10px_rgba(118,185,0,0.2)]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Dispatch Autonomous Agent</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
