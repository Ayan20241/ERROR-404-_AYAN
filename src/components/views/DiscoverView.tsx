import React, { useRef } from 'react';
import { AppView } from '../../types';

interface DiscoverViewProps {
  onNavigate: (view: AppView) => void;
  onSelectEvent?: (eventId: number) => void;
  onBookmarkToggle?: (eventId: number) => void;
  bookmarkedIds?: number[];
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onNavigate,
  onSelectEvent,
  onBookmarkToggle,
  bookmarkedIds = []
}) => {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (delta: number) => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const handleCardClick = (id: number) => {
    if (onSelectEvent) onSelectEvent(id);
    onNavigate('event-detail');
  };

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: Dark Editorial Hero Band */}
      <section className="relative w-full bg-[#090d16] text-[#f2f1ed] overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 border-b border-[#2f312e]">
        {/* Ambient atmospheric backdrop lights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#e11d48]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -right-24 w-[32rem] h-[32rem] bg-[#4f46e5]/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#fcd34d]/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          {/* Location pulse tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#fda4af] font-['Plus_Jakarta_Sans'] text-xs font-semibold border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#be123c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f43f5e]"></span>
              </span>
              <span className="font-bold tracking-wide uppercase text-[10px]">Live City Radar</span>
            </span>
            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#e2e8f0]/80 hidden sm:inline">• 480+ local gatherings happening today</span>
          </div>

          {/* Main Display Headline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[0.98]">
              Tonight in <span className="text-[#fda4af] italic font-serif">Bengaluru</span>
            </h1>
            <p className="font-['Plus_Jakarta_Sans'] text-base md:text-lg text-[#e2e8f0]/90 max-w-2xl leading-relaxed">
              Discover curated tech meetups, rooftop concerts, pottery workshops, and heritage walks within walking distance. Curated daily for creators and cultural wanderers.
            </p>
          </div>

          {/* Search & Filter Command Bar */}
          <div className="mt-8 md:mt-10 bg-white/10 backdrop-blur-xl p-2.5 md:p-3 rounded-2xl shadow-2xl max-w-5xl border border-white/15">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-stretch">
              {/* Query input */}
              <div className="md:col-span-4 flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm text-[#0f172a] min-h-[50px]">
                <span className="material-symbols-outlined text-[#e11d48] text-xl">search</span>
                <input 
                  className="w-full bg-transparent outline-none font-['Plus_Jakarta_Sans'] text-xs md:text-sm text-[#0f172a] placeholder:text-[#64748b]" 
                  placeholder="Search hackathons, gigs, supper clubs..." 
                  type="text"
                />
              </div>

              {/* Dependent Indian Location Picker */}
              <div className="md:col-span-3 flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm text-[#0f172a] min-h-[50px]">
                <span className="material-symbols-outlined text-[#4f46e5] text-xl">near_me</span>
                <div className="flex flex-col w-full text-left leading-tight justify-center">
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold text-[#64748b]">City · Hub</span>
                  <select className="bg-transparent font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a] outline-none cursor-pointer">
                    <option value="blr-ind">Bengaluru · Indiranagar</option>
                    <option value="blr-kor">Bengaluru · Koramangala</option>
                    <option value="blr-wfd">Bengaluru · Whitefield</option>
                    <option value="bom-ban">Mumbai · Bandra West</option>
                    <option value="del-hkv">Delhi NCR · Hauz Khas</option>
                    <option value="hyd-jub">Hyderabad · Jubilee Hills</option>
                  </select>
                </div>
              </div>

              {/* Quick Filter: Weekend */}
              <div className="md:col-span-3 flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('map-explorer')}
                  className="flex-1 min-h-[50px] flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-3 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-all border border-white/10"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span>This Weekend</span>
                </button>
                <button 
                  onClick={() => onNavigate('map-explorer')}
                  className="min-h-[50px] flex items-center justify-center gap-1 bg-white/15 hover:bg-white/25 text-white px-3 py-3 rounded-xl font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-all border border-white/10"
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>All</span>
                </button>
              </div>

              {/* CTA Command Button */}
              <div className="md:col-span-2">
                <button 
                  onClick={() => onNavigate('map-explorer')}
                  className="w-full min-h-[50px] flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:brightness-110 text-white font-['Plus_Jakarta_Sans'] text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Find Pulse</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trending Ticker Bar */}
          <div className="mt-6 flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
            <span className="font-['Plus_Jakarta_Sans'] text-[11px] tracking-widest uppercase text-[#e2e8f0]/80 shrink-0 font-bold">Trending Tonight:</span>
            <div className="flex items-center gap-2">
              {[
                { name: 'Technology', color: 'bg-[#2563EB]' },
                { name: 'Indie Music', color: 'bg-[#DB2777]' },
                { name: 'Filter Coffee & Food', color: 'bg-[#EA580C]' },
                { name: 'Arts & Pottery', color: 'bg-[#d97706]' },
                { name: 'Heritage & Walks', color: 'bg-[#4f46e5]' },
                { name: 'Founders Circle', color: 'bg-[#e11d48]' },
              ].map(t => (
                <button 
                  key={t.name}
                  onClick={() => onNavigate('map-explorer')}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#f2f1ed] text-xs font-['Plus_Jakarta_Sans'] whitespace-nowrap transition-colors flex items-center gap-1.5 border border-white/10"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${t.color}`}></span>
                  {t.name}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: SmartMatch For You Curated Rail */}
      <section className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0e7ff] text-[#3730a3] font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-wider font-bold mb-2">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>Hyperlocal Intelligence</span>
            </div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl md:text-3xl font-bold text-[#0f172a]">
              SmartMatch For You
            </h2>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#475569] mt-0.5">
              Recommended based on your recent activity, saved tech genres, and 5km radius.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => scrollRail(-380)}
              className="w-10 h-10 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#0f172a] transition-colors shadow-sm"
              aria-label="Previous"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button 
              onClick={() => scrollRail(380)}
              className="w-10 h-10 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#0f172a] transition-colors shadow-sm"
              aria-label="Next"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Scored Cards Carousel */}
        <div 
          ref={railRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x no-scrollbar"
        >
          {/* Card 1 */}
          <article 
            onClick={() => handleCardClick(1)}
            className="min-w-[320px] md:min-w-[380px] max-w-[380px] snap-start bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer border border-[#e2e8f0]"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f1f5f9]">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Autonomous Agents Mixer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-M9yfzCno5MDQsMvTpFRONJlE818HnzspbSULIVE1woUP4l6x63iEijUqN1SUjE24m02D9gUnhJIFWATFR836UibsEu0IqnK0HgL4H3nwNqCe4DPElVBK7w7j_hazvPm_m0DlamTZ1XyekyziDppCNZbFh1FnZo6ZzwpRHT9pjxbeQd6PG3bb2xqAr0F-sT5Myhr2lDoqzO7aPzfpMyORCkrznnlsoOR3EXvuwFLJH1uKKXOFyms55A"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">SAT 28 OCT</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onBookmarkToggle?.(1); }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0f172a] hover:text-[#e11d48] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {bookmarkedIds.includes(1) ? 'bookmark_added' : 'bookmark'}
                </span>
              </button>
              <div className="absolute bottom-3 right-3 bg-[#12100C]/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md font-['Plus_Jakarta_Sans'] text-xs font-bold">
                ₹499
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#e11d48] via-[#d97706] to-[#4f46e5] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold shadow-sm mb-3">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <span>98% Match · Matches AI interest · 1.8 km</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#4f46e5] font-bold">Tech · Generative AI</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors line-clamp-2">
                  Autonomous Agents & Vector Databases Mixer
                </h3>
                <div className="flex items-center gap-1.5 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs mt-2">
                  <span className="material-symbols-outlined text-base text-[#e11d48]">location_on</span>
                  <span className="truncate">Dialogues Cafe, 12th Main, Indiranagar</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef3c7] text-[#78350f] font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse"></span>
                  Almost full · 4 seats left
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#e11d48] font-bold inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Book Pass <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>

          {/* Card 2 */}
          <article 
            onClick={() => handleCardClick(2)}
            className="min-w-[320px] md:min-w-[380px] max-w-[380px] snap-start bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer border border-[#e2e8f0]"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f1f5f9]">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Sunday Sundowner"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZAKunEP_AJzYtsOH3pEZBbLOV1GXjePdTuJwXM9h6OEBJqOjGT64ttzhwhxFpS2xeXpZnjTJR4jL25C2qvfcI5nDvnO-gp1H9Yr_Du4r9HCZTGHx_TDcK610JINxBwDdMTaBGDrTSSrZjXhHZGS2iqYOFOoQYfRiXZfLHddndZ5ltlS9LHif0Zfa4aCJugQP1nHEVc2NsvlwxQ_N9OdkhUt1PVRk3c9z83mW4iByxe6Xkl3iOGw-0OQ"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">SUN 29 OCT</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onBookmarkToggle?.(2); }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0f172a] hover:text-[#e11d48] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {bookmarkedIds.includes(2) ? 'bookmark_added' : 'bookmark'}
                </span>
              </button>
              <div className="absolute bottom-3 right-3 bg-[#12100C]/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md font-['Plus_Jakarta_Sans'] text-xs font-bold">
                Free Pass
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#e11d48] via-[#d97706] to-[#4f46e5] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold shadow-sm mb-3">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <span>94% Match · Indie Music · Indiranagar</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#e11d48] font-bold">Live Acoustics · Community</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors line-clamp-2">
                  Sunday Sundowner: Indie Fingerstyle & Storytelling
                </h3>
                <div className="flex items-center gap-1.5 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs mt-2">
                  <span className="material-symbols-outlined text-base text-[#e11d48]">location_on</span>
                  <span className="truncate">The Humming Tree Terrace, Indiranagar (2.4 km)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f8fafc] text-[#475569] font-['Plus_Jakarta_Sans'] text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]"></span>
                  RSVP Open · 22 Attending
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#e11d48] font-bold inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Join Guestlist <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>

          {/* Card 3 */}
          <article 
            onClick={() => handleCardClick(3)}
            className="min-w-[320px] md:min-w-[380px] max-w-[380px] snap-start bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer border border-[#e2e8f0]"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f1f5f9]">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Studio Pottery"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjJ16HLGe6rM0KmgfFJVL5QBG8qX0XlczAshHrlBUJb47AHRuZzzBiu4YceVr55HpTkdlRGZFvn4KwXIcKOyx6IEN-zAP6VY87sbQzERiR1uEXTDvqlXDtZsNuvZTZGXNpsJWe0kqp7idobXiZtJx9ydMuhuneojEDxOX1t88QmV1tFiMMTbzptAYs5uNV9gcr1TzzbLasqjVAkTtQVSXQVJLMCth_SERneUBtU7kiT74DsOgB6nV1Tw"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">SAT 28 OCT</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onBookmarkToggle?.(3); }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0f172a] hover:text-[#e11d48] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {bookmarkedIds.includes(3) ? 'bookmark_added' : 'bookmark'}
                </span>
              </button>
              <div className="absolute bottom-3 right-3 bg-[#12100C]/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md font-['Plus_Jakarta_Sans'] text-xs font-bold">
                ₹1,200
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#e11d48] via-[#d97706] to-[#4f46e5] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold shadow-sm mb-3">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <span>89% Match · Handcrafts · High rated</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#d97706] font-bold">Studio Workshop · Clay</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors line-clamp-2">
                  Studio Pottery Intensive: Wheel Throwing & Glazing
                </h3>
                <div className="flex items-center gap-1.5 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs mt-2">
                  <span className="material-symbols-outlined text-base text-[#e11d48]">location_on</span>
                  <span className="truncate">Clay Station, Sadashivanagar (4.1 km)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef3c7] text-[#78350f] font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse"></span>
                  2 Spots Remaining
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#e11d48] font-bold inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Book Studio <span className="material-symbols-outlined text-sm ml-0.5">arrow_forward</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* SECTION 3: Featured Big Editorial Poster */}
      <section className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 mt-16">
        <div className="relative bg-[#090d16] text-[#f2f1ed] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* Imagery with dark gradient scrim */}
            <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden">
              <img 
                className="w-full h-full object-cover" 
                alt="Bengaluru Tech & AI Unconference 2025"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVwvu_CTIjgwNqmKG7xeICYEWk7Plt80mpWSEtGrA5gg6ix82il7BZUOpkBSzQq3gabwivyQbJzuNKqIu_w2SlqArm_IOpD9Fu4zYgtPm5Qao0nwNtQvoYQYos-fV4b-eKhww8I7ugA6ZaiurPN_qeYxnRb7OYxOpBR9snKtBZEYB0Dn4Z4Le1cEXG1YvwpaZFs7n9P9JDRx5njgUb9FMLpF9zYxx1Yu7U1Wm50G13MGewTYkfs6N0Dg"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#090d16]/60 to-[#090d16]"></div>
              
              {/* Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#090d16]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#be123c] animate-ping"></span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#ffe4e6] tracking-wide uppercase">Curator Pick of the Month</span>
              </div>
            </div>

            {/* Editorial Info */}
            <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6366f1] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Verified Collective
                  </span>
                  <span className="text-[#e2e8f0] font-['Plus_Jakarta_Sans'] text-xs">November 15-16, 2025</span>
                </div>

                <h3 className="font-['Plus_Jakarta_Sans'] text-2xl lg:text-3xl font-bold text-white leading-tight mb-3">
                  Bengaluru Tech & AI Unconference 2025
                </h3>
                <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#e2e8f0]/85 mb-6 leading-relaxed">
                  UB City Amphitheatre gathers 1,200 founders, researchers, and venture builders for non-hierarchical debates, unscripted teardowns, and midnight demo tables.
                </p>

                {/* Keynote Sessions Chips */}
                <div className="space-y-2 mb-6">
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#ffe4e6] font-bold">Keynote Sessions & Salons</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-[#f43f5e] text-sm">psychology</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs text-white">LLM Kernels & Infra</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-[#c7d2fe] text-sm">hub</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs text-white">Spatial AI Labs</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                      <span className="material-symbols-outlined text-[#fef3c7] text-sm">forum</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs text-white">Founder AMAs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Strip */}
              <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#e2e8f0]/70">Tier-1 Passes</span>
                  <p className="font-['Plus_Jakarta_Sans'] text-2xl text-white font-bold">
                    ₹2,499 <span className="font-['Plus_Jakarta_Sans'] text-xs font-normal text-[#e2e8f0]/70">/ 2 days</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => onNavigate('event-detail')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-colors"
                  >
                    View Schedule
                  </button>
                  <button 
                    onClick={() => onNavigate('event-detail')}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold shadow-xl transition-transform active:scale-95"
                  >
                    Reserve Seat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Explore Across Neighborhoods */}
      <section className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans'] text-2xl md:text-3xl font-bold text-[#0f172a]">
              Explore Across Neighborhoods
            </h2>
            <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#475569] mt-0.5">
              Select a mood or community niche to unlock gatherings across Indian cultural hubs.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['All Metros', 'Indie Music & Comedy', 'Art & Clay Workshops', 'Heritage Walks', 'Fitness & Outdoors'].map((cat, idx) => (
              <button 
                key={cat}
                className={`px-3.5 py-1.5 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-semibold whitespace-nowrap transition-colors ${
                  idx === 0 
                    ? 'bg-[#0f172a] text-white' 
                    : 'bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <article 
            onClick={() => handleCardClick(4)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group border border-[#e2e8f0] cursor-pointer"
          >
            <div className="relative w-full aspect-[4/3] bg-[#f1f5f9] overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Koramangala Tech Brunch"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdJuLKfT1PM9JAXTNHYluRYAh-ZHC5NUlzXGBbhpewYTK470XU1NB1lwy3wAs2gbiticCl60xtgRyuI-hASDmHPUsBW3POR0HV0SYtn68rUeFBU-GP3StDF5aEkQczFeJDejwngQ6me26wvb5eX4Z624LQqGAy4LxRqFbOAUBDMeYbEyozHIOnB0FxDqX5AGlHR12TwprgIdSDKQQ5uk0mtNnrFHve65fsmDwkbbTfMcuzl30-q1S3Wg"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">SUN 29 OCT · 11 AM</span>
              </div>
              <div className="absolute top-3 right-3 bg-[#f8fafc]/95 backdrop-blur-md px-2.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a]">
                Bengaluru
              </div>
              <div className="absolute bottom-3 right-3 bg-[#12100C]/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md font-['Plus_Jakarta_Sans'] text-xs font-bold">
                ₹650 incl. brunch
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48]"></span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Tech · Founders Meet</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors">
                  Koramangala Sunday Tech Brunch: Scaling 0 to 10M ARR
                </h3>
                <div className="flex items-center gap-1.5 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs mt-2">
                  <span className="material-symbols-outlined text-base text-[#e11d48]">location_on</span>
                  <span className="truncate">Third Wave Roasters, 4th Block, Koramangala</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#4f46e5]">groups</span> 38 Attending
                </span>
                <button className="px-3 py-1.5 rounded-full bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold transition-colors">
                  Details
                </button>
              </div>
            </div>
          </article>

          {/* Card 2 */}
          <article 
            onClick={() => handleCardClick(5)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group border border-[#e2e8f0] cursor-pointer"
          >
            <div className="relative w-full aspect-[4/3] bg-[#f1f5f9] overflow-hidden">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="Bandra Acoustic Evening"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEbnoBpmuVrSoOUSyKKCAWqHw1ODttiTvgJ4xVPc1B38VPyF1n3j5CBD8pBmVnkMB-IvC5KR7sysY9tcnh5isKx68bJelLgKUtN2V-cx3OpfYpFDqmYja2LfcR44YCoB-GHYDm3OIEgb04LHtLscqf5zLTKSzVmcZ7qGt29TLM_DiQLHpqTzXKKcjfxKsoAwIH9dmeqerBJqrJsTjR9DtSefST53_V1MCE-8m5UedLVrBP4wP-Uoei8Q"
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#0f172a]">FRI 3 NOV · 8 PM</span>
              </div>
              <div className="absolute top-3 right-3 bg-[#f8fafc]/95 backdrop-blur-md px-2.5 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-[10px] font-bold text-[#0f172a]">
                Mumbai
              </div>
              <div className="absolute bottom-3 right-3 bg-[#12100C]/85 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md font-['Plus_Jakarta_Sans'] text-xs font-bold">
                ₹799
              </div>
            </div>
            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4f46e5]"></span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider text-[#475569] font-bold">Music · Intimate Gigs</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors">
                  Bandra Acoustic Evening: Soulful Folk & Contemporary Jazz
                </h3>
                <div className="flex items-center gap-1.5 text-[#475569] font-['Plus_Jakarta_Sans'] text-xs mt-2">
                  <span className="material-symbols-outlined text-base text-[#e11d48]">location_on</span>
                  <span className="truncate">The Cuckoo Club, Pali Hill, Bandra West</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef3c7] text-[#78350f] font-['Plus_Jakarta_Sans'] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse"></span>
                  Selling Fast
                </span>
                <button className="px-3 py-1.5 rounded-full bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold transition-colors">
                  Details
                </button>
              </div>
            </div>
          </article>

          {/* Card 3: Interactive Neighborhood Map Teaser */}
          <article className="bg-[#f1f5f9] rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden border border-[#e2e8f0]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#ffe4e6] text-[#881337] font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-wider">
                  Interactive Map
                </span>
                <span className="material-symbols-outlined text-[#e11d48] text-xl">map</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0f172a] mb-2">
                Want to see what's near your street?
              </h3>
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569] mb-4 leading-relaxed">
                Switch to the dynamic radar view to find popups happening within 2 km of your current pin.
              </p>
              
              {/* Map Preview Graphic */}
              <div className="w-full h-32 rounded-xl bg-gradient-to-tr from-[#0f172a] to-[#2f312e] relative flex items-center justify-center overflow-hidden border border-[#e2e8f0]">
                <div className="relative flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md text-[#0f172a]">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping"></span>
                  <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold">14 Events within 15 mins walk</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <button 
                onClick={() => onNavigate('map-explorer')}
                className="w-full flex items-center justify-center gap-2 bg-[#0f172a] text-white hover:bg-[#e11d48] font-['Plus_Jakarta_Sans'] text-xs font-bold py-3 px-4 rounded-full shadow-md transition-all cursor-pointer"
              >
                <span>Launch Map Explorer</span>
                <span className="material-symbols-outlined text-base">explore</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* SECTION 5: Real-time Stats Grid */}
      <section className="max-w-7xl mx-auto w-full px-5 md:px-8 lg:px-12 mt-16 mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-[#e2e8f0]">
          <div className="space-y-1">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-widest font-bold">Active Gatherings</span>
            <div className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl text-[#e11d48] font-bold">480+</div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Live in Bengaluru this weekend</p>
          </div>
          <div className="space-y-1">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-widest font-bold">Attendees Connected</span>
            <div className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl text-[#4f46e5] font-bold">12.4K</div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Bookings made this month</p>
          </div>
          <div className="space-y-1">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-widest font-bold">Independent Creators</span>
            <div className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl text-[#d97706] font-bold">890+</div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Hosts, artists & facilitators</p>
          </div>
          <div className="space-y-1">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] uppercase tracking-widest font-bold">Match Accuracy</span>
            <div className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl text-[#be123c] font-bold">96%</div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">Report finding their community</p>
          </div>
        </div>

        {/* Creator Spotlight Bento Box */}
        <div className="mt-8 bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] rounded-3xl p-6 md:p-10 shadow-sm border border-[#e2e8f0]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffe4e6] text-[#881337] font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-xs">rocket_launch</span>
                <span>Local Organizer Spotlight</span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl lg:text-3xl font-bold text-[#0f172a]">
                Host your own community in 3 minutes.
              </h2>
              <p className="font-['Plus_Jakarta_Sans'] text-sm text-[#475569] leading-relaxed max-w-xl">
                Whether you're curating a niche tech salon, a terrace reading circle, or a specialty coffee brew flight, Locora provides ticketing, QR check-ins, and instant SmartMatch distribution to enthusiasts in your zip code.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button 
                  onClick={() => onNavigate('organizer')}
                  className="px-6 py-3 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2"
                >
                  <span>Publish Free Event</span>
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                </button>
                <button 
                  onClick={() => onNavigate('organizer')}
                  className="px-5 py-3 rounded-full bg-white text-[#0f172a] hover:bg-[#f8fafc] font-['Plus_Jakarta_Sans'] text-xs font-bold transition-colors border border-[#e2e8f0]"
                >
                  Organizer Playbook
                </button>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#e2e8f0] space-y-3">
              <div className="flex items-center gap-1 text-[#ffb03a]">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <blockquote className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] italic leading-relaxed">
                “Locora transformed our little Indiranagar AI reading club into a packed weekend salon with 40 active builders. The hyperlocal discovery brings exactly the right people right to our doorstep.”
              </blockquote>
              <div className="flex items-center gap-3 pt-2">
                <img 
                  alt="Ananya Deshmukh" 
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ffe4e6]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-0txLptdgXapTgNWyInZZXbc11XF5slT-PjexBEg7DiLYeP4GgBfXtYkTrpTPiSekN27v7tYnW-WsvmCpxBxDosJcLY5rowdO2usAURvFM73NiI376oA_l-K7yyo-iNiuECOzIWhLUX8GUXE3t-0nnZmxWPKPhz1j-q4YH4kyye5rxfMJ_L-cdKO7_IDLvRqwaGOhkGZ3D0MSkh-SL3wUMDQqePvB-7jJMszDt7iQSdWCoRfWldQm-A"
                />
                <div>
                  <div className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0f172a]">Ananya Deshmukh</div>
                  <div className="font-['Plus_Jakarta_Sans'] text-[11px] text-[#475569]">Founder, Bangalore AI Salons · Indiranagar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
