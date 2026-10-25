import React, { useState } from 'react';
import { AppView } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const suggestions = [
    { title: 'Deccan Modular Synth Showcase', cat: 'Indie Music', venue: 'Indiranagar Club' },
    { title: 'Autonomous Agents & Vector Databases Mixer', cat: 'Tech & AI', venue: 'Dialogues Cafe' },
    { title: 'Koramangala Founders & Builders Chai Meetup', cat: 'Tech & Builders', venue: 'Third Wave Coffee' },
    { title: 'Studio Pottery Intensive: Wheel Throwing', cat: 'Arts & Clay', venue: 'Clay Station' },
    { title: 'Bandra Acoustic Evening: Soulful Folk', cat: 'Music & Jazz', venue: 'The Cuckoo Club' }
  ];

  const filtered = suggestions.filter(s => 
    s.title.toLowerCase().includes(query.toLowerCase()) || 
    s.cat.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e8f0] p-6 space-y-4">
        {/* Search Input */}
        <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-3 rounded-2xl border border-[#e2e8f0]">
          <span className="material-symbols-outlined text-[#e11d48] text-xl">search</span>
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons, gigs, supper clubs, pottery..."
            className="w-full bg-transparent font-['Plus_Jakarta_Sans'] text-sm text-[#0f172a] outline-none placeholder:text-[#64748b]"
          />
          <button onClick={onClose} className="text-[#475569] hover:text-[#0f172a]">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Results */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          <div className="text-[10px] font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider text-[#475569] mb-2 px-1">
            Top Curated Matches
          </div>
          {filtered.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => {
                onNavigate('event-detail');
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8fafc] cursor-pointer transition-colors"
            >
              <div>
                <div className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#0f172a]">{item.title}</div>
                <div className="text-xs font-['Plus_Jakarta_Sans'] text-[#475569] flex items-center gap-2 mt-0.5">
                  <span className="text-[#e11d48] font-semibold">{item.cat}</span>
                  <span>•</span>
                  <span>{item.venue}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-base text-[#64748b]">arrow_forward</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs font-['Plus_Jakarta_Sans'] text-[#475569]">
              No exact matches found. Try "Modular", "Jazz", or "Founders".
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px] font-['Plus_Jakarta_Sans'] text-[#475569]">
          <span>Press ESC to close</span>
          <button 
            onClick={() => { onNavigate('map-explorer'); onClose(); }}
            className="text-[#e11d48] font-bold hover:underline"
          >
            Open in Map Explorer →
          </button>
        </div>
      </div>
    </div>
  );
};
