import { supabase } from '@/lib/supabaseClient';
import { PaginationControls } from '@/components/pagination/PaginationControls';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { formatFullDateTime } from '@/lib/utils';
import Link from 'next/link';
import { FiArrowLeft, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { logout } from '@/app/login/actions';
import { deleteGuess } from '@/app/actions';

export const dynamic = 'force-dynamic';

type SearchParamsContent = {
  page?: string;
};

type SearchParams = Promise<SearchParamsContent>;

interface PageProps {
  readonly searchParams: SearchParams;
}

function DeleteButton() {
  return (
    <button
      type='submit'
      className='px-3 py-1.5 text-sm bg-red-600/20 text-red-800 dark:bg-red-500/10 dark:text-red-300 rounded-lg hover:bg-red-600/30 dark:hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
    >
      <FiTrash2 />
      Delete
    </button>
  );
}

export default async function AdminDeletePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { count, error: countError } = await supabase
    .from('guesses')
    .select('id', { count: 'exact', head: true });

  if (countError) {
    return (
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <p className='text-red-600'>{countError.message}</p>
      </main>
    );
  }

  const { data: guesses, error } = await supabase
    .from('guesses')
    .select(
      'id, guess_display_name, actual_display_name, created_at, game_id, round_number',
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <p className='text-red-600'>{error.message}</p>
      </main>
    );
  }

  const totalPages = Math.ceil((count ?? 0) / ITEMS_PER_PAGE);

  return (
    <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
          >
            <FiArrowLeft />
            <span>Back to Home</span>
          </Link>
          <form action={logout}>
            <button
              type='submit'
              className='inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </form>
        </div>

        <div className='overflow-x-auto rounded-xl'>
          <div className='inline-block min-w-full align-middle'>
            <div className='bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl'>
              <table className='min-w-full divide-y divide-gray-100 dark:divide-gray-800'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50'>
                    <th
                      scope='col'
                      className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-left'
                    >
                      Guess Location
                    </th>
                    <th
                      scope='col'
                      className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-left'
                    >
                      Date
                    </th>
                    <th
                      scope='col'
                      className='whitespace-nowrap px-4 py-3 font-medium text-gray-900 dark:text-gray-100 text-left'
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
                  {guesses?.map((guess) => (
                    <tr
                      key={guess.id}
                      className='hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
                    >
                      <td className='px-4 py-3'>
                        <p
                          className='font-medium truncate max-w-xs'
                          title={guess.guess_display_name ?? 'N/A'}
                        >
                          {guess.guess_display_name ?? 'N/A'}
                        </p>
                        <p
                          className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs'
                          title={guess.actual_display_name ?? 'N/A'}
                        >
                          vs {guess.actual_display_name ?? 'N/A'}
                        </p>
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-600 dark:text-gray-300'>
                        {formatFullDateTime(guess.created_at ?? '')}
                      </td>
                      <td className='px-4 py-3'>
                        <form action={deleteGuess}>
                          <input
                            type='hidden'
                            name='guessId'
                            value={guess.id}
                          />
                          <DeleteButton />
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          currentSort={''}
          currentCountry={null}
          currentMovementRestriction={null}
          currentGameType={null}
        />
      </div>
    </main>
  );
}
