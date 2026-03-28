import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

interface AboutModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    dialog.addEventListener('keydown', handleEscape);
    return () => dialog.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className='fixed inset-0 bg-transparent p-4 animate-[fadeIn_0.2s_ease-out] backdrop:bg-black/30 backdrop:backdrop-blur-sm'
      onClose={onClose}
    >
      <div className='glass max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-[scaleIn_0.2s_ease-out] p-8'>
        <div className='flex justify-between items-start mb-6'>
          <h2
            id='modal-title'
            className='text-2xl font-bold text-gray-900 dark:text-white'
          >
            About GeoDov
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 text-gray-600 dark:text-gray-400 hover:bg-surface-active transition-colors'
            aria-label='Close modal'
          >
            <FiX className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-6 text-gray-600 dark:text-gray-300'>
          <section>
            <p className='leading-relaxed'>
              GeoDov tracks the most recent places I visited in{' '}
              <a
                href='https://www.geoguessr.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 dark:text-blue-400 hover:underline'
              >
                GeoGuessr
              </a>, a game where you&apos;re dropped somewhere in the world using Google
              Street View and have to guess your location. It shows how close
              (or far) my guesses were from the actual locations, along with
              details about the places I&apos;ve virtually came across.
            </p>
          </section>

          <section>
            <h3 className='text-lg font-semibold mb-3 text-gray-900 dark:text-white'>
              How it works
            </h3>
            <div className='space-y-3'>
              <p>When I play GeoGuessr, a userscript running in my browser:</p>
              <ul className='list-disc pl-5 space-y-2'>
                <li>
                  Captures the coordinates of my guess and the actual location
                </li>
                <li>
                  Uses{' '}
                  <a
                    href='https://nominatim.org'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 dark:text-blue-400 hover:underline mx-1'
                  >
                    Nominatim
                  </a>{' '}
                  to convert these coordinates into readable locations (city,
                  state, country etc.)
                </li>
                <li>Stores this information in a database</li>
              </ul>
              <p>
                This website then displays all this information in an
                easy-to-read format, showing where I guessed versus where I
                should have guessed.
              </p>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  );
}
