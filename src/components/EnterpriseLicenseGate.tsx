import React from 'react';
import {
  Lock,
  ShieldAlert,
  Sparkles,
  Server,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Key,
  Layers,
  Zap,
} from 'lucide-react';
import { LicenseMode } from '../types/metropolis';

interface EnterpriseLicenseGateProps {
  featureName: string;
  featureDescription: string;
  category: 'cloud_orchestration' | 'ai_training';
  currentMode: LicenseMode;
  onActivateEvalLicense: () => void;
  onNavigateToLicensing: () => void;
  onBypassPreview?: () => void;
  children: React.ReactNode;
}

export const EnterpriseLicenseGate: React.FC<EnterpriseLicenseGateProps> = ({
  featureName,
  featureDescription,
  category,
  currentMode,
  onActivateEvalLicense,
  onNavigateToLicensing,
  onBypassPreview,
  children,
}) => {
  // If in commercial mode, render normal content
  if (currentMode === 'commercial') {
    return <>{children}</>;
  }

  const isTraining = category === 'ai_training';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Enterprise Gate Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0F1420] to-[#080B10] border border-[#76B900]/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(118,185,0,0.12)]">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#76B900]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          {/* Header pill */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#76B900]/15 text-[#88D600] border border-[#76B900]/40 text-xs font-mono font-bold tracking-wide">
              <Lock className="w-3.5 h-3.5" />
              <span>COMMERCIAL ENTERPRISE ENTITLEMENT</span>
            </span>
            <span className="text-xs font-mono text-gray-500 hidden sm:inline">
              GNU AGPL-3.0 Community Tier Active
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide flex items-center space-x-2">
            <span>{featureName}</span>
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            {featureDescription}
          </p>

          {/* Entitlement breakdown comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
              <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
                Current: Community AGPL-3.0
              </span>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li className="flex items-start space-x-2">
                  <span className="text-gray-600 mt-0.5">&bull;</span>
                  <span>Single-node local inference (Jetson / RTX workstation)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-gray-600 mt-0.5">&bull;</span>
                  <span>Pre-trained baseline model weights only</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-gray-600 mt-0.5">&bull;</span>
                  <span className="text-amber-400/90">Source copyleft applies if offered over network</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#76B900]/08 border border-[#76B900]/30 space-y-2">
              <span className="text-[11px] font-mono font-bold text-[#88D600] uppercase tracking-wider block">
                Enterprise Commercial Tier
              </span>
              <ul className="text-xs text-gray-200 space-y-1.5">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] shrink-0 mt-0.5" />
                  <span>
                    {isTraining
                      ? 'Distributed GPU fine-tuning (NVIDIA TAO + LoRA / QLoRA)'
                      : 'Multi-node Kubernetes cluster mesh with dynamic autoscaling'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] shrink-0 mt-0.5" />
                  <span>
                    {isTraining
                      ? 'Automated TensorRT INT8/FP8 quantization & edge deployment'
                      : 'Triton Core load-balancer with sub-2ms multi-camera routing'}
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] shrink-0 mt-0.5" />
                  <span>Full closed-source proprietary waiver & air-gapped SLA</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onActivateEvalLicense}
              className="px-5 py-2.5 rounded-xl bg-[#76B900] hover:bg-[#88D600] text-black font-bold text-xs transition-all shadow-[0_0_25px_rgba(118,185,0,0.35)] cursor-pointer flex items-center space-x-2 group"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>Activate 1-Year Commercial Evaluation (Instant Unlock)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onNavigateToLicensing}
              className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2"
            >
              <Key className="w-3.5 h-3.5 text-gray-300" />
              <span>Enter Existing Commercial License Key</span>
            </button>

            {onBypassPreview && (
              <button
                onClick={onBypassPreview}
                className="px-3.5 py-2.5 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                Inspect Mock Telemetry (Preview Only)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dimmed Preview of the underlying workspace for preview feel */}
      <div className="opacity-35 pointer-events-none filter blur-[1px] select-none transition-all">
        {children}
      </div>
    </div>
  );
};
