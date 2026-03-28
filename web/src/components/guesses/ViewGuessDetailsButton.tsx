import { useState, useEffect } from 'react';
import { FiShare2, FiCheck } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

interface ViewGuessDetailsButtonProps {
  readonly guessId: string;
}

export function ViewGuessDetailsButton({
  guessId,
}: ViewGuessDetailsButtonProps) {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    if (showCopiedMessage) {
      const timer = setTimeout(() => {
        setShowCopiedMessage(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showCopiedMessage]);

  const handleShare = () => {
    const url = `/guess/${guessId}`;
    navigator.clipboard.writeText(new URL(url, window.location.origin).href);
    setShowCopiedMessage(true);
  };

  return (
    <div className='relative'>
      <button
        onClick={handleShare}
        className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
        data-tooltip-id='guess-row-tooltip'
        data-tooltip-content='Share this guess'
      >
        {showCopiedMessage ? <FiCheck /> : <FiShare2 />}
      </button>
      {showCopiedMessage && (
        <div className='absolute right-0 top-8 w-24 text-center text-sm text-blue-600 dark:text-blue-400 glass shadow-md py-1 px-2 animate-[fadeIn_0.2s_ease-out]'>
          Link copied!
        </div>
      )}
      <Tooltip id='guess-row-tooltip' />
    </div>
  );
}
