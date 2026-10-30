import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightPanel } from './components/layout/RightPanel';
import { MobileNav } from './components/layout/MobileNav';
import { NewspaperMasthead } from './components/feed/NewspaperMasthead';
import { IncogniMagnifierHero } from './components/feed/IncogniMagnifierHero';
import { UnifiedTimeline } from './components/feed/UnifiedTimeline';
import { ReaderView } from './components/feed/ReaderView';
import { AddFeedModal } from './components/feed/AddFeedModal';
import { OPMLModal } from './components/discovery/OPMLModal';
import { AnonymousDiscovery } from './components/discovery/AnonymousDiscovery';
import { Dialog } from './components/ui/dialog';
import { useFeeds } from './context/FeedContext';

export const App: React.FC = () => {
  const { activeFilter, activeFolder } = useFeeds();
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isOPMLOpen, setIsOPMLOpen] = useState(false);

  return (
    <div className="min-h-screen bg-theme-base text-theme-body flex flex-col font-sans selection:bg-[#e2cba8]/30 selection:text-[#e2cba8] transition-colors duration-200">
      {/* Background ambient lighting glows - strictly pastel accents in dark mode */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden dark:block transition-opacity">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#e2cba8]/5 blur-[150px]" />
        <div className="absolute top-1/2 -right-40 h-[650px] w-[650px] rounded-full bg-[#a3c9a8]/5 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#d8b988]/5 blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenOPML={() => setIsOPMLOpen(true)}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAddFeed={() => setIsAddFeedOpen(true)}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenOPML={() => setIsOPMLOpen(true)}
      />

      {/* 3-Column Responsive Shell */}
      <div className="relative z-10 flex-1 flex w-full max-w-7xl mx-auto bg-theme-base">
        {/* Left Column: Subscriptions & Folders Sidebar (Desktop >= 1024px) */}
        <Sidebar
          onOpenAddFeed={() => setIsAddFeedOpen(true)}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          onOpenOPML={() => setIsOPMLOpen(true)}
        />

        {/* Central Column: Unified Timeline / Reading Feed */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto pb-12 bg-theme-base text-theme-body">
          {/* Newspaper Broadsheet Masthead Banner */}
          <NewspaperMasthead
            onOpenAddFeed={() => setIsAddFeedOpen(true)}
            onExploreDiscovery={() => setIsDiscoveryOpen(true)}
          />

          {/* Hero Newspaper with Moving Magnifier on front page general view */}
          {activeFilter === 'all' && activeFolder === 'all' && (
            <IncogniMagnifierHero
              onOpenAddFeed={() => setIsAddFeedOpen(true)}
              onExploreDiscovery={() => setIsDiscoveryOpen(true)}
            />
          )}

          <UnifiedTimeline />
        </main>

        {/* Right Column: Anonymous Discovery & Reading List (Desktop >= 1280px) */}
        <RightPanel />
      </div>

      {/* Distraction-Free Reader View */}
      <ReaderView />

      {/* Add Feed Modal */}
      <AddFeedModal
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
      />

      {/* OPML Import / Export Modal */}
      <OPMLModal
        isOpen={isOPMLOpen}
        onClose={() => setIsOPMLOpen(false)}
      />

      {/* Anonymous Discovery Modal */}
      <Dialog
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        title="✦ Anonymous Dispatches & Co-Subscriptions"
        description="Graph-based discovery of peer dispatches verified completely client-side without sharing identity or telemetry."
        maxWidth="2xl"
      >
        <AnonymousDiscovery />
      </Dialog>
    </div>
  );
};

export default App;
