/* eslint-disable */
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import PublicHeader from './components/public-header';
import PublicFooter from './components/public-footer';
import HomeContent from './components/home-content';

// Asegurar render dinámico para poder leer cookies en cada request.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const session: any = sessionToken ? await decrypt(sessionToken) : null;
  const isAuthenticated = !!session;
  const username: string | null = session?.username ?? null;

  return (
    <>
      <PublicHeader isAuthenticated={isAuthenticated} username={username} />
      <HomeContent />
      <PublicFooter />
    </>
  );
}
