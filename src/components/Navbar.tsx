import React from 'react';
import {
  ShieldAlert,
  Server,
  Activity,
  FileCode2,
  FileCheck2,
  Radio,
  Github,
  Bell,
  Sparkles,
  Bot,
  Menu,
  Database,
  BrainCircuit,
  Sun,
  Moon,
} from 'lucide-react';
import { GITHUB_REPO_INFO } from '../data/mockData';

export type ActiveTab =
  | 'analytics'
  | 'agent'
  | 'training'
  | 'sensors'
  | 'cluster'
  | 'incidents'
  | 'licensing'
  | 'cla';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeIncidentsCount: number;
  openAiCopilot: () => void;
  openDataHub?: (tab?: 'video' | 'pointcloud' | 'iot' | 'webhooks' | 'backup') => void;
  currentLicenseMode: 'agpl' | 'commercial';
  onToggleSidebar?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const TAB_METADATA: Record<
  ActiveTab,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
    colorClass: string;
    badgeBorder: string;
  }
> = {
  analytics: {
    label: 'Video Analytics',
    icon: Activity,
    tag: 'RTSP / NV12',
    colorClass: 'text-cyan-500 dark:text-cyan-400',
    badgeBorder: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  agent: {
    label: 'Autonomous Agent Ops',
    icon: Bot,
    tag: 'Goal Execution',
    colorClass: 'text-violet-500 dark:text-violet-400',
    badgeBorder: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  training: {
    label: 'Model & Agent Training',
    icon: BrainCircuit,
    tag: 'TAO / LoRA / TRT',
    colorClass: 'text-fuchsia-500 dark:text-fuchsia-400',
    badgeBorder: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  },
  sensors: {
    label: 'Sensor Telemetry',
    icon: Radio,
    tag: 'LiDAR / Thermal 3D',
    colorClass: 'text-amber-500 dark:text-amber-400',
    badgeBorder: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  cluster: {
    label: 'Cluster & Edge Fleet',
    icon: Server,
    tag: 'Triton Mesh',
    colorClass: 'text-emerald-500 dark:text-emerald-400',
    badgeBorder: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  incidents: {
    label: 'Incident Desk',
    icon: ShieldAlert,
    tag: 'Anomaly Triage',
    colorClass: 'text-rose-500 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  licensing: {
    label: 'Dual Licensing',
    icon: FileCode2,
    tag: 'AGPLv3 / Commercial',
    colorClass: 'text-sky-500 dark:text-sky-400',
    badgeBorder: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  cla: {
    label: 'GitHub & CLA',
    icon: FileCheck2,
    tag: 'Gatekeeper Bot',
    colorClass: 'text-indigo-500 dark:text-indigo-400',
    badgeBorder: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeIncidentsCount,
  openAiCopilot,
  openDataHub,
  currentLicenseMode,
  onToggleSidebar,
  theme,
  onToggleTheme,
}) => {
  const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.analytics;
  const CurrentIcon = currentMeta.icon;

  return (
    <header className="sticky top-0 z-30 select-none bg-white/85 dark:bg-[#07090F]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left Zone: Sidebar Toggle + Breadcrumb */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Module breadcrumb with vibrant accent */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-mono text-slate-400 dark:text-gray-500 tracking-wider hidden sm:inline font-bold">
              METROPOLIS
            </span>
            <span className="text-slate-300 dark:text-gray-700 hidden sm:inline">/</span>
            <div className="flex items-center space-x-1.5 font-semibold text-slate-900 dark:text-white">
              <CurrentIcon className={`w-3.5 h-3.5 ${currentMeta.colorClass}`} />
              <span className="text-sm tracking-tight">{currentMeta.label}</span>
            </div>
            <span
              className={`hidden md:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded border ${currentMeta.badgeBorder}`}
            >
              {currentMeta.tag}
            </span>
          </div>
        </div>

        {/* Center Zone: Multi-Color System Telemetry */}
        <div className="hidden xl:flex items-center space-x-4 text-[11px] font-mono text-slate-500 dark:text-gray-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-slate-700 dark:text-gray-300 font-medium">DEEPSTREAM 7.1 TRT FP8</span>
          </div>
          <span className="text-slate-300 dark:text-gray-700">·</span>
          <span className="text-slate-600 dark:text-gray-400">
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold tabular-nums">6/6</span> RTSP FEEDS
          </span>
          <span className="text-slate-300 dark:text-gray-700">·</span>
          <div className="flex items-center space-x-1">
            <span className="text-slate-400 dark:text-gray-500">LICENSE:</span>
            <span
              className={
                currentLicenseMode === 'commercial'
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-indigo-600 dark:text-indigo-400 font-semibold'
              }
            >
              {currentLicenseMode === 'commercial' ? 'COMMERCIAL ENTERPRISE' : 'AGPL-3.0 OSS'}
            </span>
          </div>
        </div>

        {/* Right Zone: Crisp Action Cluster + Theme Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer group"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Data Ingestion Hub */}
          {openDataHub && (
            <button
              onClick={() => openDataHub('video')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] text-xs font-medium transition-all cursor-pointer group"
              title="Connect Custom Videos, Webcams, LiDAR Point Clouds, MQTT & Webhooks"
            >
              <Database className="w-3.5 h-3.5 text-cyan-500 group-hover:scale-105 transition-transform" />
              <span className="hidden sm:inline">Connect Data</span>
              <span className="sm:hidden">Data</span>
            </button>
          )}

          {/* GitHub Star quick indicator */}
          <a
            href={`https://github.com/${GITHUB_REPO_INFO.fullName}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('cla');
            }}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] text-xs font-mono transition-all"
            title="GitHub Repository & CLA Manager"
          >
            <Github className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="tabular-nums font-semibold">★ {GITHUB_REPO_INFO.stars.toLocaleString()}</span>
          </a>

          {/* Incident Alert Bell */}
          <button
            onClick={() => setActiveTab('incidents')}
            className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
              activeIncidentsCount > 0
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={`${activeIncidentsCount} Active Security Incidents`}
            aria-label={`${activeIncidentsCount} active security incidents`}
          >
            <Bell className="w-3.5 h-3.5" />
            {activeIncidentsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white flex items-center justify-center">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          {/* AI Copilot Drawer Trigger with multi-colored gradient */}
          <button
            onClick={openAiCopilot}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200 group-hover:rotate-12 transition-transform" />
            <span>Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
