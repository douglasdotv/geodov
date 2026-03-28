import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/shared/Spinner';

interface SortControlsProps {
  readonly currentSort: string;
}

export function SortControls({ currentSort }: SortControlsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', event.target.value);
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <select
        value={currentSort}
        onChange={handleChange}
        className='w-full px-4 py-2 rounded-md border border-glass bg-transparent hover:bg-surface-hover transition-colors'
        aria-label='Sort guesses'
      >
        <option value='latest'>Latest</option>
        <option value='best'>Best</option>
        <option value='worst'>Worst</option>
      </select>
      {isPending && <Spinner />}
    </div>
  );
}
