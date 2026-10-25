import React, { useState } from 'react';
import { AppView } from '../../types';

interface AttendeePortalViewProps {
  onNavigate: (view: AppView) => void;
}

export const AttendeePortalView: React.FC<AttendeePortalViewProps> = ({ onNavigate }) => {
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'saved' | 'history'>('overview');
  const [savedItems, setSavedItems] = useState([
    {
      id: 1,
      tag: 'Music & Vinyl',
      title: 'Bangalore Crate Diggers: Funk & Disco Showcase',
      venue: 'Record Room, Magrath Road',
      date: 'Fri, 21 Nov • ₹499'
    },
    {
      id: 2,
      tag: 'Culinary Walk',
      title: 'Old Bangalore Military Canteen Twilight Crawl',
      venue: 'Shivajinagar Bus Depot Gate',
      date: 'Sun, 23 Nov • Free RSVP'
    },
    {
      id: 3,
      tag: 'Tech & AI',
      title: 'Autonomous Drone Racing & Edge Vision Meet',
      venue: 'Koramangala 4th Block Grounds',
      date: 'Sat, 29 Nov • ₹250'
    }
  ]);

  const removeSaved = (id: number) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
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
          {/* Attendee Portal */}
          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Attendee Portal
            </div>
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-bold transition-all text-left ${
                  activeTab === 'overview' 
                    ? 'bg-[#be123c] text-white shadow-sm' 
                    : 'text-[#475569] hover:bg-[#e2e8f0] text-[#0f172a]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">grid_view</span>
                <span>Overview</span>
              </button>
              <button 
                onClick={() => setActiveTab('registrations')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium transition-all text-left ${
                  activeTab === 'registrations' 
                    ? 'bg-[#be123c] text-white shadow-sm font-bold' 
                    : 'text-[#475569] hover:bg-[#e2e8f0] text-[#0f172a]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">confirmation_number</span>
                <span>My Registrations</span>
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium transition-all text-left ${
                  activeTab === 'saved' 
                    ? 'bg-[#be123c] text-white shadow-sm font-bold' 
                    : 'text-[#475569] hover:bg-[#e2e8f0] text-[#0f172a]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">bookmark</span>
                <span>Saved Events</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#475569] hover:bg-[#e2e8f0] transition-all text-left"
              >
                <span className="material-symbols-outlined text-lg">history_edu</span>
                <span>History & Feedback</span>
              </button>
            </nav>
          </div>

          {/* Organizer Workspace */}
          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Organizer Workspace
            </div>
            <nav className="space-y-1">
              <button 
                onClick={() => onNavigate('organizer')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#475569] hover:bg-[#e2e8f0] transition-all text-left"
              >
                <span className="material-symbols-outlined text-lg">insights</span>
                <span>Overview & Analytics</span>
              </button>
              <button 
                onClick={() => onNavigate('organizer')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#475569] hover:bg-[#e2e8f0] transition-all text-left"
              >
                <span className="material-symbols-outlined text-lg">event_available</span>
                <span>My Events</span>
              </button>
              <button 
                onClick={() => onNavigate('organizer')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#475569] hover:bg-[#e2e8f0] transition-all text-left"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                <span>Create Event</span>
              </button>
            </nav>
          </div>

          {/* Moderation & Admin */}
          <div>
            <div className="text-[10px] font-['Plus_Jakarta_Sans'] text-[#475569] uppercase tracking-wider font-bold mb-2 px-2">
              Moderation & Admin
            </div>
            <nav className="space-y-1">
              <button 
                onClick={() => onNavigate('moderation')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#475569] hover:bg-[#e2e8f0] transition-all text-left"
              >
                <span className="material-symbols-outlined text-lg">fact_check</span>
                <span>Moderation Queue</span>
              </button>
              <button 
                onClick={() => onNavigate('moderation')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#475569] hover:bg-[#e2e8f0] transition-all text-left"
              >
                <span className="material-symbols-outlined text-lg">list_alt</span>
                <span>Audit Logs</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Return to Discover */}
        <div className="pt-4 border-t border-[#e2e8f0]">
          <button 
            onClick={() => onNavigate('discover')}
            className="flex items-center gap-2 text-xs font-['Plus_Jakarta_Sans'] font-bold text-[#e11d48] hover:underline"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Return to Discover</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
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
            <button 
              onClick={() => onNavigate('discover')}
              className="px-3 py-1 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Attendee View</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#e11d48] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-base">person</span>
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="p-6 lg:p-12 space-y-8 flex-1">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-[#f1f5f9] p-6 md:p-8 shadow-sm border border-[#e2e8f0]">
            <div className="absolute -right-16 -top-20 w-80 h-80 rounded-full bg-[#e0e7ff] opacity-60 blur-3xl pointer-events-none"></div>
            <div className="absolute right-40 -bottom-24 w-72 h-72 rounded-full bg-[#ffe4e6] opacity-40 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#475569] font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping"></span>
                  <span>Bengaluru City Pulse • Active Member</span>
                </div>
                <h1 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl font-bold text-[#0f172a]">
                  Namaste, <span className="text-[#e11d48]">Rahul</span>
                </h1>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#475569]">
                  Your weekend circuit is locked in across Indiranagar & Koramangala. Keep your passes handy for seamless entry scanning.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-[#e2e8f0]">
                <div className="px-4 py-2 text-center">
                  <span className="block font-['Plus_Jakarta_Sans'] text-2xl text-[#e11d48] font-bold leading-none">03</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-wider text-[#475569] font-bold">Upcoming</span>
                </div>
                <div className="w-px h-8 bg-[#e2e8f0]"></div>
                <div className="px-4 py-2 text-center">
                  <span className="block font-['Plus_Jakarta_Sans'] text-2xl text-[#4f46e5] font-bold leading-none">08</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-wider text-[#475569] font-bold">Saved</span>
                </div>
                <div className="w-px h-8 bg-[#e2e8f0]"></div>
                <div className="px-4 py-2 text-center">
                  <span className="block font-['Plus_Jakarta_Sans'] text-2xl text-[#d97706] font-bold leading-none">14</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-wider text-[#475569] font-bold">Attended</span>
                </div>
              </div>
            </div>
          </section>

          {/* Live Advisory Alert */}
          <section className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#e0e7ff] text-[#1b0062] shadow-sm border border-[#c7d2fe]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">campaign</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#1b0062]">Venue Update • Indiranagar</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#4f46e5] text-white font-['Plus_Jakarta_Sans'] text-[9px] uppercase font-bold">New</span>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#3730a3]">
                  Acoustic Evening with Swarathma moved to the Open-Air Rooftop Terrace (Level 3). Entry through Gate 2.
                </p>
              </div>
            </div>
            <button className="shrink-0 px-3 py-1.5 rounded-xl bg-white text-[#1b0062] font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#f8fafc]">
              View Notice
            </button>
          </section>

          {/* Main Grid: Active Passes & SmartMatch Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Passes Stream (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Active Passes & QR Tickets</h2>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Validated live passes ready for gate scan</p>
                </div>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase bg-[#ffe4e6] text-[#881337] px-3 py-1 rounded-full font-bold">
                  2 Live Passes
                </span>
              </div>

              {/* Featured Pass: Deccan Modular Synth */}
              <article className="relative overflow-hidden rounded-3xl bg-white shadow-md border border-[#e2e8f0]">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Event Info (7 cols) */}
                  <div className="md:col-span-7 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#e0e7ff] text-[#3730a3] font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold tracking-wider">
                          Live Synth Expo
                        </span>
                        <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] font-bold">
                          Tier: VIP Backstage
                        </span>
                      </div>
                      <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0f172a] leading-tight mb-1">
                        Deccan Modular Synth Showcase
                      </h3>
                      <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#e11d48] font-bold mb-4">
                        Indiranagar Club • 100ft Road
                      </p>

                      <div className="space-y-2 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-[#e11d48]">calendar_today</span>
                          <span>Sat, 15 Nov • 6:30 PM IST</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-[#4f46e5]">meeting_room</span>
                          <span>Hall 2 • Patchbay Booth A-14</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-[#d97706]">airplane_ticket</span>
                          <span>Pass #IN-DECCAN-992184</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-[#f1f5f9]">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f172a] text-white font-['Plus_Jakarta_Sans'] text-xs font-semibold hover:opacity-90">
                          <span className="material-symbols-outlined text-base">wallet</span>
                          <span>Add to Wallet</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f1f5f9] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold hover:bg-[#e2e8f0]">
                          <span className="material-symbols-outlined text-base text-[#d97706]">chat</span>
                          <span>WhatsApp Pass</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => setShowCancelModal(true)}
                        className="text-[#ba1a1a] font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        <span>Cancel RSVP</span>
                      </button>
                    </div>
                  </div>

                  {/* QR Stub (5 cols) */}
                  <div className="md:col-span-5 bg-[#f8fafc] p-6 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-[#e2e8f0]">
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Gate QR Scan</span>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e11d48] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e11d48]"></span>
                      </span>
                    </div>

                    {/* QR SVG */}
                    <div className="p-3 bg-white rounded-2xl shadow-sm mb-2 border border-[#e2e8f0]">
                      <svg className="w-32 h-32 text-[#0f172a]" fill="currentColor" viewBox="0 0 120 120">
                        <rect x="10" y="10" width="30" height="30" rx="4" fill="currentColor"></rect>
                        <rect x="16" y="16" width="18" height="18" rx="2" fill="#FAF9F5"></rect>
                        <rect x="20" y="20" width="10" height="10" rx="1" fill="currentColor"></rect>
                        <rect x="80" y="10" width="30" height="30" rx="4" fill="currentColor"></rect>
                        <rect x="86" y="16" width="18" height="18" rx="2" fill="#FAF9F5"></rect>
                        <rect x="90" y="20" width="10" height="10" rx="1" fill="currentColor"></rect>
                        <rect x="10" y="80" width="30" height="30" rx="4" fill="currentColor"></rect>
                        <rect x="16" y="86" width="18" height="18" rx="2" fill="#FAF9F5"></rect>
                        <rect x="20" y="90" width="10" height="10" rx="1" fill="currentColor"></rect>
                        <rect x="48" y="12" width="6" height="6" rx="1"></rect>
                        <rect x="60" y="12" width="10" height="6" rx="1"></rect>
                        <rect x="48" y="24" width="8" height="8" rx="1"></rect>
                        <rect x="62" y="24" width="8" height="12" rx="1"></rect>
                        <rect x="48" y="58" width="24" height="24" rx="3" fill="#B02600"></rect>
                        <rect x="54" y="64" width="12" height="12" rx="1" fill="#FAF9F5"></rect>
                        <rect x="82" y="48" width="10" height="6" rx="1"></rect>
                        <rect x="98" y="48" width="8" height="12" rx="1"></rect>
                        <rect x="48" y="88" width="6" height="18" rx="1"></rect>
                        <rect x="60" y="88" width="8" height="6" rx="1"></rect>
                      </svg>
                    </div>

                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] font-mono uppercase">
                      SCAN-ID: 772-NX-BLR
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#e11d48] font-bold mt-0.5">
                      Valid Till 11:59 PM Tonight
                    </span>
                  </div>
                </div>
              </article>

              {/* Secondary Pass */}
              <article className="p-5 rounded-2xl bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#e2e8f0]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#fef3c7] text-[#78350f] flex flex-col items-center justify-center shrink-0">
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold">Sun</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-xl font-bold leading-none">16</span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#3730a3] font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold">Confirmed</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">11:00 AM IST</span>
                    </div>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a]">Koramangala Sunday Tech Brunch</h4>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">The Teal Door Cafe • 80 Feet Road</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button className="px-3.5 py-1.5 rounded-xl bg-[#f1f5f9] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold hover:bg-[#e2e8f0] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">qr_code_2</span>
                    <span>Show QR</span>
                  </button>
                  <button className="p-2 rounded-xl bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0]">
                    <span className="material-symbols-outlined text-base">share</span>
                  </button>
                </div>
              </article>
            </div>

            {/* Right Rail: SmartMatch & Live Feed (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Curated Pulse</h2>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">SmartMatch within 5km radius</p>
                </div>
                <span className="material-symbols-outlined text-[#4f46e5] text-2xl">explore</span>
              </div>

              {/* Highlight Card */}
              <div className="p-6 rounded-2xl bg-[#f8fafc] relative overflow-hidden shadow-sm border border-[#e2e8f0]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e11d48] text-white font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold">
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    <span>SmartMatch 96%</span>
                  </div>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] font-bold">2.4 km away</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a] mb-1">
                  Analog Synthesizer Jam & Solder Lab
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mb-4">
                  Tailored from your affinity with Deccan Modular and open hardware tinkering sessions.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-1 text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs">
                    <span className="material-symbols-outlined text-base text-[#e11d48]">location_on</span>
                    <span>Halasuru Creative Hub</span>
                  </div>
                  <button 
                    onClick={() => onNavigate('event-detail')}
                    className="px-4 py-1.5 rounded-full bg-[#0f172a] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#e11d48] transition-colors"
                  >
                    Quick Reserve
                  </button>
                </div>
              </div>

              {/* Community Radar Live Feed */}
              <div className="p-6 rounded-2xl bg-white shadow-sm space-y-4 border border-[#e2e8f0]">
                <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                  <span className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a]">Community Radar</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase text-[#e11d48] font-bold">Live Feed</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e0e7ff] text-[#3730a3] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base">groups</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Arjun + 4 friends registered</p>
                    <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#475569]">HAL Heritage Aeromodeling Workshop • Koramangala</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#78350f] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base">local_fire_department</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Passes nearly exhausted (4 left)</p>
                    <p className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#475569]">Filter Coffee Cupping Session • 12th Main Indiranagar</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Saved Gatherings Watchlist */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Saved Gatherings Watchlist</h2>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">{savedItems.length} events tracked across Bengaluru East</p>
              </div>
              <button 
                onClick={() => onNavigate('map-explorer')}
                className="font-['Plus_Jakarta_Sans'] text-xs text-[#e11d48] font-bold hover:underline flex items-center gap-1"
              >
                <span>View all saved</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItems.map(item => (
                <article key={item.id} className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between group border border-[#e2e8f0]">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f9] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold">
                        {item.tag}
                      </span>
                      <button 
                        onClick={() => removeSaved(item.id)}
                        className="text-[#64748b] hover:text-[#ba1a1a] transition-colors"
                        title="Remove bookmark"
                      >
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                      </button>
                    </div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-sm text-[#e11d48]">location_on</span>
                      <span>{item.venue}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9]">
                    <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">{item.date}</span>
                    <button 
                      onClick={() => onNavigate('event-detail')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#e11d48] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#be123c]"
                    >
                      Register
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Empty State Fallback: Past Reviews */}
          <section className="rounded-3xl bg-[#f8fafc] p-8 text-center flex flex-col items-center justify-center border border-[#e2e8f0]">
            <div className="w-14 h-14 rounded-full bg-[#f1f5f9] text-[#475569] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">rate_review</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0f172a] mb-1">No Pending Reviews</h3>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] max-w-md mx-auto mb-4">
              You have shared thoughtful community notes for all 14 past gatherings. Your verified feedback helps local curators keep standards stellar.
            </p>
            <button className="px-5 py-2 rounded-full bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#f1f5f9] border border-[#e2e8f0]">
              Browse Past Attendance Archive
            </button>
          </section>
        </div>
      </div>

      {/* Cancel RSVP Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0f172a]">Cancel RSVP?</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-[#475569] hover:text-[#0f172a]">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mb-6 leading-relaxed">
              Releasing your ticket for <span className="font-bold text-[#0f172a]">Deccan Modular Synth Showcase</span> will open your spot to attendees on the waitlist. This action is immediate.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-[#f1f5f9] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold"
              >
                Keep My Spot
              </button>
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  alert('Ticket successfully canceled and refunded.');
                }}
                className="px-4 py-2 rounded-xl bg-[#ba1a1a] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
