import React, { useState } from 'react';
import { CommercialLicenseDetails, LicenseMode } from '../types/metropolis';
import { SAMPLE_COMMERCIAL_LICENSE } from '../data/mockData';
import {
  FileCode2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Key,
  Download,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';

interface DualLicensingViewProps {
  currentMode: LicenseMode;
  onSetLicenseMode: (mode: LicenseMode) => void;
  commercialDetails: CommercialLicenseDetails;
  onUpdateCommercialDetails: (details: CommercialLicenseDetails) => void;
}

export const DualLicensingView: React.FC<DualLicensingViewProps> = ({
  currentMode,
  onSetLicenseMode,
  commercialDetails,
  onUpdateCommercialDetails,
}) => {
  const [inputKey, setInputKey] = useState<string>(commercialDetails.licenseKey);
  const [orgInput, setOrgInput] = useState<string>(commercialDetails.orgName);
  const [tierInput, setTierInput] = useState<CommercialLicenseDetails['tier']>(commercialDetails.tier);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(null);
  const [activeLicenseTab, setActiveLicenseTab] = useState<'matrix' | 'legal_text' | 'faq'>('matrix');

  const handleValidateAndApply = () => {
    if (!inputKey || inputKey.length < 10) {
      alert('Please enter a valid Metropolis Enterprise License Key format (e.g. NV-METRO-ENT-XXXX-XXXX).');
      return;
    }

    const updated: CommercialLicenseDetails = {
      ...commercialDetails,
      licenseKey: inputKey.toUpperCase().trim(),
      orgName: orgInput.trim() || 'Enterprise Licensee',
      tier: tierInput,
    };

    onUpdateCommercialDetails(updated);
    onSetLicenseMode('commercial');
    setValidationSuccess(`Commercial Enterprise license verified & activated for "${updated.orgName}".`);
    setTimeout(() => setValidationSuccess(null), 4000);
  };

  const handleGenerateEvalLicense = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `NV-METRO-EVAL-2026-${randomHex}-ENT`;
    setInputKey(newKey);
    const updated: CommercialLicenseDetails = {
      tier: 'Enterprise Scale',
      licenseKey: newKey,
      orgName: orgInput.trim() || 'Global Robotics & Vision Inc.',
      issuedAt: '2026-10-20',
      expiresAt: '2027-10-20',
      maxEdgeNodes: 500,
      maxVideoStreams: 2000,
      hasSLA: true,
      closedSourcePermitted: true,
      airgappedDeployments: true,
      dedicatedEnterpriseSupport: true,
    };
    onUpdateCommercialDetails(updated);
    onSetLicenseMode('commercial');
    setValidationSuccess('Generated and applied 1-Year Commercial Enterprise Evaluation License!');
    setTimeout(() => setValidationSuccess(null), 4000);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(commercialDetails.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const AGPL_TEXT = `GNU AFFERO GENERAL PUBLIC LICENSE (AGPLv3)
Version 3, 20 October 2026

Copyright (C) 2026 Metropolis Analytics Platform Open Source Contributors.

Everyone is permitted to copy and distribute verbatim copies of this license document.

Preamble
The GNU Affero General Public License is a free, copyleft license for software and other
kinds of works, specifically designed to ensure cooperation with the community in the
case of network server software.

Section 13: Remote Network Interaction; Use with the GNU General Public License.
Notwithstanding any other provision of this License, if you modify the Program, your
modified version must prominently offer all users interacting with it remotely through
a computer network (such as network video analytics RTSP streams, web consoles, or APIs)
an opportunity to receive the Corresponding Source of your version by providing access
to the Corresponding Source from a network server at no charge...`;

  const COMMERCIAL_TEXT = `METROPOLIS ANALYTICS PLATFORM COMMERCIAL ENTERPRISE LICENSE AGREEMENT
Version 3.4 (Proprietary / Closed-Source Permitted / Powered by Metropolis)

1. GRANT OF LICENSE.
Subject to the terms and payment of applicable enterprise tier fees, Metropolis Analytics Platform
grants Licensee a non-exclusive, worldwide, perpetual right to:
(a) Install, deploy, and scale the Metropolis Platform on unlimited edge appliances,
    accelerator nodes, and server clusters up to the contracted node ceiling.
(b) Integrate proprietary closed-source deep learning models, plugins, and custom UI
    WITHOUT ANY REQUIREMENT TO DISCLOSE SOURCE CODE UNDER COPYLEFT OR AGPLv3.
(c) Embed within OEM hardware appliances, industrial robotics, and air-gapped security networks.
(d) Receive 24/7 Enterprise SLA response within 60 minutes for Tier-1 video pipeline outages.`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/90 dark:bg-gradient-to-r dark:from-[#0B0E14]/80 dark:via-[#111724]/70 dark:to-[#0B0E14]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 shadow-sm dark:shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-xs">
                <FileCode2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Dual-Licensing Governance Center</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-2xl">
              Metropolis Analytics Platform is engineered with a transparent dual-licensing framework with Metropolis under the hood.
              Choose between community open-source <strong className="text-slate-800 dark:text-white">GNU AGPLv3</strong> or our{' '}
              <strong className="text-amber-600 dark:text-amber-400">Commercial Enterprise License</strong> designed for proprietary,
              air-gapped, and closed-source enterprise deployments.
            </p>
          </div>

          {/* Current Mode Toggle Switcher */}
          <div className="bg-slate-100 dark:bg-black/40 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] flex items-center space-x-2">
            <button
              onClick={() => onSetLicenseMode('agpl')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                currentMode === 'agpl'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>GNU AGPL-3.0 (OSS)</span>
            </button>

            <button
              onClick={() => onSetLicenseMode('commercial')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                currentMode === 'commercial'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>COMMERCIAL ENTERPRISE</span>
            </button>
          </div>
        </div>

        {validationSuccess && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center space-x-2 animate-fadeIn shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{validationSuccess}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-1">
        <button
          onClick={() => setActiveLicenseTab('matrix')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-t-xl transition-all backdrop-blur-md ${
            activeLicenseTab === 'matrix'
              ? 'bg-white/[0.08] text-white border-t-2 border-[#76B900]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          License Matrix & Comparison
        </button>
        <button
          onClick={() => setActiveLicenseTab('legal_text')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-t-xl transition-all backdrop-blur-md ${
            activeLicenseTab === 'legal_text'
              ? 'bg-white/[0.08] text-white border-t-2 border-[#76B900]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          Full Legal License Text
        </button>
        <button
          onClick={() => setActiveLicenseTab('faq')}
          className={`px-4 py-2 text-xs font-bold font-mono rounded-t-xl transition-all backdrop-blur-md ${
            activeLicenseTab === 'faq'
              ? 'bg-white/[0.08] text-white border-t-2 border-[#76B900]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
          }`}
        >
          Enterprise Dual-Licensing FAQ
        </button>
      </div>

      {/* TAB 1: Comparison Matrix */}
      {activeLicenseTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparison Table (2 Cols - Main Glass Container) */}
          <div className="lg:col-span-2 bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">

              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#76B900]" />
                <span>Entitlement & Legal Rights Matrix</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-gray-400 text-[10px] uppercase">
                    <th className="pb-3">Capability / Term</th>
                    <th className="pb-3 text-blue-400">GNU AGPLv3 (Community)</th>
                    <th className="pb-3 text-[#88D600]">Commercial Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">Full Source Code Access</td>
                    <td className="py-3 text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Included on GitHub
                    </td>
                    <td className="py-3 text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Included + Private Repo
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">Closed-Source Proprietary Use</td>
                    <td className="py-3 text-rose-400 flex items-center">
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Prohibited (Network Copyleft)
                    </td>
                    <td className="py-3 text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 100% Permitted
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">Network Service Trigger (SaaS)</td>
                    <td className="py-3 text-amber-400">Must open-source all changes</td>
                    <td className="py-3 text-emerald-400">No source disclosure required</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">Proprietary DeepStream TensorRT Plugins</td>
                    <td className="py-3 text-gray-400">Community plugins only</td>
                    <td className="py-3 text-[#88D600] font-bold">FP8 & Quantized Acceleration Pack</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">Air-Gapped & High-Security Datacenters</td>
                    <td className="py-3 text-gray-400">Community audit</td>
                    <td className="py-3 text-emerald-400">Certified for DoD / Classified Air-gap</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">Cloud Fleet & K8s Triton Mesh</td>
                    <td className="py-3 text-gray-400 flex items-center">
                      <Lock className="w-3.5 h-3.5 text-amber-400 mr-1" /> Single-Node Local Only
                    </td>
                    <td className="py-3 text-[#88D600] font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] mr-1" /> Multi-Node Triton K8s Fleet
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">AI Model & Agent Training (TAO + LoRA)</td>
                    <td className="py-3 text-gray-400 flex items-center">
                      <Lock className="w-3.5 h-3.5 text-amber-400 mr-1" /> Pre-trained Weights Only
                    </td>
                    <td className="py-3 text-[#88D600] font-bold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] mr-1" /> Distributed GPU Training & TRT Export
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">SLA & Engineering Support</td>
                    <td className="py-3 text-gray-400">Community GitHub Discussions</td>
                    <td className="py-3 text-[#88D600] font-bold">24/7 1-Hour SLA + Partner Team</td>
                  </tr>

                  <tr className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 font-semibold text-white">OEM Hardware Embedding</td>
                    <td className="py-3 text-rose-400">Requires AGPL viral license</td>
                    <td className="py-3 text-emerald-400">Royalty-Free OEM White-labeling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* License Key Generator / Commercial Activator (Sidebar Panel) */}
          <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Key className="w-5 h-5 text-[#76B900]" />
                <h3 className="font-bold text-white text-base">Commercial Key Activator</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Enter your commercial license token to unlock enterprise scalability, unlimited video streams, and remove copyleft source disclosure obligations.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Organization / Enterprise Name
                  </label>
                  <input
                    type="text"
                    value={orgInput}
                    onChange={(e) => setOrgInput(e.target.value)}
                    placeholder="e.g. Acme Autonomous Logistics"
                    className="w-full bg-[#080B10] text-gray-200 border border-[#232D40] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    License Tier
                  </label>
                  <select
                    value={tierInput}
                    onChange={(e) => setTierInput(e.target.value as any)}
                    className="w-full bg-[#080B10] text-gray-200 border border-[#232D40] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900]"
                  >
                    <option value="Developer Pro">Developer Pro (Up to 25 Nodes)</option>
                    <option value="Enterprise Scale">Enterprise Scale (Up to 500 Nodes)</option>
                    <option value="OEM Embedded">OEM Embedded (Unlimited Appliances)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    License Key
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputKey}
                      onChange={(e) => setInputKey(e.target.value)}
                      placeholder="NV-METRO-ENT-XXXX-XXXX"
                      className="w-full bg-[#080B10] text-[#88D600] font-mono border border-[#232D40] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#76B900]"
                    />
                    <button
                      onClick={copyKey}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
                      title="Copy Key"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-[#76B900]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    onClick={handleValidateAndApply}
                    className="w-full py-2.5 rounded-xl bg-[#76B900] hover:bg-[#88D600] text-black font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(118,185,0,0.3)] cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply & Verify Commercial License</span>
                  </button>

                  <button
                    onClick={handleGenerateEvalLicense}
                    className="w-full py-2 rounded-xl bg-[#151D2A] hover:bg-[#1E2838] text-gray-200 border border-[#2B354A] font-mono text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#76B900]" />
                    <span>Generate 1-Year Enterprise Eval Key</span>
                  </button>

                  {currentMode === 'commercial' ? (
                    <button
                      onClick={() => {
                        onSetLicenseMode('agpl');
                        setValidationSuccess('Switched to GNU AGPL-3.0 Community Mode (Gated Enterprise features active).');
                        setTimeout(() => setValidationSuccess(null), 4000);
                      }}
                      className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Switch to AGPL-3.0 Community (Test Gated Mode)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateEvalLicense}
                      className="w-full py-2 rounded-xl bg-[#76B900]/20 hover:bg-[#76B900]/30 text-[#88D600] border border-[#76B900]/40 font-mono text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Switch to Commercial Enterprise Mode</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* License details card */}
            <div className="mt-4 pt-3 border-t border-[#1E2638] text-[11px] font-mono text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>ACTIVE TIER:</span>
                <span className="text-white font-bold">{commercialDetails.tier}</span>
              </div>
              <div className="flex justify-between">
                <span>MAX STREAMS:</span>
                <span className="text-[#88D600] font-bold">{commercialDetails.maxVideoStreams} Concurrent</span>
              </div>
              <div className="flex justify-between">
                <span>EXPIRY:</span>
                <span className="text-gray-300">{commercialDetails.expiresAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Legal Text */}
      {activeLicenseTab === 'legal_text' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0B0E14] border border-[#1E2638] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm font-mono text-blue-400">
                LICENSE-AGPL-3.0.txt
              </h3>
              <button
                onClick={() => {
                  const blob = new Blob([AGPL_TEXT], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'LICENSE-AGPL-3.0.txt';
                  a.click();
                }}
                className="flex items-center space-x-1 text-xs font-mono text-gray-300 hover:text-white px-2 py-1 rounded bg-[#18202F]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
            <pre className="bg-[#05070B] p-4 rounded-xl border border-[#161D2B] font-mono text-[10px] text-gray-300 max-h-[400px] overflow-y-auto leading-relaxed">
              {AGPL_TEXT}
            </pre>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E2638] rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-sm font-mono text-[#88D600]">
                LICENSE-COMMERCIAL-ENTERPRISE.txt
              </h3>
              <button
                onClick={() => {
                  const blob = new Blob([COMMERCIAL_TEXT], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'LICENSE-COMMERCIAL-ENTERPRISE.txt';
                  a.click();
                }}
                className="flex items-center space-x-1 text-xs font-mono text-gray-300 hover:text-white px-2 py-1 rounded bg-[#18202F]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
            <pre className="bg-[#05070B] p-4 rounded-xl border border-[#161D2B] font-mono text-[10px] text-gray-300 max-h-[400px] overflow-y-auto leading-relaxed">
              {COMMERCIAL_TEXT}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeLicenseTab === 'faq' && (
        <div className="bg-[#0B0E14] border border-[#1E2638] rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-[#76B900]" />
            <span>Frequently Asked Questions regarding Dual-Licensing</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0F141E] border border-[#1E2638] space-y-1.5">
              <h4 className="font-bold text-white">Why use AGPLv3 for the open-source edition?</h4>
              <p className="text-gray-400 leading-relaxed">
                AGPLv3 ensures that cloud providers or large enterprises cannot take the open-source Metropolis codebase, host it as a proprietary cloud service over the network, and withhold their improvements from the community. It protects open-source contributors while keeping the code freely accessible.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141E] border border-[#1E2638] space-y-1.5">
              <h4 className="font-bold text-white">When do I need a Commercial Enterprise License?</h4>
              <p className="text-gray-400 leading-relaxed">
                You require a Commercial License if your organization cannot open-source proprietary extensions, if you are embedding Metropolis in a closed-source appliance or OEM hardware, or if your enterprise policy forbids copyleft software. It also provides guaranteed SLAs and 24/7 dedicated engineering support.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141E] border border-[#1E2638] space-y-1.5">
              <h4 className="font-bold text-white">How does the Contributor License Agreement (CLA) relate?</h4>
              <p className="text-gray-400 leading-relaxed">
                The CLA gives the Metropolis project the intellectual property rights necessary to dual-license contributions under both AGPLv3 and the commercial license, ensuring seamless enterprise legal compliance without patent ambiguity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0F141E] border border-[#1E2638] space-y-1.5">
              <h4 className="font-bold text-white">Can I run the platform completely air-gapped?</h4>
              <p className="text-gray-400 leading-relaxed">
                Yes. The Commercial Enterprise tier allows completely offline, zero-telemetry installations on private sovereign cloud or edge clusters with node-locked offline license keys.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
