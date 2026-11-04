import React, { useState } from 'react';
import { CLASignatory } from '../types/metropolis';
import { GITHUB_REPO_INFO } from '../data/mockData';
import {
  FileCheck2,
  Github,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Search,
  ExternalLink,
  Download,
  Copy,
  Check,
  Shield,
  HelpCircle,
  PenTool,
} from 'lucide-react';

interface CLAManagerViewProps {
  signatories: CLASignatory[];
  onAddSignatory: (signatory: CLASignatory) => void;
}

export const CLAManagerView: React.FC<CLAManagerViewProps> = ({
  signatories,
  onAddSignatory,
}) => {
  // Sign Form State
  const [claType, setClaType] = useState<'individual' | 'corporate'>('individual');
  const [fullName, setFullName] = useState<string>('');
  const [githubHandle, setGithubHandle] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [signatureTyped, setSignatureTyped] = useState<string>('');
  const [signingSuccess, setSigningSuccess] = useState<CLASignatory | null>(null);

  // PR Bot Simulator State
  const [testPrNumber, setTestPrNumber] = useState<string>('142');
  const [testAuthorHandle, setTestAuthorHandle] = useState<string>('erostova-cv');
  const [botCheckResult, setBotCheckResult] = useState<{
    status: 'passed' | 'failed';
    message: string;
  }>({
    status: 'passed',
    message: 'All commit authors (@erostova-cv) have signed the Metropolis Platform CLA.',
  });

  // Directory Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'corporate'>('all');
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  const handleSignCla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !githubHandle || !email || !agreedToTerms) {
      alert('Please fill out all required fields and accept the agreement.');
      return;
    }

    const cleanHandle = githubHandle.replace('@', '').trim();

    // Generate cryptographic-style signature hash
    const fakeHash = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newSignatory: CLASignatory = {
      id: `cla-${Date.now().toString().slice(-4)}`,
      type: claType,
      name: fullName.trim(),
      githubHandle: cleanHandle,
      email: email.trim(),
      company: claType === 'corporate' ? company.trim() : undefined,
      signedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      signatureHash: fakeHash,
      verified: true,
      prsCount: 1,
      claVersion: 'v2.1',
    };

    onAddSignatory(newSignatory);
    setSigningSuccess(newSignatory);
    setTestAuthorHandle(cleanHandle);

    // Reset fields
    setFullName('');
    setGithubHandle('');
    setEmail('');
    setCompany('');
    setSignatureTyped('');
    setAgreedToTerms(false);
  };

  const handleTestPR = () => {
    const handleToTest = testAuthorHandle.replace('@', '').trim().toLowerCase();
    const found = signatories.find(
      (s) => s.githubHandle.toLowerCase() === handleToTest
    );

    if (found) {
      setBotCheckResult({
        status: 'passed',
        message: `Commit author @${found.githubHandle} has a verified CLA signature on file (Hash: ${found.signatureHash.substring(0, 8)}...).`,
      });
    } else {
      setBotCheckResult({
        status: 'failed',
        message: `Commit author @${testAuthorHandle} has NOT signed the CLA. Merging is blocked until the agreement is submitted.`,
      });
    }
  };

  const filteredSignatories = signatories.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.githubHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  const copyCloneCmd = () => {
    navigator.clipboard.writeText(
      `git clone https://github.com/${GITHUB_REPO_INFO.fullName}.git`
    );
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* GitHub Repository Banner (Glassmorphic) */}
      <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/[0.08] text-white shadow-inner">
              <Github className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm font-mono">{GITHUB_REPO_INFO.owner} /</span>
                <h2 className="text-lg font-extrabold text-white font-mono">
                  {GITHUB_REPO_INFO.repo}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.06] text-[#88D600] border border-[#76B900]/40 backdrop-blur-md">
                  PUBLIC
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-900/40 text-blue-300 border border-blue-500/30 backdrop-blur-md">
                  {GITHUB_REPO_INFO.latestRelease}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Open-source repository available via GitHub with Dual Licensing (GNU AGPLv3 & Commercial Enterprise) and automated CLA verification.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/[0.08] flex items-center space-x-2 text-xs font-mono text-gray-300 shadow-inner">
              <span className="text-gray-500">$</span>
              <span>git clone https://github.com/{GITHUB_REPO_INFO.fullName}.git</span>
              <button
                onClick={copyCloneCmd}
                className="p-1 hover:text-white transition-colors"
                title="Copy Clone Command"
              >
                {copiedClone ? <Check className="w-3.5 h-3.5 text-[#76B900]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Repo Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.08] text-xs font-mono">
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Stars:</span>
            <span className="text-white font-bold">{GITHUB_REPO_INFO.stars.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Forks:</span>
            <span className="text-white font-bold">{GITHUB_REPO_INFO.forks}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span>Open PRs:</span>
            <span className="text-[#88D600] font-bold">{GITHUB_REPO_INFO.openPRs} Active</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <span>CLA Policy:</span>
            <span className="text-emerald-400 font-bold">STRICT (Required to Merge)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sign CLA Portal (Left) & GitHub PR CLA Bot Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contributor License Agreement Sign Form (Frosted Glass) */}
        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">

                <div className="flex items-center space-x-2">
                  <PenTool className="w-5 h-5 text-[#76B900]" />
                  <h3 className="font-bold text-white text-base">Sign the Metropolis CLA</h3>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-400">Version 2.1 (Dual-License Standard)</span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              To contribute code, bug fixes, or video analytics plugins to Metropolis Analytics Platform, please sign either the Individual (ICLA) or Corporate (CCLA) agreement.
            </p>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setClaType('individual')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all backdrop-blur-md ${
                  claType === 'individual'
                    ? 'bg-white/[0.1] border-[#76B900] text-white shadow-[0_0_12px_rgba(118,185,0,0.2)]'
                    : 'bg-black/30 border-white/[0.08] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Individual (ICLA)</span>
              </button>

              <button
                type="button"
                onClick={() => setClaType('corporate')}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all backdrop-blur-md ${
                  claType === 'corporate'
                    ? 'bg-white/[0.1] border-[#76B900] text-white shadow-[0_0_12px_rgba(118,185,0,0.2)]'
                    : 'bg-black/30 border-white/[0.08] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Corporate (CCLA)</span>
              </button>
            </div>

            <form onSubmit={handleSignCla} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Legal Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    GitHub Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="e.g. janedoe-ai"
                    className="w-full bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@organization.com"
                  className="w-full bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md"
                />
              </div>

              {claType === 'corporate' && (
                <div>
                  <label className="text-xs font-mono text-gray-300 block mb-1">
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Robotics Innovation Corp."
                    className="w-full bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md"
                  />
                </div>
              )}

              {/* CLA Terms scrollbox */}
              <div className="bg-[#05070B]/80 backdrop-blur-md border border-white/[0.08] rounded-xl p-3 text-[10px] font-mono text-gray-400 max-h-[110px] overflow-y-auto leading-relaxed shadow-inner">
                <strong>Grant of Copyright License:</strong> You grant the Metropolis Project a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable copyright license to reproduce, prepare derivative works of, publicly display, publicly perform, sublicense, and distribute your contributions and such derivative works.
                <br /><br />
                <strong>Dual Licensing Acknowledgment:</strong> You understand that the project is distributed under both GNU AGPLv3 (Open Source) and a Commercial Enterprise License. This agreement grants the maintainers the explicit right to sublicense your contributions under both licenses.
                <br /><br />
                <strong>Patent License:</strong> You grant a perpetual, royalty-free patent license for patents necessarily infringed by your contributions.
              </div>

              {/* Acceptance checkbox & typed signature */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 accent-[#76B900]"
                  />
                  <span>
                    I accept and execute the Metropolis Analytics Platform Contributor License Agreement v2.1.
                  </span>
                </label>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-1">
                    Digital Signature (Type your full legal name):
                  </label>
                  <input
                    type="text"
                    value={signatureTyped}
                    onChange={(e) => setSignatureTyped(e.target.value)}
                    placeholder="Type name to sign..."
                    className="w-full bg-[#080B10] text-white border border-[#232D40] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#76B900]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!agreedToTerms || !fullName}
                className="w-full py-2.5 rounded-xl bg-[#76B900] hover:bg-[#88D600] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(118,185,0,0.3)] mt-2"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Execute & Submit Signed CLA</span>
              </button>
            </form>
          </div>

          {signingSuccess && (
            <div className="mt-4 p-3 bg-emerald-950/60 border border-[#76B900] rounded-xl text-xs font-mono text-[#88D600] space-y-1 animate-fadeIn">
              <div className="flex items-center space-x-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>CLA Successfully Recorded for @{signingSuccess.githubHandle}!</span>
              </div>
              <div className="text-[10px] text-gray-300 truncate">
                Signature SHA-256 Hash: {signingSuccess.signatureHash}
              </div>
            </div>
          )}
        </div>

        {/* GitHub Pull Request CLA Bot Simulator (Frosted Glass Sidebar) */}
        <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">

                <div className="flex items-center space-x-2">
                  <GitPullRequest className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">GitHub PR CLA Bot Simulator</h3>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950/50 text-purple-300 border border-purple-500/30 backdrop-blur-md">
                metropolis-cla-bot
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Test how the automated GitHub action verifies pull requests in real time. If any author has not signed the CLA, the bot flags the PR status check as failed and blocks merge.
            </p>

            {/* Test inputs */}
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/[0.08] space-y-3 mb-4 shadow-inner">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-1">
                    Pull Request #
                  </label>
                  <input
                    type="text"
                    value={testPrNumber}
                    onChange={(e) => setTestPrNumber(e.target.value)}
                    className="w-full bg-[#121722]/80 text-white border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs font-mono backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-1">
                    PR Author GitHub Handle
                  </label>
                  <input
                    type="text"
                    value={testAuthorHandle}
                    onChange={(e) => setTestAuthorHandle(e.target.value)}
                    placeholder="e.g. erostova-cv"
                    className="w-full bg-[#121722]/80 text-[#88D600] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs font-mono backdrop-blur-md"
                  />
                </div>
              </div>

              <button
                onClick={handleTestPR}
                className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-1.5 backdrop-blur-md"
              >
                <span>Trigger metropolis-cla-bot Check</span>
              </button>
            </div>

            {/* Simulated GitHub Check Widget (Frosted Glass) */}
            <div className="bg-[#0D1117]/80 backdrop-blur-md border border-white/[0.1] rounded-xl p-4 font-mono text-xs shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <Github className="w-4 h-4 text-gray-300" />
                  <span className="font-bold text-gray-200">
                    {GITHUB_REPO_INFO.fullName} #{testPrNumber}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">Continuous Integration</span>
              </div>

              <div className="mt-3 flex items-start space-x-3">
                {botCheckResult.status === 'passed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div>
                  <div className="font-bold text-white flex items-center space-x-2">
                    <span>cla/metropolis-platform</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        botCheckResult.status === 'passed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {botCheckResult.status === 'passed' ? 'SUCCESS' : 'FAILURE'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mt-1 leading-relaxed">
                    {botCheckResult.message}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] text-gray-500">
                <span>Webhook: POST /api/v1/github/cla/verify</span>
                <span>Response: 200 OK</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] text-[11px] font-mono text-gray-400 flex justify-between">
            <span>SIGNATORIES ON FILE:</span>
            <span className="text-white font-bold">{signatories.length} Verified Developers</span>
          </div>
        </div>
      </div>

      {/* Verified CLA Signatories Directory (Glassmorphic Table) */}
      <div className="bg-[#0B0E14]/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">

            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-[#76B900]" />
              <h3 className="font-bold text-white text-base">Verified Signatory Registry</h3>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, github, company..."
                className="bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#76B900] backdrop-blur-md"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-black/40 text-gray-200 border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs font-mono focus:outline-none backdrop-blur-md"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
        </div>

        {/* Signatories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-gray-400 uppercase text-[10px]">
                <th className="pb-3">GitHub Contributor</th>
                <th className="pb-3">Legal Name</th>
                <th className="pb-3">Type / Entity</th>
                <th className="pb-3">Signed Timestamp</th>
                <th className="pb-3">PRs Merged</th>
                <th className="pb-3">Signature SHA Hash</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151D2A]">
              {filteredSignatories.map((sig) => (
                <tr key={sig.id} className="hover:bg-[#121722] transition-colors">
                  <td className="py-3 font-bold text-white flex items-center space-x-1.5">
                    <Github className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[#88D600]">@{sig.githubHandle}</span>
                  </td>
                  <td className="py-3 text-gray-300">{sig.name}</td>
                  <td className="py-3">
                    {sig.type === 'corporate' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-500/30">
                        Corporate: {sig.company}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300">
                        Individual
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-gray-400">{sig.signedAt}</td>
                  <td className="py-3 text-white font-bold">{sig.prsCount} PRs</td>
                  <td className="py-3 font-mono text-[10px] text-gray-400 truncate max-w-[120px]">
                    {sig.signatureHash.substring(0, 16)}...
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 text-[#88D600] border border-[#76B900]/40 flex items-center w-fit space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
