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

  const gameTypeLabel = guess.game_type;
  const movementLabel = formatMovementRestrictions(guess.movement_restrictions);

  const badgeColors: Record<string, string> = {
    duels: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    challenge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    br: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  };
  const badgeColor = badgeColors[gameTypeLabel] ?? 'bg-gray-500/20 text-gray-600 dark:text-gray-300';

  let brTooltipContent: string;
  if (isLoading) {
    brTooltipContent = 'Loading...';
  } else if (isExpanded) {
    brTooltipContent = 'Hide additional guesses';
  } else {
    brTooltipContent = 'Show additional guesses for this round';
  }

  const rowClass = isSubRow
    ? 'bg-red-500/10 hover:bg-red-500/20'
    : 'hover:bg-surface-hover';

  const hasActualLocation = guess.actual_lat != null && guess.actual_lng != null;
  const hasGuessLocation = guess.guess_lat != null && guess.guess_lng != null;
  const canShowMap = hasActualLocation && hasGuessLocation;

  return (
    <tr className={`transition-all duration-200 ${rowClass}`}>
      <td className='px-4 py-3 relative'>
        {isExpandable && (
          <button
            onClick={onToggle}
            className='absolute left-1 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-4 h-4 text-[10px] bg-surface-active border border-glass rounded hover:bg-surface-active transition-colors'
            disabled={isLoading}
            data-tooltip-id='guess-row-tooltip'
            data-tooltip-content={brTooltipContent}
          >
            {getToggleIcon()}
          </button>
        )}
        <div className='flex flex-col items-center gap-1'>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
            {gameTypeLabel}
          </span>
          <span className='text-[10px] text-gray-500 dark:text-gray-400'>
            {movementLabel}
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
              data-tooltip-content='Open actual location in Street View'
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
