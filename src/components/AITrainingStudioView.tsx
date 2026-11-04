import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Cpu,
  Layers,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Download,
  UploadCloud,
  Sliders,
  Activity,
  Zap,
  Server,
  ArrowRight,
  TrendingDown,
  Clock,
  Shield,
  Bot,
  Flame,
} from 'lucide-react';
import { TrainingJob, CameraFeed } from '../types/metropolis';

interface AITrainingStudioViewProps {
  cameras: CameraFeed[];
  onDeployModelToCameras?: (modelName: string) => void;
}

const INITIAL_TRAINING_JOBS: TrainingJob[] = [
  {
    id: 'job-tao-01',
    name: 'YOLOv11x Industrial Warehouse Safety Fine-Tune',
    type: 'vision_object_detection',
    baseModel: 'YOLOv11x-COCO-Pretrained (PyTorch)',
    datasetName: 'Facility Cameras 1-6 Annotated Clips (18,400 frames)',
    datasetSamples: 18400,
    epochs: 100,
    currentEpoch: 84,
    batchSize: 32,
    learningRate: 0.0003,
    status: 'running',
    accuracyMap50: 93.4,
    currentLoss: 0.042,
    lossHistory: [0.38, 0.28, 0.21, 0.16, 0.12, 0.09, 0.065, 0.048, 0.042],
    targetHardware: '4x NVIDIA H100 80GB SXM5 Cluster',
    outputEngineName: 'yolov11x-industrial-fp8.engine',
    startedAt: '38m ago',
    etaMinutes: 14,
  },
  {
    id: 'job-agent-02',
    name: 'Metropolis Agent Triage Policy LoRA (Llama-3-Vision)',
    type: 'agent_policy_lora',
    baseModel: 'Metropolis-Agentic-Vision-8B (Base)',
    datasetName: 'Physical Security Incident Triage Logs (4,500 scenarios)',
    datasetSamples: 4500,
    epochs: 25,
    currentEpoch: 25,
    batchSize: 16,
    learningRate: 0.0001,
    status: 'completed',
    accuracyMap50: 97.2,
    currentLoss: 0.018,
    lossHistory: [0.45, 0.31, 0.18, 0.09, 0.045, 0.024, 0.018],
    targetHardware: '8x NVIDIA A100 80GB Tensor Core',
    outputEngineName: 'agent-triage-policy-v2.1-fp16.bin',
    startedAt: '2h ago',
    etaMinutes: 0,
  },
  {
    id: 'job-anomaly-03',
    name: 'Spatial LiDAR Anomaly Variational Autoencoder',
    type: 'anomaly_autoencoder',
    baseModel: 'PointNet++ 3D Spatial Backbone',
    datasetName: 'Logistics Facility 3D Point Cloud Baselines (240k points)',
    datasetSamples: 240000,
    epochs: 50,
    currentEpoch: 18,
    batchSize: 64,
    learningRate: 0.0005,
    status: 'running',
    accuracyMap50: 89.1,
    currentLoss: 0.088,
    lossHistory: [0.52, 0.39, 0.26, 0.18, 0.13, 0.088],
    targetHardware: '2x NVIDIA H100 80GB SXM5',
    outputEngineName: 'pointnet-spatial-anomaly-int8.engine',
    startedAt: '12m ago',
    etaMinutes: 32,
  },
];

