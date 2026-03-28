interface CountryStatsButtonProps {
  readonly onClick: () => void;
}

export function CountryStatsButton({ onClick }: CountryStatsButtonProps) {
  return (
    <button
      onClick={onClick}
      className='px-4 py-2 rounded-md border border-glass hover:bg-surface-hover transition-colors'
    >
      Country Stats
    </button>
  );
}
