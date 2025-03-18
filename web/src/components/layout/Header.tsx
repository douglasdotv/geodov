'use client';

import { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Audiowide } from 'next/font/google';
import { FiMenu, FiX } from 'react-icons/fi';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { AboutModal } from '@/components/about/AboutModal';
import { CountryStatsModal } from '@/components/stats/CountryStatsModal';
import { getCountryStats } from '@/app/actions';
import { CountryStats } from '@/types/stats';
import { Spinner } from '@/components/shared/Spinner';

const audiowide = Audiowide({
  weight: '400',
  subsets: ['latin'],
});

export function Header() {
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showCountryStats, setShowCountryStats] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPendingGeoStats, startTransitionGeoStats] = useTransition();
  const [isPendingVisitedPlaces, startTransitionVisitedPlaces] =
    useTransition();
  const router = useRouter();

  const handleMapClick = () => {
    startTransitionVisitedPlaces(() => {
      router.push('/places');
      setIsMenuOpen(false);
    });
  };

  const handleHomeClick = () => {
    startTransitionGeoStats(() => {
      router.push('/');
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

  return (
    <>
      <header className='border-b border-gray-300 dark:border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <button
                onClick={handleHomeClick}
                className={`text-xl font-bold ${audiowide.className} cursor-pointer flex items-center gap-2`}
                aria-label='Navigate to home page'
              >
                GeoStats
                {isPendingGeoStats && <Spinner />}
              </button>
              <ThemeToggle />
            </div>

            <div className='hidden md:flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleMapClick}
                  className='px-4 py-2 rounded-md border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                  disabled={isPendingVisitedPlaces}
                >
                  <span>Visited Places</span>
                </button>
                {isPendingVisitedPlaces && <Spinner />}
              </div>
              <button
                onClick={handleCountryStatsClick}
                className='px-4 py-2 rounded-md border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                Country Stats
              </button>
              <button
                onClick={handleAboutClick}
                className='px-4 py-2 rounded-md border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                About
              </button>
            </div>

            <button
              onClick={toggleMenu}
              className='md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div className='md:hidden py-4 space-y-2 animate-[fadeIn_0.2s_ease-out]'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={handleMapClick}
                  className='w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                  disabled={isPendingVisitedPlaces}
                >
                  <span>Visited Places</span>
                </button>
                {isPendingVisitedPlaces && <Spinner />}
              </div>
              <button
                onClick={handleCountryStatsClick}
                className='w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                Country Stats
              </button>
              <button
                onClick={handleAboutClick}
                className='w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
              >
                About
              </button>
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
