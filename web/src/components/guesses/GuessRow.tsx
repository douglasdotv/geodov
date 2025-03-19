import { Guess } from '@/types/guess';
import { DistanceCell } from '@/components/guesses/DistanceCell';
import { ClickableCountryFlag } from '@/components/shared/ClickableCountryFlag';
import {
  getCountryCode,
  getTimeToGuess,
  formatMovementRestrictions,
  formatRelativeTime,
  formatFullDateTime,
} from '@/lib/utils';
import { GOOGLE_STREET_VIEW_BASE_URL } from '@/lib/constants';
import {
  FiPlus,
  FiMinus,
  FiMap,
  FiGlobe,
  FiExternalLink,
} from 'react-icons/fi';
import Link from 'next/link';

interface GuessRowProps {
  readonly guess: Guess;
  readonly availableCountries: string[];
  readonly isExpandable?: boolean;
  readonly isExpanded?: boolean;
  readonly onToggle?: () => void;
  readonly isSubRow?: boolean;
  readonly isLoading?: boolean;
  readonly onShowMap?: () => void;
}

export function GuessRow({
  guess,
  availableCountries,
  isExpandable = false,
  isExpanded = false,
  onToggle,
  isSubRow = false,
  isLoading = false,
  onShowMap,
}: GuessRowProps) {
  function renderLocation(
    displayName: string | null,
    countryName: string | null,
  ) {
    const code = getCountryCode(countryName);
    return (
      <div
        className='flex items-center gap-2'
        data-tooltip-id='guess-row-tooltip'
        data-tooltip-content={displayName ?? 'Unknown'}
      >
        {code && (
          <ClickableCountryFlag
            countryCode={code}
            countryName={countryName}
            availableCountries={availableCountries}
          />
        )}
        <span className='truncate max-w-[200px]'>
          {displayName ?? 'Unknown'}
        </span>
      </div>
    );
  }

  function getToggleIcon() {
    if (isLoading) return '...';
    return isExpanded ? <FiMinus size={12} /> : <FiPlus size={12} />;
  }

  const gameTypeContent = `${guess.game_type}/${formatMovementRestrictions(guess.movement_restrictions)}`;

  let brTooltipContent: string;
  if (isLoading) {
    brTooltipContent = 'Loading...';
  } else if (isExpanded) {
    brTooltipContent = 'Hide additional guesses';
  } else {
    brTooltipContent = 'Show additional guesses for this round';
  }

  const rowClass = isSubRow
    ? 'bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700'
    : 'hover:bg-gray-50 dark:hover:bg-gray-800';

  const hasActualLocation = Boolean(guess.actual_lat && guess.actual_lng);
  const hasGuessLocation = Boolean(guess.guess_lat && guess.guess_lng);
  const canShowMap = hasActualLocation && hasGuessLocation;

  return (
    <tr className={`transition-all duration-200 ${rowClass}`}>
      <td className='px-4 py-3 relative'>
        {isExpandable && (
          <button
            onClick={onToggle}
            className='absolute left-1 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-4 h-4 text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
            disabled={isLoading}
            data-tooltip-id='guess-row-tooltip'
            data-tooltip-content={brTooltipContent}
          >
            {getToggleIcon()}
          </button>
        )}
        <div className='flex justify-center'>
          <span className='truncate text-gray-600 dark:text-gray-300'>
            {gameTypeContent}
          </span>
        </div>
      </td>
      <td className='px-4 py-3'>
        {renderLocation(guess.guess_display_name, guess.guess_country)}
      </td>
      <td className='px-4 py-3'>
        {renderLocation(guess.actual_display_name, guess.actual_country)}
      </td>
      <td className='px-4 py-3 text-center'>
        <DistanceCell distance={guess.distance} />
      </td>
      <td
        className='px-4 py-3 text-center whitespace-nowrap text-gray-600 dark:text-gray-300'
        data-tooltip-id='guess-row-tooltip'
        data-tooltip-content={formatFullDateTime(guess.guess_time)}
      >
        {formatRelativeTime(guess.guess_time)}
      </td>
      <td className='px-4 py-3 text-center whitespace-nowrap text-gray-600 dark:text-gray-300'>
        {getTimeToGuess(guess.guess_time, guess.round_start_time)}
      </td>
      <td className='px-4 py-3'>
        <div className='flex justify-center gap-2'>
          {canShowMap && (
            <button
              onClick={onShowMap}
              className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
              data-tooltip-id='guess-row-tooltip'
              data-tooltip-content='Display guess and actual location on an interactive map'
            >
              <FiMap />
            </button>
          )}
          {hasActualLocation && (
            <a
              href={`${GOOGLE_STREET_VIEW_BASE_URL}${guess.actual_lat},${guess.actual_lng}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
              data-tooltip-id='guess-row-tooltip'
              data-tooltip-content='Open actual location in Google Street View'
            >
              <FiGlobe />
            </a>
          )}
          <Link
            href={`/guess/${guess.id}`}
            className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
            data-tooltip-id='guess-row-tooltip'
            data-tooltip-content='Show details'
          >
            <FiExternalLink />
          </Link>
        </div>
      </td>
    </tr>
  );
}
