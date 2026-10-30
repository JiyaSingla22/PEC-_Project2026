import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { MobileNav } from './components/layout/MobileNav';
import { SplineHero } from './components/feed/SplineHero';
import { UnifiedTimeline } from './components/feed/UnifiedTimeline';
import { ReaderView } from './components/feed/ReaderView';
import { FloatingAudioPlayer } from './components/audio/FloatingAudioPlayer';
import { AddFeedModal } from './components/feed/AddFeedModal';
import { AnonymousDiscovery } from './components/discovery/AnonymousDiscovery';
import { Dialog } from './components/ui/dialog';
import { useFeeds } from './context/FeedContext';

export const App: React.FC = () => {
  const { activeFilter, activeFolder } = useFeeds();
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDiscoveryOpen, setIsMobileDiscoveryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Background ambient lighting glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px]" />
        <div className="absolute top-1/2 -right-40 h-[650px] w-[650px] rounded-full bg-emerald-500/5 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenDiscovery={() => setIsMobileDiscoveryOpen(true)}
      />

      {/* 3-Column Responsive Shell */}
      <div className="relative z-10 flex-1 flex w-full max-w-7xl mx-auto">
        {/* Left Column: Subscriptions & Folders Sidebar (Desktop >= 1024px) */}
        <Sidebar onOpenAddFeed={() => setIsAddFeedOpen(true)} />

        {/* Central Column: Unified Timeline / Reading Feed */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-28">
          {/* Hero only on general 'all' view */}
          {activeFilter === 'all' && activeFolder === 'all' && (
            <SplineHero
              onOpenAddFeed={() => setIsAddFeedOpen(true)}
              onExploreDiscovery={() => setIsMobileDiscoveryOpen(true)}
            />
          )}

          <UnifiedTimeline />
        </main>

        {/* Right Column: Audio Queue & Anonymous Discovery (Desktop >= 1280px) */}
        <RightPanel />
      </div>

      {/* Persistent Floating Audio Player (Sticky bottom) */}
      <FloatingAudioPlayer />

      {/* Distraction-Free Reader View */}
      <ReaderView />

      {/* Add Feed Modal */}
      <AddFeedModal
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
      />

      {/* Mobile Discovery Modal (For screens < 1280px) */}
      <Dialog
        isOpen={isMobileDiscoveryOpen}
        onClose={() => setIsMobileDiscoveryOpen(false)}
        maxWidth="lg"
        title="Anonymous Co-Subscription Discovery"
        description="Collective recommendation engine with transparent reasoning."
      >
        <AnonymousDiscovery />
      </Dialog>
    </div>
  );
};

export default App;
