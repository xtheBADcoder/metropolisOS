import React, { useState, useEffect, useRef } from 'react';
import {
  CameraFeed,
  DetectedObject,
  SecurityIncident,
} from '../types/metropolis';
import { VlmSearchOverlay } from './VlmSearchOverlay';
import { StreamConfigModal } from './StreamConfigModal';
import {
  Play,
  Pause,
  Maximize2,
  Camera,
  Layers,
  Cpu,
  AlertTriangle,
  Eye,
  Radio,
  Crosshair,
  Sliders,
  ShieldCheck,
  Video,
  Zap,
  Plus,
  Settings2,
} from 'lucide-react';

interface VideoAnalyticsViewProps {
  cameras: CameraFeed[];
  activeCamera: CameraFeed;
  onSelectCamera: (cam: CameraFeed) => void;
  onTriggerAlert: (incident: SecurityIncident) => void;
  onOpenDataHub?: (tab?: 'video' | 'pointcloud' | 'iot' | 'webhooks') => void;
  onAddCamera?: (newCam: CameraFeed) => void;
}

export const VideoAnalyticsView: React.FC<VideoAnalyticsViewProps> = ({
  cameras,
  activeCamera,
  onSelectCamera,
  onTriggerAlert,
  onOpenDataHub,
  onAddCamera,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showTrajectories, setShowTrajectories] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showLidarOverlay, setShowLidarOverlay] = useState<boolean>(true);
  const [selectedEngine, setSelectedEngine] = useState<string>(activeCamera.modelEngine);
  const [activeObjects, setActiveObjects] = useState<DetectedObject[]>(activeCamera.objects);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [cameraList, setCameraList] = useState<CameraFeed[]>(cameras);

  // Sync cameraList with prop updates
  useEffect(() => {
    setCameraList(cameras);
  }, [cameras]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const tickRef = useRef<number>(0);

  // Sync webcam or local video file stream
  useEffect(() => {
    let localStream: MediaStream | null = null;
    const videoEl = hiddenVideoRef.current;
    if (!videoEl) return;

    if (activeCamera.streamUrl === 'stream:webcam') {
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
          .then((stream) => {
            localStream = stream;
            videoEl.srcObject = stream;
            videoEl.play().catch(() => {});
          })
          .catch((err) => {
            console.warn('Webcam hardware access error:', err);
          });
      }
    } else if (
      activeCamera.streamUrl &&
      (activeCamera.streamUrl.startsWith('blob:') ||
        activeCamera.streamUrl.startsWith('http') ||
        activeCamera.streamUrl.startsWith('data:'))
    ) {
      videoEl.srcObject = null;
      videoEl.src = activeCamera.streamUrl;
      videoEl.loop = true;
      videoEl.muted = true;
      videoEl.play().catch(() => {});
    } else {
      videoEl.srcObject = null;
      videoEl.removeAttribute('src');
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activeCamera.streamUrl]);

  // Sync objects when camera changes
  useEffect(() => {
    setActiveObjects(activeCamera.objects);
    setSelectedEngine(activeCamera.modelEngine);
  }, [activeCamera]);

  // Animated simulation loop for live DeepStream inference
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      tickRef.current += 0.03;
      const t = tickRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * 0.35;

      // 1. Draw Camera Background (Live Video/Webcam if available, or procedural facility grid)
      const videoEl = hiddenVideoRef.current;
      const hasLiveVideo = videoEl && (videoEl.readyState >= 2 || (videoEl.currentTime > 0 && !videoEl.paused));

      if (hasLiveVideo && videoEl) {
        ctx.drawImage(videoEl, 0, 0, width, height);
        // Subtle cybernetic tint overlay for enterprise HUD consistency
        ctx.fillStyle = 'rgba(7, 9, 14, 0.2)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, width, height);

        // Draw perspective grid ground
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.lineWidth = 1;

        // Vanishing point grid lines
        const vpX = width * 0.5;
        const vpY = horizonY;

        for (let i = -10; i <= 20; i++) {
          const groundX = (i / 10) * width;
          ctx.beginPath();
          ctx.moveTo(vpX, vpY);
          ctx.lineTo(groundX, height);
          ctx.stroke();
        }

        // Horizontal depth lines
        for (let d = 0.1; d <= 1.0; d += 0.1) {
          const y = horizonY + (height - horizonY) * Math.pow(d, 2);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Procedural background structures (buildings/logistics racks)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(width * 0.05, horizonY - 60, width * 0.25, 60);
        ctx.fillRect(width * 0.7, horizonY - 90, width * 0.25, 90);

        // Building lights / indicators
        ctx.fillStyle = '#76B900';
        ctx.fillRect(width * 0.08, horizonY - 45, 6, 6);
        ctx.fillRect(width * 0.15, horizonY - 30, 6, 6);
      }

      // 2. Draw Geofence Intrusion Polygons / Tripwires
      if (showZones && activeCamera.zoneBoundary && activeCamera.zoneBoundary.length > 0) {
        ctx.beginPath();
        activeCamera.zoneBoundary.forEach((pt, index) => {
          const px = (pt.x / 100) * width;
          const py = (pt.y / 100) * height;
          if (index === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        const isAlerting = activeCamera.intruderAlert;
        ctx.fillStyle = isAlerting
          ? `rgba(239, 68, 68, ${0.12 + Math.sin(t * 5) * 0.08})`
          : 'rgba(118, 185, 0, 0.06)';
        ctx.fill();

        ctx.strokeStyle = isAlerting
          ? `rgba(239, 68, 68, ${0.7 + Math.sin(t * 5) * 0.3})`
          : 'rgba(118, 185, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Zone label
        ctx.fillStyle = isAlerting ? '#EF4444' : '#76B900';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        const labelX = (activeCamera.zoneBoundary[0].x / 100) * width + 10;
        const labelY = (activeCamera.zoneBoundary[0].y / 100) * height - 8;
        ctx.fillText(`ZONE: ${activeCamera.zone.toUpperCase()} [${isAlerting ? 'BREACH DETECTED' : 'SECURE'}]`, labelX, labelY);
      }

      // 3. Optional AI Heatmap Overlay
      if (showHeatmap) {
        activeObjects.forEach((obj) => {
          const ox = ((obj.bbox.x + obj.bbox.w / 2) / 100) * width;
          const oy = ((obj.bbox.y + obj.bbox.h / 2) / 100) * height;

          const grad = ctx.createRadialGradient(ox, oy, 10, ox, oy, 90);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.3)');
          grad.addColorStop(1, 'rgba(118, 185, 0, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ox, oy, 90, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. LiDAR Point-Cloud Depth Simulation
      if (showLidarOverlay) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.65)';
        for (let i = 0; i < 40; i++) {
          const px = ((Math.sin(i * 1.7 + t * 0.8) * 0.5 + 0.5) * width);
          const py = horizonY + ((Math.cos(i * 2.3 + t * 0.5) * 0.5 + 0.5) * (height - horizonY));
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Draw Detected Objects, Trajectories & DeepStream Multi-Colored Bounding Boxes
      activeObjects.forEach((obj, idx) => {
        // Dynamic multi-color classification
        const isWarning = !!obj.alert;
        const l = obj.label.toLowerCase();
        let boxColor = '#38BDF8'; // Default Sky
        if (isWarning) {
          boxColor = '#EF4444'; // Rose / Red for alerts
        } else if (l.includes('person') || l.includes('pedestrian') || l.includes('worker')) {
          boxColor = '#06B6D4'; // Vibrant Cyan for humans
        } else if (l.includes('vehicle') || l.includes('car') || l.includes('truck') || l.includes('forklift')) {
          boxColor = '#8B5CF6'; // Electric Violet for vehicles
        } else if (l.includes('bag') || l.includes('box') || l.includes('package') || l.includes('asset')) {
          boxColor = '#F59E0B'; // Amber for cargo/assets
        } else if (l.includes('face') || l.includes('badge') || l.includes('id')) {
          boxColor = '#10B981'; // Emerald for credentials
        }

        // Minor dynamic jitter/motion for realism
        const xOffset = isPlaying ? Math.sin(t + idx * 1.5) * 1.5 : 0;
        const yOffset = isPlaying ? Math.cos(t * 0.8 + idx) * 0.8 : 0;

        const bx = ((obj.bbox.x + xOffset) / 100) * width;
        const by = ((obj.bbox.y + yOffset) / 100) * height;
        const bw = (obj.bbox.w / 100) * width;
        const bh = (obj.bbox.h / 100) * height;

        // Multi-colored Trajectory Trail
        if (showTrajectories && obj.trajectory && obj.trajectory.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);

          obj.trajectory.forEach((pt, pIdx) => {
            const ptx = (pt.x / 100) * width;
            const pty = (pt.y / 100) * height;
            if (pIdx === 0) ctx.moveTo(ptx, pty);
            else ctx.lineTo(ptx, pty);
          });
          ctx.lineTo(bx + bw / 2, by + bh);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Multi-Colored Bounding Box
        if (showBBoxes) {
          // Box border
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 1.8;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner reticles
          const cornerLen = 8;
          ctx.lineWidth = 3;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(bx, by + cornerLen);
          ctx.lineTo(bx, by);
          ctx.lineTo(bx + cornerLen, by);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + cornerLen);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(bx, by + bh - cornerLen);
          ctx.lineTo(bx, by + bh);
          ctx.lineTo(bx + cornerLen, by + bh);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(bx + bw - cornerLen, by + bh);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx + bw, by + bh - cornerLen);
          ctx.stroke();

          // Label badge header
          const labelText = `#${obj.trackingId} ${obj.label} ${(obj.confidence * 100).toFixed(0)}%`;
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          const textWidth = ctx.measureText(labelText).width;

          ctx.fillStyle = boxColor;
          ctx.fillRect(bx, by - 18, textWidth + 10, 18);

          ctx.fillStyle = '#000000';
          ctx.fillText(labelText, bx + 5, by - 4);

          // Sub-telemetry: Speed & Dwell
          const speedText = `${obj.velocityKmh.toFixed(1)} km/h | ${obj.dwellTimeSec}s`;
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(speedText, bx + 2, by + bh + 12);

          // Alert banner if present
          if (obj.alert) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
            ctx.fillRect(bx, by + bh + 16, Math.max(bw, 140), 16);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.fillText(`! ${obj.alert.toUpperCase()}`, bx + 4, by + bh + 28);
          }
        }
      });

      // 6. HUD / Telemetry Stamp
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, 10, 310, 52);
      ctx.strokeStyle = '#1E293B';
      ctx.strokeRect(10, 10, 310, 52);

      ctx.fillStyle = '#76B900';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`STREAM: ${activeCamera.name.toUpperCase()}`, 18, 28);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(
        `FPS: ${activeCamera.fps.toFixed(1)} | LATENCY: ${activeCamera.latencyMs}ms | RES: ${activeCamera.resolution}`,
        18,
        42
      );
      ctx.fillText(`ENGINE: ${selectedEngine}`, 18, 54);

      // LIVE watermark
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.beginPath();
      ctx.arc(width - 50, 24, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText('LIVE', width - 40, 28);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isPlaying,
    showBBoxes,
    showTrajectories,
    showZones,
    showHeatmap,
    showLidarOverlay,
    activeCamera,
    selectedEngine,
    activeObjects,
  ]);

  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    setCapturedSnapshot(dataUrl);
  };

  const handleSimulateBreach = () => {
    const newIncident: SecurityIncident = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      severity: 'critical',
      title: `Emergency Tripwire Alarm: ${activeCamera.zone}`,
      description: `Target exceeded designated threshold on ${activeCamera.name}. Automated AI triage protocol initiated.`,
      location: activeCamera.zone,
      cameraId: activeCamera.id,
      cameraName: activeCamera.name,
      status: 'active',
      detectedBy: selectedEngine,
      tags: ['Tripwire', 'Perimeter', 'Real-Time Alert'],
    };
    onTriggerAlert(newIncident);
  };

  return (
    <div className="space-y-4">
      {/* Stream Ingestion Strip Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
            Active Multi-Camera Mesh
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
            {cameraList.length} STREAMS ONLINE
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenDataHub && (
            <button
              onClick={() => onOpenDataHub('video')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Video / Webcam</span>
            </button>
          )}

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-700 dark:text-white border border-slate-200 dark:border-white/[0.1] text-xs font-mono font-semibold transition-all shadow-xs cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-slate-500 dark:text-gray-300" />
            <span>RTSP Manager</span>
          </button>
        </div>
      </div>

      {/* Camera Switcher Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {cameraList.map((cam) => {
          const isSelected = cam.id === activeCamera.id;
          return (
            <button
              key={cam.id}
              onClick={() => onSelectCamera(cam)}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/10 dark:bg-white/[0.08] border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-white/80 dark:bg-[#0B0E14]/70 border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.2] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-900 dark:text-gray-200 truncate">
                  <Video className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-500' : 'text-slate-400 dark:text-gray-400'}`} />
                  <span className="truncate font-mono">{cam.id.replace('cam-', '').toUpperCase()}</span>
                </span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    cam.intruderAlert
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                  }`}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mb-1.5">{cam.name}</p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
                <span>{cam.fps.toFixed(0)} FPS</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-medium">{cam.objects.length} objs</span>
              </div>

              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Video Stream Viewer + Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Stream Canvas & VLM Section (Spans 3 cols on xl) */}
        <div className="xl:col-span-3 space-y-4 flex flex-col">
          <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl flex flex-col">
          {/* Stream header bar */}
          <div className="bg-slate-50/80 dark:bg-white/[0.03] backdrop-blur-md px-4 py-2.5 border-b border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">{activeCamera.name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-gray-300 rounded border border-slate-200 dark:border-white/[0.08]">
                  {activeCamera.resolution}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 rounded border border-cyan-500/30">
                  NVDEC HEVC
                </span>
              </div>
            </div>

            {/* Ingestion & AI inference overlay switches (Multi-Colored Segmented Buttons) */}
            <div className="flex items-center space-x-1.5 flex-wrap">
              <button
                onClick={() => setShowBBoxes(!showBBoxes)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  showBBoxes
                    ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-semibold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                Boxes
              </button>

              <button
                onClick={() => setShowTrajectories(!showTrajectories)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  showTrajectories
                    ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)] font-semibold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                Vectors
              </button>

              <button
                onClick={() => setShowZones(!showZones)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  showZones
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)] font-semibold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                Tripwires
              </button>

              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  showHeatmap
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-semibold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                Heatmap
              </button>

              <button
                onClick={() => setShowLidarOverlay(!showLidarOverlay)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  showLidarOverlay
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-semibold'
                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                }`}
              >
                LiDAR Fusion
              </button>
            </div>
          </div>

          {/* Canvas viewport container with Tactical HUD Reticles */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            <video
              ref={hiddenVideoRef}
              className="hidden"
              playsInline
              muted
              autoPlay
              loop
            />

            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />

            {/* Scanline overlay for high-tech HUD feel */}
            <div className="absolute inset-0 scanline pointer-events-none opacity-30"></div>

            {/* Tactical HUD Corner Reticles with Cyan Accent */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Quiet Corner Telemetry Labels */}
            <div className="absolute top-4 left-6 text-[10px] font-mono text-cyan-300/80 pointer-events-none select-none tracking-wider">
              METROPOLIS NV12 · DEEPSTREAM 7.1
            </div>
            <div className="absolute bottom-4 right-6 text-[10px] font-mono text-gray-400 pointer-events-none select-none tracking-wider">
              NVENC HEVC CBR · TRT FP8
            </div>
          </div>

          {/* Playback & Action Footer */}
          <div className="bg-slate-50/80 dark:bg-white/[0.02] backdrop-blur-md px-4 py-2.5 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-800 dark:text-white border border-slate-200 dark:border-white/[0.08] transition-colors cursor-pointer"
                title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
              >
                {isPlaying ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-cyan-500" />}
              </button>

              <button
                onClick={handleCaptureSnapshot}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-white/[0.08] text-xs font-medium transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>AI Snapshot</span>
              </button>

              <button
                onClick={handleSimulateBreach}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>Simulate Perimeter Breach</span>
              </button>
            </div>

            {/* Pipeline engine selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 dark:text-gray-400 font-mono flex items-center">
                <Cpu className="w-3.5 h-3.5 text-cyan-500 mr-1" /> Model:
              </span>
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="bg-slate-100 dark:bg-black/40 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/[0.1] rounded-xl text-xs px-2.5 py-1 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="PeopleNet v2.6 (TensorRT FP8)">PeopleNet v2.6 (TensorRT FP8)</option>
                <option value="YOLOv10x-DeepStream-TRT">YOLOv10x-DeepStream-TRT</option>
                <option value="CrowdNet-v4-Metropolis">CrowdNet-v4-Metropolis</option>
                <option value="TrafficCamNet-LPR-TensorRT">TrafficCamNet-LPR-TensorRT</option>
                <option value="ThermalAnomaly-TRT-v3">ThermalAnomaly-TRT-v3</option>
              </select>
            </div>
          </div>
        </div>

        {/* VLM Open-Vocabulary Semantic Grounding Overlay */}
        <VlmSearchOverlay
          activeCamera={activeCamera}
          onFlagIncident={onTriggerAlert}
        />
      </div>

      {/* Right Telemetry Column */}
      <div className="space-y-4 flex flex-col justify-between">
        {/* Real-time Inference Engine Telemetry */}
        <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-gray-300 flex items-center">
              <Zap className="w-4 h-4 text-cyan-500 mr-1.5" />
              DeepStream Telemetry
            </h3>
            <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/15 px-2 py-0.5 rounded-md border border-cyan-500/30">
              ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
              <div className="text-slate-500 dark:text-gray-400 text-[10px]">PIPELINE FPS</div>
              <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{activeCamera.fps.toFixed(1)}</div>
              <div className="text-[9px] text-cyan-700 dark:text-cyan-400/80">Hardware Sync Lock</div>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
              <div className="text-slate-500 dark:text-gray-400 text-[10px]">TRT LATENCY</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeCamera.latencyMs} ms</div>
              <div className="text-[9px] text-emerald-700 dark:text-emerald-400/80">TensorRT FP8</div>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
              <div className="text-slate-500 dark:text-gray-400 text-[10px]">STREAM BITRATE</div>
              <div className="text-base font-bold text-violet-600 dark:text-violet-400 mt-0.5">{activeCamera.bitrateMbps} Mbps</div>
              <div className="text-[9px] text-slate-500 dark:text-gray-400">H.265 CBR</div>
            </div>

            <div className="bg-slate-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06]">
              <div className="text-slate-500 dark:text-gray-400 text-[10px]">EDGE NODE</div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 truncate">{activeCamera.edgeNodeId}</div>
              <div className="text-[9px] text-amber-700 dark:text-amber-400/80">Orin AGX 64GB</div>
            </div>
          </div>

          {/* RTSP stream URL info */}
          <div className="mt-3 p-2 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200/80 dark:border-white/[0.06] text-[10px] font-mono text-slate-600 dark:text-gray-400 truncate">
            <span className="text-slate-400 dark:text-gray-500">RTSP: </span>
            {activeCamera.streamUrl}
          </div>
        </div>

        {/* Detected Entities List (Multi-Colored Classification) */}
        <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-4 shadow-sm dark:shadow-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-gray-300 flex items-center">
              <Crosshair className="w-4 h-4 text-violet-500 mr-1.5" />
              Active Entities ({activeObjects.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">DeepStream IoU</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1">
            {activeObjects.map((obj) => {
              const l = obj.label.toLowerCase();
              let dotColor = 'bg-cyan-500';
              let badgeText = 'text-cyan-600 dark:text-cyan-400';
              if (obj.alert) {
                dotColor = 'bg-rose-500';
                badgeText = 'text-rose-600 dark:text-rose-400';
              } else if (l.includes('vehicle') || l.includes('car') || l.includes('truck')) {
                dotColor = 'bg-violet-500';
                badgeText = 'text-violet-600 dark:text-violet-400';
              } else if (l.includes('bag') || l.includes('box') || l.includes('package')) {
                dotColor = 'bg-amber-500';
                badgeText = 'text-amber-600 dark:text-amber-400';
              } else if (l.includes('face') || l.includes('badge')) {
                dotColor = 'bg-emerald-500';
                badgeText = 'text-emerald-600 dark:text-emerald-400';
              }

              return (
                <div
                  key={obj.id}
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    obj.alert
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                      : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                      <span>#{obj.trackingId} {obj.label}</span>
                    </span>
                    <span className={`font-mono text-[10px] font-semibold ${badgeText}`}>
                      {(obj.confidence * 100).toFixed(0)}% conf
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
                    <span>Speed: {obj.velocityKmh.toFixed(1)} km/h</span>
                    <span>Dwell: {obj.dwellTimeSec}s</span>
                  </div>

                  {obj.alert && (
                    <div className="mt-1.5 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-semibold flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                      {obj.alert}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>

      {/* Snapshot Preview Modal with macOS Frosted Glass */}
      {capturedSnapshot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F141E]/80 backdrop-blur-2xl border border-white/[0.12] rounded-2xl max-w-3xl w-full p-5 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">

                <Camera className="w-5 h-5 text-[#76B900]" />
                <h3 className="font-bold text-white text-base">DeepStream AI Frame Snapshot</h3>
              </div>
              <button
                onClick={() => setCapturedSnapshot(null)}
                className="text-gray-400 hover:text-white font-mono text-sm px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/[0.1] shadow-inner">
              <img src={capturedSnapshot} alt="Snapshot" className="w-full h-auto" />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-gray-400">
              <div>Captured from: {activeCamera.name}</div>
              <a
                href={capturedSnapshot}
                download={`metropolis-ai-frame-${activeCamera.id}.png`}
                className="px-4 py-2 bg-[#76B900] hover:bg-[#88D600] text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(118,185,0,0.3)] flex items-center space-x-1"
              >
                <span>Download PNG</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* RTSP & WebRTC Ingestion Manager Modal */}
      <StreamConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        cameras={cameraList}
        activeCameraId={activeCamera.id}
        onSaveCamera={(updatedCam) => {
          setCameraList((prev) =>
            prev.map((c) => (c.id === updatedCam.id ? updatedCam : c))
          );
          if (activeCamera.id === updatedCam.id) {
            onSelectCamera(updatedCam);
          }
        }}
        onAddCamera={(newCam) => {
          setCameraList((prev) => [...prev, newCam]);
          onSelectCamera(newCam);
        }}
      />
    </div>
  );
};
