import React from 'react';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[16px]">explore</span>
              </div>
              <span className="font-headline-3 text-2xl font-bold text-white">
                Locora <span className="text-rose-500">India</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Hyperlocal cultural chronicles, weekend workshops, indie music showcases, and creator popups curated for urban India.
            </p>
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Hubs:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'].map(hub => (
                  <span key={hub} className="text-xs bg-slate-800 border border-slate-700/60 px-2.5 py-0.5 rounded-full text-slate-200 font-medium">
                    {hub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Neighborhood Hubs */}
          <div>
            <h4 className="font-headline-3 text-base font-bold text-white mb-4">Neighborhood Hubs</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Koramangala, Bengaluru</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Bandra West, Mumbai</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Hauz Khas Village, Delhi</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Jubilee Hills, Hyderabad</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Baner & KP, Pune</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">C-Scheme, Jaipur</li>
            </ul>
          </div>

          {/* Discover Categories */}
          <div>
            <h4 className="font-headline-3 text-base font-bold text-white mb-4">Discover Categories</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li onClick={() => onNavigate('map-explorer')} className="hover:text-rose-400 transition-colors cursor-pointer">Indie Music & Gigs</li>
              <li onClick={() => onNavigate('map-explorer')} className="hover:text-rose-400 transition-colors cursor-pointer">Art, Clay & Handcrafts</li>
              <li onClick={() => onNavigate('map-explorer')} className="hover:text-rose-400 transition-colors cursor-pointer">Heritage Walking Tours</li>
              <li onClick={() => onNavigate('map-explorer')} className="hover:text-rose-400 transition-colors cursor-pointer">Tech & Web3 Meetups</li>
              <li onClick={() => onNavigate('map-explorer')} className="hover:text-rose-400 transition-colors cursor-pointer">Culinary Popups & Tastings</li>
              <li onClick={() => onNavigate('map-explorer')} className="hover:text-rose-400 transition-colors cursor-pointer">Open Mic & Theatre</li>
            </ul>
          </div>

          {/* Organizer & Legal */}
          <div>
            <h4 className="font-headline-3 text-base font-bold text-white mb-4">Organizer & Legal</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li onClick={() => onNavigate('organizer')} className="hover:text-rose-400 transition-colors cursor-pointer font-bold text-rose-400">Organizer Portal</li>
              <li onClick={() => onNavigate('attendee')} className="hover:text-rose-400 transition-colors cursor-pointer">Ticketing & Passes</li>
              <li onClick={() => onNavigate('moderation')} className="hover:text-rose-400 transition-colors cursor-pointer">Trust & Safety Queue</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Community Guidelines</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Privacy & Data Rights</li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">Terms of Experience</li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 Locora India Interactive Ltd. Handcrafted for cultural enthusiasts.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              Live in 6 Metros
            </span>
            <span>Made with pride across India</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
