import { useState, useEffect } from 'react';
import { AppView } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DiscoverView } from './components/views/DiscoverView';
import { MapExplorerView } from './components/views/MapExplorerView';
import { EventDetailView } from './components/views/EventDetailView';
import { AttendeePortalView } from './components/views/AttendeePortalView';
import { OrganizerWorkspaceView } from './components/views/OrganizerWorkspaceView';
import { ModerationAdminView } from './components/views/ModerationAdminView';
import { AuthModal } from './components/AuthModal';
import { SearchModal } from './components/SearchModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('discover');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([1, 2, 3]);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBookmarkToggle = (id: number) => {
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isStandaloneDashboard = ['attendee', 'organizer', 'moderation'].includes(currentView);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Plus_Jakarta_Sans'] text-[#0f172a] flex flex-col selection:bg-[#ffe4e6] selection:text-[#881337]">
      {/* Top Header - Rendered on standard public pages */}
      {!isStandaloneDashboard && (
        <Header 
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenSearch={() => setShowSearchModal(true)}
          savedCount={bookmarkedIds.length}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'discover' && (
          <DiscoverView 
            onNavigate={(view) => setCurrentView(view)}
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {currentView === 'map-explorer' && (
          <MapExplorerView 
            onNavigate={(view) => setCurrentView(view)}
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {currentView === 'event-detail' && (
          <EventDetailView 
            onNavigate={(view) => setCurrentView(view)}
            onBookmarkToggle={handleBookmarkToggle}
            isBookmarked={bookmarkedIds.includes(101)}
          />
        )}

        {currentView === 'attendee' && (
          <AttendeePortalView 
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'organizer' && (
          <OrganizerWorkspaceView 
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'moderation' && (
          <ModerationAdminView 
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* Global Footer - on standard pages */}
      {!isStandaloneDashboard && (
        <Footer onNavigate={(view) => setCurrentView(view)} />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Logged in user can jump to attendee portal
          setCurrentView('attendee');
        }}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onNavigate={(view) => setCurrentView(view)}
      />
    </div>
  );
}
