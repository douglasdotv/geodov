'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import bcrypt from 'bcrypt';

export async function login(
  _prevState: { error?: string },
  formData: FormData,
) {
  const envHashBase64 = process.env.ADMIN_PASSWORD_HASH_BASE64;

  if (!envHashBase64) {
    console.error('ADMIN_PASSWORD_HASH (Base64) not set or empty');
    return { error: 'Server configuration error' };
  }

  let adminPasswordHash: string;

  try {
    adminPasswordHash = Buffer.from(envHashBase64, 'base64').toString('utf8');
  } catch (e) {
    console.error('Error decoding ADMIN_PASSWORD_HASH from Base64:', e);
    return { error: 'Server configuration error (invalid Base64 format)' };
  }

  const username = formData.get('username');
  const password = formData.get('password');

  if (
    username === process.env.ADMIN_USERNAME &&
    typeof password === 'string' &&
    password.length > 0 &&
    adminPasswordHash &&
    (await bcrypt.compare(password, adminPasswordHash))
  ) {
    const session = await getSession();
    session.isLoggedIn = true;
    await session.save();
    return redirect('/admin');
  }

  return { error: 'Invalid username or password' };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
