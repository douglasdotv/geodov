'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import lookup from 'country-code-lookup';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { CountryStats } from '@/types/stats';
import { formatDistance } from '@/lib/utils';
import { Spinner } from '@/components/shared/Spinner';

interface CountryStatsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly stats: CountryStats[];
}

export function CountryStatsModal({
  isOpen,
  onClose,
  stats,
}: CountryStatsModalProps) {
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCountryCode = (countryName: string) => {
    try {
      const country = lookup.byCountry(countryName);
      return country?.iso2 ?? null;
    } catch {
      return null;
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const percentageDiff = b.correctPercentage - a.correctPercentage;
    if (percentageDiff !== 0) return percentageDiff;

    const guessesDiff = b.totalGuesses - a.totalGuesses;
    if (guessesDiff !== 0) return guessesDiff;

    return a.country.localeCompare(b.country);
  });

  const bestCountries = sortedStats.slice(0, 5);
  const worstCountries = sortedStats.slice(-5).reverse();

  const displayStats = showAllCountries
    ? [...sortedStats].sort((a, b) => a.country.localeCompare(b.country))
    : null;

  const navigateToCountry = (country: string) => {
    setPendingCountry(country);
    const params = new URLSearchParams(searchParams.toString());
    params.set('country', country);
    params.set('page', '1');

    startTransition(() => {
      router.push(`?${params.toString()}`);
      onClose();
    });
  };

  if (!isOpen) return null;

  const overallStats = {
    totalGuesses: stats.reduce((acc, stat) => acc + stat.totalGuesses, 0),
    correctGuesses: stats.reduce((acc, stat) => acc + stat.correctGuesses, 0),
    averageDistance:
      stats.reduce(
        (acc, stat) => acc + stat.averageDistance * stat.totalGuesses,
        0,
      ) / stats.reduce((acc, stat) => acc + stat.totalGuesses, 0),
  };

  const overallPercentage = (
    (overallStats.correctGuesses / overallStats.totalGuesses) *
    100
  ).toFixed(1);

  const renderStatRow = (stat: CountryStats) => {
    const countryCode = getCountryCode(stat.country);
    const isPendingThisCountry = isPending && pendingCountry === stat.country;

    return (
      <button
        key={stat.country}
        onClick={() => navigateToCountry(stat.country)}
        className='w-full text-left flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        disabled={isPending}
      >
        <div className='flex items-center gap-2'>
          {countryCode && (
            <CountryFlag countryCode={countryCode} countryName={stat.country} />
          )}
          <span>{stat.country}</span>
          {isPendingThisCountry && <Spinner />}
        </div>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            {stat.correctGuesses}/{stat.totalGuesses}
          </span>
          <span className='font-mono w-16 text-right'>
            {stat.correctPercentage.toFixed(1)}%
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_ease-out]'>
        <div className='flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold'>Country Statistics</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            disabled={isPending}
          >
            ✕
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          <div className='mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <h3 className='text-lg font-semibold mb-2'>Overall Performance</h3>
            <p>Total Guesses: {overallStats.totalGuesses}</p>
            <p>
              Correct Country: {overallStats.correctGuesses} (
              {overallPercentage}%)
            </p>
            <p>
              Average Distance: {formatDistance(overallStats.averageDistance)}
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            <div>
              <h3 className='text-lg font-semibold mb-4'>Top 5 Countries</h3>
              <div className='space-y-3'>
                {bestCountries.map(renderStatRow)}
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>Bottom 5 Countries</h3>
              <div className='space-y-3'>
                {worstCountries.map(renderStatRow)}
              </div>
            </div>
          </div>

          <div className='mt-8 flex justify-center'>
            <button
              onClick={() => setShowAllCountries(!showAllCountries)}
              className='px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2'
              disabled={isPending}
            >
              {showAllCountries ? 'Hide All Countries' : 'Show All Countries'}
              {isPending && pendingCountry === null && <Spinner />}
            </button>
          </div>

          {displayStats && (
            <div className='mt-8'>
              <h3 className='text-lg font-semibold mb-4'>All Countries</h3>
              <div className='space-y-2'>{displayStats.map(renderStatRow)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
