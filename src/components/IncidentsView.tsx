import React, { useState } from 'react';
import { SecurityIncident, CameraFeed } from '../types/metropolis';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  UserCheck,
  Tag,
  Filter,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';

interface IncidentsViewProps {
  incidents: SecurityIncident[];
  cameras: CameraFeed[];
  onSelectCamera: (cam: CameraFeed) => void;
  onUpdateIncidentStatus: (id: string, status: SecurityIncident['status']) => void;
  onOpenAiForIncident: (incident: SecurityIncident) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  cameras,
  onSelectCamera,
  onUpdateIncidentStatus,
  onOpenAiForIncident,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(
    incidents[0] || null
  );

  const filtered = incidents.filter((inc) => {
    const matchesSev = filterSeverity === 'all' || inc.severity === filterSeverity;
    const matchesStat = filterStatus === 'all' || inc.status === filterStatus;
    return matchesSev && matchesStat;
  });

  const getSeverityBadge = (sev: SecurityIncident['severity']) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/50';
      case 'high':
        return 'bg-orange-950/70 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/50';
      default:
        return 'bg-blue-950/70 text-blue-300 border-blue-500/50';
    }
  };

  const activeCount = incidents.filter((i) => i.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Top Incident KPIs (Frosted Glass Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] p-4 rounded-2xl shadow-xl">
          <div className="text-[11px] font-mono text-gray-400">ACTIVE UNRESOLVED INCIDENTS</div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 flex items-center space-x-2">
            <span>{activeCount}</span>
            {activeCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Automated AI Trigger</div>
        </div>

        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] p-4 rounded-2xl shadow-xl">
          <div className="text-[11px] font-mono text-gray-400">MEAN TIME TO DETECT (MTTD)</div>
          <div className="text-2xl font-bold font-mono text-[#88D600] mt-1">1.24s</div>
          <div className="text-[10px] text-gray-400 mt-0.5">DeepStream TRT Hardware Sync</div>
        </div>

        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] p-4 rounded-2xl shadow-xl">
          <div className="text-[11px] font-mono text-gray-400">FALSE POSITIVE SUPPRESSION</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">99.7%</div>
          <div className="text-[10px] text-[#88D600] mt-0.5">Multi-Sensor Validation Filter</div>
        </div>

        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] p-4 rounded-2xl shadow-xl">
          <div className="text-[11px] font-mono text-gray-400">TOTAL LOGGED TODAY</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{incidents.length}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Across 6 Enterprise Sectors</div>
        </div>
      </div>

      {/* Main Grid: Incident List (Left) & Incident Detail / Triage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List (2 Cols - Main Glass Container) */}
        <div className="lg:col-span-2 bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3 mb-4">
              <div className="flex items-center space-x-3">

                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <h3 className="font-bold text-white text-base">Metropolis Incident Desk</h3>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-2.5 py-1 text-xs font-mono backdrop-blur-md"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="info">Info</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-2.5 py-1 text-xs font-mono backdrop-blur-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filtered.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-white/[0.1] border-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.2)]'
                        : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(
                            inc.severity
                          )}`}
                        >
                          {inc.severity}
                        </span>
                        <span className="font-bold text-white text-xs">{inc.title}</span>
                      </div>

                      <span className="text-[10px] font-mono text-gray-400">{inc.timestamp}</span>
                    </div>

                    <p className="text-xs text-gray-300 mb-2">{inc.description}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#76B900]" />
                          <span>{inc.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Camera className="w-3 h-3 text-blue-400" />
                          <span>{inc.cameraName}</span>
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inc.status === 'active'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : inc.status === 'investigating'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-950/80 text-[#88D600] border border-[#76B900]/40'
                        }`}
                      >
                        {inc.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Incident Deep Triage (Sidebar Panel) */}
        {selectedIncident && (
          <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-400">INCIDENT ID: #{selectedIncident.id}</span>
                  <h3 className="font-bold text-white text-sm mt-0.5">{selectedIncident.title}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(
                    selectedIncident.severity
                  )}`}
                >
                  {selectedIncident.severity}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-mono text-[11px] block mb-0.5">DESCRIPTION</span>
                  <p className="text-gray-200 leading-relaxed bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/[0.08]">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/[0.08]">
                    <span className="text-gray-500 block">LOCATION</span>
                    <span className="text-white font-semibold">{selectedIncident.location}</span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/[0.08]">
                    <span className="text-gray-500 block">DETECTED BY</span>
                    <span className="text-[#88D600] font-semibold truncate block">
                      {selectedIncident.detectedBy}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 font-mono text-[11px] block mb-1">EVENT TAGS</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedIncident.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141B26] text-gray-300 border border-[#232D40]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                  {/* AI Root Cause Analysis button */}
                <button
                  onClick={() => onOpenAiForIncident(selectedIncident)}
                  className="w-full py-2.5 rounded-xl bg-[#76B900]/15 hover:bg-[#76B900]/25 text-[#88D600] border border-[#76B900]/40 font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-all backdrop-blur-md shadow-[0_0_15px_rgba(118,185,0,0.2)]"
                >
                  <Sparkles className="w-4 h-4 text-[#76B900]" />
                  <span>Ask Metropolis Copilot for Triage Plan</span>
                </button>
              </div>
            </div>

            {/* Incident Status Transitions */}
            <div className="mt-5 pt-3 border-t border-white/[0.08] space-y-2">
              <span className="text-[11px] font-mono text-gray-400 block">UPDATE INCIDENT WORKFLOW:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'active')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold transition-all backdrop-blur-md ${
                    selectedIncident.status === 'active'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  ACTIVE
                </button>
                <button
                  onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'investigating')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold transition-all backdrop-blur-md ${
                    selectedIncident.status === 'investigating'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  INVESTIGATE
                </button>
                <button
                  onClick={() => onUpdateIncidentStatus(selectedIncident.id, 'resolved')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold transition-all backdrop-blur-md ${
                    selectedIncident.status === 'resolved'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  RESOLVE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
