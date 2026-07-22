/* eslint-disable */
import { cookies } from 'next/headers';
import Link from 'next/link';
import { decrypt } from '@/lib/auth';
import PublicHeader from '../components/public-header';
import PublicFooter from '../components/public-footer';

export const dynamic = 'force-dynamic';

export default async function QuienesSomosPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  const session: any = sessionToken ? await decrypt(sessionToken) : null;
  const isAuthenticated = !!session;
  const username: string | null = session?.username ?? null;

  return (
    <>
      <PublicHeader isAuthenticated={isAuthenticated} username={username} />

      <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh' }}>
        {/* Banner de Título */}
        <section
          style={{
            backgroundColor: 'var(--puebla-vino)',
            color: 'var(--text-white)',
            padding: '50px 20px',
            textAlign: 'center',
            borderBottom: '4px solid var(--puebla-beige)',
          }}
        >
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1
              style={{
                fontSize: '2.2rem',
                color: 'var(--puebla-beige)',
                marginBottom: '10px',
              }}
            >
              Quiénes Somos
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>
              Conozca la misión, visión y estructura de la Secretaría de Turismo del Estado de Puebla.
            </p>
          </div>
        </section>

        {/* Sección Principal de Contenido */}
        <section className="public-section">
          <div
            style={{
              backgroundColor: 'var(--bg-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '40px',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '40px',
            }}
          >
            <h2
              style={{
                fontSize: '1.6rem',
                color: 'var(--puebla-vino)',
                marginBottom: '20px',
                borderBottom: '2px solid var(--puebla-beige)',
                paddingBottom: '8px',
              }}
            >
              Semblanza e Historia Institucional
            </h2>

            <p style={{ lineHeight: 1.7, color: 'var(--text-main)', textAlign: 'justify', marginBottom: '20px' }}>
              La Secretaría de Turismo del Estado de Puebla fue creada con la finalidad de coordinar y dirigir la política pública en materia de turismo. Desde su constitución, ha trabajado de la mano con prestadores de servicios, comités locales y comunidades para impulsar el desarrollo regional sustentables en nuestros municipios y Pueblos Mágicos.
            </p>

            <p style={{ lineHeight: 1.7, color: 'var(--text-main)', textAlign: 'justify', marginBottom: '30px' }}>
              Nuestra entidad cuenta con una riqueza arquitectónica, gastronómica, cultural y natural inigualable. La Secretaría actúa como un enlace estratégico entre los sectores público y privado para promocionar a Puebla como un destino turístico de clase mundial.
            </p>

            {/* Tarjetas de Misión y Visión */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '25px',
                marginTop: '30px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderLeft: '5px solid var(--puebla-vino)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '25px',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.3rem',
                    color: 'var(--puebla-vino)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Misión
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'justify' }}>
                  Promover, fomentar y regular el desarrollo turístico sustentable en el Estado de Puebla, consolidando a la entidad como un destino competitivo a nivel nacional e internacional a través de la preservación de su patrimonio cultural y natural.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderLeft: '5px solid var(--puebla-vino)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '25px',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.3rem',
                    color: 'var(--puebla-vino)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Visión
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'justify' }}>
                  Ser el motor de desarrollo económico y social del estado, posicionando a Puebla como líder en turismo cultural, de negocios y de aventura, promoviendo la inclusión social y la conservación de la identidad poblana.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas de Accesos Institucionales */}
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--puebla-vino)', marginBottom: '20px', textAlign: 'center' }}>
              Módulos e Información de Interés
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
              }}
            >
              <Link href="/directorio" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    transition: 'var(--transition-fast)',
                    height: '100%',
                  }}
                  className="acceso-rapido-card"
                >
                  <h4 style={{ color: 'var(--puebla-vino)', marginBottom: '8px' }}>Directorio de Personal</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Consulte el equipo de trabajo y titulares de las distintas áreas de la Secretaría.
                  </p>
                </div>
              </Link>

              <Link href="/control-interno" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    transition: 'var(--transition-fast)',
                    height: '100%',
                  }}
                  className="acceso-rapido-card"
                >
                  <h4 style={{ color: 'var(--puebla-vino)', marginBottom: '8px' }}>Control Interno</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Informes del Órgano Interno de Control, procedimientos y circulares oficiales.
                  </p>
                </div>
              </Link>

              <Link href="/normatividad" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    transition: 'var(--transition-fast)',
                    height: '100%',
                  }}
                  className="acceso-rapido-card"
                >
                  <h4 style={{ color: 'var(--puebla-vino)', marginBottom: '8px' }}>Normatividad</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Leyes, reglamentos y acuerdos aplicables a la gestión turística estatal.
                  </p>
                </div>
              </Link>

              <Link href="/comite-etica" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: 'var(--bg-white)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '20px',
                    transition: 'var(--transition-fast)',
                    height: '100%',
                  }}
                  className="acceso-rapido-card"
                >
                  <h4 style={{ color: 'var(--puebla-vino)', marginBottom: '8px' }}>Comité de Ética</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Integrantes, código de conducta y resoluciones éticas de la dependencia.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
