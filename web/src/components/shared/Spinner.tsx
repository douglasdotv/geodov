export function Spinner() {
  return (
    <output
      className='relative inline-flex h-5 w-5 items-center justify-center'
      aria-label='Loading'
    >
      <span className='absolute inset-0 rounded-full opacity-30 animate-ping bg-gradient-to-r from-blue-600/40 to-indigo-600/40 dark:from-blue-500/40 dark:to-indigo-400/40'></span>
      <span className='absolute h-full w-full rounded-full border-2 border-t-blue-600 border-r-indigo-500 border-b-blue-500 border-l-transparent dark:border-t-blue-500 dark:border-r-indigo-400 dark:border-b-blue-400 dark:border-l-transparent animate-spin'></span>
      <span className='absolute h-3 w-3 rounded-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-sm'></span>
      <span className='absolute h-1 w-1 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 animate-pulse'></span>
    </output>
  );
}
