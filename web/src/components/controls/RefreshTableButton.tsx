'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiRefreshCw } from 'react-icons/fi';
import { Spinner } from '@/components/shared/Spinner';

export function RefreshTableButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRefresh = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    startTransition(() => {
      router.push(`?${currentParams.toString()}`);
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={handleRefresh}
        className='flex items-center gap-2 px-4 py-2 glass hover:bg-surface-active transition-colors'
        aria-label='Refresh table data'
      >
        <span>Refresh</span>
        <FiRefreshCw className='w-4 h-4' />
      </button>
      {isPending && <Spinner />}
    </div>
  );
}
