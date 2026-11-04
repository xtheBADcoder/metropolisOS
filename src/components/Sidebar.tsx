import React from 'react';
import {
  Activity,
  Bot,
  Radio,
  Server,
  ShieldAlert,
  FileCode2,
  FileCheck2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Database,
  BrainCircuit,
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeIncidentsCount: number;
  openAiCopilot: () => void;
  openDataHub?: (tab?: 'video' | 'pointcloud' | 'iot' | 'webhooks' | 'backup') => void;
  currentLicenseMode: 'agpl' | 'commercial';
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  category: 'core' | 'governance';
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isAgent?: boolean;
  isEnterpriseOnly?: boolean;
  description: string;
  accentColor: string;
  activeBg: string;
  activeBorder: string;
  barColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeIncidentsCount,
  openAiCopilot,
  openDataHub,
  currentLicenseMode,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems: NavItemConfig[] = [
    {
      id: 'analytics',
      label: 'Video Analytics',
      category: 'core',
      icon: Activity,
      description: 'Multi-stream RTSP, NV12 & bounding boxes',
      accentColor: 'text-cyan-500 dark:text-cyan-400',
      activeBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
      activeBorder: 'border-cyan-500/30',
      barColor: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]',
    },
    {
      id: 'agent',
      label: 'Autonomous Agent Ops',
      category: 'core',
      icon: Bot,
      isAgent: true,
      description: 'Goal execution & autonomous pipeline tuning',
      accentColor: 'text-violet-500 dark:text-violet-400',
      activeBg: 'bg-violet-500/10 dark:bg-violet-500/15',
      activeBorder: 'border-violet-500/30',
      barColor: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]',
    },
    {
      id: 'training',
      label: 'Model & Agent Training',
      category: 'core',
      icon: BrainCircuit,
      isEnterpriseOnly: true,
      description: 'TAO fine-tuning, LoRA & TensorRT FP8 export',
      accentColor: 'text-fuchsia-500 dark:text-fuchsia-400',
      activeBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
      activeBorder: 'border-fuchsia-500/30',
      barColor: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]',
    },
    {
      id: 'sensors',
      label: 'Sensor Telemetry',
      category: 'core',
      icon: Radio,
      description: 'LiDAR, Radar & Thermal spatial fusion',
      accentColor: 'text-amber-500 dark:text-amber-400',
      activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
      activeBorder: 'border-amber-500/30',
      barColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    },
    {
      id: 'cluster',
      label: 'Cluster & Edge Fleet',
      category: 'core',
      icon: Server,
      isEnterpriseOnly: true,
      description: 'Jetson Orin nodes & Triton mesh',
      accentColor: 'text-emerald-500 dark:text-emerald-400',
      activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      activeBorder: 'border-emerald-500/30',
      barColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    },
    {
      id: 'incidents',
      label: 'Incident Desk',
      category: 'core',
      icon: ShieldAlert,
      badge: activeIncidentsCount,
      description: 'Anomaly triage & physical dispatch events',
      accentColor: 'text-rose-500 dark:text-rose-400',
      activeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
      activeBorder: 'border-rose-500/30',
      barColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
    },
    {
      id: 'licensing',
      label: 'Dual Licensing',
      category: 'governance',
      icon: FileCode2,
      description: 'AGPLv3 Community vs Commercial Enterprise',
      accentColor: 'text-sky-500 dark:text-sky-400',
      activeBg: 'bg-sky-500/10 dark:bg-sky-500/15',
      activeBorder: 'border-sky-500/30',
      barColor: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]',
    },
    {
      id: 'cla',
      label: 'GitHub & CLA',
      category: 'governance',
      icon: FileCheck2,
      description: 'Contributor License Agreements & PR bot',
      accentColor: 'text-indigo-500 dark:text-indigo-400',
      activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      activeBorder: 'border-indigo-500/30',
      barColor: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const coreItems = navItems.filter((i) => i.category === 'core');
  const governanceItems = navItems.filter((i) => i.category === 'governance');

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white/95 dark:bg-[#07090E]/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.08] transition-all duration-300 shadow-lg dark:shadow-[4px_0_30px_rgba(0,0,0,0.6)] ${
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01]">
          <div
            onClick={() => handleSelectTab('analytics')}
            className="flex items-center space-x-3 cursor-pointer group overflow-hidden"
          >
            {/* Multi-Colored Geometric Reticle Mark */}
            <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/40 group-hover:border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 rounded-xs rotate-45 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-xs" />
              </div>
            </div>

            {(!isCollapsed || mobileOpen) && (
              <div className="flex flex-col truncate">
                <div className="flex items-center space-x-1">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                    METROPOLIS
                  </span>
                  <span className="font-extrabold text-sm bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                    OS
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tracking-wider">
                  VISION & SENSORS
                </span>
              </div>
            )}
          </div>

          {/* Close button on mobile / Collapse button on desktop */}
          <div className="flex items-center">
            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Nav Item Groups */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* Group 1: Core Platform */}
          <div>
            {(!isCollapsed || mobileOpen) && (
              <div className="px-2.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-gray-500 font-semibold flex items-center justify-between">
                <span>01 / Core Platform</span>
                <span className="text-[9px] text-cyan-500 dark:text-cyan-400">v3.4</span>
              </div>
            )}
            <nav className="space-y-1">
              {coreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={isCollapsed && !mobileOpen ? item.label : undefined}
                    className={`w-full group relative flex items-center rounded-lg transition-all duration-150 text-left cursor-pointer ${
                      isCollapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-2.5 py-2 space-x-2.5'
                    } ${
                      isActive
                        ? `${item.activeBg} ${item.activeBorder} border text-slate-900 dark:text-white shadow-xs`
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? item.accentColor
                            : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-200'
                        }`}
                      />
                      {item.isEnterpriseOnly && currentLicenseMode === 'agpl' && isCollapsed && !mobileOpen && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                          <Lock className="w-1.5 h-1.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    {(!isCollapsed || mobileOpen) && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-medium truncate ${
                              isActive
                                ? 'text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-700 dark:text-gray-300'
                            }`}
                          >
                            {item.label}
                          </span>

                          <div className="flex items-center space-x-1 ml-2 shrink-0">
                            {item.isEnterpriseOnly && currentLicenseMode === 'agpl' && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center space-x-0.5"
                                title="Enterprise Entitlement"
                              >
                                <Lock className="w-2 h-2" />
                                <span>ENT</span>
                              </span>
                            )}
                            {item.isAgent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
                                AGENT
                              </span>
                            )}
                            {item.badge !== undefined && item.badge > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 tabular-nums">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 truncate font-mono mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {isActive && (
                      <div className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r ${item.barColor}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Group 2: Governance & Open Source */}
          <div>
            {(!isCollapsed || mobileOpen) && (
              <div className="px-2.5 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-gray-500 font-semibold flex items-center justify-between">
                <span>02 / Governance</span>
                <span className="text-[9px] text-indigo-500 dark:text-indigo-400">OSS</span>
              </div>
            )}
            <nav className="space-y-1">
              {governanceItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={isCollapsed && !mobileOpen ? item.label : undefined}
                    className={`w-full group relative flex items-center rounded-lg transition-all duration-150 text-left cursor-pointer ${
                      isCollapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-2.5 py-2 space-x-2.5'
                    } ${
                      isActive
                        ? `${item.activeBg} ${item.activeBorder} border text-slate-900 dark:text-white shadow-xs`
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? item.accentColor
                          : 'text-slate-400 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-200'
                      }`}
                    />

                    {(!isCollapsed || mobileOpen) && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-medium truncate ${
                              isActive
                                ? 'text-slate-900 dark:text-white font-semibold'
                                : 'text-slate-700 dark:text-gray-300'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 truncate font-mono mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {isActive && (
                      <div className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r ${item.barColor}`} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Action & Status Footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] space-y-2">
          {/* Data Ingestion Hub Action */}
          {openDataHub && (
            <button
              onClick={() => openDataHub('video')}
              className={`w-full group flex items-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] transition-all cursor-pointer ${
                isCollapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
              }`}
              title="Connect Your Own Data (Video, LiDAR, MQTT, Webhooks)"
            >
              <Database className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              {(!isCollapsed || mobileOpen) && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-xs font-medium">Connect Data</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-white/[0.06] text-slate-600 dark:text-gray-400">
                    HUB
                  </span>
                </div>
              )}
            </button>
          )}

          {/* AI Copilot Action with multi-colored gradient */}
          <button
            onClick={openAiCopilot}
            className={`w-full group flex items-center rounded-lg bg-gradient-to-r from-violet-600/15 via-indigo-600/15 to-cyan-600/15 hover:from-violet-600/25 hover:via-indigo-600/25 hover:to-cyan-600/25 text-violet-700 dark:text-violet-300 border border-violet-500/30 transition-all cursor-pointer ${
              isCollapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
            }`}
            title="Launch Metropolis AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0 group-hover:rotate-12 transition-transform" />
            {(!isCollapsed || mobileOpen) && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">AI Copilot</span>
                <span className="text-[9px] font-mono text-violet-600 dark:text-violet-400 font-bold">READY</span>
              </div>
            )}
          </button>

          {/* Quiet License Status Card */}
          {(!isCollapsed || mobileOpen) && (
            <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.05] text-[10px] font-mono flex items-center justify-between text-slate-500 dark:text-gray-400">
              <span className="text-slate-400 dark:text-gray-500">LICENSE:</span>
              <span
                className={
                  currentLicenseMode === 'commercial'
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-indigo-600 dark:text-indigo-400 font-semibold'
                }
              >
                {currentLicenseMode === 'commercial' ? 'COMMERCIAL' : 'AGPL-3.0'}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
