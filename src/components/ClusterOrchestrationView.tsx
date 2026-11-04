import React, { useState } from 'react';
import { EdgeNode, ClusterPod } from '../types/metropolis';
import {
  Server,
  Cpu,
  Layers,
  Terminal,
  RotateCcw,
  Zap,
  HardDrive,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  Code,
  SlidersHorizontal,
} from 'lucide-react';

interface ClusterOrchestrationViewProps {
  nodes: EdgeNode[];
  pods: ClusterPod[];
}

export const ClusterOrchestrationView: React.FC<ClusterOrchestrationViewProps> = ({
  nodes,
  pods: initialPods,
}) => {
  const [pods, setPods] = useState<ClusterPod[]>(initialPods);
  const [selectedNode, setSelectedNode] = useState<EdgeNode>(nodes[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeConfigTab, setActiveConfigTab] = useState<'helm' | 'compose' | 'triton'>('helm');
  const [logFilter, setLogFilter] = useState<string>('all');

  const handleRestartPod = (podId: string) => {
    setPods((prev) =>
      prev.map((p) =>
        p.id === podId
          ? { ...p, restarts: p.restarts + 1, age: '0s', status: 'Running' }
          : p
      )
    );
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const HELM_VALUES_SNIPPET = `# Metropolis Enterprise Analytics Helm Values (v3.4.0)
# Scalable edge orchestration for Jetson Orin & Server clusters
metropolis:
  clusterName: "enterprise-vision-mesh-alpha"
  edgeArchitecture: "hybrid-jetson-orin-cluster"
  deepstream:
    pipelineWorkers: 8
    nvdecHardwareAccel: true
    precision: "fp8" # TensorRT 10.4 INT8/FP8 engine
    maxRtspsPerNode: 32
  tritonInferenceServer:
    replicas: 4
    gpuQuota: 1.0
    models:
      - name: "peoplenet_v2.6"
        version: "latest"
        runtime: "tensorrt_plan"
      - name: "yolov10x_deepstream"
        version: "latest"
  sensorFusion:
    lidarDrivers: ["ouster_os1", "hesai_pandar"]
    radarFmcwEnabled: true
    mqttBrokerUrl: "tcp://mqtt.metropolis.internal:1883"
  governance:
    dualLicenseEnforcement: true
    githubClaValidationWebhook: "https://api.github.com/repos/metropolis-analytics/metropolis/hooks"`;

  const DOCKER_COMPOSE_SNIPPET = `version: '3.8'
services:
  metropolis-deepstream-edge:
    image: ghcr.io/metropolis-analytics/metropolis-core:v7.1
    container_name: metropolis-edge-orin-01
    restart: always
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility,video
      - METROPOLIS_LICENSE_MODE=COMMERCIAL_ENTERPRISE
      - METROPOLIS_RTSP_PORT=8554
    volumes:
      - /opt/metropolis/configs:/configs:ro
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "8554:8554"
      - "9000:9000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]`;

  return (
    <div className="space-y-6">
      {/* Cluster Overview Stats Bar (Glassmorphic) */}
      <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.06]">
            <div className="text-[11px] font-mono text-gray-400">TOTAL EDGE & CORE NODES</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {nodes.length}{' '}
              <span className="text-xs font-normal text-[#88D600]">(100% HEALTHY)</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">2x Jetson Orin + 1x RTX 6000 + 1x DGX H100</div>
          </div>

          <div className="p-3 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.06]">
            <div className="text-[11px] font-mono text-gray-400">ACTIVE TRITON PIPELINES</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {nodes.reduce((acc, n) => acc + n.activePipelines, 0)}{' '}
              <span className="text-xs font-normal text-gray-400">STREAMS</span>
            </div>
            <div className="text-[10px] text-[#88D600] mt-0.5">Throughput: 2,580 FPS aggregate</div>
          </div>

          <div className="p-3 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.06]">
            <div className="text-[11px] font-mono text-gray-400">AVG TENSORRT INFERENCE LATENCY</div>
            <div className="text-2xl font-bold font-mono text-[#88D600] mt-1">2.36 ms</div>
            <div className="text-[10px] text-gray-400 mt-0.5">FP8 Engine Quantization</div>
          </div>

          <div className="p-3 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/[0.06]">
            <div className="text-[11px] font-mono text-gray-400">METROPOLIS POD ORCHESTRATION</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {pods.length}/{pods.length} <span className="text-xs font-normal text-[#88D600]">RUNNING</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Namespace: metropolis-mesh</div>
          </div>
        </div>
      </div>

      {/* Edge Node Hardware Telemetry Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-[#76B900]" />
            <h3 className="font-bold text-white text-base">
              Hardware Fleet & GPU Accelerator Telemetry
            </h3>
          </div>
          <span className="text-xs font-mono text-gray-400">Accelerator Telemetry (NVML v12.4)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const isSelected = node.id === selectedNode.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                  isSelected
                    ? 'bg-white/[0.1] border-[#76B900] shadow-[0_0_20px_rgba(118,185,0,0.2)]'
                    : 'bg-[#0B0E14]/60 border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#76B900] shadow-[0_0_6px_#76B900]"></span>
                    <span className="font-bold text-sm text-white font-mono">{node.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-[#88D600] border border-[#76B900]/30">
                    {node.role}
                  </span>
                </div>

                <div className="text-xs text-gray-400 mb-3 font-mono">{node.hardware}</div>

                {/* GPU Util bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-gray-400">GPU Core Util</span>
                    <span className="text-white font-bold">{node.gpuUtil}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className="bg-[#76B900] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#76B900]"
                      style={{ width: `${node.gpuUtil}%` }}
                    ></div>
                  </div>
                </div>

                {/* NVDEC / NVENC Decoders */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-3 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/[0.06]">
                  <div>
                    <span className="text-gray-500">NVDEC (Decode):</span>{' '}
                    <span className="text-white font-semibold">{node.nvdecUtil}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">NVENC (Encode):</span>{' '}
                    <span className="text-white font-semibold">{node.nvencUtil}%</span>
                  </div>
                </div>

                {/* VRAM & Temp Stats */}
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2 border-t border-white/[0.08]">
                  <span className="flex items-center space-x-1">
                    <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {node.vramUsedGB} / {node.vramTotalGB} GB
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{node.tempC}°C</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-[#76B900]" />
                    <span>{node.powerWatts}W</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kubernetes Pods & Scalable Deployment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pods Table (2 Cols - Main Container) */}
        <div className="lg:col-span-2 bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center space-x-3">

              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#76B900]" />
                <h3 className="font-bold text-white text-base">Metropolis Microservice Mesh Pods</h3>
              </div>
            </div>
            <span className="text-xs font-mono text-gray-400">Kubernetes v1.31 + K3s on Edge</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] text-gray-400 uppercase text-[10px]">
                  <th className="pb-2.5">Pod Name</th>
                  <th className="pb-2.5">Namespace</th>
                  <th className="pb-2.5">Node</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Restarts</th>
                  <th className="pb-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {pods.map((pod) => (
                  <tr key={pod.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-2.5 font-bold text-white max-w-[220px] truncate" title={pod.name}>
                      {pod.name}
                    </td>
                    <td className="py-2.5 text-gray-400">{pod.namespace}</td>
                    <td className="py-2.5 text-gray-300 truncate max-w-[140px]">{pod.node}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-[#88D600] border border-[#76B900]/30">
                        {pod.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400">{pod.restarts}</td>
                    <td className="py-2.5">
                      <button
                        onClick={() => handleRestartPod(pod.id)}
                        className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white transition-colors"
                        title="Rolling Restart Pod"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#76B900]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simulated Live GStreamer / DeepStream Container Logs */}
          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-300">
                <Terminal className="w-4 h-4 text-[#76B900]" />
                <span className="font-bold">Live Container Logs: deepstream-ingress-gate04</span>
              </div>
              <span className="text-[10px] font-mono text-[#88D600]">STREAMING 200 lines/s</span>
            </div>

            <div className="bg-[#05070B]/80 backdrop-blur-md rounded-xl p-3 border border-white/[0.06] font-mono text-[11px] text-gray-300 space-y-1 max-h-[140px] overflow-y-auto">
              <div className="text-gray-500">[10:46:12.802] INFO nvstreammux: Batch size 4, width 3840, height 2160, batched-push-timeout 40000</div>
              <div className="text-[#88D600]">[10:46:13.114] SUCCESS nvinfer: Loaded TensorRT FP8 engine file /opt/models/peoplenet_v2.6_fp8.engine</div>
              <div className="text-gray-300">[10:46:13.501] INFO nvtracker: NvDCF tracker initialized, past-frame max=10, compute-hw=GPU</div>
              <div className="text-amber-400">[10:46:14.200] WARN nvdsosd: Intrusion line crossed on stream 0 (Gate 04 Perimeter) by ID #101</div>
              <div className="text-cyan-400">[10:46:14.205] INFO event-broker: Published Kafka payload to topic: metropolis.events.breach (latency 1.4ms)</div>
            </div>
          </div>
        </div>

        {/* Enterprise Deployment Specs (Sidebar Panel) */}
        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-[#76B900]" />
                <h3 className="font-bold text-white text-base">Enterprise Deploy Configs</h3>
              </div>
            </div>

            {/* Config Sub-tabs */}
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => setActiveConfigTab('helm')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors backdrop-blur-md ${
                  activeConfigTab === 'helm'
                    ? 'bg-white/[0.1] text-white border border-[#76B900] shadow-[0_0_10px_rgba(118,185,0,0.2)]'
                    : 'bg-white/[0.04] text-gray-400 hover:text-gray-200 hover:bg-white/[0.07]'
                }`}
              >
                Helm Chart
              </button>
              <button
                onClick={() => setActiveConfigTab('compose')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors backdrop-blur-md ${
                  activeConfigTab === 'compose'
                    ? 'bg-white/[0.1] text-white border border-[#76B900] shadow-[0_0_10px_rgba(118,185,0,0.2)]'
                    : 'bg-white/[0.04] text-gray-400 hover:text-gray-200 hover:bg-white/[0.07]'
                }`}
              >
                Docker Compose
              </button>
            </div>

            <div className="relative">
              <pre className="bg-[#05070B]/80 backdrop-blur-md p-3 rounded-xl border border-white/[0.08] font-mono text-[10px] text-gray-300 overflow-x-auto max-h-[310px]">
                {activeConfigTab === 'helm' ? HELM_VALUES_SNIPPET : DOCKER_COMPOSE_SNIPPET}
              </pre>

              <button
                onClick={() =>
                  copyToClipboard(
                    activeConfigTab === 'helm' ? HELM_VALUES_SNIPPET : DOCKER_COMPOSE_SNIPPET,
                    activeConfigTab
                  )
                }
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-gray-300 transition-colors backdrop-blur-md"
                title="Copy Configuration"
              >
                {copiedKey === activeConfigTab ? (
                  <Check className="w-3.5 h-3.5 text-[#76B900]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-gray-400">
            Certified on: <span className="text-white">Edge Nodes, JetPack 6.0, Enterprise Server Clusters, DGX Scale-Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};
