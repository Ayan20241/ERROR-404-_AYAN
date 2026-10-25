import React, { useState } from 'react';
import { AppView } from '../../types';

interface OrganizerWorkspaceViewProps {
  onNavigate: (view: AppView) => void;
}

export const OrganizerWorkspaceView: React.FC<OrganizerWorkspaceViewProps> = ({ onNavigate }) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showScanModal, setShowScanModal] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [ticketCheckCode, setTicketCheckCode] = useState<string>('');
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const [eventsList, setEventsList] = useState([
    {
      id: 1,
      title: 'Deccan Modular Synth & Indie Audio',
      date: 'Tomorrow · 7:30 PM IST · Indiranagar Loft',
      category: 'Indie Music',
      hub: 'Bengaluru Hub',
      tiers: 'Early Bird (₹899) · VIP (₹1,499)',
      tierSub: 'Free RSVP for Performers',
      capacity: '130 / 150',
      pct: '87%',
      status: 'Published',
      statusClass: 'bg-[#ffe4e6] text-[#881337]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe00NTYeBiGi2OoIev7QXHQ9mIHAt8FVqZ_xc6btwafLbagIEcDhqK-W3aAyprgZIgEFZOwPFaORz8bzGcpZnTq2DVju2fnZTFqxFHZGtNTN9dsnnFOKnG3WGJKBN7h_x5DLRSdD-6FnnCbimF4vbe0UarQ2PQh_vnUPEX1PaVg31JVFzK_xbWhwkVn-PYkS0k8Az13bLDpFGdk-c6olQ6qCztIr270QoS8sYlTAf2SFog8NvNxJDCDQ'
    },
    {
      id: 2,
      title: 'Hauz Khas Golden Hour Walk',
      date: 'Saturday · 4:45 PM IST · Deer Park Gate 2',
      category: 'Heritage & Nature',
      hub: 'Delhi NCR Hub',
      tiers: 'Curated Walk (₹450)',
      tierSub: 'Includes filter chai & booklet',
      capacity: '38 / 40',
      pct: '95%',
      status: 'Published',
      statusClass: 'bg-[#ffe4e6] text-[#881337]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDatWWdswT4TilhSUwvAkZKMaH9TsMHXGqE838NzV2IFhhgYvYAm-iw4Q3vH3K6Md0N6BpyzB-XIKN5LXUh47Mdv0Yab6JyikcKaZ_s193oJaa4jsWv-su8d-Bru4VUyz2AqiHMYdFrE9T5BbZBXW5CoNXknDFtudDxgBvbBibEaPz7o4-xym0bhrOP28kuwdsVdPO59dlR-eyR9V-4sAGL-iHbmribxpRjXbqcw6AaWAEyzlHYrryTFg'
    },
    {
      id: 3,
      title: 'Bengaluru AI Founders Mixer',
      date: 'Oct 28 · HSR Layout Co-lab',
      category: 'Tech & Venture',
      hub: 'Bengaluru Hub',
      tiers: 'Founder Pass (Free Application)',
      tierSub: 'Vetted via GitHub / Pitch',
      capacity: '0 / 80',
      pct: '0%',
      status: 'Draft',
      statusClass: 'bg-[#f1f5f9] text-[#475569]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6yFOPoOJiwjwzNFCpem9lpksuELW4MAMwJarR5fWX7X7vadQmIzmT8axC37SmKUco4PIxc89bwFFoUK0SkejKP6dduuTTLR2M8ujEMkhJB_QCbW5ZqVm6urhwfWWS6M_tMDnUA_LdxkTAkL5eBfkmlwzLRbL05934vJYyvBpxYgDdMCnsug6TjGCvrowM4drWVQ842-2TZPc4huhPrjwaj7-SRzYy60x9NuHMB_2XRwO_9o_f_Z4nYw'
    },
    {
      id: 4,
      title: 'Old Delhi Heritage Food Trail',
      date: 'Concluded last Sunday · Matia Mahal',
      category: 'Culinary Arts',
      hub: 'Delhi NCR Hub',
      tiers: 'Foodie Pass (₹1,250)',
      tierSub: '8 Stalls included',
      capacity: '25 / 25',
      pct: '100%',
      status: 'Completed',
      statusClass: 'bg-[#f1f5f9] text-[#0f172a]',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMH6y64oE9OksXcBWz32qRht7WbS91wa7pmAGDBZvoeefvoqiFAHqeTbWniV0ZaYKPWWp-kmaF5XU9J6xORalY-fzwjLQ6Fbwg6vIjvPhkYBfhlEA8qF7-_lV78necSi9ZABhQuc3EQvXjOUdMzN0QEfL7GQgxWGxVAuIeXVkRboEc6nHUG1n60y9U_G7PASQJrHVwVapqf0wjXy5e81i7vq-G2COKsqVMKADzXMyNDKsBdQ5zb6jdpg'
    }
  ]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Event,Registrations,GrossINR,Status\nDeccan Modular Synth,130,116870,Published\nHauz Khas Walk,38,17100,Published\nAI Founders Mixer,0,0,Draft\nOld Delhi Trail,25,31250,Completed";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Locora_Events_Registry.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTicketCheck = () => {
    if (!ticketCheckCode.trim()) return;
    setCheckResult(`Verified: Pass ${ticketCheckCode.toUpperCase()} · Attendee: Aarav Mehta · Early Bird Valid`);
  };

  const submitNewGathering = () => {
    setEventsList(prev => [
      {
        id: Date.now(),
        title: 'Bangalore Modular Collective: Rooftop Ambient Sessions',
        date: 'Nov 15 · 6:30 PM IST · Indiranagar Deck',
        category: 'Indie Music',
        hub: 'Bengaluru Hub',
        tiers: 'Early Bird (₹699) · Patron (₹2,499)',
        tierSub: 'Includes 1 artisanal brew',
        capacity: '0 / 135',
        pct: '0%',
        status: 'Published',
        statusClass: 'bg-[#ffe4e6] text-[#881337]',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe00NTYeBiGi2OoIev7QXHQ9mIHAt8FVqZ_xc6btwafLbagIEcDhqK-W3aAyprgZIgEFZOwPFaORz8bzGcpZnTq2DVju2fnZTFqxFHZGtNTN9dsnnFOKnG3WGJKBN7h_x5DLRSdD-6FnnCbimF4vbe0UarQ2PQh_vnUPEX1PaVg31JVFzK_xbWhwkVn-PYkS0k8Az13bLDpFGdk-c6olQ6qCztIr270QoS8sYlTAf2SFog8NvNxJDCDQ'
      },
      ...prev
    ]);
    setShowCreateModal(false);
    alert('Gathering Published to Bengaluru Hub!');
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
              <button onClick={() => onNavigate('attendee')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                <span>My Registrations</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Organizer Workspace
            </div>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-bold bg-[#be123c] text-white shadow-sm text-left">
                <span className="material-symbols-outlined text-lg">event_available</span>
                <span>My Events</span>
              </button>
              <button onClick={() => setShowCreateModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Create Event</span>
              </button>
              <button onClick={() => setShowScanModal(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                <span>Turnstile Scanner</span>
              </button>
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Moderation & Admin
            </div>
            <nav className="space-y-1">
              <button onClick={() => onNavigate('moderation')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
                <span className="material-symbols-outlined text-lg">fact_check</span>
                <span>Moderation Queue</span>
              </button>
              <button onClick={() => onNavigate('moderation')} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] text-[#475569] hover:bg-[#e2e8f0] text-left">
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

      {/* Main Workspace Area */}
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

        {/* Content */}
        <div className="p-6 lg:p-12 space-y-8 flex-1">
          {/* Action Strip */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#e11d48] font-bold mb-1">
                <span>Studio Hub · Koramangala Stage 4</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#be123c]"></span>
                <span className="text-[#475569]">Production Environment</span>
              </div>
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl font-bold text-[#0f172a]">
                Event Operations & Creator Engine
              </h1>
              <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#475569] max-w-2xl mt-1">
                Real-time gate metrics, tiered capacity distribution, and live booking flows across metropolitan circuits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold flex items-center gap-2 transition-all shadow-sm border border-[#e2e8f0]"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Export CSV</span>
              </button>
              <button 
                onClick={() => { setCurrentStep(1); setShowCreateModal(true); }}
                className="px-5 py-2.5 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>Create New Gathering</span>
              </button>
            </div>
          </div>

          {/* Metric Bento (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Live Pipeline</span>
                <span className="px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#3730a3] font-['Plus_Jakarta_Sans'] text-[9px] font-bold">Active</span>
              </div>
              <div className="my-3">
                <div className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0f172a]">04</div>
                <div className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-0.5">Across Bengaluru & Delhi NCR</div>
              </div>
              <div className="flex items-center gap-1 text-[#e11d48] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+2 pending audit review</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Total Registrations</span>
                <span className="material-symbols-outlined text-[#4f46e5] text-lg">confirmation_number</span>
              </div>
              <div className="my-3">
                <div className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0f172a]">428</div>
                <div className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-0.5">Issued passes & digital wristbands</div>
              </div>
              <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#4f46e5] h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Gross Bookings</span>
                <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#78350f] font-['Plus_Jakarta_Sans'] text-[9px] font-bold">INR Net</span>
              </div>
              <div className="my-3">
                <div className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0f172a]">₹1,84,500</div>
                <div className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-0.5">Direct UPI & Razorpay Settlement</div>
              </div>
              <div className="flex items-center gap-1 text-[#d97706] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">account_balance</span>
                <span>Payout window: Friday noon</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Verified Turnout</span>
                <span className="material-symbols-outlined text-[#be123c] text-lg">verified_user</span>
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#be123c]">91.4%</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">avg check-in</span>
              </div>
              <div className="flex items-center gap-1 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs">
                <span className="material-symbols-outlined text-sm text-[#e11d48]">speed</span>
                <span>Peak gate scan: 18/min</span>
              </div>
            </div>
          </div>

          {/* Quick Turnstile Scanner Banner */}
          <div className="bg-[#12100C] text-white rounded-3xl p-6 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-[#2f312e]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl text-[#fda4af]">qr_code_scanner</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-white">Digital Gate Turnstile Ready</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-[9px] uppercase font-bold">Live Scan</span>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#e2e8f0]/80 mt-0.5">
                  Currently monitoring ticket passes for Deccan Modular Synth session at Indiranagar Cultural Loft.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setShowScanModal(true)}
                className="px-4 py-2 rounded-xl bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110"
              >
                <span className="material-symbols-outlined text-base">document_scanner</span>
                <span>Scan Tickets (Check-in)</span>
              </button>
              <button 
                onClick={() => setShowScanModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-['Plus_Jakarta_Sans'] text-xs font-semibold"
              >
                Guest List (142)
              </button>
            </div>
          </div>

          {/* Curated Events Registry Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Curated Events Registry</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] font-['Plus_Jakarta_Sans'] text-xs font-bold">
                  {eventsList.length} Listed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Filter by title, venue..."
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] outline-none"
                />
                <select className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] outline-none">
                  <option>All Statuses</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-[#e2e8f0]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f8fafc] font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] border-b border-[#e2e8f0]">
                    <tr>
                      <th className="py-3 px-6">Event & Date</th>
                      <th className="py-3 px-4">Category & Hub</th>
                      <th className="py-3 px-4">Ticket Tiers</th>
                      <th className="py-3 px-4">Capacity & Fill</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] text-xs font-['Plus_Jakarta_Sans'] text-[#0f172a]">
                    {eventsList.map(ev => (
                      <tr key={ev.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img alt={ev.title} className="w-12 h-12 rounded-xl object-cover shrink-0" src={ev.image} />
                            <div>
                              <div className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0f172a] leading-tight">{ev.title}</div>
                              <div className="text-[11px] text-[#475569] flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-xs text-[#e11d48]">calendar_today</span>
                                <span>{ev.date}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0e7ff] text-[#3730a3] text-[11px] font-bold">
                            {ev.category}
                          </span>
                          <div className="text-[10px] text-[#475569] mt-1">{ev.hub}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-[#0f172a]">{ev.tiers}</div>
                          <div className="text-[10px] text-[#475569]">{ev.tierSub}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold">{ev.capacity}</span>
                            <span className="text-[#e11d48] font-bold">{ev.pct}</span>
                          </div>
                          <div className="w-28 bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#e11d48] h-full rounded-full" style={{ width: ev.pct }}></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${ev.statusClass}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setShowScanModal(true)} className="p-2 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a]" title="Scan Tickets">
                              <span className="material-symbols-outlined text-base">qr_code_scanner</span>
                            </button>
                            <button onClick={() => { onNavigate('event-detail'); }} className="p-2 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a]" title="View Event">
                              <span className="material-symbols-outlined text-base">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Step Creation Engine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-[#e2e8f0]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#f8fafc] flex items-center justify-between sticky top-0 z-10 border-b border-[#e2e8f0]">
              <div>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase text-[#e11d48] font-bold tracking-wider">Creator Studio · Multi-Step Engine</span>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Curate a New Gathering</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#0f172a]">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="px-6 py-3 bg-white grid grid-cols-4 gap-4 border-b border-[#f1f5f9]">
              {[
                { step: 1, title: 'Details' },
                { step: 2, title: 'Venue & Map' },
                { step: 3, title: 'Ticketing' },
                { step: 4, title: 'Visuals' }
              ].map(s => (
                <div key={s.step} onClick={() => setCurrentStep(s.step)} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-7 h-7 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center justify-center ${
                    currentStep === s.step ? 'bg-[#e11d48] text-white' : 'bg-[#f1f5f9] text-[#475569]'
                  }`}>
                    {s.step}
                  </div>
                  <span className={`font-['Plus_Jakarta_Sans'] text-xs font-bold hidden sm:inline ${
                    currentStep === s.step ? 'text-[#0f172a]' : 'text-[#475569]'
                  }`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Stepper Forms */}
            <div className="p-6 md:p-8 space-y-6 flex-1">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">Gathering Title</label>
                    <input 
                      type="text" 
                      defaultValue="Bangalore Modular Collective: Rooftop Ambient Sessions"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">Category</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]">
                        <option>Indie Music & Audio Experimentation</option>
                        <option>Heritage Architecture Walk</option>
                        <option>Founders & Tech Roundtable</option>
                        <option>Artisan Pottery & Claycraft</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">City & Hub</label>
                      <select className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]">
                        <option>Bengaluru · Koramangala & Indiranagar Circuit</option>
                        <option>Delhi NCR · Hauz Khas & South Extension</option>
                        <option>Mumbai · Bandra West & Khar Creative Corridor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">Short Manifesto / Experience Description</label>
                    <textarea 
                      rows={3}
                      defaultValue="Underneath twilight skies, join hardware synth builders and modular improvisers for an unscripted quadraphonic audio lab."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">Physical Venue Name</label>
                    <input 
                      type="text" 
                      defaultValue="The Humming Tree Open Deck, 12th Main Road, Indiranagar"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">Date & Time</label>
                      <input 
                        type="datetime-local" 
                        defaultValue="2025-11-15T18:30"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]"
                      />
                    </div>
                    <div>
                      <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold mb-1 block">Coordinates</label>
                      <input 
                        type="text" 
                        defaultValue="12.9719° N, 77.6412° E (Indiranagar)"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#f8fafc] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-sm outline-none border border-[#e2e8f0]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">Ticket Tiers (INR & RSVP)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                      <div className="font-['Plus_Jakarta_Sans'] font-bold text-sm">Early Bird Tier</div>
                      <div className="text-[#e11d48] font-bold text-xl my-1">₹699</div>
                      <div className="text-[11px] text-[#475569]">Capacity: 40 passes</div>
                    </div>
                    <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                      <div className="font-['Plus_Jakarta_Sans'] font-bold text-sm">General Admission</div>
                      <div className="text-[#e11d48] font-bold text-xl my-1">₹1,199</div>
                      <div className="text-[11px] text-[#475569]">Capacity: 80 passes</div>
                    </div>
                    <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                      <div className="font-['Plus_Jakarta_Sans'] font-bold text-sm">Patron Backstage</div>
                      <div className="text-[#e11d48] font-bold text-xl my-1">₹2,499</div>
                      <div className="text-[11px] text-[#475569]">Capacity: 15 passes</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <label className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] font-bold block">Cover Artwork Slot</label>
                  <div className="h-44 rounded-2xl bg-[#f8fafc] border-2 border-dashed border-[#e2e8f0] flex flex-col items-center justify-center p-4 text-center">
                    <span className="material-symbols-outlined text-4xl text-[#e11d48] mb-2">add_photo_alternate</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Artwork Uploaded: deccan_modular_analog.png</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] mt-0.5">High-resolution verified by Locora Editorial</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-[#f8fafc] border-t border-[#e2e8f0] flex items-center justify-between">
              {currentStep > 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold border border-[#e2e8f0]"
                >
                  Back
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-3">
                {currentStep < 4 ? (
                  <button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-5 py-2.5 rounded-xl bg-[#e11d48] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#be123c]"
                  >
                    Continue
                  </button>
                ) : (
                  <button 
                    onClick={submitNewGathering}
                    className="px-6 py-2.5 rounded-xl bg-[#e11d48] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#be123c]"
                  >
                    Publish Gathering
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Ticket Scan Console Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#e2e8f0] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase text-[#e11d48] font-bold">Scanner Console</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0f172a]">Ticket Validator</h3>
              </div>
              <button onClick={() => setShowScanModal(false)} className="text-[#475569] hover:text-[#0f172a]">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scan animation */}
            <div className="bg-[#12100C] text-white rounded-2xl p-6 text-center flex flex-col items-center justify-center h-44">
              <span className="material-symbols-outlined text-5xl text-[#f43f5e] animate-pulse">qr_code_scanner</span>
              <div className="font-['Plus_Jakarta_Sans'] text-xs font-bold mt-2">Gate Camera Simulation Active</div>
              <div className="font-['Plus_Jakarta_Sans'] text-[10px] text-white/60">Ready to scan attendee digital pass</div>
            </div>

            {/* Manual Passcode Check */}
            <div className="space-y-1.5">
              <label className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Manual Passcode Check</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ticketCheckCode}
                  onChange={(e) => setTicketCheckCode(e.target.value)}
                  placeholder="e.g., LP-IND-8842"
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f8fafc] text-xs font-['Plus_Jakarta_Sans'] border border-[#e2e8f0] outline-none"
                />
                <button 
                  onClick={handleTicketCheck}
                  className="px-4 py-2 rounded-xl bg-[#e11d48] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#be123c]"
                >
                  Check
                </button>
              </div>
              {checkResult && (
                <div className="p-2.5 rounded-xl bg-[#e0e7ff] text-[#1b0062] font-['Plus_Jakarta_Sans'] text-xs font-semibold mt-2">
                  {checkResult}
                </div>
              )}
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-3 flex items-center justify-between text-xs font-['Plus_Jakarta_Sans'] text-[#475569]">
              <span>Gate Terminal:</span>
              <span className="font-bold text-[#0f172a]">Koramangala Terminal #2</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
