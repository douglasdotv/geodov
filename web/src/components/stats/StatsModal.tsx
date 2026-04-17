'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CountryFlag } from '@/components/shared/CountryFlag';
import { Spinner } from '@/components/shared/Spinner';
import {
  CountryStats,
  OverviewStats,
  GameTypeStats,
  MovementStats,
} from '@/types/stats';
import {
  getCountryStats,
  getOverviewStats,
  getGameTypeStats,
  getMovementStats,
} from '@/app/actions';
import { formatDistance, getCountryCode } from '@/lib/utils';

type Tab = 'overview' | 'countries';
type Period = 'all' | 'month' | 'week';

interface StatsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

function getPeriodDate(period: Period): string | undefined {
  if (period === 'all') return undefined;
  const now = new Date();
  if (period === 'month') {
    now.setMonth(now.getMonth() - 1);
  } else {
    now.setDate(now.getDate() - 7);
  }
  return now.toISOString();
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState<Period>('all');
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingCountry, setPendingCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(
    null,
  );
  const [gameTypeStats, setGameTypeStats] = useState<GameTypeStats[]>([]);
  const [movementStats, setMovementStats] = useState<MovementStats[]>([]);

  const fetchStats = useCallback(async (p: Period) => {
    setIsLoading(true);
    try {
      const fromDate = getPeriodDate(p);
      const [country, overview, gameType, movement] = await Promise.all([
        getCountryStats(fromDate),
        getOverviewStats(fromDate),
        getGameTypeStats(fromDate),
        getMovementStats(fromDate),
      ]);
      setCountryStats(country);
      setOverviewStats(overview);
      setGameTypeStats(gameType);
      setMovementStats(movement);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchStats(period);
    }
  }, [isOpen, period, fetchStats]);

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    setShowAllCountries(false);
  };

  const navigateToCountry = (country: string) => {
    setPendingCountry(country);
    const params = new URLSearchParams(searchParams.toString());
    params.set('country', country);
    params.set('page', '1');

    startTransition(() => {
      router.push(`/?${params.toString()}`);
      onClose();
    });
  };

  if (!isOpen) return null;

  const sortedCountries = [...countryStats].sort((a, b) => {
    const percentageDiff = b.correctPercentage - a.correctPercentage;
    if (percentageDiff !== 0) return percentageDiff;
    const guessesDiff = b.totalGuesses - a.totalGuesses;
    if (guessesDiff !== 0) return guessesDiff;
    return a.country.localeCompare(b.country);
  });

  const bestCountries = sortedCountries.slice(0, 5);
  const worstCountries = sortedCountries.slice(-5).reverse();

  const displayCountries = showAllCountries
    ? [...sortedCountries].sort((a, b) => a.country.localeCompare(b.country))
    : null;

  const tabClass = (tab: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-blue-600 text-white'
        : 'bg-surface-hover hover:bg-surface-active'
    }`;

  const periodClass = (p: Period) =>
    `px-3 py-1 text-xs font-medium rounded-md transition-colors ${
      period === p
        ? 'bg-blue-600 text-white'
        : 'bg-surface-hover hover:bg-surface-active'
    }`;

  const renderCountryRow = (stat: CountryStats, rank?: number) => {
    const countryCode = getCountryCode(stat.country);
    const isPendingThis = isPending && pendingCountry === stat.country;

    return (
      <button
        key={stat.country}
        onClick={() => navigateToCountry(stat.country)}
        className='w-full text-left flex items-center justify-between p-2 bg-surface-hover rounded hover:bg-surface-active transition-colors'
        disabled={isPending}
      >
        <div className='flex items-center gap-2'>
          {rank != null && (
            <span className='text-xs text-gray-500 dark:text-gray-400 w-6 text-right'>
              #{rank}
            </span>
          )}
          {countryCode && (
            <CountryFlag countryCode={countryCode} countryName={stat.country} />
          )}
          <span>{stat.country}</span>
          {isPendingThis && <Spinner />}
        </div>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            {formatDistance(stat.averageDistance)}
          </span>
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

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    const min = Math.floor(seconds / 60);
    const sec = Math.round(seconds % 60);
    return `${min}m ${sec}s`;
  };

  const gameTypeLabels: Record<string, string> = {
    duels: 'Duels',
    challenge: 'Challenge',
    br: 'Battle Royale',
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]'>
      <div className='glass shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_ease-out]'>
        <div className='flex justify-between items-center p-4 border-b border-divider'>
          <h2 className='text-xl font-semibold'>Stats</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            disabled={isPending}
          >
            ✕
          </button>
        </div>

        <div className='flex items-center justify-between px-4 pt-4'>
          <div className='flex gap-2'>
            <button onClick={() => setActiveTab('overview')} className={tabClass('overview')}>
              Overview
            </button>
            <button onClick={() => setActiveTab('countries')} className={tabClass('countries')}>
              Countries
            </button>
          </div>
          <div className='flex gap-1'>
            <button onClick={() => handlePeriodChange('week')} className={periodClass('week')}>
              Last 7 Days
            </button>
            <button onClick={() => handlePeriodChange('month')} className={periodClass('month')}>
              Last 30 Days
            </button>
            <button onClick={() => handlePeriodChange('all')} className={periodClass('all')}>
              All Time
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <Spinner />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && overviewStats && (
                <div className='space-y-8'>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    <div className='glass-subtle rounded-lg p-4'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Total Rounds</p>
                      <p className='text-2xl font-semibold mt-1'>{overviewStats.totalRounds}</p>
                    </div>
                    <div className='glass-subtle rounded-lg p-4'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Total Games</p>
                      <p className='text-2xl font-semibold mt-1'>{overviewStats.totalGames}</p>
                    </div>
                    <div className='glass-subtle rounded-lg p-4'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Countries Visited</p>
                      <p className='text-2xl font-semibold mt-1'>{overviewStats.totalCountries}</p>
                    </div>
                    <div className='glass-subtle rounded-lg p-4'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Country Accuracy</p>
                      <p className='text-2xl font-semibold mt-1'>{overviewStats.correctCountryPercentage}%</p>
                    </div>
                    <div className='glass-subtle rounded-lg p-4'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Avg Distance</p>
                      <p className='text-2xl font-semibold mt-1'>{formatDistance(overviewStats.averageDistance)}</p>
                    </div>
                    <div className='glass-subtle rounded-lg p-4'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Avg Time to Guess</p>
                      <p className='text-2xl font-semibold mt-1'>{formatTime(overviewStats.averageTimeToGuess)}</p>
                    </div>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4'>
                    <Link
                      href={`/guess/${overviewStats.bestGuess.id}`}
                      onClick={onClose}
                      className='glass-subtle rounded-lg p-4 hover:bg-surface-hover transition-colors'
                    >
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Best Guess</p>
                      <p className='font-semibold mt-1 text-green-600 dark:text-green-400'>
                        {formatDistance(overviewStats.bestGuess.distance)}
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-400 truncate mt-1'>
                        {overviewStats.bestGuess.location ?? 'Unknown'}
                      </p>
                    </Link>
                    <Link
                      href={`/guess/${overviewStats.worstGuess.id}`}
                      onClick={onClose}
                      className='glass-subtle rounded-lg p-4 hover:bg-surface-hover transition-colors'
                    >
                      <p className='text-sm text-gray-500 dark:text-gray-400'>Worst Guess</p>
                      <p className='font-semibold mt-1 text-red-600 dark:text-red-400'>
                        {formatDistance(overviewStats.worstGuess.distance)}
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-400 truncate mt-1'>
                        {overviewStats.worstGuess.location ?? 'Unknown'}
                      </p>
                    </Link>
                  </div>

                  {gameTypeStats.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>By Game Type</h3>
                      <div className='overflow-x-auto'>
                        <table className='min-w-full'>
                          <thead>
                            <tr className='border-b border-divider text-sm text-gray-500 dark:text-gray-400'>
                              <th className='text-left py-2 pr-4'>Type</th>
                              <th className='text-right py-2 px-4'>Rounds</th>
                              <th className='text-right py-2 px-4'>Accuracy</th>
                              <th className='text-right py-2 px-4'>Avg Distance</th>
                              <th className='text-right py-2 pl-4'>Avg Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gameTypeStats.map((stat) => (
                              <tr key={stat.gameType} className='border-b border-divider'>
                                <td className='py-2 pr-4 font-medium'>
                                  {gameTypeLabels[stat.gameType] ?? stat.gameType}
                                </td>
                                <td className='text-right py-2 px-4'>{stat.totalRounds}</td>
                                <td className='text-right py-2 px-4'>{stat.correctCountryPercentage}%</td>
                                <td className='text-right py-2 px-4'>{formatDistance(stat.averageDistance)}</td>
                                <td className='text-right py-2 pl-4'>{formatTime(stat.averageTimeToGuess)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {movementStats.length > 0 && (
                    <div>
                      <h3 className='text-lg font-semibold mb-4'>By Movement Type</h3>
                      <div className='overflow-x-auto'>
                        <table className='min-w-full'>
                          <thead>
                            <tr className='border-b border-divider text-sm text-gray-500 dark:text-gray-400'>
                              <th className='text-left py-2 pr-4'>Type</th>
                              <th className='text-right py-2 px-4'>Rounds</th>
                              <th className='text-right py-2 px-4'>Accuracy</th>
                              <th className='text-right py-2 px-4'>Avg Distance</th>
                              <th className='text-right py-2 pl-4'>Avg Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {movementStats.map((stat) => (
                              <tr key={stat.movementType} className='border-b border-divider'>
                                <td className='py-2 pr-4 font-medium'>{stat.movementType}</td>
                                <td className='text-right py-2 px-4'>{stat.totalRounds}</td>
                                <td className='text-right py-2 px-4'>{stat.correctCountryPercentage}%</td>
                                <td className='text-right py-2 px-4'>{formatDistance(stat.averageDistance)}</td>
                                <td className='text-right py-2 pl-4'>{formatTime(stat.averageTimeToGuess)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'overview' && !overviewStats && (
                <p className='text-center text-gray-500 dark:text-gray-400 py-12'>
                  No stats available for this period.
                </p>
              )}

              {activeTab === 'countries' && (
                <div className='space-y-8'>
                  {countryStats.length === 0 ? (
                    <p className='text-center text-gray-500 dark:text-gray-400 py-12'>
                      No country data for this period.
                    </p>
                  ) : (
                    <>
                      <div className='grid md:grid-cols-2 gap-8'>
                        <div>
                          <h3 className='text-lg font-semibold mb-4'>Top 5 Countries</h3>
                          <div className='space-y-3'>
                            {bestCountries.map((stat, i) => renderCountryRow(stat, i + 1))}
                          </div>
                        </div>

                        <div>
                          <h3 className='text-lg font-semibold mb-4'>Bottom 5 Countries</h3>
                          <div className='space-y-3'>
                            {worstCountries.map((stat) => {
                              const rank = sortedCountries.findIndex((s) => s.country === stat.country) + 1;
                              return renderCountryRow(stat, rank);
                            })}
                          </div>
                        </div>
                      </div>

                      <div className='flex justify-center'>
                        <button
                          onClick={() => setShowAllCountries(!showAllCountries)}
                          className='px-4 py-2 bg-surface-hover rounded-md hover:bg-surface-active transition-colors flex items-center gap-2'
                          disabled={isPending}
                        >
                          {showAllCountries ? 'Hide All Countries' : 'Show All Countries'}
                          {isPending && pendingCountry === null && <Spinner />}
                        </button>
                      </div>

                      {displayCountries && (
                        <div>
                          <h3 className='text-lg font-semibold mb-4'>All Countries</h3>
                          <div className='space-y-2'>
                            {displayCountries.map((stat) => {
                              const rank = sortedCountries.findIndex((s) => s.country === stat.country) + 1;
                              return renderCountryRow(stat, rank);
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
