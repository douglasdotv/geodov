import Link from 'next/link';
import { FiGithub } from 'react-icons/fi';

export function Footer() {
  const playerName = process.env.G_USER ?? 'Mysterious User';
  const profileLink = process.env.G_PROFILE ?? 'https://www.geoguessr.com/';
  const githubRepositoryUrl = process.env.GITHUB_REPOSITORY_URL ?? 'https://github.com/douglasdotv';

  return (
    <footer className='mt-auto py-6 border-t border-gray-300 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center'>
        <span className='text-sm'>
          <Link
            href={profileLink}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
          >
            {playerName}
          </Link>
        </span>

        <Link
          href={githubRepositoryUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors'
          aria-label='View source code on GitHub'
        >
          <FiGithub size={18} />
          <span className='text-sm hidden sm:inline'>GitHub</span>
        </Link>
      </div>
    </footer>
  );
}
