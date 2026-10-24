import React, { useState } from 'react';
import { AppView } from '../../types';

interface EventDetailViewProps {
  onNavigate: (view: AppView) => void;
  onBookmarkToggle?: (eventId: number) => void;
  isBookmarked?: boolean;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({
  onNavigate,
  onBookmarkToggle,
  isBookmarked = false
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(499);
  const [qty, setQty] = useState<number>(1);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'confirmed'>('idle');

  // Pricing calculations
  const subtotal = selectedTier * qty;
  const platformFee = Math.round(subtotal * 0.05); // 5% fee
  const gst = Math.round(subtotal * 0.18); // 18% GST
  const grandTotal = subtotal + platformFee + gst;

  const handleBooking = () => {
    setBookingStatus('processing');
    setTimeout(() => {
      setBookingStatus('confirmed');
      setTimeout(() => {
        setBookingStatus('idle');
        onNavigate('attendee');
      }, 1500);
    }, 1200);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const addToCalendar = () => {
    const title = encodeURIComponent("Deccan Modular Synth & Indie Audio Showcase");
    const location = encodeURIComponent("Indiranagar Club Rooftop, 100ft Road, Bengaluru");
    const details = encodeURIComponent("Live hardware analog showcase, quadraphonic audio array, community patch clinic. Hosted by Bangalore Sound Collective.");
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20251115T130000Z/20251115T173000Z&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent('Joining Deccan Modular Synth Showcase at Indiranagar Club Rooftop this Saturday! Check it out on Locora: ' + window.location.href);
    window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
  };

  return (
    <div className="flex flex-col w-full pt-20 bg-[#f8fafc]">
      {/* Top Breadcrumb & Status Pill Bar */}
      <section className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[#475569]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium">
            <button onClick={() => onNavigate('discover')} className="hover:text-[#e11d48] transition-colors">Home</button>
            <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
            <button onClick={() => onNavigate('map-explorer')} className="hover:text-[#e11d48] transition-colors">Bengaluru</button>
            <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
            <span className="hover:text-[#e11d48] transition-colors">Music & Audio</span>
            <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
            <span className="text-[#0f172a] font-bold truncate max-w-xs md:max-w-md">Deccan Modular Synth Showcase</span>
          </nav>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#e2e8f0] px-3 py-1 rounded-full text-[#0f172a] font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulse"></span>
              SELLING FAST · 87% CAPACITY
            </span>
            <button 
              onClick={() => onBookmarkToggle?.(101)}
              className="p-2 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] transition-colors"
              title="Save Event"
            >
              <span className={`material-symbols-outlined text-lg ${isBookmarked ? 'text-[#e11d48]' : ''}`}>
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Editorial Poster Hero Header */}
      <section className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 py-2">
        <div className="relative w-full rounded-3xl overflow-hidden bg-[#2f312e] shadow-xl border border-[#e2e8f0]">
          {/* Ambient Poster Backdrop */}
          <div 
            className="w-full h-80 md:h-[420px] bg-cover bg-center" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB67o8aa41doIBFcHK6sUU9S22ul5VgiaPaxPNkbfqA60OLgL3KzuedZBePKZR-7ZtuE4OqSqsa0xwTR10rEVzWzdOCgn3GTEU8fVSNSiBT1e6ZvZ02efqlPdFS_qoLxv-9tr3FzoH_FPXf3fcz-0W2ZW0xbzM6Hwl5gAwN8eM7q9MTse0QQq--MDdgAw2jG9QAwsTHOkzPE41ZIU3aqbHdQHO7V-b5a5Dy7_nu6B-XOgO2gUn3XfNb4g')` }}
          >
            {/* Scrim Overlay */}
            <div className="w-full h-full bg-gradient-to-t from-[#12100C] via-[#12100C]/60 to-transparent flex flex-col justify-between p-6 md:p-10">
              
              {/* Floating Metadata Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#6366f1] text-white font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md font-bold">
                    Music & Audio
                  </span>
                  <span className="bg-white/90 backdrop-blur-md text-[#0f172a] font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#e11d48]">electric_bolt</span>
                    Live Audio Lab
                  </span>
                </div>
                
                <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2 text-[#0f172a]">
                  <span className="material-symbols-outlined text-[#e11d48] text-sm">calendar_month</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">SAT, 15 NOV 2025 · 6:30 PM IST</span>
                </div>
              </div>

              {/* Title & Host Strip */}
              <div className="space-y-3 max-w-4xl pt-8">
                <div className="flex items-center gap-1.5 text-[#e0e7ff] font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider font-semibold">
                  <span className="material-symbols-outlined text-base">place</span>
                  <span>Indiranagar Club Rooftop · 100ft Road, Stage II</span>
                </div>
                
                <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                  Deccan Modular Synth & Indie Audio Showcase
                </h1>

                {/* Host Strip */}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-[#f2f1ed]">
                  <div className="flex items-center gap-2.5">
                    <img 
                      alt="Bangalore Sound Collective" 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#e11d48]"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQNGPM9gEGoS1O1b5Cl8qQqkrTHJO89p5AIHNN0n9HF3zccxAcF3XmGk--caQTMihNrvYFcBdzFaMHIV7Ueru8x0UQ3kEyeVXCYijGUI1ovhXM1vF61NhyaLloXvpSvyWmE1T2b-MxJP85Gzltb3WT_EuCx5awCklGEo6rw6MonwU5bCsgdo2mAUPpTp4jIc8LlQCT1GUaKmUWI0Vw2gUh2TCo6n4E9sjEqJR1X5A1YgNeTdVsgOdzGA"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-white">Bangalore Sound Collective</span>
                        <span className="material-symbols-outlined text-[#ffe4e6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                      <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-white/80">4.9 ★ (182 reviews) · 34 sessions hosted</p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/20 text-white/90 font-['Plus_Jakarta_Sans'] text-xs font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#fef3c7]">group</span> 120 Cap</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#fef3c7]">schedule</span> 4.5 Hours</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#fef3c7]">volume_up</span> 96dB Curfew</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <main className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Narrative & Details (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-10 min-w-0">
            
            {/* Signature SmartMatch Radial Score Card */}
            <div className="bg-[#f8fafc] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 border border-[#e2e8f0]">
              {/* Radial SVG Gauge */}
              <div className="relative flex-shrink-0 w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-[#e2e8f0]" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  <defs>
                    <linearGradient id="matchGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#be123c" />
                      <stop offset="50%" stopColor="#fcd34d" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                  <circle 
                    cx="50" cy="50" fill="transparent" r="40" 
                    stroke="url(#matchGrad)" 
                    strokeDasharray="251.2" 
                    strokeDashoffset="15.07" 
                    strokeLinecap="round" 
                    strokeWidth="8"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-['Plus_Jakarta_Sans'] text-2xl text-[#e11d48] font-bold">94%</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-widest text-[#475569] font-bold">Match</span>
                </div>
              </div>

              {/* Reasons */}
              <div className="flex flex-col space-y-1 flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    SMARTMATCH V4
                  </span>
                  <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">Curated Specifically for Your Sonic Taste</h2>
                </div>
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">
                  Calculated from your past attendance at The Humming Tree reunions, ambient listening histories, and weekend evening geo-preferences.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="flex items-center gap-1.5 text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                    <span className="material-symbols-outlined text-[#e11d48] text-base">check_circle</span>
                    <span>Synth & Ambient tags</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                    <span className="material-symbols-outlined text-[#e11d48] text-base">near_me</span>
                    <span>2.1 km from Metro</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                    <span className="material-symbols-outlined text-[#e11d48] text-base">schedule</span>
                    <span>Saturday evening slot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curatorial Notes & Lineup */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Curatorial Notes & Lineup</h2>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#475569] font-bold">EDITION 07</span>
              </div>
              <div className="space-y-3 font-['Plus_Jakarta_Sans'] text-sm text-[#475569] leading-relaxed">
                <p>
                  Underneath Bengaluru’s November twilight, the <strong className="text-[#0f172a] font-semibold">Deccan Modular Synth Showcase</strong> transforms the historic open-air pavilion of the Indiranagar Club into an experiential sonic laboratory. Seven bespoke Eurorack and semi-modular rigs—handcrafted across South India—converge for an evening spanning deep cinematic drone, generative polyrhythms, and live patch improvisation.
                </p>
                <p>
                  Unlike standard nightclub DJ sets, this showcase centers hardware autonomy: no pre-recorded playback laptops, no safety nets. Each performer builds their audio architecture in real-time, routed through a quadriphonic d&b audiotechnik custom sound array tuned specifically for open rooftop acoustic damping.
                </p>
              </div>

              {/* Featured Artists Bento Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#f1f5f9] rounded-2xl p-4 flex flex-col justify-between border border-[#e2e8f0]">
                  <img className="w-full h-32 rounded-xl object-cover mb-3" alt="Varun Raman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWhIUvHshNBU-0Gv1KHJZYurBJnl9ogjex6d1z62ndEmpL9mTkWVpTAWuRpczc84hDjPmAlgnlcV7pEbnqwY7w7kY1QgvpqzLuOnMxy0PM5vxEmrAljRnrpuS9VZHj8vNb4WfxFcIoLo-aHdSMur6wBKPMqyu6DDO20RnTqpecoqWLN9ScZ3BVUaeO3G3YV9W6UswqC-7wzMPbqlFOh-Oyp33Ji4NZa0M1WSsGQQk5m0dwA8-BN49kvg" />
                  <div>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#e11d48] font-bold uppercase tracking-wider">Modular Rig Solo</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a]">Varun Raman (Koramangala)</h4>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-1">Generative tape loops & Moog Subharmonicon drone sets.</p>
                  </div>
                </div>

                <div className="bg-[#f1f5f9] rounded-2xl p-4 flex flex-col justify-between border border-[#e2e8f0]">
                  <img className="w-full h-32 rounded-xl object-cover mb-3" alt="Neural Ragas" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcVDy3JqMxr4FniJGKpjCWREZWWYyQQ2CfM2U0NoHooawozaPV4H4i_WMAH1CR5spyHhr9_piam51GdVlWFmFY8vnaite_ZqyTbp4SrHEw1ZTcpFnGvMZD1CLw8xQNB9alSZ1-exkFC7KTBHkenBwRWpSvp_On0XwE1E3b9xs5pnvCwwE9aOPVp-EOTXpP3Vmmjn4C6kz7iqdcleMVVZi2TqqlbR28oD3YStdhiufA7NwHnNIgP8B5fg" />
                  <div>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#4f46e5] font-bold uppercase tracking-wider">Live Algorithmic Duo</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a]">Neural Ragas (Kochi / BLR)</h4>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-1">Carnatic microtonal scales interfaced with Buchla style synthesis.</p>
                  </div>
                </div>

                <div className="bg-[#f1f5f9] rounded-2xl p-4 flex flex-col justify-between border border-[#e2e8f0]">
                  <img className="w-full h-32 rounded-xl object-cover mb-3" alt="DIY Patch Lab" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVVtGc7n9x3a-rAizPx9cz-ItKxWKCGG4M3aE0emW3xgo5Ui7dH5ByBgFylmessls3MQyofRx4MXVC0-HuP0zQA_0BdUR6XwEB_OEmXF0xqumfdxgZl-u1FjeyLSrU71IG0wQJXzh81UdfrhwiOyRrKFodAyFK4v-vLvMKvyDLj_UtlBqNFPxFmxcxEBJDA74vqauyPlhhOswI0FNXkC2cvPhyqgL8jPhrX5HE5cADS0qxmecdrBnF8g" />
                  <div>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#d97706] font-bold uppercase tracking-wider">Hardware Workshop</span>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a]">DIY Patch Lab BLR</h4>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-1">Hands-on soldering demo & voltage-controlled oscillator workbench.</p>
                  </div>
                </div>
              </div>

              {/* Essential Details Grid */}
              <div className="bg-[#f8fafc] rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 border border-[#e2e8f0]">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-wider font-bold">Acoustic Setup</span>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a] mt-1">Quadraphonic Array</p>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">Tuned rooftop perimeter</span>
                </div>
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-wider font-bold">Atmosphere</span>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a] mt-1">Intimate Listening</p>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">Seated mats & stools</span>
                </div>
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-wider font-bold">Age Policy</span>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a] mt-1">18+ Only</p>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">Government ID required</span>
                </div>
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-wider font-bold">Refreshments</span>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a] mt-1">Artisan Coffee & Brews</p>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">Club counter open</span>
                </div>
              </div>
            </section>

            {/* Session Schedule Timeline */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Session Schedule</h2>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Subject to sound-check clearance</span>
              </div>

              <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e2e8f0]">
                {[
                  {
                    time: '06:30 PM - 07:15 PM',
                    duration: '45 MINS',
                    dotColor: 'bg-[#4f46e5]',
                    textColor: 'text-[#4f46e5]',
                    title: 'Sunset Ambient Tapestry & Setup Exploration',
                    desc: 'Rooftop access begins. Filter coffee bar open. Ambient tape saturation soundscapes while attendees inspect open patch bays.'
                  },
                  {
                    time: '07:45 PM - 08:40 PM',
                    duration: '55 MINS',
                    dotColor: 'bg-[#e11d48]',
                    textColor: 'text-[#e11d48]',
                    title: 'Live Hardware Performance: Neural Ragas',
                    desc: 'Live Carnatic raga synthesis using open-source Eurorack oscillators, tactile touch-plates, and algorithmic gate sequences.'
                  },
                  {
                    time: '09:00 PM - 10:15 PM',
                    duration: '75 MINS',
                    dotColor: 'bg-[#d97706]',
                    textColor: 'text-[#d97706]',
                    title: 'The Deccan Grand Modular Jam (Quadraphonic)',
                    desc: 'All five artists sync MIDI-CV clocks for an unscripted, high-voltage sonic collaboration moving from ambient drone to 124 BPM broken beats.'
                  },
                  {
                    time: '10:15 PM - 11:00 PM',
                    duration: '45 MINS',
                    dotColor: 'bg-[#64748b]',
                    textColor: 'text-[#0f172a]',
                    title: 'Community Patch Clinic & Gear Swap Q&A',
                    desc: 'Audience invited onto the stage carpet to test modular patch points, ask questions, and trade DIY effect modules.'
                  }
                ].map((s, idx) => (
                  <div key={idx} className="relative flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 bg-[#f8fafc] hover:bg-[#f1f5f9] p-4 rounded-2xl transition-colors border border-[#e2e8f0]">
                    <span className={`absolute -left-6 top-5 w-3 h-3 rounded-full ${s.dotColor} ring-4 ring-[#f8fafc]`}></span>
                    <div className="sm:w-36 flex-shrink-0">
                      <span className={`font-['Plus_Jakarta_Sans'] text-xs font-bold ${s.textColor}`}>{s.time}</span>
                      <span className="block font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">{s.duration}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a]">{s.title}</h4>
                      <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Venue & Getting There */}
            <section className="space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Venue & Getting There</h2>
              <div className="bg-[#f8fafc] rounded-2xl overflow-hidden p-5 sm:p-6 space-y-4 border border-[#e2e8f0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">Indiranagar Club (Rooftop Open Pavilion)</h3>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">4th Cross Rd, Indiranagar 1st Stage, HAL 2nd Stage, Bengaluru, Karnataka 560038</p>
                  </div>
                  <a 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e2e8f0] hover:bg-[#e2e8f0] text-[#0f172a] rounded-full font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-colors flex-shrink-0"
                    href="https://maps.google.com" 
                    rel="noopener noreferrer" 
                    target="_blank"
                  >
                    <span className="material-symbols-outlined text-sm text-[#e11d48]">directions</span>
                    <span>Get Directions</span>
                  </a>
                </div>

                {/* Map Visual */}
                <div 
                  className="w-full h-56 bg-cover bg-center rounded-2xl relative shadow-inner overflow-hidden border border-[#e2e8f0]"
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCBy0cXzKwBEGSHPDfFYQ3AjTpQlXqatju9k3w4p1WT5xbE-n_6pZ4FhlyWphereeiFBVanL3rwoIrTu85t74hxmubaHh7XXuNc9vag5aX1Q6OhUQN4dQW0FkDVN_Q1lmCIy326uzF5CM6q2ktLgBwzuu6Kp5tyC2bhv27C9W2azsJInzafTdkH2kDvwjhG2qXl_qjfoZWHBMWqRMYta5j3j-1XqvGIxmvEhywktH8A2dA6nb56wxlHw')` }}
                >
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-2 border border-white/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#be123c] animate-ping"></span>
                    <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Rooftop Pavilion (South Wing Elevator)</span>
                  </div>
                </div>

                {/* Transportation Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-4 rounded-xl space-y-1 border border-[#e2e8f0]">
                    <div className="flex items-center gap-1.5 text-[#e11d48]">
                      <span className="material-symbols-outlined text-base">directions_subway</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">Namma Metro</span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">CMH Road Purple Line Station is 650m away (~8 min walk).</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl space-y-1 border border-[#e2e8f0]">
                    <div className="flex items-center gap-1.5 text-[#4f46e5]">
                      <span className="material-symbols-outlined text-base">local_parking</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">Parking Support</span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Valet available inside club gate. Dedicated 2-wheeler bay.</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl space-y-1 border border-[#e2e8f0]">
                    <div className="flex items-center gap-1.5 text-[#d97706]">
                      <span className="material-symbols-outlined text-base">accessible</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">Accessibility</span>
                    </div>
                    <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Wheelchair elevator available from Ground Floor lobby to Rooftop deck.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Host Profile Card */}
            <section className="bg-[#f1f5f9] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#e2e8f0]">
              <div className="flex items-start gap-4">
                <img 
                  alt="Bangalore Sound Collective" 
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#e11d48]/20 flex-shrink-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqi1b5eIrtIwsgCjo4hG1zpgoRfUH8qThnUSxFtQX6ziJpaEccCkTp5Nm8EqaLoaF3Zxrh-FjJBYT6u1mH8eTq8vMj6rI9yz6PBSxcsw_jC39MhZNwKCZRB5nZkKr0ZNvHwAypy132siF3MbMsGVI6qRr69KXi6kI8CQQmYPKAHVSVX84qdPpzL3VdbmD9sot1L-LBQNb0aQaG5qh2oUtzXUXk1Afkhfu3Ak_4w6x-0s_2A8VrVDmQyA"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a]">Bangalore Sound Collective</h3>
                    <span className="material-symbols-outlined text-[#e11d48] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">
                    Non-profit creator syndicate spotlighting synth-builders, hardware acousticians, and ambient performers across South India.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs">
                    <span>3.2k Followers</span>
                    <span>·</span>
                    <span>34 Events Curated</span>
                    <span>·</span>
                    <span className="text-[#e11d48] font-bold">Bengaluru, IN</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`w-full sm:w-36 py-2 px-4 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFollowing 
                      ? 'bg-[#e11d48] text-white' 
                      : 'bg-[#e2e8f0] text-[#0f172a] hover:bg-[#e2e8f0]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{isFollowing ? 'check' : 'person_add'}</span>
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                <button className="w-full sm:w-36 py-2 px-4 bg-white text-[#0f172a] hover:bg-[#f8fafc] rounded-full font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#e2e8f0]">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span>Contact</span>
                </button>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section className="space-y-3">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#0f172a]">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {[
                  {
                    id: 1,
                    q: 'What is the ticket refund and transfer policy?',
                    a: 'Tickets are 100% refundable up to 24 hours prior to doors opening (Friday, 14 Nov, 6:30 PM IST). You can also transfer your pass to another attendee via the Locora app profile tab with zero handling fees.'
                  },
                  {
                    id: 2,
                    q: 'Can I bring my own modular synth or patch gear?',
                    a: 'Yes! The post-jam segment (10:15 PM) includes an open community testing bay. Small battery-powered rigs, desktop synth units (like Volcas or Eurorack pods), and DIY pedalboards are welcome. Dedicated 230V power strips will be provided.'
                  },
                  {
                    id: 3,
                    q: 'Is food and beverage permitted or available at the rooftop?',
                    a: 'Outside food and alcohol are strictly prohibited per club guidelines. Indiranagar Club rooftop counters will serve freshly roasted third-wave filter coffee, kombucha, club sandwiches, and seasonal fruit mocktails throughout the event.'
                  },
                  {
                    id: 4,
                    q: 'What happens in case of unexpected rain?',
                    a: 'The Indiranagar Club rooftop features an automated retractable motorized canopy. In the event of showers, the acoustic setup continues uninterrupted with waterproof side baffles deployed.'
                  }
                ].map(faq => (
                  <div key={faq.id} className="bg-[#f8fafc] rounded-xl overflow-hidden border border-[#e2e8f0] transition-all">
                    <button 
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      className="w-full p-4 flex items-center justify-between text-left font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className={`material-symbols-outlined text-lg transition-transform duration-200 ${openFaq === faq.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    {openFaq === faq.id && (
                      <div className="px-4 pb-4 font-['Plus_Jakarta_Sans'] text-xs text-[#475569] leading-relaxed border-t border-[#e2e8f0]/50 pt-2">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT ASIDE: Sticky Registration & Ticket Card (4 Cols) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-xl border-t-4 border-[#e11d48] space-y-4 border-x border-b border-[#e2e8f0]">
              
              {/* Pricing Header */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Passes Starting At</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Plus_Jakarta_Sans'] text-3xl font-bold text-[#0f172a]">₹499</span>
                    <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">+ GST</span>
                  </div>
                </div>
                <span className="bg-[#ffdad6] text-[#ba1a1a] font-['Plus_Jakarta_Sans'] text-[10px] px-2.5 py-1 rounded-full font-bold animate-pulse">
                  3 SPOTS LEFT AT ₹499
                </span>
              </div>

              {/* Tier Selection Radio Cards */}
              <div className="space-y-2.5">
                {[
                  {
                    id: 499,
                    name: 'Early Bird General',
                    price: '₹499',
                    desc: 'Rooftop entry + quadraphonic listening session access.',
                    badge: 'Almost sold out',
                    badgeColor: 'text-[#ba1a1a]'
                  },
                  {
                    id: 999,
                    name: 'Workshop + Gig Pass',
                    price: '₹999',
                    desc: 'Includes hands-on 5:00 PM soldering lab & kit discounts.',
                    badge: '14 spots available',
                    badgeColor: 'text-[#4f46e5]'
                  },
                  {
                    id: 1499,
                    name: 'Community Patron',
                    price: '₹1,499',
                    desc: 'Directly sponsors local synth builders + limited tape release.',
                    badge: 'Collector Edition Tape Included',
                    badgeColor: 'text-[#d97706]'
                  }
                ].map(t => (
                  <label 
                    key={t.id}
                    onClick={() => setSelectedTier(t.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      selectedTier === t.id 
                        ? 'border-2 border-[#e11d48] bg-[#f1f5f9]' 
                        : 'border-[#e2e8f0] bg-[#f8fafc] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="ticketTier" 
                      checked={selectedTier === t.id} 
                      onChange={() => setSelectedTier(t.id)}
                      className="mt-1 accent-[#e11d48]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0f172a]">{t.name}</span>
                        <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#e11d48]">{t.price}</span>
                      </div>
                      <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mt-0.5">{t.desc}</p>
                      <span className={`font-['Plus_Jakarta_Sans'] text-[10px] font-bold ${t.badgeColor} mt-1 block`}>{t.badge}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">Select Number of Passes</span>
                <div className="flex items-center gap-2 bg-[#f1f5f9] rounded-full p-1 border border-[#e2e8f0]">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0f172a] font-bold disabled:opacity-30 hover:bg-[#e2e8f0]"
                  >
                    -
                  </button>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold w-6 text-center text-[#0f172a]">{qty}</span>
                  <button 
                    onClick={() => setQty(Math.min(6, qty + 1))}
                    disabled={qty >= 6}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#0f172a] font-bold disabled:opacity-30 hover:bg-[#e2e8f0]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Fee Breakdown Container */}
              <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-1.5 font-['Plus_Jakarta_Sans'] text-xs border border-[#e2e8f0]">
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Pass subtotal ({qty} × ₹{selectedTier})</span>
                  <span className="text-[#0f172a]">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Platform & Razorpay UPI fee</span>
                  <span className="text-[#0f172a]">₹{platformFee}</span>
                </div>
                <div className="flex items-center justify-between text-[#475569]">
                  <span>GST (18%)</span>
                  <span className="text-[#0f172a]">₹{gst}</span>
                </div>
                <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between font-['Plus_Jakarta_Sans'] text-base text-[#0f172a]">
                  <span className="font-bold">Grand Total</span>
                  <span className="text-[#e11d48] font-bold">₹{grandTotal}</span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="space-y-2">
                <button 
                  onClick={handleBooking}
                  disabled={bookingStatus !== 'idle'}
                  className="w-full py-3.5 px-6 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-sm font-bold shadow-[0_8px_20px_rgba(176,38,0,0.35)] hover:shadow-[0_12px_28px_rgba(176,38,0,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <span className="material-symbols-outlined text-lg">confirmation_number</span>
                  <span>
                    {bookingStatus === 'processing' 
                      ? 'Opening Secure Razorpay...' 
                      : bookingStatus === 'confirmed' 
                        ? 'Pass Reserved! ✓' 
                        : `Reserve My Spot · ₹${grandTotal}`}
                  </span>
                </button>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-center text-[#475569]">
                  Zero risk: Full refund if canceled 24h prior.
                </p>
              </div>

              {/* Trust Badges Strip */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-[#f8fafc] p-2 rounded-xl flex flex-col items-center border border-[#e2e8f0]">
                  <span className="material-symbols-outlined text-[#e11d48] text-base">verified_user</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a] mt-0.5">Verified</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#475569]">By Locora</span>
                </div>
                <div className="bg-[#f8fafc] p-2 rounded-xl flex flex-col items-center border border-[#e2e8f0]">
                  <span className="material-symbols-outlined text-[#4f46e5] text-base">bolt</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a] mt-0.5">Instant QR</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#475569]">WhatsApp pass</span>
                </div>
                <div className="bg-[#f8fafc] p-2 rounded-xl flex flex-col items-center border border-[#e2e8f0]">
                  <span className="material-symbols-outlined text-[#d97706] text-base">lock</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a] mt-0.5">UPI / Cards</span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] text-[#475569]">Secure escrow</span>
                </div>
              </div>

              {/* Share & Actions Strip */}
              <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Spread the word:</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={shareWhatsApp}
                    className="p-2 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] transition-colors" 
                    title="Share on WhatsApp"
                  >
                    <span className="material-symbols-outlined text-base text-emerald-600">chat</span>
                  </button>
                  <button 
                    onClick={copyLink}
                    className="p-2 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] transition-colors" 
                    title="Copy Link"
                  >
                    <span className="material-symbols-outlined text-base">
                      {copiedLink ? 'check' : 'link'}
                    </span>
                  </button>
                  <button 
                    onClick={addToCalendar}
                    className="p-2 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#0f172a] transition-colors" 
                    title="Export to Calendar"
                  >
                    <span className="material-symbols-outlined text-base">event_upcoming</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Sticky Helper Mini Notice */}
            <div className="bg-[#e0e7ff]/60 rounded-2xl p-4 flex items-center gap-3 text-[#1b0062] border border-[#c7d2fe]/60">
              <span className="material-symbols-outlined text-[#4f46e5] text-xl flex-shrink-0">headphones</span>
              <p className="font-['Plus_Jakarta_Sans'] text-xs leading-tight">
                High fidelity sound system on site. Complimentary high-grade silicone earplugs provided at registration.
              </p>
            </div>
          </aside>

        </div>
      </main>

      {/* "You Might Also Vibe With" Related Events Rail */}
      <section className="w-full bg-[#f8fafc] py-16 mt-12 border-t border-[#e2e8f0]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#e11d48] uppercase tracking-widest font-bold">More Sonic Gatherings</span>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl md:text-3xl font-bold text-[#0f172a]">You Might Also Vibe With</h2>
            </div>
            <button 
              onClick={() => onNavigate('map-explorer')}
              className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#e11d48] hover:underline"
            >
              <span>Explore All 28 Music Gigs</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <article 
              onClick={() => onNavigate('map-explorer')}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0] cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Sunday Dusk Acoustic"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqpo5TIx6PE8Q_3N3DELppMD6m3OkfOYKQBCHmhDHfxC5bKE9SNMNtkoo4JF60pDhSBOknY3FVTCezMD3fDlpai8KUspTon0g9lOd-0NPRbfPCVcgb9d3CEISszO3pAN2EPKewPx4nlTZ6A3gMOyOEGlaoFaWPKGo8ds-aA4dDXnS0THRN4koxDmfmDFz_2ofgDt9g81P_rrI9bsrTb4-zapjOzuYgxIVrfpifSoVAo2I-3a36fNaoPA"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a]">
                  SUN, 16 NOV · 5:00 PM
                </span>
                <span className="absolute bottom-3 right-3 bg-[#12100C]/80 text-white backdrop-blur-md px-2 py-0.5 rounded font-['Plus_Jakarta_Sans'] text-xs font-bold">
                  ₹350
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#e11d48] font-bold">Jazz & Soul</span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] mt-1 line-clamp-1 group-hover:text-[#e11d48] transition-colors">
                    Sunday Dusk Acoustic & Espresso Sessions
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] line-clamp-2 mt-1">
                    Warm double-bass and archtop guitar duets paired with freshly brewed single-estate Chikmagalur pour-overs.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[#475569] font-['Plus_Jakarta_Sans'] text-xs pt-2 border-t border-[#f1f5f9]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#e11d48]">place</span> Church Street, 3.4 km</span>
                  <span className="font-bold text-[#0f172a]">88% Match</span>
                </div>
              </div>
            </article>

            {/* Card 2 */}
            <article 
              onClick={() => onNavigate('map-explorer')}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0] cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Koramangala Analog Flea"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIFrtX4w5G5IKUhUcyxhlcLe48Q81fpkHN6e-Y0Qv4rJd0exT-HEczRu5bP95HcGrCjD1yOjdtuNsnkhb_TGOO623RK-dRoZH-kYfRd6CyYipHN5nNax8D_KptTqxgjY01pKNN4MGz5AXnpeqv3ThqZyMDKvUQaYxWjcLqQKhY3HhIEPAdx3yi5lQUyg6rDxIROO3yj8TSGDZ4BUTZtHVx5A07rpgq542jdov-GTNcfwtwBeWAoBQkIQ"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a]">
                  SAT, 22 NOV · 2:00 PM
                </span>
                <span className="absolute bottom-3 right-3 bg-[#12100C]/80 text-white backdrop-blur-md px-2 py-0.5 rounded font-['Plus_Jakarta_Sans'] text-xs font-bold">
                  FREE RSVP
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#4f46e5] font-bold">Vinyl & Flea</span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] mt-1 line-clamp-1 group-hover:text-[#e11d48] transition-colors">
                    Koramangala Analog Flea & Record Dig
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] line-clamp-2 mt-1">
                    Over 1,200 crates of funk, Indian disco, psych-rock, and synth rarities alongside cassette collectors.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[#475569] font-['Plus_Jakarta_Sans'] text-xs pt-2 border-t border-[#f1f5f9]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#4f46e5]">place</span> Koramangala 4th Block, 4.2 km</span>
                  <span className="font-bold text-[#0f172a]">91% Match</span>
                </div>
              </div>
            </article>

            {/* Card 3 */}
            <article 
              onClick={() => onNavigate('map-explorer')}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group border border-[#e2e8f0] cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt="Sub-Basement Raw Techno"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgBRSyC8V7Z47cnlj2gE_aJFX9PNeDFVgdfGlRDzdHQMN9X4wZbVabOTVdpAc31gbURHaYWs010yaS24P5XJHvvWt51q1h4U5i0URAACbqw5mcrl9_ttVwLCI4RmDiu5LSfcQ4YOE331oNI16pDDVvm1NlvIs2OxwUaO4Rnu5264PWaw-ZU_7Sf03vSP291AyFVnnbf_NkN2EKRzaviRodcqPLU56yii2bj5I5T7vvH63mczkC2zjLDg"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a]">
                  FRI, 28 NOV · 9:00 PM
                </span>
                <span className="absolute bottom-3 right-3 bg-[#12100C]/80 text-white backdrop-blur-md px-2 py-0.5 rounded font-['Plus_Jakarta_Sans'] text-xs font-bold">
                  ₹799
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#d97706] font-bold">Underground Club</span>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] mt-1 line-clamp-1 group-hover:text-[#e11d48] transition-colors">
                    Sub-Basement: Raw Industrial Techno
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] line-clamp-2 mt-1">
                    Deep sub frequencies, strobe installations, and international guest selectors at an old warehouse space.
                  </p>
                </div>
                <div className="flex items-center justify-between text-[#475569] font-['Plus_Jakarta_Sans'] text-xs pt-2 border-t border-[#f1f5f9]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#e11d48]">place</span> Central MG Road, 5.1 km</span>
                  <span className="font-bold text-[#0f172a]">82% Match</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};
