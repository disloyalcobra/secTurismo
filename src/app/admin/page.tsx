import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import PanelView from '@/app/admin/panel-view';

// Asegurar que esta página no sea indexada y se evalúe de manera dinámica
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestión Interna',
  description: 'Sistema de administración y control de documentos.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminPanelPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  let session: any = null;

  if (sessionToken) {
    session = await decrypt(sessionToken);
  }

  const isAuthenticated = !!session;
  const username: string | null = session?.username ?? null;

  return <PanelView isAuthenticated={isAuthenticated} username={username} />;
}
