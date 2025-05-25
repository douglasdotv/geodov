'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';
import { FiMenu, FiX, FiLock } from 'react-icons/fi';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AboutModal } from '@/components/about/AboutModal';
import { CountryStatsModal } from '@/components/stats/CountryStatsModal';
import { getCountryStats } from '@/app/actions';
import { CountryStats } from '@/types/stats';
import { Spinner } from '@/components/shared/Spinner';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export function Header() {
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showCountryStats, setShowCountryStats] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPendingGeoStats, startTransitionGeoStats] = useTransition();
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

  const handleCountryStatsClick = () => {
    setShowCountryStats(true);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const fetchCountryStats = async () => {
      try {
        const stats = await getCountryStats();
        setCountryStats(stats);
      } catch (error) {
        console.error('Failed to fetch country stats:', error);
      }
    };
    fetchCountryStats();
  }, []);

  const navLinkClassName =
    'px-3 py-1.5 rounded-lg font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors flex items-center gap-1';
  const mobileNavLinkClassName =
    'w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2';

  return (
    <>
      <header className='border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-white/95 dark:bg-gray-950/90'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => handleNavigation('/', startTransitionGeoStats)}
                className={`text-xl font-semibold ${spaceGrotesk.className} cursor-pointer flex items-center gap-2`}
                aria-label='Navigate to home page'
                disabled={isPendingGeoStats}
              >
                <span
                  className={`${spaceGrotesk.className} bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent font-bold tracking-tighter`}
                >
                  GuessrStats
                </span>
                {isPendingGeoStats && <Spinner />}
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
                onClick={handleCountryStatsClick}
                className={navLinkClassName}
              >
                Country Stats
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
              className='md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
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
                onClick={handleCountryStatsClick}
                className={mobileNavLinkClassName}
              >
                Country Stats
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

      {showCountryStats && (
        <Suspense
          fallback={
            <div className='flex items-center justify-center h-screen'>
              Loading stats...
            </div>
          }
        >
          <CountryStatsModal
            isOpen={showCountryStats}
            onClose={() => setShowCountryStats(false)}
            stats={countryStats}
          />
        </Suspense>
      )}
    </>
  );
}
