import React, { useState } from 'react';
import { AppView } from '../../types';

interface ModerationAdminViewProps {
  onNavigate: (view: AppView) => void;
}

export const ModerationAdminView: React.FC<ModerationAdminViewProps> = ({ onNavigate }) => {
  const [queueItems, setQueueItems] = useState([
    {
      id: 1,
      title: 'Underground Boiler Techno Vol. 4',
      time: 'Submitted 12m ago • Today, 14:48 IST',
      organizer: 'Nexus Collective',
      orgTier: 'Unverified Host (Tier 0)',
      orgInit: 'NX',
      city: 'Bengaluru (Indiranagar)',
      risk: 'High: Unverified Venue',
      riskClass: 'bg-[#ffdad6] text-[#ba1a1a]',
      riskDot: 'bg-[#ba1a1a]'
    },
    {
      id: 2,
      title: 'Koramangala Artisan Sourdough Lab',
      time: 'Submitted 38m ago • Today, 14:22 IST',
      organizer: 'Bakehouse Living',
      orgTier: '14 Events Hosted • 4.9★',
      orgInit: 'BL',
      city: 'Bengaluru (Koramangala)',
      risk: 'Med: Duplicate Submission',
      riskClass: 'bg-[#fef3c7] text-[#78350f]',
      riskDot: 'bg-[#d97706]'
    },
    {
      id: 3,
      title: 'Dharavi Clay Pottery Residency',
      time: 'Submitted 1h ago • Today, 13:40 IST',
      organizer: 'Mitti Collective',
      orgTier: 'Govt NGO Partner',
      orgInit: 'MC',
      city: 'Mumbai (Dharavi)',
      risk: 'Low: Clean Record',
      riskClass: 'bg-[#f1f5f9] text-[#0f172a]',
      riskDot: 'bg-[#b45309]'
    },
    {
      id: 4,
      title: 'Sundown Poetry Circle & Zine Fair',
      time: 'Submitted 2h ago • Today, 12:55 IST',
      organizer: 'Delhi Lit Guild',
      orgTier: 'Verified Institutional',
      orgInit: 'DF',
      city: 'Delhi NCR (Hauz Khas)',
      risk: 'Low: Clean Record',
      riskClass: 'bg-[#f1f5f9] text-[#0f172a]',
      riskDot: 'bg-[#b45309]'
    }
  ]);

  const [incidentSuspended, setIncidentSuspended] = useState(false);

  const handleAction = (id: number, action: 'pass' | 'review' | 'reject') => {
    setQueueItems(prev => prev.filter(i => i.id !== id));
    alert(`Item ${action.toUpperCase()} action recorded on immutable audit node.`);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#f8fafc]">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#f8fafc] border-r border-[#e2e8f0] fixed left-0 top-0 h-full z-40 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8">
          <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#e11d48]">Locora</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold bg-[#e0e7ff] text-[#3730a3] px-2 py-0.5 rounded-full">
            Hub
          </span>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Attendee Portal
            </div>
            <nav className="space-y-1">
              <button onClick={() => onNavigate('attendee')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">grid_view</span>
                <span>Overview</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Organizer Workspace
            </div>
            <nav className="space-y-1">
              <button onClick={() => onNavigate('organizer')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">event_available</span>
                <span>My Events</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Moderation & Admin
            </div>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-bold bg-[#be123c] text-white shadow-sm text-left">
                <span className="material-symbols-outlined text-lg">fact_check</span>
                <span>Moderation Queue</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">flag</span>
                <span>Flagged Content</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">list_alt</span>
                <span>Audit Logs</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e2e8f0]">
          <button onClick={() => onNavigate('discover')} className="flex items-center gap-2 text-xs font-['Plus_Jakarta_Sans'] font-bold text-[#e11d48] hover:underline">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Return to Discover</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <div className="h-16 bg-[#f8fafc]/90 backdrop-blur-xl border-b border-[#e2e8f0] px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f5f9] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
              <span className="material-symbols-outlined text-[#e11d48] text-sm">location_city</span>
              <span>Bengaluru Hub</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#78350f] font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold tracking-wider">
              Live
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('discover')} className="px-3 py-1 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Attendee View</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">person</span>
            </div>
          </div>
        </div>

        {/* Ops Body */}
        <div className="p-6 lg:p-12 space-y-8 flex-1">
          {/* Top Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#475569] font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping"></span>
                <span>Operational Dispatch • Live Moderation Engine</span>
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl font-bold text-[#0f172a]">
                Trust & Safety Operations
              </h1>
              <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#475569] max-w-2xl mt-1">
                Review inbound event submissions, resolve escalated community alerts, and monitor cross-city hub equilibrium in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#f8fafc] px-4 py-2 rounded-xl text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold border border-[#e2e8f0]">
                <span className="material-symbols-outlined text-[#e11d48] text-base">shield_person</span>
                <span>Active Duty: <strong>Admin_9402</strong> (Zone 1)</span>
              </div>
              <button className="bg-[#0f172a] hover:bg-[#2f312e] text-white px-4 py-2 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center gap-1.5 transition-all">
                <span className="material-symbols-outlined text-base">tune</span>
                <span>Rules Engine</span>
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">In Queue</span>
                <span className="w-7 h-7 rounded-lg bg-[#ffe4e6] text-[#881337] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">pending_actions</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0f172a]">{queueItems.length}</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#e11d48]">Awaiting SLA</span>
              </div>
              <div className="mt-1 text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                <strong className="text-[#e11d48]">~14m</strong> avg turnaround today
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Flagged Listings</span>
                <span className="w-7 h-7 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">flag</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#ba1a1a]">2</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#ba1a1a]">Requires Action</span>
              </div>
              <div className="mt-1 text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                1 high severity report
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Active Organizers</span>
                <span className="w-7 h-7 rounded-lg bg-[#e0e7ff] text-[#3730a3] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">groups</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0f172a]">142</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#4f46e5]">+18 this wk</span>
              </div>
              <div className="mt-1 text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                94.2% verified credentials
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Community Signals</span>
                <span className="w-7 h-7 rounded-lg bg-[#fef3c7] text-[#78350f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">report_problem</span>
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#d97706]">3</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#d97706]">Open Tickets</span>
              </div>
              <div className="mt-1 text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                2 scalping, 1 noise breach
              </div>
            </div>
          </div>

          {/* Split Queue & Incident Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Ingestion Queue Table (8 cols) */}
            <div className="xl:col-span-8 flex flex-col space-y-4">
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-[#e2e8f0]">
                <div className="px-6 py-4 bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0]">
                  <div className="flex items-center gap-2">
                    <span className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">Event Ingestion Queue</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ffe4e6] text-[#881337] font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold">
                      {queueItems.length} Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Filter by title, organizer..."
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#f8fafc]/60 font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] border-b border-[#e2e8f0]">
                      <tr>
                        <th className="py-3 px-6">Event & Ingestion</th>
                        <th className="py-3 px-4">Organizer</th>
                        <th className="py-3 px-4">City & Hub</th>
                        <th className="py-3 px-4">Risk Assessment</th>
                        <th className="py-3 px-6 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a]">
                      {queueItems.map(item => (
                        <tr key={item.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#0f172a]">{item.title}</div>
                            <div className="text-[10px] text-[#475569]">{item.time}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center font-bold text-[10px] text-[#0f172a]">
                                {item.orgInit}
                              </div>
                              <div>
                                <div className="font-bold text-[#0f172a]">{item.organizer}</div>
                                <div className="text-[9px] text-[#475569]">{item.orgTier}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-[#0f172a]">
                            {item.city}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-['Plus_Jakarta_Sans'] text-[10px] font-bold ${item.riskClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.riskDot}`}></span>
                              <span>{item.risk}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleAction(item.id, 'pass')}
                                className="px-2.5 py-1 bg-[#f1f5f9] hover:bg-[#e11d48] hover:text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Pass
                              </button>
                              <button 
                                onClick={() => handleAction(item.id, 'review')}
                                className="px-2.5 py-1 bg-[#fef3c7] text-[#78350f] hover:bg-[#d97706] hover:text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                Review
                              </button>
                              <button 
                                onClick={() => handleAction(item.id, 'reject')}
                                className="p-1 hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded text-[#475569]"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-3 bg-[#f8fafc] flex items-center justify-between text-xs font-['Plus_Jakarta_Sans'] text-[#475569]">
                  <span>Showing {queueItems.length} pending items</span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-white rounded-lg border border-[#e2e8f0] font-bold">Prev</button>
                    <button className="px-3 py-1 bg-white rounded-lg border border-[#e2e8f0] font-bold">Next</button>
                  </div>
                </div>
              </div>

              {/* Guardrail Note */}
              <div className="bg-[#f1f5f9] rounded-2xl p-4 flex items-start gap-3 border border-[#e2e8f0] text-xs font-['Plus_Jakarta_Sans'] text-[#0f172a]">
                <span className="material-symbols-outlined text-[#e11d48] text-lg">tips_and_updates</span>
                <div>
                  <strong>Algorithmic Guardrail Active:</strong> Submissions flagged with <em>Duplicate Venue</em> or <em>Zero Ticket Cap</em> are auto-routed to Tier-2 manual check before public listing in Bengaluru and Mumbai feeds.
                </div>
              </div>
            </div>

            {/* Right Column: Escalation & City Health (4 cols) */}
            <div className="xl:col-span-4 space-y-6">
              {/* Critical Alert */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-[#e2e8f0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>Escalated Incident Ticket</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-['Plus_Jakarta_Sans'] text-[9px] font-bold">
                    3 Signals
                  </span>
                </div>

                <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">
                  Suspicious ticket scalping for Bandra Acoustic Gig
                </h2>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] leading-relaxed">
                  Multiple attendees reported external Telegram bots selling counterfeit VIP entry passes at 4x the authorized INR 650 cap.
                </p>

                <div className="p-3 bg-[#f8fafc] rounded-xl space-y-1 text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                  <div className="flex justify-between">
                    <span>Reported by:</span>
                    <span className="font-bold text-[#0f172a]">3 Verified Local Attendees</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organizer:</span>
                    <span className="font-bold text-[#0f172a]">Bandra Live Rooms (Tier 2)</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => setIncidentSuspended(true)}
                    className={`flex-1 py-2 px-3 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all ${
                      incidentSuspended 
                        ? 'bg-[#0f172a] text-white' 
                        : 'bg-[#ba1a1a] text-white hover:bg-[#e11d48]'
                    }`}
                  >
                    {incidentSuspended ? 'Listing Suspended ✓' : 'Suspend Listing'}
                  </button>
                  <button 
                    onClick={() => alert('Message dispatch opened for Bandra Live Rooms host.')}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] font-['Plus_Jakarta_Sans'] text-xs font-bold"
                  >
                    Contact Host
                  </button>
                </div>
              </div>

              {/* City Hub Distribution */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold text-[#475569]">National Footprint</div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">City Hub Distribution</h2>
                  </div>
                  <span className="material-symbols-outlined text-[#475569]">hub</span>
                </div>

                <div className="space-y-3 font-['Plus_Jakarta_Sans'] text-xs">
                  {[
                    { city: 'Bengaluru Hub', count: '182 active', pct: '37%', color: 'bg-[#e11d48]' },
                    { city: 'Mumbai Hub', count: '114 active', pct: '23%', color: 'bg-[#4f46e5]' },
                    { city: 'Delhi NCR Hub', count: '96 active', pct: '20%', color: 'bg-[#d97706]' },
                    { city: 'Hyderabad Hub', count: '52 active', pct: '11%', color: 'bg-[#64748b]' },
                    { city: 'Pune Hub', count: '48 active', pct: '9%', color: 'bg-[#16A34A]' }
                  ].map(h => (
                    <div key={h.city}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${h.color}`}></span>
                          {h.city}
                        </span>
                        <span className="text-[#475569]">{h.count} ({h.pct})</span>
                      </div>
                      <div className="w-full bg-[#f1f5f9] h-1.5 rounded-full overflow-hidden">
                        <div className={`${h.color} h-full rounded-full`} style={{ width: h.pct }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">
                  <span>Health Index: <strong>98.4% Normal</strong></span>
                  <span className="text-[#e11d48] font-bold cursor-pointer">Live Node Map →</span>
                </div>
              </div>
            </div>

          </div>

          {/* Audit Trail Log */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold text-[#475569]">Compliance & Traceability</div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">Immutable Moderator Audit Log</h2>
              </div>
              <span className="text-xs font-['Plus_Jakarta_Sans'] text-[#475569]">Node: in-south-blr-cluster-04</span>
            </div>

            <div className="space-y-2">
              {[
                { id: '01', title: 'Event Approved — ‘Indie Game Dev Mixer #12’ published to Koramangala stream.', note: 'Venue pre-check passed • Host KYC Level 2 Verified', admin: 'Admin_9402', time: '14:32:10 IST' },
                { id: '02', title: 'Safety Flag Triggered — ‘Bandra Acoustic Gig’ tagged for Secondary Ticketing Breach.', note: '3 User reports aggregated • Alert escalated to L2 queue', admin: 'System_Automod', time: '14:15:44 IST' },
                { id: '03', title: 'Revision Requested — ‘Rooftop Electronic Showcase’ sent back for Missing Sound NOC permit.', note: 'Notification dispatched to organizer phone + WhatsApp API', admin: 'Admin_8120', time: '13:58:02 IST' }
              ].map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors border border-[#e2e8f0]">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-xs text-[#0f172a] border border-[#e2e8f0]">
                      {log.id}
                    </span>
                    <div>
                      <div className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#0f172a]">{log.title}</div>
                      <div className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">{log.note}</div>
                    </div>
                  </div>
                  <div className="text-right font-['Plus_Jakarta_Sans'] text-[10px]">
                    <div className="font-bold text-[#0f172a]">{log.admin}</div>
                    <div className="text-[#475569]">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
