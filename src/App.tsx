/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar, ActiveTab } from './components/Navbar';
import { VideoAnalyticsView } from './components/VideoAnalyticsView';
import { SensorTelemetryView } from './components/SensorTelemetryView';
import { ClusterOrchestrationView } from './components/ClusterOrchestrationView';
import { DualLicensingView } from './components/DualLicensingView';
import { CLAManagerView } from './components/CLAManagerView';
import { IncidentsView } from './components/IncidentsView';
import { MetropolisAIAssistant } from './components/MetropolisAIAssistant';
import { AgenticOpsView } from './components/AgenticOpsView';
import { AITrainingStudioView } from './components/AITrainingStudioView';
import { EnterpriseLicenseGate } from './components/EnterpriseLicenseGate';

import {
  INITIAL_CAMERAS,
  INITIAL_SENSORS,
  INITIAL_EDGE_NODES,
  INITIAL_INCIDENTS,
  INITIAL_CLA_SIGNATORIES,
  INITIAL_CLUSTER_PODS,
  SAMPLE_COMMERCIAL_LICENSE,
  GITHUB_REPO_INFO,
} from './data/mockData';
import {
  CameraFeed,
  SecurityIncident,
  CLASignatory,
  LicenseMode,
  CommercialLicenseDetails,
  CustomPoint3D,
  WebhookEndpoint,
} from './types/metropolis';
import { DataIngestionHubModal, IngestionTab } from './components/DataIngestionHubModal';

