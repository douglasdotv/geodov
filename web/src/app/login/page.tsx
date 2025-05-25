'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from './actions';
import { FiLogIn } from 'react-icons/fi';

const initialState: { error?: string } = {};

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      aria-disabled={pending}
      className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors'
    >
      <FiLogIn />
      {pending ? 'Signing In...' : 'Go'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <main className='flex items-center justify-center min-h-screen'>
      <div className='w-full max-w-sm mx-auto p-8 space-y-6 card'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold'>Admin Access</h1>
        </div>
        <form action={formAction} className='space-y-4'>
          <div>
            <label
              htmlFor='username'
              className='block text-sm font-medium mb-1'
            >
              Username
            </label>
            <input
              id='username'
              name='username'
              type='text'
              required
              className='w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium mb-1'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              className='w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
          {state?.error && (
            <p className='text-sm text-red-500 text-center'>{state.error}</p>
          )}
          <LoginButton />
        </form>
      </div>
    </main>
  );
}
