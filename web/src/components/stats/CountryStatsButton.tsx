'use client';

interface CountryStatsButtonProps {
  readonly onClick: () => void;
}

export function CountryStatsButton({ onClick }: CountryStatsButtonProps) {
  return (
    <button
      onClick={onClick}
      className='px-4 py-2 rounded-md border border-gray-400 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
    >
      Country Stats
    </button>
  );
}
