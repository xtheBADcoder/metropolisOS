/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Play,
  RotateCw,
  Send,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Shield,
  Eye,
  Sliders,
  CheckCircle2,
  Lock,
  Undo2,
} from 'lucide-react';
import {
  AgentMission,
  AgentMode,
  AgentToolCall,
  AutonomousAgentProfile,
} from '../types/agent';
import { CameraFeed, EdgeNode, SecurityIncident, SensorTelemetry } from '../types/metropolis';
import { INITIAL_AGENTS, INITIAL_MISSIONS, executeAgentMission } from '../agent/agentEngine';

interface AgenticOpsViewProps {
  cameras: CameraFeed[];
  nodes: EdgeNode[];
  incidents: SecurityIncident[];
  sensors: SensorTelemetry[];
  onResolveIncident?: (incidentId: string) => void;
  onTuneNode?: (nodeId: string, precision: 'fp8' | 'int8' | 'fp16') => void;
}

export const AgenticOpsView: React.FC<AgenticOpsViewProps> = ({
  cameras,
  nodes,
  incidents,
  sensors,
  onResolveIncident,
  onTuneNode,
}) => {
  const [agents, setAgents] = useState<AutonomousAgentProfile[]>(INITIAL_AGENTS);
  const [missions, setMissions] = useState<AgentMission[]>(INITIAL_MISSIONS);
  const [activeMission, setActiveMission] = useState<AgentMission | null>(INITIAL_MISSIONS[0]);
  const [agentMode, setAgentMode] = useState<AgentMode>('autonomous');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [autonomousLoopActive, setAutonomousLoopActive] = useState<boolean>(true);
  const [lastCycleTime, setLastCycleTime] = useState<string>('Just now');
  const [actionSuccessBanner, setActionSuccessBanner] = useState<string | null>(null);

  // Auto-cycle simulation when autonomous mode is enabled
  useEffect(() => {
    if (!autonomousLoopActive || isProcessing) return;

    const interval = setInterval(() => {
      setLastCycleTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      // Increment cycle count for active agents
      setAgents((prev) =>
        prev.map((a) => ({ ...a, cycleCount: a.cycleCount + 1 }))
      );
    }, 12000);

    return () => clearInterval(interval);
  }, [autonomousLoopActive, isProcessing]);

  const handleRunMission = async (goalText: string) => {
    if (!goalText.trim() || isProcessing) return;
    setIsProcessing(true);
    setActionSuccessBanner(null);

    const updatedMission = await executeAgentMission(
      goalText,
      { cameras, nodes, incidents, sensors },
      agentMode,
      (intermediateMission) => {
        setActiveMission(intermediateMission);
      }
    );

    setActiveMission(updatedMission);
    setMissions((prev) => [updatedMission, ...prev.slice(0, 9)]);
    setIsProcessing(false);
    setCustomGoal('');

    // Trigger physical side effects based on tools called
    updatedMission.toolCalls.forEach((tc) => {
      if (tc.tool === 'tuneInferencePipeline' && onTuneNode) {
        const nodeId = tc.arguments.nodeId || nodes[0]?.id;
        const precision = (tc.arguments.precision as any) || 'fp8';
        onTuneNode(nodeId, precision);
      }
      if (tc.tool === 'resolveSecurityIncident' && onResolveIncident) {
        const incId = tc.arguments.incidentId || incidents[0]?.id;
        if (incId) onResolveIncident(incId);
      }
    });

    setActionSuccessBanner(
      `Mission "${updatedMission.title}" completed! ${updatedMission.toolCalls.length} autonomous tool(s) executed.`
    );
    setTimeout(() => setActionSuccessBanner(null), 5000);
  };

  const handleRollbackTool = (toolId: string) => {
    if (!activeMission) return;

    setActiveMission((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        toolCalls: prev.toolCalls.map((tc) => {
          if (tc.id === toolId) {
            // Revert physical side-effect if applicable
            if (tc.tool === 'tuneInferencePipeline' && onTuneNode) {
              const nodeId = tc.arguments.nodeId || nodes[0]?.id;
              onTuneNode(nodeId, 'fp16');
            }
            return {
              ...tc,
              status: 'failed' as const,
              result: 'Action reverted & rolled back to safe baseline by Operator.',
            };
          }
          return tc;
        }),
      };
    });

    setActionSuccessBanner(`Tool action ${toolId} successfully rolled back to safe state.`);
    setTimeout(() => setActionSuccessBanner(null), 4000);
  };

  const presetScenarios = [
    {
      title: 'Perimeter Breach & Drone Intercept',
      desc: 'Investigate unauthorized motion at Gate 04, dispatch Drone SkyEye-01, and lock PTZ camera.',
      goal: 'Investigate perimeter tripwire breach at Gate 04, dispatch tactical drone for thermal tracking, and focus PTZ camera on unauthorized subject.',
      agent: 'Perimeter Threat Sentinel',
      icon: Eye,
      color: 'border-emerald-500/40 text-emerald-400',
    },
    {
      title: 'Edge Node Overheat & FP8 Precision Auto-Tune',
      desc: 'Orin Edge node temperature exceeding 68°C. Switch pipeline to TensorRT FP8 precision.',
      goal: 'Orin Edge North node GPU thermals high. Optimize TensorRT pipeline: switch precision to FP8 and throttle batch to 4 to stabilize below 60°C.',
      agent: 'Edge Fleet Thermal Regulator',
      icon: Cpu,
      color: 'border-cyan-500/40 text-cyan-400',
    },
    {
      title: 'AGPLv3 & CLA Compliance Audit',
      desc: 'Verify network source code disclosure offer on RTSP feeds and audit PR contributor signatures.',
      goal: 'Audit network RTSP endpoints for AGPLv3 Section 13 compliance and run automated CLA validation on pending pull requests.',
      agent: 'Licensing & CLA Governance Sentinel',
      icon: Shield,
      color: 'border-purple-500/40 text-purple-400',
    },
    {
      title: 'Sector 4 Lockdown & Siren Alert',
      desc: 'Deploy zone isolation barriers and trigger optical deterrent strobe beacons.',
      goal: 'Execute localized lockdown protocol in Sector 4 Logistics yard: trigger visual warning strobes and isolate perimeter gate access barriers.',
      agent: 'Perimeter Threat Sentinel',
      icon: Lock,
      color: 'border-amber-500/40 text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Agentic Engine Overview (Frosted Glass) */}
      <div className="bg-gradient-to-r from-[#0B0E14]/85 via-[#111726]/75 to-[#0B0E14]/85 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#76B900]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-xl bg-[#76B900]/15 text-[#88D600] border border-[#76B900]/30 shadow-[0_0_15px_rgba(118,185,0,0.25)] flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-extrabold text-white">
                    Autonomous AI Operations Center
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#76B900]/20 text-[#88D600] border border-[#76B900]/40 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76B900] animate-ping"></span>
                    <span>AGENTIC LOOP ACTIVE</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Metropolis AI Agentic Engine continuously perceives video streams, LiDAR/Radar fusion, and edge cluster thermals. It formulates multi-step reasoning plans and invokes physical remediation tools autonomously.
                </p>
              </div>
            </div>
          </div>

          {/* Autonomy Mode Switcher (macOS Pill Control) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-black/50 backdrop-blur-xl p-1 rounded-xl border border-white/[0.08] flex items-center space-x-1 shadow-inner text-xs font-mono">
              <button
                onClick={() => setAgentMode('autonomous')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  agentMode === 'autonomous'
                    ? 'bg-[#76B900] text-black font-bold shadow-[0_0_12px_rgba(118,185,0,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Full Autonomy</span>
              </button>

              <button
                onClick={() => setAgentMode('semi-autonomous')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  agentMode === 'semi-autonomous'
                    ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Human-in-the-Loop</span>
              </button>
            </div>

            {/* Quick Trigger Button */}
            <button
              onClick={() => handleRunMission('Perform automated perception scan across all 6 camera feeds and rebalance edge pipelines.')}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] text-xs font-mono font-semibold transition-all flex items-center space-x-2 backdrop-blur-md disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#76B900] ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Trigger Perception Cycle</span>
            </button>
          </div>
        </div>

        {/* Success toast banner */}
        {actionSuccessBanner && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fadeIn backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessBanner}</span>
          </div>
        )}
      </div>

      {/* Autonomous Agents Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all hover:border-white/[0.2]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
                  style={{
                    backgroundColor: `${agent.avatarColor}15`,
                    borderColor: `${agent.avatarColor}40`,
                    color: agent.avatarColor,
                  }}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                  <p className="text-[11px] text-gray-400">{agent.role}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-black/30 p-2 rounded-xl border border-white/[0.04]">
                <span className="text-gray-400 text-[10px] block">Perception Cycles</span>
                <span className="text-white font-bold">{agent.cycleCount.toLocaleString()}</span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/[0.04]">
                <span className="text-gray-400 text-[10px] block">Actions Executed</span>
                <span className="text-[#88D600] font-bold">{agent.actionsExecuted}</span>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Agent Capabilities:</span>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 2).map((cap, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-gray-300 border border-white/[0.06]"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Execution Arena: Directive Console + Live Chain-of-Thought */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): Interactive Mission Dispatcher & Preset Scenarios */}
        <div className="lg:col-span-5 space-y-4">
          {/* Mission Dispatch Console */}
          <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <Terminal className="w-4 h-4 text-[#76B900]" />
              <h3 className="font-bold text-sm">Issue Agent Mission Directive</h3>
            </div>
            <p className="text-xs text-gray-400">
              Instruct the Metropolis Agent in natural language. The agent will formulate a plan, assess security/thermal risk, and execute tools.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunMission(customGoal);
              }}
              className="space-y-3"
            >
              {/* Autonomy Mode Selector */}
              <div className="flex items-center space-x-1 p-1 bg-black/50 rounded-xl border border-white/[0.08] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAgentMode('autonomous')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                    agentMode === 'autonomous'
                      ? 'bg-[#76B900]/25 text-[#88D600] border border-[#76B900]/40 font-bold shadow-[0_0_8px_rgba(118,185,0,0.2)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Autonomous
                </button>
                <button
                  type="button"
                  onClick={() => setAgentMode('semi-autonomous')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                    agentMode === 'semi-autonomous'
                      ? 'bg-blue-500/25 text-blue-300 border border-blue-500/40 font-bold shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Semi-Auto
                </button>
                <button
                  type="button"
                  onClick={() => setAgentMode('manual')}
                  className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                    agentMode === 'manual'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Manual Approval
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Inspect perimeter line at Gate 04, deploy tactical drone, and auto-tune Orin node to FP8..."
                  rows={3}
                  className="w-full bg-[#111622]/80 text-white border border-white/[0.1] rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md resize-none shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !customGoal.trim()}
                className="w-full py-2.5 rounded-xl bg-[#76B900] hover:bg-[#88D600] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs font-mono transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(118,185,0,0.3)]"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Agent Deliberating & Executing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Autonomous Directive</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Preset Scenarios */}
          <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Autonomous Scenario Presets</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">1-Click Trigger</span>
            </div>

            <div className="space-y-2">
              {presetScenarios.map((sc, i) => {
                const Icon = sc.icon;
                return (
                  <div
                    key={i}
                    onClick={() => handleRunMission(sc.goal)}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] cursor-pointer transition-all group backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${sc.color.split(' ')[1]}`} />
                        <span className="font-semibold text-white text-xs group-hover:text-[#88D600] transition-colors">
                          {sc.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {sc.desc}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
                      <span>Assigned: {sc.agent}</span>
                      <span className="text-[#76B900]">Execute →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col (7 cols): Live Chain-of-Thought Reasoning & Tool Execution Log */}
        <div className="lg:col-span-7 space-y-4">
          {activeMission && (
            <div className="bg-[#0B0E14]/75 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-4">
              {/* Mission Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-gray-400">Mission ID: {activeMission.id}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-xs font-mono text-[#88D600]">{activeMission.assignedAgent}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    {activeMission.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="px-2.5 py-1 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono flex items-center space-x-1.5">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-[#88D600] font-bold">{activeMission.confidence}%</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono uppercase font-bold border ${
                      activeMission.status === 'completed'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                        : 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {activeMission.status}
                  </span>
                </div>
              </div>

              {/* Chain of Thought (Reasoning Steps) */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-[#76B900]" />
                  <span>Agent Chain-of-Thought (Reasoning Trace)</span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  {activeMission.thoughts.map((thought, idx) => {
                    const phaseColors: Record<string, string> = {
                      PERCEIVE: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
                      THINK: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
                      DECIDE: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
                      ACT: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
                      VERIFY: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
                    };

                    return (
                      <div
                        key={thought.id || idx}
                        className="p-3 rounded-xl bg-black/35 border border-white/[0.06] backdrop-blur-md space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                phaseColors[thought.phase] || 'bg-gray-800 text-gray-300'
                              }`}
                            >
                              [{thought.phase}]
                            </span>
                            <span className="text-gray-400 text-[11px]">{thought.timestamp}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Confidence {thought.confidence}%
                          </span>
                        </div>

                        <p className="text-gray-200 text-xs leading-relaxed pl-1 pt-1">
                          {thought.message}
                        </p>

                        {thought.detail && (
                          <p className="text-gray-400 text-[11px] pl-1 font-sans italic">
                            ↳ {thought.detail}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tool Execution Ledger */}
              {activeMission.toolCalls.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-[#76B900]" />
                    <span>Physical Tool Invocations & Verification Ledger</span>
                  </div>

                  <div className="space-y-2">
                    {activeMission.toolCalls.map((tc) => (
                      <div
                        key={tc.id}
                        className="p-3.5 rounded-xl bg-[#090D14]/80 border border-white/[0.08] backdrop-blur-md space-y-2 text-xs font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-[#76B900]/15 text-[#88D600] border border-[#76B900]/30 font-bold">
                              {tc.tool}
                            </span>
                            <span className="text-gray-400 text-[11px]">{tc.timestamp}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 text-[10px]">{tc.executionTimeMs}ms</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                              {tc.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-300 text-xs font-sans">
                          {tc.description}
                        </p>

                        {/* Tool Arguments */}
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] text-gray-300">
                          <span className="text-gray-500 block mb-0.5 text-[10px]">PAYLOAD ARGUMENTS:</span>
                          <pre className="text-xs text-[#88D600] overflow-x-auto">
                            {JSON.stringify(tc.arguments, null, 2)}
                          </pre>
                        </div>

                        {tc.result && (
                          <div className="text-[11px] text-emerald-400 flex items-center space-x-1.5 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{tc.result}</span>
                          </div>
                        )}

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500 border-t border-white/[0.04]">
                          <div className="flex items-center space-x-1 font-mono">
                            <span>Hash:</span>
                            <span className="text-gray-400">{tc.securityHash}</span>
                          </div>

                          {tc.status !== 'failed' && (
                            <button
                              onClick={() => handleRollbackTool(tc.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                              title="Revert and rollback this tool action"
                            >
                              <Undo2 className="w-3 h-3" />
                              <span>Rollback Action</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