const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'wh-slack-01',
    name: 'Ops Slack #critical-alerts',
    platform: 'slack',
    url: 'https://api.metropolis-telemetry.io/webhooks/slack/critical-channel',
    eventFilters: ['critical', 'high'],
    active: true,
    lastTriggered: '14m ago',
    lastStatus: 'success',
  },
  {
    id: 'wh-pagerduty-02',
    name: 'Facility Incident Escalation',
    platform: 'pagerduty',
    url: 'https://events.pagerduty.com/v2/enqueue',
    eventFilters: ['critical'],
    active: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');
  const [cameras, setCameras] = useState<CameraFeed[]>(INITIAL_CAMERAS);
  const [activeCamera, setActiveCamera] = useState<CameraFeed>(INITIAL_CAMERAS[0]);
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  const [nodes, setNodes] = useState(INITIAL_EDGE_NODES);
  const [pods, setPods] = useState(INITIAL_CLUSTER_PODS);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);
  const [signatories, setSignatories] = useState<CLASignatory[]>(INITIAL_CLA_SIGNATORIES);
  const [licenseMode, setLicenseMode] = useState<LicenseMode>('commercial');
  const [commercialDetails, setCommercialDetails] = useState<CommercialLicenseDetails>(
    SAMPLE_COMMERCIAL_LICENSE
  );

  // Custom User-Connected Data State
  const [customPointCloud, setCustomPointCloud] = useState<CustomPoint3D[] | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(INITIAL_WEBHOOKS);
  const [isDataHubOpen, setIsDataHubOpen] = useState<boolean>(false);
  const [dataHubInitialTab, setDataHubInitialTab] = useState<IngestionTab>('video');

  // Copilot drawer state
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotIncident, setCopilotIncident] = useState<SecurityIncident | null>(null);

  // Theme Mode State (Dark default with full Light mode support)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('metropolis-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('metropolis-theme', theme);
  }, [theme]);

  // Sidebar navigation state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Handlers
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  const handleSelectCamera = (cam: CameraFeed) => {
    setActiveCamera(cam);
  };

  const handleOpenDataHub = (tab: IngestionTab = 'video') => {
    setDataHubInitialTab(tab);
    setIsDataHubOpen(true);
  };

  const handleAddCamera = (newCam: CameraFeed) => {
    setCameras((prev) => [newCam, ...prev]);
    setActiveCamera(newCam);
  };

  const handleDeployModelToCameras = (modelName: string) => {
    setCameras((prev) =>
      prev.map((c) => ({
        ...c,
        modelEngine: modelName,
      }))
    );
  };

  const handleImportFullConfig = (config: any) => {
    if (config.cameras && Array.isArray(config.cameras)) {
      setCameras(config.cameras);
      if (config.cameras.length > 0) setActiveCamera(config.cameras[0]);
    }
    if (config.sensors && Array.isArray(config.sensors)) {
      setSensors(config.sensors);
    }
    if (config.customPointCloud) {
      setCustomPointCloud(config.customPointCloud);
    }
    if (config.webhooks && Array.isArray(config.webhooks)) {
      setWebhooks(config.webhooks);
    }
  };

  const handleTriggerAlert = (incident: SecurityIncident) => {
    setIncidents((prev) => [incident, ...prev]);
    // Flash notification / open incidents tab or show copilot
    setCopilotIncident(incident);

    // Automated Outbound Webhook Dispatch for matching severities
    setWebhooks((prev) =>
      prev.map((wh) => {
        if (wh.active && (wh.eventFilters as string[]).includes(incident.severity)) {
          return {
            ...wh,
            lastTriggered: 'Just now',
            lastStatus: 'success',
          };
        }
        return wh;
      })
    );
  };

  const handleUpdateIncidentStatus = (
    id: string,
    newStatus: SecurityIncident['status']
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  };

  const handleAddSignatory = (newSignatory: CLASignatory) => {
    setSignatories((prev) => [newSignatory, ...prev]);
  };

  const handleOpenAiForIncident = (incident: SecurityIncident) => {
    setCopilotIncident(incident);
    setIsCopilotOpen(true);
  };

  const handleTuneNode = (nodeId: string, precision: 'fp8' | 'int8' | 'fp16') => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            tempC: Math.max(48, node.tempC - (precision === 'fp8' ? 9 : 4)),
            gpuUtil: Math.max(40, node.gpuUtil - (precision === 'fp8' ? 14 : 6)),
            tensorRtLatencyMs: precision === 'fp8' ? 1.85 : 2.45,
          };
        }
        return node;
      })
    );
  };

  const handleResolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, status: 'resolved' as const, assignedTo: 'Metropolis AI Agent (Autonomous)' }
          : inc
      )
    );
  };

  const activeIncidentsCount = incidents.filter((i) => i.status === 'active').length;

  return (
    <div
      className={`min-h-screen flex relative overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#06080D] text-[#E2E8F0]' : 'bg-[#F8FAFC] text-[#0F172A]'
      }`}
    >
      {/* High-Tech Ambient Grid & Multi-Colored Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute inset-0 ${theme === 'dark' ? 'tech-grid opacity-35' : 'tech-grid-light opacity-50'}`} />
        <div className="absolute -top-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-cyan-500/08 dark:bg-cyan-500/10 blur-[150px]" />
        <div className="absolute top-[30%] -right-[10%] w-[550px] h-[550px] rounded-full bg-violet-500/08 dark:bg-violet-500/10 blur-[160px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[500px] h-[500px] rounded-full bg-emerald-500/06 dark:bg-emerald-500/08 blur-[140px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] rounded-full bg-fuchsia-500/06 dark:bg-fuchsia-500/08 blur-[150px]" />
      </div>

      {/* Primary Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeIncidentsCount={activeIncidentsCount}
        openAiCopilot={() => {
          setCopilotIncident(null);
          setIsCopilotOpen(true);
        }}
        openDataHub={handleOpenDataHub}
        currentLicenseMode={licenseMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Workspace Column with Desktop Sidebar Offset */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Platform Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeIncidentsCount={activeIncidentsCount}
          openAiCopilot={() => {
            setCopilotIncident(null);
            setIsCopilotOpen(true);
          }}
          openDataHub={handleOpenDataHub}
          currentLicenseMode={licenseMode}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleSidebar={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <div className="transition-all duration-300">
            {activeTab === 'analytics' && (
              <VideoAnalyticsView
                cameras={cameras}
                activeCamera={activeCamera}
                onSelectCamera={handleSelectCamera}
                onTriggerAlert={handleTriggerAlert}
                onOpenDataHub={handleOpenDataHub}
                onAddCamera={handleAddCamera}
              />
            )}

            {activeTab === 'agent' && (
              <AgenticOpsView
                cameras={cameras}
                nodes={nodes}
                incidents={incidents}
                sensors={sensors}
                onResolveIncident={handleResolveIncident}
                onTuneNode={handleTuneNode}
              />
            )}

            {activeTab === 'training' && (
              <EnterpriseLicenseGate
                featureName="AI Model & Agent Training Studio (TAO Toolkit + LoRA)"
                featureDescription="Train custom vision backbones (YOLOv11, Grounding DINO, PeopleNet) and fine-tune multi-modal agent policies using distributed multi-GPU training clusters with automated TensorRT FP8/INT8 export."
                category="ai_training"
                currentMode={licenseMode}
                onActivateEvalLicense={() => setLicenseMode('commercial')}
                onNavigateToLicensing={() => setActiveTab('licensing')}
              >
                <AITrainingStudioView
                  cameras={cameras}
                  onDeployModelToCameras={handleDeployModelToCameras}
                />
              </EnterpriseLicenseGate>
            )}

            {activeTab === 'sensors' && (
              <SensorTelemetryView
                sensors={sensors}
                customPointCloud={customPointCloud}
                onOpenDataHub={handleOpenDataHub}
                onTriggerAlert={handleTriggerAlert}
              />
            )}

            {activeTab === 'cluster' && (
              <EnterpriseLicenseGate
                featureName="Cloud Cluster & Triton Inference Fleet Orchestration"
                featureDescription="Manage distributed Jetson AGX Orin edge mesh nodes, Triton Core inference clusters, dynamic Kubernetes pod quotas, and sub-2ms network routing across enterprise facilities."
                category="cloud_orchestration"
                currentMode={licenseMode}
                onActivateEvalLicense={() => setLicenseMode('commercial')}
                onNavigateToLicensing={() => setActiveTab('licensing')}
              >
                <ClusterOrchestrationView
                  nodes={nodes}
                  pods={pods}
                />
              </EnterpriseLicenseGate>
            )}

            {activeTab === 'incidents' && (
              <IncidentsView
                incidents={incidents}
                cameras={cameras}
                onSelectCamera={handleSelectCamera}
                onUpdateIncidentStatus={handleUpdateIncidentStatus}
                onOpenAiForIncident={handleOpenAiForIncident}
              />
            )}

            {activeTab === 'licensing' && (
              <DualLicensingView
                currentMode={licenseMode}
                onSetLicenseMode={setLicenseMode}
                commercialDetails={commercialDetails}
                onUpdateCommercialDetails={setCommercialDetails}
              />
            )}

            {activeTab === 'cla' && (
              <CLAManagerView
                signatories={signatories}
                onAddSignatory={handleAddSignatory}
              />
            )}
          </div>
        </main>

        {/* Platform Footer */}
        <footer className="mt-auto border-t border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#07090E]/60 backdrop-blur-xl px-4 py-3.5 text-xs font-mono text-slate-500 dark:text-gray-400">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
              <span className="font-semibold text-slate-700 dark:text-gray-300">
                Metropolis Multi-Modal Vision & Sensor Platform
              </span>
              <span className="text-slate-300 dark:text-gray-700">·</span>
              <span className="text-slate-500 dark:text-gray-400">DeepStream NV12 / TensorRT FP8</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-500 dark:text-gray-400">
              <span>Dual License: GNU AGPL-3.0 & Commercial Enterprise</span>
              <span className="text-slate-300 dark:text-gray-700">·</span>
              <span>Automated GitHub PR Bot</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Intelligent AI Copilot Drawer */}
      <MetropolisAIAssistant
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialIncident={copilotIncident}
        activeCamera={activeCamera}
      />

      {/* Multi-Modal Data Ingestion Hub (Bring Your Own Data) */}
      <DataIngestionHubModal
        isOpen={isDataHubOpen}
        onClose={() => setIsDataHubOpen(false)}
        initialTab={dataHubInitialTab}
        cameras={cameras}
        sensors={sensors}
        customPointCloud={customPointCloud}
        webhooks={webhooks}
        onAddCamera={handleAddCamera}
        onUpdateSensors={setSensors}
        onUpdateCustomPointCloud={setCustomPointCloud}
        onUpdateWebhooks={setWebhooks}
        onTriggerAlert={handleTriggerAlert}
        onImportFullConfig={handleImportFullConfig}
      />
    </div>
  );
}
