import React, { useState } from 'react';
import {
  Video,
  Radio,
  Cpu,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Activity,
  Plus,
  Trash2,
} from 'lucide-react';
import { CameraFeed } from '../types/metropolis';

interface StreamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: CameraFeed[];
  onSaveCamera: (updatedCamera: CameraFeed) => void;
  onAddCamera: (newCamera: CameraFeed) => void;
  activeCameraId: string;
}

export const StreamConfigModal: React.FC<StreamConfigModalProps> = ({
  isOpen,
  onClose,
  cameras,
  onSaveCamera,
  onAddCamera,
  activeCameraId,
}) => {
  const [selectedCamId, setSelectedCamId] = useState<string>(activeCameraId);
  const selectedCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  const [formData, setFormData] = useState({
    name: selectedCam.name,
    zone: selectedCam.zone,
    streamUrl: selectedCam.streamUrl,
    resolution: selectedCam.resolution,
    fps: selectedCam.fps,
    codec: 'HEVC / H.265 (NVDEC NV12)',
    protocol: 'RTSP over TCP',
    edgeNode: 'node-orin-agx-01 (Jetson AGX Orin 64GB)',
    inferencePipeline: 'YOLOv11x + DeepStream Multi-Tracker',
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testPingMs, setTestPingMs] = useState<number>(14);

  if (!isOpen) return null;

  const handleSelectCam = (cam: CameraFeed) => {
    setSelectedCamId(cam.id);
    setFormData({
      name: cam.name,
      zone: cam.zone,
      streamUrl: cam.streamUrl,
      resolution: cam.resolution,
      fps: cam.fps,
      codec: 'HEVC / H.265 (NVDEC NV12)',
      protocol: 'RTSP over TCP',
      edgeNode: 'node-orin-agx-01 (Jetson AGX Orin 64GB)',
      inferencePipeline: 'YOLOv11x + DeepStream Multi-Tracker',
    });
    setTestStatus('idle');
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('success');
      setTestPingMs(12 + Math.floor(Math.random() * 8));
    }, 800);
  };

  const handleSave = () => {
    const updated: CameraFeed = {
      ...selectedCam,
      name: formData.name,
      zone: formData.zone,
      streamUrl: formData.streamUrl,
      resolution: formData.resolution,
      fps: formData.fps,
      modelEngine: formData.inferencePipeline,
    };
    onSaveCamera(updated);
    onClose();
  };

  const handleCreateNew = () => {
    const newId = `cam-${Date.now().toString().slice(-4)}`;
    const newFeed: CameraFeed = {
      id: newId,
      name: 'Auxiliary Perimeter Cam ' + (cameras.length + 1),
      zone: 'Substation West Perimeter',
      type: 'optical_rgb',
      streamUrl: `rtsp://stream.metropolis.local:554/live/substation_${cameras.length + 1}`,
      resolution: '3840x2160 (4K)',
      fps: 30,
      bitrateMbps: 8.5,
      latencyMs: 14,
      status: 'online',
      modelEngine: 'YOLOv11x + DeepStream Multi-Tracker',
      edgeNodeId: 'node-orin-agx-01',
      objects: [],
      occupancyCount: 0,
      zoneBoundary: [
        { x: 10, y: 10 },
        { x: 90, y: 10 },
        { x: 90, y: 90 },
        { x: 10, y: 90 },
      ],
    };
    onAddCamera(newFeed);
    handleSelectCam(newFeed);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0F17]/95 border border-white/[0.12] rounded-2xl max-w-3xl w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-5 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#76B900]/15 border border-[#76B900]/30 text-[#88D600]">
              <Video className="w-5 h-5 text-[#76B900]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>RTSP & WebRTC Ingestion Manager</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-[#88D600] border border-[#76B900]/40">
                  NVDEC ACCELERATED
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                Configure live RTSP streams, hardware decoders, edge routing, and inference models
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Selector Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {cameras.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCam(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                  c.id === selectedCamId
                    ? 'bg-[#76B900]/20 text-[#88D600] border border-[#76B900]/50 font-bold'
                    : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/[0.06]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateNew}
            className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] rounded-xl text-xs font-mono font-semibold transition-colors flex items-center space-x-1 shrink-0 ml-2"
          >
            <Plus className="w-3.5 h-3.5 text-[#76B900]" />
            <span>Add Feed</span>
          </button>
        </div>

        {/* Configuration Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Stream Name */}
          <div>
            <label className="text-gray-400 block mb-1">Stream Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/50 text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
            />
          </div>

          {/* Location / Zone */}
          <div>
            <label className="text-gray-400 block mb-1">Physical Facility Zone</label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full bg-black/50 text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
            />
          </div>

          {/* RTSP Stream URL */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-400">RTSP / WebRTC / HLS Endpoint</label>
              <span className="text-[10px] text-gray-500">Supports rtsp://, whep://, http://, .m3u8</span>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.streamUrl}
                onChange={(e) => setFormData({ ...formData, streamUrl: e.target.value })}
                className="flex-1 bg-black/50 text-[#88D600] font-mono border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
              />
              <button
                onClick={handleTestConnection}
                className="px-3 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.1] rounded-xl font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Test Ping</span>
              </button>
            </div>
          </div>

          {/* Codec */}
          <div>
            <label className="text-gray-400 block mb-1">Hardware Video Decoder</label>
            <select
              value={formData.codec}
              onChange={(e) => setFormData({ ...formData, codec: e.target.value })}
              className="w-full bg-[#121824] text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
            >
              <option value="HEVC / H.265 (NVDEC NV12)">HEVC / H.265 (NVDEC NV12)</option>
              <option value="AVC / H.264 (NVDEC YUV420)">AVC / H.264 (NVDEC YUV420)</option>
              <option value="AV1 Hardware Accelerated">AV1 Hardware Accelerated</option>
            </select>
          </div>

          {/* Resolution & FPS */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-gray-400 block mb-1">Resolution</label>
              <select
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                className="w-full bg-[#121824] text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
              >
                <option value="3840x2160 (4K)">3840x2160 (4K)</option>
                <option value="1920x1080 (FHD)">1920x1080 (FHD)</option>
                <option value="1280x720 (HD)">1280x720 (HD)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-400 block mb-1">FPS Target</label>
              <select
                value={formData.fps}
                onChange={(e) => setFormData({ ...formData, fps: parseInt(e.target.value) })}
                className="w-full bg-[#121824] text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
              >
                <option value={60}>60 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={15}>15 FPS</option>
              </select>
            </div>
          </div>

          {/* Target Edge Node */}
          <div>
            <label className="text-gray-400 block mb-1">Assigned Edge Accelerator</label>
            <select
              value={formData.edgeNode}
              onChange={(e) => setFormData({ ...formData, edgeNode: e.target.value })}
              className="w-full bg-[#121824] text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
            >
              <option value="node-orin-agx-01">node-orin-agx-01 (Jetson AGX Orin 64GB)</option>
              <option value="node-orin-agx-02">node-orin-agx-02 (Jetson AGX Orin 64GB)</option>
              <option value="node-orin-nano-01">node-orin-nano-01 (Jetson Orin Nano 8GB)</option>
            </select>
          </div>

          {/* AI Inference Pipeline */}
          <div>
            <label className="text-gray-400 block mb-1">Inference Engine Pipeline</label>
            <select
              value={formData.inferencePipeline}
              onChange={(e) => setFormData({ ...formData, inferencePipeline: e.target.value })}
              className="w-full bg-[#121824] text-white border border-white/[0.1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#76B900]"
            >
              <option value="YOLOv11x + DeepStream Multi-Tracker">YOLOv11x + DeepStream Tracker (FP8)</option>
              <option value="Grounding DINO Open-Vocabulary VLM">Grounding DINO Open-Vocabulary VLM</option>
              <option value="Thermal Optical Cross-Fusion Mesh">Thermal Optical Cross-Fusion Mesh</option>
            </select>
          </div>
        </div>

        {/* Live Test Status Banner */}
        {testStatus !== 'idle' && (
          <div
            className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
              testStatus === 'testing'
                ? 'bg-blue-950/30 border-blue-500/40 text-blue-300'
                : testStatus === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {testStatus === 'testing' && (
                <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              <span>
                {testStatus === 'testing'
                  ? 'Handshaking RTSP endpoint via GStreamer rtspsrc...'
                  : testStatus === 'success'
                  ? `Stream stream verified: 0 packet drops • Egress latency: ${testPingMs}ms • Codec NVDEC OK`
                  : 'Failed to negotiate RTSP stream handshake.'}
              </span>
            </div>

            {testStatus === 'success' && (
              <span className="font-bold text-[#88D600]">{testPingMs}ms</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#76B900] hover:bg-[#88D600] text-black font-mono font-bold rounded-xl text-xs transition-colors shadow-[0_0_15px_rgba(118,185,0,0.3)]"
          >
            Apply & Connect Feed
          </button>
        </div>
      </div>
    </div>
  );
};
