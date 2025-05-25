import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface AdminSessionData {
  isLoggedIn: boolean;
}

export const sessionOptions = {
  cookieName: 'geostats_admin_session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<AdminSessionData>(
    cookieStore,
    sessionOptions,
  );
  return session;
}
