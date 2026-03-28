'use client';

import { useState, useEffect } from 'react';
import { FiZoomIn, FiMap, FiChevronDown } from 'react-icons/fi';
import { Space_Grotesk } from 'next/font/google';
import { VisitedPlacesMap } from '@/components/map/VisitedPlacesMap';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { Spinner } from '@/components/shared/Spinner';
import { CountryStats, OverviewStats } from '@/types/stats';
import { getCountryStats, getOverviewStats } from '@/app/actions';
import { getCountryCode } from '@/lib/utils';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isZoomTooLow, setIsZoomTooLow] = useState(true);
  const [showCountries, setShowCountries] = useState(false);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);

  useEffect(() => {
    Promise.all([getCountryStats(), getOverviewStats()])
      .then(([stats, ov]) => {
        const sorted = [...stats].sort((a, b) => b.totalGuesses - a.totalGuesses);
        setCountryStats(sorted);
        setOverview(ov);
      })
      .catch(console.error);
  }, []);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='space-y-6'>
        <div>
          <h1
            className={`text-3xl font-bold ${spaceGrotesk.className} bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent tracking-tight`}
          >
            Places I&apos;ve Been
          </h1>
          {overview && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {overview.totalRounds} rounds across {overview.totalCountries} countries
            </p>
          )}
        </div>

        <div className='relative glass'>
          {isLoading && (
            <div className='absolute top-4 right-4 z-10'>
              <Spinner />
            </div>
          )}
          {isZoomTooLow && (
            <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10 glass text-blue-700 dark:text-blue-200 px-4 py-2 shadow-sm flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]'>
              <FiZoomIn className='flex-shrink-0' />
              <span>Zoom in to see locations</span>
            </div>
          )}
          {countryStats.length > 0 && (
            <div className='absolute bottom-4 left-4 z-10 animate-[fadeIn_0.2s_ease-out]'>
              <button
                onClick={() => setShowCountries(!showCountries)}
                className='glass px-3 py-2 text-sm font-medium flex items-center gap-2 shadow-sm hover:bg-surface-hover transition-colors'
              >
                <FiMap size={14} />
                <span>Most Visited Countries</span>
                <FiChevronDown
                  size={14}
                  className={`transition-transform ${showCountries ? 'rotate-180' : ''}`}
                />
              </button>
              {showCountries && (
                <div className='glass mt-2 p-3 shadow-lg max-h-64 overflow-y-auto animate-[fadeIn_0.1s_ease-out]'>
                  <div className='space-y-2'>
                    {countryStats.map((stat) => {
                      const code = getCountryCode(stat.country);
                      return (
                        <div
                          key={stat.country}
                          className='flex items-center justify-between gap-4 text-sm'
                        >
                          <div className='flex items-center gap-2'>
                            {code && (
                              <CountryFlag
                                countryCode={code}
                                countryName={stat.country}
                              />
                            )}
                            <span>{stat.country}</span>
                          </div>
                          <span className='text-gray-500 dark:text-gray-400 font-mono'>
                            {stat.totalGuesses}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className='w-full h-[80vh]'>
            <VisitedPlacesMap
              onLoadingChange={setIsLoading}
              onZoomChange={setIsZoomTooLow}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
