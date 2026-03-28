'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SortControls } from '@/components/controls/SortControls';
import { FilterControls } from '@/components/controls/FilterControls';
import { ResetFiltersButton } from '@/components/controls/filters/ResetFiltersButton';
import { RefreshTableButton } from '@/components/controls/RefreshTableButton';
import { MovementRestrictionType } from '@/types/movement';
import { GameType } from '@/types/gametype';

interface TableControlsProps {
  readonly currentSort: string;
  readonly countries: string[];
  readonly currentCountry: string | null;
  readonly currentMovementRestriction: MovementRestrictionType | null;
  readonly currentGameType: GameType | null;
}

export function TableControls({
  currentSort,
  countries,
  currentCountry,
  currentMovementRestriction,
  currentGameType,
}: TableControlsProps) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const activeOptionsCount = [
    currentSort !== 'latest',
    currentCountry,
    currentMovementRestriction,
    currentGameType,
  ].filter(Boolean).length;

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className='flex items-center gap-2 px-4 py-2 glass hover:bg-surface-active transition-colors'
          aria-expanded={isOptionsOpen}
          aria-haspopup='true'
        >
          <span>Options</span>
          {activeOptionsCount > 0 && (
            <span className='flex items-center justify-center w-5 h-5 text-xs bg-blue-600 text-white rounded-full'>
              {activeOptionsCount}
            </span>
          )}
          <FiChevronDown
            className={`w-4 h-4 transition-transform ${
              isOptionsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {!isOptionsOpen && <ResetFiltersButton />}

        <div className='ml-auto flex items-center gap-4'>
          <RefreshTableButton />
        </div>
      </div>

      {isOptionsOpen && (
        <div className='p-4 glass animate-[scaleIn_0.2s_ease-out]'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <h3 className='text-sm font-medium mb-1'>Sort By</h3>
              <SortControls currentSort={currentSort} />
            </div>
            <FilterControls
              countries={countries}
              currentCountry={currentCountry}
              currentMovementRestriction={currentMovementRestriction}
              currentGameType={currentGameType}
            />
          </div>
          <div className='flex justify-between items-center border-t border-divider mt-4 pt-4'>
            <button
              onClick={() => setIsOptionsOpen(false)}
              className='flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-surface-hover rounded-md hover:bg-surface-active transition'
            >
              <FiChevronUp className='w-4 h-4' />
            </button>

            <ResetFiltersButton />
          </div>
        </div>
      )}
    </div>
  );
}
