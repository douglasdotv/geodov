import { LocationMap } from '@/components/map/LocationMap';

interface LocationMapModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly guessLat: number;
  readonly guessLng: number;
  readonly actualLat: number;
  readonly actualLng: number;
  readonly guessLocation?: string | null;
  readonly actualLocation?: string | null;
}

export function LocationMapModal({
  isOpen,
  onClose,
  guessLat,
  guessLng,
  actualLat,
  actualLng,
  guessLocation,
  actualLocation,
}: LocationMapModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]'>
      <div className='glass shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-[scaleIn_0.2s_ease-out]'>
        <div className='flex justify-between items-center p-4 border-b border-divider'>
          <h2 className='text-xl font-semibold'>Location Comparison</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            ✕
          </button>
        </div>
        <div className='p-4'>
          <LocationMap
            guessLat={guessLat}
            guessLng={guessLng}
            actualLat={actualLat}
            actualLng={actualLng}
            guessLocation={guessLocation}
            actualLocation={actualLocation}
            className='w-full h-[60vh] rounded-lg'
          />
        </div>
      </div>
    </div>
  );
}
