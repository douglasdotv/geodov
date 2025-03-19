'use client';

import { useRouter } from 'next/navigation';
import { FiGlobe, FiArrowLeft } from 'react-icons/fi';
import { LocationMap } from '@/components/map/LocationMap';
import { DistanceCell } from '@/components/guesses/DistanceCell';
import { ViewGuessDetailsButton } from '@/components/guesses/ViewGuessDetailsButton';
import {
  getTimeToGuess,
  formatMovementRestrictions,
  formatRelativeTime,
  formatFullDateTime,
} from '@/lib/utils';
import { GOOGLE_STREET_VIEW_BASE_URL } from '@/lib/constants';
import { Guess } from '@/types/guess';

interface SingleGuessViewProps {
  readonly guess: Guess;
}

export function SingleGuessView({ guess }: SingleGuessViewProps) {
  const router = useRouter();
  const hasLocation = Boolean(
    guess.actual_lat && guess.actual_lng && guess.guess_lat && guess.guess_lng,
  );

  const gameTypeContent = `${guess.game_type}/${formatMovementRestrictions(guess.movement_restrictions)}`;
  const mapContent =
    guess.game_type === 'br'
      ? 'World'
      : (guess.map_name ?? guess.map ?? 'Unknown Map');

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <button
          onClick={() => router.back()}
          className='inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>
        <ViewGuessDetailsButton guessId={guess.id} />
      </div>

      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800'>
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-lg font-medium mb-4'>Guess</h2>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span>{guess.guess_display_name ?? 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className='text-lg font-medium mb-4'>Actual Location</h2>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <span>{guess.actual_display_name ?? 'Unknown'}</span>
              </div>
              {Boolean(guess.actual_lat) && Boolean(guess.actual_lng) && (
                <div>
                  <a
                    href={`${GOOGLE_STREET_VIEW_BASE_URL}${guess.actual_lat},${guess.actual_lng}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    <FiGlobe />
                    <span>Open in Street View</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='border-t border-gray-200 dark:border-gray-800 mt-6 pt-6'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
            <div>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Game Type
              </span>
              <div className='mt-1'>{gameTypeContent}</div>
            </div>
            <div>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Map
              </span>
              <div className='mt-1'>{mapContent}</div>
            </div>
            <div>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Distance
              </span>
              <div className='mt-1'>
                <DistanceCell distance={guess.distance} />
              </div>
            </div>

            {guess.game_type === 'challenge' && (
              <div>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Score
                </span>
                <div className='mt-1'>{guess.score ?? 'N/A'}</div>
              </div>
            )}

            <div>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                When
              </span>
              <div
                className='mt-1'
                title={formatFullDateTime(guess.guess_time)}
              >
                {formatRelativeTime(guess.guess_time)}
              </div>
            </div>
            <div>
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Time to Guess
              </span>
              <div className='mt-1'>
                {getTimeToGuess(guess.guess_time, guess.round_start_time)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasLocation && (
        <div className='rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800'>
          <LocationMap
            guessLat={guess.guess_lat}
            guessLng={guess.guess_lng}
            actualLat={guess.actual_lat}
            actualLng={guess.actual_lng}
            guessLocation={guess.guess_display_name}
            actualLocation={guess.actual_display_name}
            className='w-full h-[60vh]'
          />
        </div>
      )}
    </div>
  );
}
