import React, { useState } from 'react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenSearch,
  savedCount
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [selectedLocality, setSelectedLocality] = useState('Indiranagar, Bengaluru');
  const [selectedRadius, setSelectedRadius] = useState('5 KM');
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      <div className="h-20 max-w-7xl mx-auto px-5 md:px-8 lg:px-12 flex items-center justify-between gap-3 md:gap-4">
        
        {/* Brand Lockup & Location Selector */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('discover')} 
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[19px]">explore</span>
            </div>
            <span className="font-headline-3 text-2xl font-bold text-slate-900 tracking-tight hidden sm:inline">
              Locora<span className="text-rose-600 font-bold ml-0.5">.</span>
            </span>
          </button>

          {/* Location Pill with Interactive Selector */}
          <div className="relative hidden xl:block">
            <button 
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 px-3.5 py-1.5 rounded-full text-slate-800 font-semibold text-xs transition-colors border border-slate-200/80"
            >
              <span className="material-symbols-outlined text-rose-600 text-base">location_on</span>
              <span className="text-xs font-semibold">{selectedLocality}</span>
              <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 font-bold">{selectedRadius}</span>
              <span className="material-symbols-outlined text-slate-500 text-sm">keyboard_arrow_down</span>
            </button>

            {showLocationMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">Change Neighborhood</div>
                {['Indiranagar, Bengaluru', 'Koramangala, Bengaluru', 'Bandra West, Mumbai', 'Hauz Khas, Delhi NCR'].map(loc => (
                  <button 
                    key={loc}
                    onClick={() => { setSelectedLocality(loc); setShowLocationMenu(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${selectedLocality === loc ? 'bg-rose-50 text-rose-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <span>{loc}</span>
                    {selectedLocality === loc && <span className="material-symbols-outlined text-xs text-rose-600">check</span>}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-2 pt-2 flex items-center justify-between px-2">
                  <span className="text-[11px] font-semibold text-slate-500">Search Radius</span>
                  <div className="flex gap-1">
                    {['3 KM', '5 KM', '10 KM'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setSelectedRadius(r)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${selectedRadius === r ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/70">
          <button 
            onClick={() => onNavigate('discover')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentView === 'discover' 
                ? 'bg-rose-600 text-white font-bold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Discover
          </button>
          <button 
            onClick={() => onNavigate('map-explorer')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentView === 'map-explorer' 
                ? 'bg-rose-600 text-white font-bold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Map Explorer
          </button>
          <button 
            onClick={() => onNavigate('event-detail')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currentView === 'event-detail' 
                ? 'bg-rose-600 text-white font-bold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            Featured Event
          </button>
          
          {/* Quick Hub Portals Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowPortalMenu(!showPortalMenu)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                ['attendee', 'organizer', 'moderation'].includes(currentView)
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <span>Workspaces</span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>

            {showPortalMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                <button 
                  onClick={() => { onNavigate('attendee'); setShowPortalMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-2 text-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-rose-600 text-base">confirmation_number</span>
                  <div>
                    <div className="font-bold text-slate-900">Attendee Portal</div>
                    <div className="text-[10px] text-slate-500">View QR tickets & saved events</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onNavigate('organizer'); setShowPortalMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-2 text-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-indigo-600 text-base">add_business</span>
                  <div>
                    <div className="font-bold text-slate-900">Organizer Engine</div>
                    <div className="text-[10px] text-slate-500">Gate scan & create gathering</div>
                  </div>
                </button>
                <button 
                  onClick={() => { onNavigate('moderation'); setShowPortalMenu(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 flex items-center gap-2 text-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-amber-600 text-base">security</span>
                  <div>
                    <div className="font-bold text-slate-900">Trust & Safety Ops</div>
                    <div className="text-[10px] text-slate-500">Moderation queue & audit log</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button 
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 px-3.5 py-1.5 rounded-full text-slate-600 hover:text-slate-900 transition-colors border border-slate-200/80"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span className="text-xs font-medium">Search popups, gigs...</span>
            <kbd className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">⌘K</kbd>
          </button>

          {/* Host Event CTA */}
          <button 
            onClick={() => onNavigate('organizer')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:shadow transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Host Event</span>
          </button>

          {/* Saved Events Bookmark Quick Link */}
          <button 
            onClick={() => onNavigate('attendee')}
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors"
            title="Saved Events"
          >
            <span className="material-symbols-outlined text-lg">bookmark</span>
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* User Profile / Sign In */}
          <div className="flex items-center pl-1">
            <button 
              onClick={onOpenAuth}
              className="relative p-0.5 rounded-full ring-2 ring-rose-500/30 hover:ring-rose-600 transition-all flex items-center gap-2"
              title="Sign in / Profile"
            >
              <img 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHyjgxmvGoPXujx6ZILsAtqrlMko_aPDggurBNCML3qJ9I6vAlbeIaKrWP5RKLpOIS_a1XWuGp6JMPjiLorRrL4ZoQxq-YA1wEFY8_It_3NbeOmi2Pzcs9ILpCyKBlnpvi6dqWCigPRPXYdLnCIJwFeHOBbiZ9MIO6BKV7iVAococGZHo0G9mysbrCCMjZG9LNB98Ug143XFzWFqF4qhVQervaWT3U5V-O5XRTp3JDtEkC-hRzssTefg"
              />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
