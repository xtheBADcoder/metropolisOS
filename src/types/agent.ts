/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentMode = 'autonomous' | 'semi-autonomous' | 'manual';

export type AgentMissionStatus = 'idle' | 'perceiving' | 'reasoning' | 'executing' | 'completed' | 'failed' | 'awaiting_approval';

export type ToolName =
  | 'dispatchDronePatrol'
  | 'adjustPtzCamera'
  | 'tuneInferencePipeline'
  | 'quarantineZoneLockdown'
  | 'auditLicenseCompliance'
  | 'resolveSecurityIncident'
  | 'triggerSensorDiagnostics';

export interface AgentToolCall {
  id: string;
  tool: ToolName;
  description: string;
  arguments: Record<string, any>;
  status: 'pending' | 'executing' | 'approved' | 'rejected' | 'completed' | 'failed';
  result?: string;
  executionTimeMs?: number;
  timestamp: string;
  securityHash: string;
}

export interface AgentThoughtStep {
  id: string;
  phase: 'PERCEIVE' | 'THINK' | 'DECIDE' | 'ACT' | 'VERIFY';
  message: string;
  detail?: string;
  confidence: number; // 0-100%
  timestamp: string;
}

export interface AgentMission {
  id: string;
  title: string;
  goal: string;
  status: AgentMissionStatus;
  startedAt: string;
  completedAt?: string;
  thoughts: AgentThoughtStep[];
  toolCalls: AgentToolCall[];
  confidence: number;
  assignedAgent: string;
}

export interface AutonomousAgentProfile {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'standby' | 'processing';
  avatarColor: string;
  cycleCount: number;
  actionsExecuted: number;
  capabilities: string[];
}
