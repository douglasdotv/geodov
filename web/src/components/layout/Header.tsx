'use client';

import { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import { FiMenu, FiX, FiLock } from 'react-icons/fi';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AboutModal } from '@/components/about/AboutModal';
import { StatsModal } from '@/components/stats/StatsModal';
import { Spinner } from '@/components/shared/Spinner';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export function Header() {
  const [showAbout, setShowAbout] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPendingGeoDov, startTransitionGeoDov] = useTransition();
  const [isPendingVisitedPlaces, startTransitionVisitedPlaces] =
    useTransition();
  const [isPendingAdmin, startTransitionAdmin] = useTransition();
  const router = useRouter();

  const handleNavigation = (
    path: string,
    transitionStart: React.TransitionStartFunction,
  ) => {
    transitionStart(() => {
      router.push(path);
      setIsMenuOpen(false);
    });
  };

  const handleAboutClick = () => {
    setShowAbout(true);
    setIsMenuOpen(false);
  };

  const handleStatsClick = () => {
    setShowStats(true);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinkClassName =
    'px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-surface-hover dark:text-gray-300 transition-colors flex items-center gap-1';
  const mobileNavLinkClassName =
    'w-full px-3 py-2 text-left rounded-lg hover:bg-surface-hover transition-colors flex items-center gap-2';

  return (
    <>
      <header className='border-b border-divider glass-subtle'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => handleNavigation('/', startTransitionGeoDov)}
                className={`text-xl font-semibold ${spaceGrotesk.className} cursor-pointer flex items-center gap-2`}
                aria-label='Navigate to home page'
                disabled={isPendingGeoDov}
              >
                <span
                  className={`${spaceGrotesk.className} bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent font-bold tracking-tighter`}
                >
                  GeoDov
                </span>
                {isPendingGeoDov && <Spinner />}
              </button>
              <ThemeToggle />
            </div>

            <nav className='hidden md:flex items-center gap-2'>
              <button
                onClick={() =>
                  handleNavigation('/places', startTransitionVisitedPlaces)
                }
                className={navLinkClassName}
                disabled={isPendingVisitedPlaces}
              >
                Visited Places
                {isPendingVisitedPlaces && <Spinner />}
              </button>
              <button
                onClick={handleStatsClick}
                className={navLinkClassName}
              >
                Stats
              </button>
              <button onClick={handleAboutClick} className={navLinkClassName}>
                About
              </button>
              <Link
                href='/admin'
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/admin', startTransitionAdmin);
                }}
                className={navLinkClassName}
                aria-disabled={isPendingAdmin}
              >
                <FiLock size={16} />
                {isPendingAdmin && <Spinner />}
              </Link>
            </nav>

            <button
              onClick={toggleMenu}
              className='md:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className='md:hidden pb-4 space-y-1 animate-[fadeIn_0.1s_ease-out]'>
              <button
                onClick={() =>
                  handleNavigation('/places', startTransitionVisitedPlaces)
                }
                className={mobileNavLinkClassName}
                disabled={isPendingVisitedPlaces}
              >
                Visited Places
                {isPendingVisitedPlaces && <Spinner />}
              </button>
              <button
                onClick={handleStatsClick}
                className={mobileNavLinkClassName}
              >
                Stats
              </button>
              <button
                onClick={handleAboutClick}
                className={mobileNavLinkClassName}
              >
                About
              </button>
              <Link
                href='/admin'
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/admin', startTransitionAdmin);
                }}
                className={mobileNavLinkClassName}
                aria-disabled={isPendingAdmin}
              >
                <FiLock size={16} />
                {isPendingAdmin && <Spinner />}
              </Link>
            </div>
          )}
        </div>
      </header>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {showStats && (
        <Suspense
          fallback={
            <div className='flex items-center justify-center h-screen'>
              Loading stats...
            </div>
          }
        >
          <StatsModal
            isOpen={showStats}
            onClose={() => setShowStats(false)}
          />
        </Suspense>
      )}
    </>
  );
}
