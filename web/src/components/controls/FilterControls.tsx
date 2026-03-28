import { CountryFilter } from '@/components/controls/filters/CountryFilter';
import { MovementRestrictionFilter } from '@/components/controls/filters/MovementRestrictionFilter';
import { GameTypeFilter } from '@/components/controls/filters/GameTypeFilter';
import { MovementRestrictionType } from '@/types/movement';
import { GameType } from '@/types/gametype';

interface FilterControlsProps {
  readonly countries: string[];
  readonly currentCountry: string | null;
  readonly currentMovementRestriction: MovementRestrictionType | null;
  readonly currentGameType: GameType | null;
}

export function FilterControls({
  countries,
  currentCountry,
  currentMovementRestriction,
  currentGameType,
}: FilterControlsProps) {
  return (
    <>
      <div>
        <h3 className='text-sm font-medium mb-1'>Country</h3>
        <CountryFilter countries={countries} currentCountry={currentCountry} />
      </div>
      <div>
        <h3 className='text-sm font-medium mb-1'>Movement Type</h3>
        <MovementRestrictionFilter
          currentMovementRestriction={currentMovementRestriction}
        />
      </div>
      <div>
        <h3 className='text-sm font-medium mb-1'>Game Type</h3>
        <GameTypeFilter currentGameType={currentGameType} />
      </div>
    </>
  );
}
