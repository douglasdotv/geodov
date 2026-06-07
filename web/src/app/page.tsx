import { supabase } from '@/lib/supabaseClient';
import { GuessesTable } from '@/components/guesses/GuessesTable';
import { PaginationControls } from '@/components/pagination/PaginationControls';
import { TableControls } from '@/components/controls/TableControls';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { isValidGameType, isValidMovementRestriction } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type SearchParamsContent = {
  page?: string;
  sort?: 'latest' | 'best' | 'worst';
  country?: string;
  movement?: string;
  game_type?: string;
};

type SearchParams = Promise<SearchParamsContent>;

interface PageProps {
  readonly searchParams: SearchParams;
}

export default async function Home({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort ?? 'latest';
  const movement = isValidMovementRestriction(sp.movement) ? sp.movement : null;
  const gameType = isValidGameType(sp.game_type) ? sp.game_type : null;

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: countries } = await supabase.rpc('get_unique_countries');
  const availableCountries = countries ?? [];
  const country =
    sp.country && availableCountries.includes(sp.country) ? sp.country : null;

  const { data: countResult } = await supabase.rpc('get_total_rounds_count', {
    country_filter: country,
    movement_type: movement,
    game_type_filter: gameType === 'all' ? null : gameType,
  });
  const count = countResult ?? 0;

  const { data: guesses, error } = await supabase.rpc(
    'get_sorted_guesses_paginated',
    {
      page_start: from,
      page_end: to,
      sort_order: sort,
      country_filter: country,
      movement_type: movement,
      game_type_filter: gameType === 'all' ? null : gameType,
    },
  );

  if (error) {
    return (
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <p className='text-red-600'>{error.message}</p>
      </main>
    );
  }

  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex flex-col gap-4'>
        <TableControls
          currentSort={sort}
          countries={availableCountries}
          currentCountry={country}
          currentMovementRestriction={movement}
          currentGameType={gameType}
        />
        <GuessesTable
          guesses={guesses}
          availableCountries={availableCountries}
        />
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          currentSort={sort}
          currentCountry={country}
          currentMovementRestriction={movement}
          currentGameType={gameType}
        />
      </div>
    </main>
  );
}
