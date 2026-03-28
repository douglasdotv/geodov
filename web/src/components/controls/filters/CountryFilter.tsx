'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/shared/Spinner';

interface CountryFilterProps {
  readonly countries: string[];
  readonly currentCountry: string | null;
}

export function CountryFilter({
  countries,
  currentCountry,
}: CountryFilterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const country = event.target.value;
    if (country === '') {
      params.delete('country');
    } else {
      params.set('country', country);
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <select
        value={currentCountry ?? ''}
        onChange={handleChange}
        className='w-full px-4 py-2 rounded-md border border-glass bg-transparent hover:bg-surface-hover transition-colors'
        aria-label='Filter by country'
      >
        <option value=''>All Countries</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {isPending && <Spinner />}
    </div>
  );
}
