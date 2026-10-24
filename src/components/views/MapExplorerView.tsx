import React, { useState } from 'react';
import { AppView } from '../../types';

interface MapExplorerViewProps {
  onNavigate: (view: AppView) => void;
  onSelectEvent?: (eventId: number) => void;
  onBookmarkToggle?: (eventId: number) => void;
  bookmarkedIds?: number[];
}

export const MapExplorerView: React.FC<MapExplorerViewProps> = ({
  onNavigate,
  onSelectEvent,
  onBookmarkToggle,
  bookmarkedIds = []
}) => {
  const [selectedState, setSelectedState] = useState('Karnataka');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedLocality, setSelectedLocality] = useState('Indiranagar');
  const [selectedRadius, setSelectedRadius] = useState('5km');
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [dateFilter, setDateFilter] = useState('weekend');
  const [priceFilter, setPriceFilter] = useState('under500');
  const [activeCategory, setActiveCategory] = useState<string>('tech');
  const [activeEventId, setActiveEventId] = useState<number>(1);
  const [mapZoomLevel, setMapZoomLevel] = useState<number>(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);

  // Event Registry for Map
  const events = [
    {
      id: 1,
      title: 'Koramangala Founders & Builders Chai Meetup',
      category: 'Tech & Builders',
      categoryBadge: 'bg-[#ffe4e6] text-[#e11d48]',
      dotColor: 'bg-[#2563EB]',
      venue: 'Third Wave Coffee, 80ft Rd, 4th Block',
      distance: '1.2 km away',
      dateLabel: 'SAT',
      dateNum: '28',
      time: 'Saturday, 10:00 AM – 1:00 PM IST',
      price: '₹199',
      match: '96% SmartMatch',
      spots: '4 spots left',
      host: 'Nikhil Varma (DevRel Hub)',
      hostImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyQ4o2futNMvaEB9nVn4aFYmoAGGlsxICCi93_dWMoDHuPr-AjdPMBYWKdIV9JEfuFZDDwoiDIPXMowzTD9l-Up22jqX7gVsq1YCa3JUDSBqHov_YOYM9QtPepC5D8NDOZzA6bI2q_08L7wvnOVGrQntYz4ddwolxP7xvMVnsJB2JG2EIZ7KtQVESA6WrU7v2f183HH-4gH0-x7G2pgGRY1CmfNNDusd6jVHH9tnYFklZHN4YEnGelcQ',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCboPzOZUf5nJ56qKlh1kaAjOw_TUt0ttYmYVb0iplOhEeh6T8YnL8JyKXEauIy3uRAISc5mVVxOSMNilBT54A6YBDJ8teHEXVtyrAPx3FI5I43TliYn_ffGDRRvQXkhh7efouzrL91vcQgmarP7CoFeN-6sxokmuZK-CxWo-SxxBibro1GYNJEPGuc-0V-8ONIhadRXX6UNx9Y_GYblO4FKfZX8QAnrieiqk9M4DWDRle8iLLwB3AKgw',
      pinPos: { top: '48%', left: '46%' },
      pinIcon: 'terminal',
      pinColor: 'bg-[#be123c]'
    },
    {
      id: 2,
      title: 'Rooftop Sunset Sessions: Raghu Dixit Collective & Friends',
      category: 'Indie Music & Acoustic',
      categoryBadge: 'bg-pink-100 text-[#DB2777]',
      dotColor: 'bg-[#DB2777]',
      venue: 'The Humming Tree Open Air, 12th Main Indiranagar',
      distance: '2.4 km away',
      dateLabel: 'SUN',
      dateNum: '29',
      time: 'Sunday, 5:30 PM – 9:00 PM IST',
      price: '₹450',
      match: '89% Match',
      spots: 'Selling Fast',
      host: 'Acoustic Bengaluru Nights',
      hostImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQRCq8EOiPhdM_K-BVgZ7EDd1tlFr25OQuwe8Yfpze-4hhKTq7M_DK6n1Lf77_5LVAzW2npAfHraMa6xHAukUcVTCPnGztW3OjXvhuQ6K1ckMsc2sdA4p7e4PoRIwEGlj9vIfPrAtLgeW6iC-CZm_Cmk6nt5so5Fh8wWJLs9XxThfx-42q7MatZkKmycoktC78OtnLD2f5Er8QeQ0n_y5YvnzIJSAl2sNFYTLazvBBwJtjdr51JdJ1nw',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMIsZ0jRryTCCcn_NWFYsSQWdqf95_lHinFLTPdjtypENR53o02MdsOwhjDB7qyl35JDuzhduQtsgJt4u1Qu7N-AC3LhuD98O59NH7umTYbeTryZLAE2AyoW3auWyetkOvt0kw9Ywh-k_MrKXB7Ve_EHtz-am5DlISI7Pyc_dDKZzqM7m7bGr6jJztgb5OucXKwSuoSUDjfdT0A7MziEORKyBUk0Ecthy_IwzmhRhoA6fdx_rrY-cgRQ',
      pinPos: { top: '32%', left: '64%' },
      pinIcon: 'music_note',
      pinColor: 'bg-[#DB2777]'
    },
    {
      id: 3,
      title: 'Mastering Wild Fermentation: Sourdough & Tepache Tasting',
      category: 'Culinary Popups',
      categoryBadge: 'bg-orange-100 text-[#EA580C]',
      dotColor: 'bg-[#EA580C]',
      venue: 'Krust Artisan Studio, HAL 2nd Stage, Indiranagar',
      distance: '3.1 km away',
      dateLabel: 'SUN',
      dateNum: '29',
      time: 'Sunday, 11:30 AM – 2:30 PM IST',
      price: '₹850',
      match: '84% Match',
      spots: 'Only 6 Seats',
      host: 'Chef Tanvi Sen',
      hostImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCchcWTfBbb_M9TQFnGpUppqCaNF5xCx8N83ylA_Yt2kUxvBwgpIlT4901Qf8F75C7TFzAVVqNlGTw8l3ZD-Tl50dABiZPvlGa7Xb3__SnCp0abHTfAOqoMRBeqgauM8GTKdmyDrJm5IUnZNF4eVa4uSOIJcH6JZQ2dj1Lo5_Lvk4gNNYOOYgvNr0Oo1nNbAbYda8YLNsL_eomnSJ1hxnVdjIBRkveoV_3SF563iD7CTpbsiWyp56pkrQ',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDj-XrIbKHF4nQNyvqQ5YqhoFZWztT5ihEkyXOaHgoSht-2u3eQkGyytlRaPikTw0m90iSv3OKT2T_NEGH88XK4h0YWBsPg7szdevdl_iC4kBFdAp77gpGwwtaGtm5QFKk2jAiU5jMYlPciu81JwJF6Vi6I_5xDe5JqN8yqrp5gUvG6bELC19qPmLtjrvrQ_BdLPRy0DsupREAru9WzrW9rHAli7cgYGGba3oaFfw5AeyFCU2GsoT1UfQ',
      pinPos: { top: '68%', left: '72%' },
      pinIcon: 'restaurant',
      pinColor: 'bg-[#EA580C]'
    },
    {
      id: 4,
      title: 'Weekend Clay & Wheel Immersion for Beginners',
      category: 'Arts & Handcrafts',
      categoryBadge: 'bg-yellow-100 text-[#d97706]',
      dotColor: 'bg-[#d97706]',
      venue: 'Clay Station Bengaluru, Domlur Ring Rd',
      distance: '3.8 km away',
      dateLabel: 'SAT',
      dateNum: '28',
      time: 'Saturday, 3:30 PM – 6:00 PM IST',
      price: '₹600',
      match: '78% Match',
      spots: 'Materials Provided',
      host: 'Clay Station Collective',
      hostImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYZByWqkkfNB2sUaaauDOFGC5oqsWY7iNulCSaLTY5P3pm1TnioyTvfh_7b52d5jG_63F1B9d_BQsuf-qHA5itpryY6LmK3hcCcfUfQtkE2OY8XHx01-SCb3sGahBcCPlVdSupjf2-ATOAndZ9hHpndghcjMpHyLmfP95D2ccRH8fxnZ8aAoOP1wxjSGS63baa33kK53lxfhd_ZICU-EA6XYPsVvZ8vNcVKrIJiMzczsTKcX76mkCOrA',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnB-lbpK1evF6GQObBfu-SlzA-JyxyloIJ2xSR8PY6KSiH9JZ16huWpL1Ur7XXejOzzXGK5u6NCwg6ahlu-QUsQhKYgLDeAYRVy-TLwTZQHnnZKRzG2WzN8FXP3H11yWkT5x0sYSxejQZJVwErMz7pbWeryZr7HXoH3qj2W3x9KGfr6nUPOaUjHyWIV9KZDbw5AXtxn9gpYKx7UbkdWFN7v5mg2alBcV1s6NhZoo5a3cB4WiM9YHp30g',
      pinPos: { top: '58%', left: '28%' },
      pinIcon: 'palette',
      pinColor: 'bg-[#d97706]'
    }
  ];

  const activeEvent = events.find(e => e.id === activeEventId) || events[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="flex flex-col w-full pt-20 bg-[#f8fafc]">
      {/* Sticky Glass Filter Control Bar */}
      <section className="sticky top-20 z-40 w-full bg-[#f8fafc]/90 backdrop-blur-xl border-b border-[#e2e8f0] shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-3 space-y-2.5">
          {/* Top Row: Location Hierarchy, Radius, View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Nested Location Selector */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f1f5f9] rounded-full border border-[#e2e8f0]">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[#e11d48] text-sm">domain</span>
                <span className="font-bold">{selectedState}</span>
              </div>
              <span className="text-[#64748b] text-xs">/</span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold shadow-sm">
                <span className="font-bold">{selectedCity}</span>
              </div>
              <span className="text-[#64748b] text-xs">/</span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-semibold">
                <span className="material-symbols-outlined text-[#4f46e5] text-xs">near_me</span>
                <span className="font-bold">{selectedLocality}</span>
              </div>
            </div>

            {/* Radius Slider Pill */}
            <div className="flex items-center gap-1.5 bg-[#f1f5f9] px-3.5 py-1 rounded-full border border-[#e2e8f0]">
              <span className="material-symbols-outlined text-[#e11d48] text-sm">radar</span>
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#475569] font-bold">Radius</span>
              <div className="flex items-center gap-1 ml-1">
                {['1km', '3km', '5km', '10km'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRadius(r)}
                    className={`px-2 py-0.5 text-[11px] font-['Plus_Jakarta_Sans'] rounded-full transition-all ${
                      selectedRadius === r
                        ? 'bg-[#be123c] text-white font-bold shadow-sm'
                        : 'text-[#475569] hover:bg-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Segmented Controls */}
            <div className="flex items-center p-1 bg-[#f1f5f9] rounded-full border border-[#e2e8f0]">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#475569] hover:text-[#0f172a]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">view_agenda</span>
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#475569] hover:text-[#0f172a]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                <span className="hidden sm:inline">List Only</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-[#475569] hover:text-[#0f172a]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">map</span>
                <span className="hidden sm:inline">Full Map</span>
              </button>
            </div>
          </div>

          {/* Second Row: Dates, Categories, Price Radios */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#e2e8f0]/60">
            {/* Date Selector */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'today', label: 'Today' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'weekend', label: 'This Weekend' },
                { id: 'custom', label: 'Pick Date', icon: 'calendar_month' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDateFilter(d.id)}
                  className={`flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs transition-colors ${
                    dateFilter === d.id
                      ? 'bg-[#e11d48] text-white font-bold shadow-sm'
                      : 'text-[#475569] hover:bg-[#f1f5f9] font-medium'
                  }`}
                >
                  {d.icon && <span className="material-symbols-outlined text-xs">{d.icon}</span>}
                  <span>{d.label}</span>
                </button>
              ))}
            </div>

            {/* Category Chips with indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'tech', label: 'Tech', color: 'bg-[#2563EB]' },
                { id: 'music', label: 'Music', color: 'bg-[#DB2777]' },
                { id: 'food', label: 'Food', color: 'bg-[#EA580C]' },
                { id: 'arts', label: 'Arts', color: 'bg-[#d97706]' },
                { id: 'sports', label: 'Sports', color: 'bg-[#16A34A]' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-['Plus_Jakarta_Sans'] text-xs font-semibold transition-colors border ${
                    activeCategory === c.id
                      ? 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe] font-bold'
                      : 'bg-white text-[#0f172a] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.color}`}></span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Price Filter Group */}
            <div className="flex items-center bg-[#f1f5f9] p-1 rounded-full border border-[#e2e8f0]">
              {[
                { id: 'all', label: 'All' },
                { id: 'free', label: 'Free' },
                { id: 'under500', label: 'Under ₹500' },
                { id: 'mid', label: '₹500 - ₹2000' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPriceFilter(p.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-['Plus_Jakarta_Sans'] transition-all ${
                    priceFilter === p.id
                      ? 'bg-white text-[#0f172a] font-bold shadow-sm'
                      : 'text-[#475569] hover:text-[#0f172a]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Discovery Workspace (Grid / Split) */}
      <div className="w-full max-w-7xl mx-auto px-5 md:px-8 lg:px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Results Stream */}
          <section className={`${viewMode === 'map' ? 'hidden' : viewMode === 'list' ? 'lg:col-span-12 max-w-4xl mx-auto w-full' : 'lg:col-span-7'} flex flex-col space-y-4`}>
            {/* Results Counter & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] px-4 py-2.5 rounded-xl border border-[#e2e8f0]">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-['Plus_Jakarta_Sans'] text-2xl text-[#e11d48] font-bold">42</span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs md:text-sm text-[#0f172a] font-bold">
                  events happening near <span className="underline decoration-[#e11d48] underline-offset-4">Indiranagar, Bengaluru</span>
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] bg-[#e2e8f0] text-[#475569] px-2 py-0.5 rounded-full font-semibold">Within 5 km</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-[#475569]">Sort by:</label>
                <select className="bg-white text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#e2e8f0] shadow-sm cursor-pointer outline-none">
                  <option>SmartMatch Score</option>
                  <option>Distance (Nearest)</option>
                  <option>Date & Time</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>

            {/* Event Cards Stream */}
            <div className="space-y-4">
              {events.map(ev => {
                const isSelected = ev.id === activeEventId;
                const isSaved = bookmarkedIds.includes(ev.id);

                return (
                  <article
                    key={ev.id}
                    onClick={() => setActiveEventId(ev.id)}
                    className={`cursor-pointer group relative bg-white rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border ${
                      isSelected 
                        ? 'ring-2 ring-[#e11d48] shadow-md border-transparent' 
                        : 'border-[#e2e8f0] shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Thumbnail & Badges */}
                      <div className="relative w-full md:w-56 h-48 md:h-auto rounded-xl overflow-hidden flex-shrink-0 bg-[#f1f5f9]">
                        <img 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          alt={ev.title}
                          src={ev.image}
                        />
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-center shadow-sm">
                          <div className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold text-[#e11d48]">{ev.dateLabel}</div>
                          <div className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0f172a] leading-none">{ev.dateNum}</div>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 bg-[#12100C]/85 backdrop-blur-md text-white font-['Plus_Jakarta_Sans'] text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {ev.price}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onBookmarkToggle?.(ev.id); }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#0f172a] hover:text-[#e11d48] transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isSaved ? 'bookmark_added' : 'bookmark'}
                          </span>
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="flex flex-col justify-between flex-grow min-w-0">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${ev.categoryBadge}`}>
                              {ev.category}
                            </span>
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#4f46e5] text-white font-['Plus_Jakarta_Sans'] text-[10px] font-bold shadow-sm">
                              <span className="material-symbols-outlined text-xs">auto_awesome</span>
                              <span>{ev.match}</span>
                            </div>
                            <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#e11d48] bg-[#ffdad6] px-2 py-0.5 rounded-full font-bold">
                              {ev.spots}
                            </span>
                          </div>

                          <h3 
                            onClick={(e) => { e.stopPropagation(); if (onSelectEvent) onSelectEvent(ev.id); onNavigate('event-detail'); }}
                            className="font-['Plus_Jakarta_Sans'] text-base md:text-lg font-bold text-[#0f172a] group-hover:text-[#e11d48] transition-colors line-clamp-2"
                          >
                            {ev.title}
                          </h3>

                          <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">
                            <span className="material-symbols-outlined text-[#e11d48] text-sm">location_on</span>
                            <span className="truncate">{ev.venue}</span>
                            <span className="text-[#64748b]">·</span>
                            <span className="font-bold text-[#0f172a]">{ev.distance}</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs text-[#475569]">
                            <span className="material-symbols-outlined text-[#4f46e5] text-sm">schedule</span>
                            <span>{ev.time}</span>
                          </div>
                        </div>

                        {/* Host & Action Strip */}
                        <div className="flex items-center justify-between gap-2 pt-3 mt-2 bg-[#f8fafc]/60 p-2 rounded-xl">
                          <div className="flex items-center gap-2">
                            <img alt={ev.host} className="w-6 h-6 rounded-full object-cover" src={ev.hostImg} />
                            <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#0f172a] truncate hidden sm:inline">{ev.host}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setActiveEventId(ev.id)}
                              className="px-3 py-1 rounded-full bg-[#e2e8f0] hover:bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">map</span>
                              <span>Locate</span>
                            </button>
                            <button 
                              onClick={() => { if (onSelectEvent) onSelectEvent(ev.id); onNavigate('event-detail'); }}
                              className="px-4 py-1.5 rounded-full bg-[#e11d48] text-white font-['Plus_Jakarta_Sans'] text-xs font-bold hover:bg-[#be123c] shadow-sm transition-all flex items-center gap-1"
                            >
                              <span>Quick Register</span>
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Load More Button */}
            <div className="pt-4 flex flex-col items-center justify-center space-y-2 pb-8">
              <button
                onClick={() => setHasLoadedMore(true)}
                className="px-6 py-3 rounded-full bg-[#e2e8f0] hover:bg-[#e2e8f0] text-[#0f172a] font-['Plus_Jakarta_Sans'] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#e11d48]">
                  {hasLoadedMore ? 'check_circle' : 'sync'}
                </span>
                <span>{hasLoadedMore ? 'Showing all 42 local events' : 'Load More Nearby Events (38 Remaining)'}</span>
              </button>
              <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569]">
                {hasLoadedMore ? 'All happenings loaded' : 'Showing 4 of 42 curated local activities'}
              </span>
            </div>
          </section>

          {/* Right Column: Sticky Styled Map */}
          <section className={`${viewMode === 'list' ? 'hidden' : viewMode === 'map' ? 'lg:col-span-12 h-[calc(100vh-160px)] min-h-[640px]' : 'lg:col-span-5 sticky top-36 h-[calc(100vh-160px)] min-h-[540px]'} rounded-3xl overflow-hidden bg-[#090d16] shadow-xl flex flex-col relative border border-[#2f312e]`}>
            {/* Interactive Map Area */}
            <div className="relative w-full h-full overflow-hidden select-none">
              
              {/* Map Ambient Dark Vector / Texture Background */}
              <div 
                className="absolute inset-0 w-full h-full bg-[#0f172a] transition-transform duration-500"
                style={{ transform: `scale(${mapZoomLevel})` }}
              >
                {/* SVG Roads & Waterways Graphic Representation */}
                <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Stylized arterial roads of Bengaluru */}
                  <path d="M 0 100 Q 150 180 300 120 T 600 240" fill="none" stroke="#fcd34d" strokeWidth="3" opacity="0.4" />
                  <path d="M 80 0 Q 140 220 220 400 T 360 600" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.3" />
                  <path d="M 0 350 Q 200 320 400 360 T 700 300" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.25" />
                  <circle cx="280" cy="260" r="140" fill="#2563EB" opacity="0.08" />
                  <circle cx="420" cy="380" r="100" fill="#DB2777" opacity="0.06" />
                </svg>
              </div>

              {/* Floating Action Button: Search this area */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg text-[#0f172a] hover:text-[#e11d48] font-['Plus_Jakarta_Sans'] text-xs font-bold transition-all hover:scale-105"
                >
                  <span className={`material-symbols-outlined text-[#e11d48] text-sm ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
                  <span>Search this area</span>
                </button>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
                <button 
                  onClick={() => setMapZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
                  className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md text-[#0f172a] hover:bg-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                  title="Zoom in"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
                <button 
                  onClick={() => setMapZoomLevel(prev => Math.max(prev - 0.15, 0.85))}
                  className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md text-[#0f172a] hover:bg-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                  title="Zoom out"
                >
                  <span className="material-symbols-outlined text-base">remove</span>
                </button>
                <button 
                  onClick={() => { setActiveEventId(1); setMapZoomLevel(1); }}
                  className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md text-[#e11d48] hover:bg-white shadow-md flex items-center justify-center mt-2 transition-transform active:scale-95 cursor-pointer"
                  title="Locate Me"
                >
                  <span className="material-symbols-outlined text-base">my_location</span>
                </button>
              </div>

              {/* Interactive Category-Colored Map Pins */}
              {events.map(ev => {
                const isSelected = ev.id === activeEventId;

                return (
                  <div
                    key={ev.id}
                    onClick={() => setActiveEventId(ev.id)}
                    className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-30 transition-transform duration-300 hover:scale-125"
                    style={{ top: ev.pinPos.top, left: ev.pinPos.left }}
                  >
                    {isSelected && (
                      <div className="absolute -inset-2 rounded-full bg-[#be123c]/40 animate-ping"></div>
                    )}
                    <div className={`relative flex items-center justify-center ${isSelected ? 'w-10 h-10 ring-2 ring-white scale-110' : 'w-8 h-8 ring-1 ring-white/80'} rounded-full ${ev.pinColor} text-white shadow-xl`}>
                      <span className="material-symbols-outlined text-sm">{ev.pinIcon}</span>
                    </div>
                    <div className="w-0 h-0 mx-auto border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-white"></div>
                  </div>
                );
              })}

              {/* Floating Event Preview Card (Anchored at Bottom of Map) */}
              <div className="absolute bottom-10 left-4 right-4 z-30 transition-all duration-300">
                <div 
                  onClick={() => { if (onSelectEvent) onSelectEvent(activeEvent.id); onNavigate('event-detail'); }}
                  className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl flex items-center gap-3 border border-white/20 cursor-pointer hover:bg-white transition-all"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#f1f5f9]">
                    <img alt={activeEvent.title} className="w-full h-full object-cover" src={activeEvent.image} />
                    <span className="absolute bottom-1 left-1 bg-[#12100C]/85 text-white font-['Plus_Jakarta_Sans'] text-[9px] px-1 py-0.5 rounded font-bold">
                      {activeEvent.price}
                    </span>
                  </div>

                  <div className="flex-grow min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase font-bold text-[#e11d48]">{activeEvent.category}</span>
                      <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#475569] font-bold">{activeEvent.distance}</span>
                    </div>
                    <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0f172a] truncate">
                      {activeEvent.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
                      <span>{activeEvent.time.split('–')[0]}</span>
                      <span>·</span>
                      <span className="truncate">{activeEvent.venue.split(',')[0]}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); if (onSelectEvent) onSelectEvent(activeEvent.id); onNavigate('event-detail'); }}
                    className="w-9 h-9 rounded-full bg-[#e11d48] text-white flex items-center justify-center hover:bg-[#be123c] shadow-md transition-all flex-shrink-0 cursor-pointer"
                    title="View Event Details"
                  >
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Attribution */}
              <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[9px] font-['Plus_Jakarta_Sans'] text-white/70">
                <span className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">High-contrast mode enabled</span>
                <span className="bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded">© OpenStreetMap contributors · Locora Cartography</span>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
