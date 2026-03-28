'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/shared/Spinner';
import { MovementRestrictionType } from '@/types/movement';
import { GameType } from '@/types/gametype';

interface PaginationControlsProps {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly currentSort: string;
  readonly currentCountry: string | null;
  readonly currentMovementRestriction: MovementRestrictionType | null;
  readonly currentGameType: GameType | null;
}

export function PaginationControls({
  currentPage,
  totalPages,
  currentSort,
  currentCountry,
  currentMovementRestriction,
  currentGameType,
}: PaginationControlsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getQueryParams = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    params.set('sort', currentSort);

    if (currentCountry) {
      params.set('country', currentCountry);
    }

    if (currentMovementRestriction) {
      params.set('movement', currentMovementRestriction);
    }

    if (currentGameType && currentGameType !== 'all') {
      params.set('game_type', currentGameType);
    }

    return params;
  };

  const goToPage = (page: number) => {
    startTransition(() => {
      router.push(`?${getQueryParams(page).toString()}`);
    });
  };

  const renderPageButtons = () => {
    const buttons = [];
    const showEllipsis = totalPages > 7;
    const pageWindow = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - pageWindow && i <= currentPage + pageWindow)
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`px-3 py-1 mx-1 rounded-md transition-colors ${
              currentPage === i
                ? 'bg-blue-600 text-white'
                : 'bg-surface-hover hover:bg-surface-active'
            }`}
            aria-current={currentPage === i ? 'page' : undefined}
          >
            {i}
          </button>,
        );
      } else if (
        showEllipsis &&
        (i === currentPage - pageWindow - 1 ||
          i === currentPage + pageWindow + 1)
      ) {
        buttons.push(
          <span key={i} className='px-3 py-1'>
            ...
          </span>,
        );
      }
    }
    return buttons;
  };

  return (
    <div className='flex justify-center items-center space-x-2 my-6'>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md bg-surface-hover hover:bg-surface-active transition-colors ${
          currentPage === 1 ? 'opacity-50' : ''
        }`}
        aria-disabled={currentPage === 1}
      >
        Previous
      </button>
      {renderPageButtons()}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md bg-surface-hover hover:bg-surface-active transition-colors ${
          currentPage === totalPages ? 'opacity-50' : ''
        }`}
        aria-disabled={currentPage === totalPages}
      >
        Next
      </button>
      {isPending && <Spinner />}
    </div>
  );
}
