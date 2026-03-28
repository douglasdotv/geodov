'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/shared/Spinner';

export function ResetFiltersButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleReset = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('sort', 'latest');

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const hasFilters = Array.from(searchParams.entries()).some(
    ([key, value]) =>
      (key === 'country' && value !== '') ||
      (key === 'movement' && value !== '') ||
      (key === 'game_type' && value !== '') ||
      (key === 'sort' && value !== 'latest'),
  );

  if (!hasFilters) {
    return null;
  }

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={handleReset}
        className='w-full px-4 py-2 rounded-md border border-glass hover:bg-surface-hover transition-colors'
        aria-label='Reset all filters'
      >
        Reset
      </button>
      {isPending && <Spinner />}
    </div>
  );
}