export const AITrainingStudioView: React.FC<AITrainingStudioViewProps> = ({
  cameras,
  onDeployModelToCameras,
}) => {
  const [jobs, setJobs] = useState<TrainingJob[]>(INITIAL_TRAINING_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0].id);
  const [isLaunchingNewJob, setIsLaunchingNewJob] = useState<boolean>(false);
  const [deployedNotification, setDeployedNotification] = useState<string | null>(null);

  // New Training Job Form State
  const [newJobForm, setNewJobForm] = useState({
    name: 'Custom Facility Hardhat & Hazard Net',
    type: 'vision_object_detection' as TrainingJob['type'],
    baseModel: 'YOLOv11x-COCO-Pretrained (PyTorch)',
    datasetName: 'Custom Ingested Video Frames & BBoxes',
    epochs: 60,
    batchSize: 32,
    learningRate: 0.0004,
    precision: 'FP8 (TensorRT 10.4 Quantized)',
    hardware: '4x NVIDIA H100 80GB SXM5 Cluster',
    targetEdgeNodes: 'All Jetson AGX Orin Fleet Nodes',
  });

  // Animated progress for running training jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.status === 'running') {
            const nextEpoch = Math.min(job.epochs, job.currentEpoch + 1);
            const isDone = nextEpoch >= job.epochs;
            const lossReduction = (Math.random() * 0.002);
            const newLoss = Math.max(0.015, Number((job.currentLoss - lossReduction).toFixed(4)));
            const newLossHist = [...job.lossHistory.slice(-10), newLoss];
            const newAcc = Math.min(99.2, Number((job.accuracyMap50 + 0.1).toFixed(1)));
            const newEta = Math.max(0, job.etaMinutes - 1);

            return {
              ...job,
              currentEpoch: nextEpoch,
              status: isDone ? 'completed' : 'running',
              currentLoss: newLoss,
              lossHistory: newLossHist,
              accuracyMap50: newAcc,
              etaMinutes: isDone ? 0 : newEta,
            };
          }
          return job;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleLaunchTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: TrainingJob = {
      id: `job-custom-${Date.now().toString().slice(-4)}`,
      name: newJobForm.name,
      type: newJobForm.type,
      baseModel: newJobForm.baseModel,
      datasetName: newJobForm.datasetName,
      datasetSamples: 12500,
      epochs: newJobForm.epochs,
      currentEpoch: 1,
      batchSize: newJobForm.batchSize,
      learningRate: newJobForm.learningRate,
      status: 'running',
      accuracyMap50: 62.5,
      currentLoss: 0.42,
      lossHistory: [0.42],
      targetHardware: newJobForm.hardware,
      outputEngineName: `${newJobForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-fp8.engine`,
      startedAt: 'Just now',
      etaMinutes: Math.round(newJobForm.epochs * 0.4),
    };

    setJobs([newJob, ...jobs]);
    setSelectedJobId(newJob.id);
    setIsLaunchingNewJob(false);
  };

  const handleDeployToEdge = (job: TrainingJob) => {
    if (onDeployModelToCameras) {
      onDeployModelToCameras(job.outputEngineName);
    }
    setDeployedNotification(
      `Successfully compiled & deployed "${job.outputEngineName}" over-the-air (OTA) to all ${cameras.length} active camera nodes with TensorRT FP8 acceleration!`
    );
    setTimeout(() => setDeployedNotification(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Architecture Explainer */}
      <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/08 dark:bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-fuchsia-500/10 dark:bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400">
                <BrainCircuit className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">
                NVIDIA TAO & Autonomous Agent Training Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/30 font-semibold">
                ENTERPRISE COMMERCIAL
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Train, adapt, and optimize custom physical vision models (YOLO, Grounding DINO, PeopleNet) and fine-tune autonomous multi-modal agent policies with LoRA on distributed GPU clusters. Automatically compiles into TensorRT FP8/INT8 engines for edge execution.
            </p>
          </div>

          <button
            onClick={() => setIsLaunchingNewJob(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] cursor-pointer flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Start New Training Job</span>
          </button>
        </div>

        {/* 5-Step Pipeline Strip (Multi-Colored Category Steps) */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mt-6 pt-5 border-t border-slate-200/80 dark:border-white/[0.08] text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">01. INGESTION</span>
            <p className="text-[11px] text-slate-800 dark:text-gray-200 font-semibold">Data & BBoxes</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">Streams, clips, or COCO</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">02. TAO ADAPT</span>
            <p className="text-[11px] text-slate-800 dark:text-gray-200 font-semibold">Transfer Learning</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">YOLOv11 & DINO backbones</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-bold">03. AGENT LORA</span>
            <p className="text-[11px] text-slate-800 dark:text-gray-200 font-semibold">Policy Fine-Tuning</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">RLHF & tool reasoning</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">04. QUANTIZATION</span>
            <p className="text-[11px] text-slate-800 dark:text-gray-200 font-semibold">TensorRT FP8/INT8</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">QAT & PTQ calibration</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] space-y-1">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">05. OTA DEPLOY</span>
            <p className="text-[11px] text-slate-800 dark:text-gray-200 font-semibold">Jetson Mesh Push</p>
            <p className="text-[10px] text-slate-500 dark:text-gray-400">Instant camera update</p>
          </div>
        </div>
      </div>

      {deployedNotification && (
        <div className="p-4 rounded-xl bg-[#76B900]/15 border border-[#76B900]/50 text-xs text-white font-mono flex items-center space-x-3 shadow-[0_0_25px_rgba(118,185,0,0.25)] animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#88D600] shrink-0" />
          <span>{deployedNotification}</span>
        </div>
      )}

      {/* Main Studio Viewport (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Selector & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Job Inspector Card */}
          <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">{selectedJob.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedJob.status === 'running'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/40 animate-pulse'
                        : selectedJob.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-300'
                    }`}
                  >
                    {selectedJob.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-gray-400 mt-0.5">
                  ID: {selectedJob.id} &bull; Base: {selectedJob.baseModel}
                </p>
              </div>

              {selectedJob.status === 'completed' && (
                <button
                  onClick={() => handleDeployToEdge(selectedJob)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] cursor-pointer flex items-center space-x-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Deploy to Active Camera Mesh</span>
                </button>
              )}
            </div>

            {/* Live Progress Bar & Epoch Metric */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-gray-400">
                  TRAINING PROGRESS (EPOCH {selectedJob.currentEpoch}/{selectedJob.epochs})
                </span>
                <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold tabular-nums">
                  {Math.round((selectedJob.currentEpoch / selectedJob.epochs) * 100)}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-black/60 border border-slate-300/80 dark:border-white/[0.1] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(217,70,239,0.5)]"
                  style={{ width: `${(selectedJob.currentEpoch / selectedJob.epochs) * 100}%` }}
                />
              </div>
            </div>

            {/* Core Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block">VALIDATION ACCURACY</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{selectedJob.accuracyMap50}%</span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block mt-0.5">mAP@0.5 IoU</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block">CURRENT LOSS</span>
                <span className="text-base font-bold text-violet-600 dark:text-violet-400 flex items-center space-x-1">
                  <span>{selectedJob.currentLoss}</span>
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block mt-0.5">Smooth L1 + CE</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block">DATASET SAMPLES</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedJob.datasetSamples.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block mt-0.5">Annotated frames</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block">CLUSTER HARDWARE</span>
                <span className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate block mt-1">
                  {selectedJob.targetHardware.split(' ')[1]} {selectedJob.targetHardware.split(' ')[2]}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 block mt-0.5">
                  {selectedJob.status === 'running' ? `ETA: ${selectedJob.etaMinutes}m` : 'Done'}
                </span>
              </div>
            </div>

            {/* Loss Convergence Curve (SVG HUD Graph) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200/80 dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-gray-400">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-violet-500" />
                  <span>CONVERGENCE CURVE (LOSS DECAY OVER CHECKPOINTS)</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">OPTIMAL CONVERGENCE</span>
              </div>

              <div className="h-28 w-full flex items-end space-x-2 pt-2 px-1">
                {selectedJob.lossHistory.map((lossVal, i) => {
                  const maxLoss = Math.max(...selectedJob.lossHistory, 0.5);
                  const heightPercent = Math.max(12, Math.min(100, (lossVal / maxLoss) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div
                        className="w-full bg-gradient-to-t from-violet-500/40 via-fuchsia-500/60 to-fuchsia-500 rounded-t transition-all duration-300 group-hover:from-violet-400 group-hover:to-cyan-400"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400 dark:text-gray-500 mt-1">c{i + 1}</span>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 px-1.5 py-0.5 rounded bg-slate-900 dark:bg-black/90 text-[10px] font-mono text-white pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-xs">
                        Loss: {lossVal}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Output Engine Artifact */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                <div>
                  <span className="text-slate-400 dark:text-gray-400 block text-[10px]">OUTPUT COMPILED ARTIFACT</span>
                  <span className="text-slate-800 dark:text-white font-bold">{selectedJob.outputEngineName}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-[10px] font-bold">
                TENSORRT 10.4 // NVDEC NV12 FP8
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Training Jobs List & Policy Config (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-fuchsia-500" />
              <span>Training Jobs Queue</span>
            </h3>

            <div className="space-y-2">
              {jobs.map((job) => {
                const isSelected = job.id === selectedJob.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-fuchsia-500/10 dark:bg-white/[0.08] border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.25)]'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {job.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                          job.status === 'running'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mb-2">{job.baseModel}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
                      <span>Epoch {job.currentEpoch}/{job.epochs}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">mAP {job.accuracyMap50}%</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Autonomous Agent Policy Explanation Card */}
          <div className="bg-white/90 dark:bg-[#0B0E14]/70 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-5 shadow-sm dark:shadow-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-violet-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                How Agent Training Works
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Autonomous agents learn security protocols through <strong>Reinforcement Learning from Operator Feedback (RLOF)</strong>. Successful incident resolutions reward tool-selection weights, reducing mean-time-to-respond (MTTR) while respecting human safety bounds.
            </p>
          </div>
        </div>
      </div>

      {/* New Job Launch Modal */}
      {isLaunchingNewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-white/[0.12] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-fuchsia-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Configure New Distributed Training Job</h3>
              </div>
              <button
                onClick={() => setIsLaunchingNewJob(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white cursor-pointer text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLaunchTraining} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Job Title / Architecture</label>
                <input
                  type="text"
                  required
                  value={newJobForm.name}
                  onChange={(e) => setNewJobForm({ ...newJobForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Job Type</label>
                  <select
                    value={newJobForm.type}
                    onChange={(e) => setNewJobForm({ ...newJobForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="vision_object_detection">Vision Object Detection (TAO)</option>
                    <option value="agent_policy_lora">Agent Policy LoRA (Decision Engine)</option>
                    <option value="vlm_zero_shot">Open-Vocab Zero-Shot VLM</option>
                    <option value="anomaly_autoencoder">3D LiDAR Anomaly Autoencoder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Base Pretrained Backbone</label>
                  <select
                    value={newJobForm.baseModel}
                    onChange={(e) => setNewJobForm({ ...newJobForm, baseModel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="YOLOv11x-COCO-Pretrained (PyTorch)">YOLOv11x (State-of-the-art Vision)</option>
                    <option value="PeopleNet-v2.6 (Worker / Pedestrian)">PeopleNet v2.6 (Industrial)</option>
                    <option value="Grounding-DINO-Base (Zero-Shot)">Grounding DINO (Open-Vocabulary)</option>
                    <option value="Metropolis-Agentic-Vision-8B (Base)">Metropolis Agentic Policy (LLM/VLM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Total Epochs</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={newJobForm.epochs}
                    onChange={(e) => setNewJobForm({ ...newJobForm, epochs: parseInt(e.target.value) || 20 })}
                    className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Batch Size</label>
                  <input
                    type="number"
                    min={4}
                    max={256}
                    value={newJobForm.batchSize}
                    onChange={(e) => setNewJobForm({ ...newJobForm, batchSize: parseInt(e.target.value) || 16 })}
                    className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Target Precision</label>
                  <select
                    value={newJobForm.precision}
                    onChange={(e) => setNewJobForm({ ...newJobForm, precision: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="FP8 (TensorRT 10.4 Quantized)">TensorRT FP8</option>
                    <option value="INT8 (Calibration Cache PTQ)">TensorRT INT8</option>
                    <option value="FP16 Mixed Precision">FP16 Mixed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-500 dark:text-gray-400">Compute Hardware Allocation</label>
                <select
                  value={newJobForm.hardware}
                  onChange={(e) => setNewJobForm({ ...newJobForm, hardware: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#07090E] border border-slate-200 dark:border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="4x NVIDIA H100 80GB SXM5 Cluster">4x NVIDIA H100 80GB SXM5 Cluster</option>
                  <option value="8x NVIDIA A100 80GB Tensor Core">8x NVIDIA A100 80GB Tensor Core</option>
                  <option value="Local Jetson AGX Orin 64GB (On-Device)">Local Jetson AGX Orin 64GB (On-Device)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsLaunchingNewJob(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-gray-300 text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] cursor-pointer flex items-center space-x-1.5"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Launch Distributed Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
