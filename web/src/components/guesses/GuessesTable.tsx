'use client';

import { useState, Fragment } from 'react';
import { Guess, GuessWithAdditionalGuesses } from '@/types/guess';
import { GuessRow } from '@/components/guesses/GuessRow';
import { LocationMapModal } from '@/components/map/LocationMapModal';
import { getAdditionalGuesses } from '@/app/actions';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface GuessesTableProps {
  readonly guesses: GuessWithAdditionalGuesses[];
  readonly availableCountries: string[];
}

export function GuessesTable({
  guesses,
  availableCountries,
}: GuessesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [additionalGuesses, setAdditionalGuesses] = useState<
    Record<string, Guess[]>
  >({});
  const [loadingRows, setLoadingRows] = useState<Set<string>>(new Set());
  const [activeMapGuess, setActiveMapGuess] = useState<Guess | null>(null);
  const [errorRows, setErrorRows] = useState<Record<string, string>>({});

  async function toggleExpand(id: string, gameId: string, roundNumber: number) {
    const copy = new Set(expandedRows);
    const isExpanding = !copy.has(id);

    if (isExpanding && !additionalGuesses[id]) {
      setLoadingRows((prev) => new Set(prev).add(id));
      try {
        const data = await getAdditionalGuesses(gameId, roundNumber);
        if (data) {
          setAdditionalGuesses((prev) => ({ ...prev, [id]: data }));
        }
        setErrorRows((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (err) {
        if (err instanceof Error) {
          setErrorRows((prev) => ({
            ...prev,
            [id]: err.message || 'Failed to fetch additional guesses.',
          }));
        } else {
          setErrorRows((prev) => ({
            ...prev,
            [id]: 'Failed to fetch additional guesses.',
          }));
        }
      }
      setLoadingRows((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }

    if (copy.has(id)) {
      copy.delete(id);
    } else {
      copy.add(id);
    }
    setExpandedRows(copy);
  }

  return (
    <div className='mt-4 relative'>
      <div className='overflow-x-auto rounded-xl'>
        <div className='inline-block min-w-full align-middle'>
          <div className='glass overflow-hidden'>
            <table className='min-w-full divide-y divide-divider'>
              <thead>
                <tr className='border-b border-divider glass-subtle'>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-center'
                  >
                    Type
                  </th>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-left'
                  >
                    Guess
                  </th>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-left'
                  >
                    Actual Location
                  </th>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-center'
                  >
                    Distance
                  </th>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-center'
                  >
                    When
                  </th>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-center'
                  >
                    Time to Guess
                  </th>
                  <th
                    scope='col'
                    className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-center'
                  >
                    View
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-divider'>
                {guesses.map((guess) => {
                  const rowKey = `${guess.game_id}-${guess.round_number}`;
                  const isExpanded = expandedRows.has(rowKey);
                  const isLoading = loadingRows.has(rowKey);
                  const error = errorRows[rowKey];
                  const otherGuesses = additionalGuesses[rowKey] ?? [];

                  return (
                    <Fragment key={rowKey}>
                      <GuessRow
                        guess={guess}
                        availableCountries={availableCountries}
                        isExpandable={guess.has_additional_guesses}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          toggleExpand(
                            rowKey,
                            guess.game_id,
                            guess.round_number,
                          )
                        }
                        isLoading={isLoading}
                        onShowMap={() => setActiveMapGuess(guess)}
                      />
                      {error && (
                        <tr>
                          <td
                            colSpan={7}
                            className='text-red-500 text-center px-4 py-2'
                          >
                            {error}
                          </td>
                        </tr>
                      )}
                      {isExpanded &&
                        otherGuesses.map((g) => (
                          <GuessRow
                            key={g.id}
                            guess={g}
                            isExpandable={false}
                            isExpanded={false}
                            isSubRow
                            onShowMap={() => setActiveMapGuess(g)}
                            availableCountries={availableCountries}
                          />
                        ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Tooltip id='guess-row-tooltip' place='top' variant='dark' />

      {activeMapGuess &&
        Boolean(activeMapGuess.actual_lat) &&
        Boolean(activeMapGuess.actual_lng) && (
          <LocationMapModal
            isOpen={true}
            onClose={() => setActiveMapGuess(null)}
            guessLat={activeMapGuess.guess_lat}
            guessLng={activeMapGuess.guess_lng}
            actualLat={activeMapGuess.actual_lat}
            actualLng={activeMapGuess.actual_lng}
            guessLocation={activeMapGuess.guess_display_name}
            actualLocation={activeMapGuess.actual_display_name}
          />
        )}
    </div>
  );
}
