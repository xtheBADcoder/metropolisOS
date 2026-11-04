export type CameraType = 'optical_rgb' | 'thermal_flir' | 'lidar_fusion' | 'ptz_surveillance';

export interface BoundingBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  w: number; // percentage (0-100)
  h: number; // percentage (0-100)
}

export interface DetectedObject {
  id: string;
  trackingId: number;
  label: 'Pedestrian' | 'Vehicle' | 'Forklift' | 'Worker (Hardhat)' | 'Unattended Cargo' | 'Drone' | 'Hazard Anomaly';
  confidence: number;
  bbox: BoundingBox;
  velocityKmh: number;
  trajectory: { x: number; y: number }[];
  alert?: string;
  dwellTimeSec: number;
}

export interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  type: CameraType;
  resolution: string;
  fps: number;
  bitrateMbps: number;
  latencyMs: number;
  status: 'online' | 'degraded' | 'offline';
  modelEngine: string; // e.g. "PeopleNet v2.6 (TensorRT FP8)"
  edgeNodeId: string;
  streamUrl: string;
  objects: DetectedObject[];
  intruderAlert?: boolean;
  occupancyCount: number;
  zoneBoundary: { x: number; y: number }[];
}

export interface SensorTelemetry {
  id: string;
  name: string;
  type: 'lidar_depth' | 'doppler_radar' | 'acoustic_spl' | 'thermal_ambient' | 'co2_voc';
  zone: string;
  currentValue: number;
  unit: string;
  min: number;
  max: number;
  thresholdWarn: number;
  thresholdCrit: number;
  status: 'normal' | 'warning' | 'critical';
  history: { time: string; value: number }[];
}

export interface EdgeNode {
  id: string;
  name: string;
  hardware: string; // e.g. "Jetson AGX Orin 64GB"
  role: 'Edge Inference' | 'Gateway Aggregator' | 'Triton Core Cluster';
  ipAddress: string;
  gpuUtil: number; // %
  nvdecUtil: number; // %
  nvencUtil: number; // %
  vramUsedGB: number;
  vramTotalGB: number;
  tempC: number;
  powerWatts: number;
  activePipelines: number;
  deepstreamFps: number;
  tensorRtLatencyMs: number;
  status: 'healthy' | 'warning' | 'error';
  uptimeHours: number;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  description: string;
  location: string;
  cameraId: string;
  cameraName: string;
  status: 'active' | 'investigating' | 'resolved';
  detectedBy: string;
  assignedTo?: string;
  tags: string[];
}

export type LicenseMode = 'agpl' | 'commercial';

export interface CommercialLicenseDetails {
  tier: 'Developer Pro' | 'Enterprise Scale' | 'OEM Embedded';
  licenseKey: string;
  orgName: string;
  issuedAt: string;
  expiresAt: string;
  maxEdgeNodes: number;
  maxVideoStreams: number;
  hasSLA: boolean;
  closedSourcePermitted: boolean;
  airgappedDeployments: boolean;
  dedicatedEnterpriseSupport: boolean;
}

export interface CLASignatory {
  id: string;
  type: 'individual' | 'corporate';
  name: string;
  githubHandle: string;
  email: string;
  company?: string;
  signedAt: string;
  signatureHash: string;
  verified: boolean;
  prsCount: number;
  claVersion: string;
}

export interface ClusterPod {
  id: string;
  name: string;
  namespace: string;
  node: string;
  ready: string;
  restarts: number;
  age: string;
  status: 'Running' | 'Pending' | 'Terminating';
  cpuCores: number;
  gpuQuota: number;
}

export interface CustomPoint3D {
  x: number;
  y: number;
  z: number;
  intensity?: number;
  colorHex?: string;
}

export interface IoTBrokerConfig {
  brokerUrl: string;
  clientId: string;
  topic: string;
  qos: 0 | 1 | 2;
  protocol: 'wss' | 'ws' | 'mqtt';
  status: 'connected' | 'disconnected' | 'connecting';
  lastMessage?: string;
  packetCount: number;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  platform: 'slack' | 'discord' | 'teams' | 'pagerduty' | 'custom';
  eventFilters: ('critical' | 'high' | 'medium')[];
  active: boolean;
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed';
}

export interface TrainingJob {
  id: string;
  name: string;
  type: 'vision_object_detection' | 'agent_policy_lora' | 'vlm_zero_shot' | 'anomaly_autoencoder';
  baseModel: string;
  datasetName: string;
  datasetSamples: number;
  epochs: number;
  currentEpoch: number;
  batchSize: number;
  learningRate: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  accuracyMap50: number; // mAP@50 or reward score %
  currentLoss: number;
  lossHistory: number[];
  targetHardware: string;
  outputEngineName: string;
  startedAt: string;
  etaMinutes: number;
}


