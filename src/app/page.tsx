'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle2,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface MilestoneItem {
  id: string;
  title: string;
  amount: number;
  status: string;
  sequenceOrder: number;
}

interface ContractItem {
  id: string;
  project: { title: string; budget: number };
  client: { name: string };
  freelancer: { name: string };
  totalAmount: number;
  escrowBalance: number;
  status: string;
  milestones: MilestoneItem[];
}

export default function DashboardPage() {
  const [role, setRole] = useState<'CLIENT' | 'FREELANCER' | 'REVIEWER' | 'ADMIN'>('CLIENT');
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePollContractId, setActivePollContractId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Simulated persona accounts from seed
  const personas = {
    CLIENT: { id: 'usr-client-alice', name: 'Alice Client', email: 'client1@escrow.local' },
    FREELANCER: { id: 'usr-dev-charlie', name: 'Charlie Developer', email: 'dev1@escrow.local' },
    REVIEWER: { id: 'usr-reviewer-judge', name: 'Judge Reviewer', email: 'reviewer1@escrow.local' },
    ADMIN: { id: 'usr-admin-system', name: 'System Auditor', email: 'admin@escrow.local' },
  };

  const currentPersona = personas[role];

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/contracts', {
        headers: {
          'x-user-id': currentPersona.id,
        },
      });
      const data = await res.json();
      if (data.success) {
        setContracts(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [role]);

  // 5-second polling loop for active contract (FR-10)
  useEffect(() => {
    if (!activePollContractId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/contracts/${activePollContractId}/milestones`);
        const result = await res.json();
        if (result.success) {
          setContracts((prev) =>
            prev.map((c) =>
              c.id === activePollContractId
                ? {
                    ...c,
                    status: result.data.status,
                    escrowBalance: result.data.escrowBalance,
                    milestones: result.data.milestones,
                  }
                : c
            )
          );
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activePollContractId]);

  const handleAction = async (contractId: string, action: string, milestoneId?: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/contracts/${contractId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentPersona.id,
        },
        body: JSON.stringify({
          action,
          milestoneId,
          sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          notes: 'Deliverable submitted with cryptographic hash validation',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Action '${action}' executed successfully.`);
        fetchContracts();
      } else {
        setActionMessage(`Error: ${data.error?.message || 'Action failed'}`);
      }
    } catch (err: any) {
      setActionMessage(`Network Error: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AWAITING_DEPOSIT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-400 border border-amber-800/60">Awaiting Deposit</span>;
      case 'FUNDED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-950/60 text-blue-400 border border-blue-800/60">Funded (Escrow Locked)</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">In Progress</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-950/60 text-purple-400 border border-purple-800/60">Submitted (Review Window)</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-950/60 text-teal-400 border border-teal-800/60">Approved</span>;
      case 'RELEASED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">Released (Settled)</span>;
      case 'DISPUTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-800/60">Disputed (Escrow Frozen)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Architecture Proof */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                TEAM 07 — THEME 01
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> FSM + SHA-256 + ACID Active
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Milestone Escrow & Evidence-Based Dispute Resolution
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Deterministic four-engine architecture enforcing atomic fund locks, Merkle evidence verification, and server-side RBAC.
            </p>
          </div>

          {/* Role Persona Switcher */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Persona / RBAC Role:</span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              {(['CLIENT', 'FREELANCER', 'REVIEWER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    role === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentPersona.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-sm font-mono text-indigo-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Four Engines Architecture Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-mono text-indigo-400 mb-1">ENGINE 01 (OS)</div>
          <div className="font-semibold text-white text-sm">Escrow FSM & Mutex</div>
          <div className="text-xs text-slate-400 mt-1">Vaishnavi Modekar · Roll 21</div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400">Lock: KeyedMutex (5s TTL)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-mono text-cyan-400 mb-1">ENGINE 02 (DSA/SE)</div>
          <div className="font-semibold text-white text-sm">Evidence Tree & Matcher</div>
          <div className="text-xs text-slate-400 mt-1">Darshan Kittur · Roll 18</div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400">SHA-256 + N-ary Merkle</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-mono text-amber-400 mb-1">ENGINE 03 (DBMS)</div>
          <div className="font-semibold text-white text-sm">ACID Ledger Coordinator</div>
          <div className="text-xs text-slate-400 mt-1">Purvi Sammatshetti · Roll 11</div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400">BCNF + Chained Audit Log</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-mono text-purple-400 mb-1">ENGINE 04 (WEB TECH)</div>
          <div className="font-semibold text-white text-sm">RBAC Dashboard & Poller</div>
          <div className="text-xs text-slate-400 mt-1">Vaibhav Chavanpatil · Roll 04</div>
          <div className="mt-2 text-[11px] font-mono text-emerald-400">Next.js 16 + 5s Poller</div>
        </div>
      </div>

      {/* Contract & Milestone Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Active Escrow Contracts & Milestones
          </h2>
          <button
            onClick={() => fetchContracts()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm font-mono text-slate-500">Loading contracts...</div>
        ) : contracts.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
            No active contracts found for persona <span className="font-semibold text-white">{currentPersona.name}</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 shadow-lg"
              >
                {/* Contract Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-semibold text-white">{contract.project?.title || 'Contract Agreement'}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono mt-1">
                      <span>Client: <span className="text-slate-200">{contract.client?.name}</span></span>
                      <span>Freelancer: <span className="text-slate-200">{contract.freelancer?.name}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-400">Escrow Locked</div>
                      <div className="text-lg font-bold font-mono text-emerald-400">${contract.escrowBalance.toFixed(2)}</div>
                    </div>

                    {/* Enable 5s polling toggle */}
                    <button
                      onClick={() =>
                        setActivePollContractId(activePollContractId === contract.id ? null : contract.id)
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                        activePollContractId === contract.id
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60 animate-pulse'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {activePollContractId === contract.id ? '5s Polling Active' : 'Start 5s Poller'}
                    </button>
                  </div>
                </div>

                {/* Milestone Pipeline */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Sequential Milestones:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contract.milestones?.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-lg bg-slate-950/60 border border-slate-800/80 p-4 space-y-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                            Sequence #{m.sequenceOrder}
                          </span>
                          <span className="text-sm font-bold font-mono text-white">${m.amount.toFixed(2)}</span>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-slate-200">{m.title}</div>
                          <div className="mt-1">{getStatusBadge(m.status)}</div>
                        </div>

                        {/* Milestone Action Buttons tailored by RBAC */}
                        <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-900">
                          {contract.status === 'AWAITING_DEPOSIT' && role === 'CLIENT' && (
                            <button
                              onClick={() => handleAction(contract.id, 'DEPOSIT')}
                              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" /> Deposit Escrow
                            </button>
                          )}

                          {m.status === 'FUNDED' && role === 'FREELANCER' && (
                            <button
                              onClick={() => handleAction(contract.id, 'START_WORK', m.id)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1"
                            >
                              <ArrowRight className="w-3 h-3" /> Start Work
                            </button>
                          )}

                          {m.status === 'IN_PROGRESS' && role === 'FREELANCER' && (
                            <button
                              onClick={() => handleAction(contract.id, 'SUBMIT_DELIVERABLE', m.id)}
                              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1"
                            >
                              <FileCheck2 className="w-3 h-3" /> Submit (SHA-256)
                            </button>
                          )}

                          {m.status === 'SUBMITTED' && role === 'CLIENT' && (
                            <>
                              <button
                                onClick={() => handleAction(contract.id, 'APPROVE_MILESTONE', m.id)}
                                className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleAction(contract.id, 'RAISE_DISPUTE', m.id)}
                                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3 h-3" /> Dispute
                              </button>
                            </>
                          )}

                          {m.status === 'APPROVED' && role === 'CLIENT' && (
                            <button
                              onClick={() => handleAction(contract.id, 'RELEASE_ESCROW', m.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3" /> Release Funds
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
