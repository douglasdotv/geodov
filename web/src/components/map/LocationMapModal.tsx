'use client';

import { useState, useCallback } from 'react';
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
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${closing ? 'animate-[fadeOut_0.15s_ease-in_forwards]' : 'animate-[fadeIn_0.2s_ease-out]'}`}
      onClick={handleClose}
    >
      <div
        className={`glass shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${closing ? 'animate-[scaleOut_0.15s_ease-in_forwards]' : 'animate-[scaleIn_0.2s_ease-out]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex justify-end items-center p-2'>
          <button
            onClick={handleClose}
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
