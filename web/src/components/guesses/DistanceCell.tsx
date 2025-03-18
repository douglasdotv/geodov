import { GuessQuality } from '@/types/guess';
import { getGuessQuality, formatDistance } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { FiZap } from 'react-icons/fi';

const bulletColors: Record<GuessQuality, string> = {
  [GuessQuality.Good]: 'bg-green-400',
  [GuessQuality.Average]: 'bg-yellow-400',
  [GuessQuality.Bad]: 'bg-red-400',
};

interface DistanceCellProps {
  readonly distance: number | null;
}

export function DistanceCell({ distance }: DistanceCellProps) {
  const pathname = usePathname();

  const quality = getGuessQuality(distance);
  const isVeryClose = distance !== null && distance <= 1000;
  const isGuessDetailsPage = pathname.startsWith('/guess');

  return (
    <div className='inline-flex items-center space-x-2'>
      <span className={`block w-2 h-2 rounded-full ${bulletColors[quality]}`} />
      <span>{formatDistance(distance)}</span>

      {isVeryClose && !isGuessDetailsPage && (
        <FiZap
          className='text-amber-500 ml-1'
          size={12}
          data-tooltip-id='guess-row-tooltip'
          data-tooltip-content='Nice guess!'
        />
      )}
    </div>
  );
}
