'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/shared/Spinner';
import { GameType } from '@/types/gametype';
import { isValidGameType } from '@/lib/validation';

interface GameTypeFilterProps {
  readonly currentGameType: GameType | null;
}

export function GameTypeFilter({ currentGameType }: GameTypeFilterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const gameType = event.target.value;

    if (!isValidGameType(gameType)) {
      return;
    }

    if (gameType === 'all') {
      params.delete('game_type');
    } else {
      params.set('game_type', gameType);
    }
    params.set('page', '1');

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <select
        value={currentGameType ?? 'all'}
        onChange={handleChange}
        className='w-full px-4 py-2 rounded-md border border-glass bg-transparent hover:bg-surface-hover transition-colors'
        aria-label='Filter by game type'
      >
        <option value='all'>All Game Types</option>
        <option value='duels'>Duels</option>
        <option value='challenge'>Challenge</option>
        <option value='br'>Battle Royale Distance</option>
      </select>
      {isPending && <Spinner />}
    </div>
  );
}
