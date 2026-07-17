/* eslint-disable */
'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/public-header';
import PublicFooter from '../components/public-footer';

interface GaleriaItem {
  idSlide: number;
  idCarrusel: number;
  claveCarrusel: string;
  nombreCarrusel: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  album: string;
  fechaEvento: string | null;
  fechaCreacion: string | null;
}

function formatShort(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GaleriaPage() {
  const [items, setItems] = useState<GaleriaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<GaleriaItem | null>(null);

  useEffect(() => {
    fetch('/api/galeria')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setItems(d);
        else { setItems([]); setError(d?.error || 'Respuesta inválida'); }
      })
      .catch((e) => { setItems([]); setError(String(e)); });
  }, []);

  // Cerrar lightbox con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page, #fafafa)' }}>
      <PublicHeader />

      {/* ENCABEZADO */}
      <section className="public-section" style={{ paddingTop: '40px', paddingBottom: '20px' }}>
        <h1 className="public-section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Galería
        </h1>
        <p className="public-section-subtitle" style={{ marginBottom: '10px' }}>
          Un recorrido visual por los eventos, destinos y momentos de la Secretaría de Turismo del Estado de Puebla.
        </p>
      </section>

      {/* GRID ESTILO INSTAGRAM */}
      <section className="public-section" style={{ paddingTop: '10px', paddingBottom: '60px' }}>
        {items === null && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            Cargando galería…
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            Aún no hay imágenes en la galería. Vuelve pronto.
          </div>
        )}

        {items !== null && items.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '14px',
              gridAutoFlow: 'dense',
            }}
          >
            {items.map((it) => (
              <article
                key={it.idSlide}
                onClick={() => setActive(it)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  aspectRatio: '1 / 1',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <img
                  src={it.imagenUrl}
                  alt={it.titulo || it.nombreCarrusel}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Overlay hover con info */}
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 60%)',
                    color: '#fff', padding: '14px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    opacity: 0, transition: 'opacity 200ms ease',
                  }}
                  className="galeria-card-overlay"
                >
                  {it.titulo && (
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', lineHeight: 1.2 }}>
                      {it.titulo}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '8px' }}>
                    <span style={{
                      backgroundColor: 'var(--puebla-vino)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '60%',
                    }}>
                      {it.nombreCarrusel}
                    </span>
                    {it.fechaCreacion && (
                      <span style={{ opacity: 0.85 }}>{formatShort(it.fechaCreacion)}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX */}
      {active && (
        <div
          onClick={() => setActive(null)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px', cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: 'var(--radius-md)',
              maxWidth: '900px', width: '100%', maxHeight: '90vh',
              overflow: 'auto', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src={active.imagenUrl}
              alt={active.titulo || active.nombreCarrusel}
              style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', backgroundColor: '#000' }}
            />
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--puebla-vino)', fontSize: '1.3rem' }}>
                    {active.titulo || active.nombreCarrusel}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {active.nombreCarrusel}
                    {active.fechaCreacion && ` · ${formatShort(active.fechaCreacion)}`}
                    {active.fechaEvento && ` · Evento: ${formatShort(active.fechaEvento)}`}
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  aria-label="Cerrar"
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: '1.4rem', color: 'var(--text-muted)', padding: '0 6px',
                  }}
                >×</button>
              </div>
              {active.descripcion && (
                <p style={{ color: 'var(--text-main)', lineHeight: 1.5, margin: '10px 0 14px' }}>
                  {active.descripcion}
                </p>
              )}
              <Link
                href="/galeria"
                onClick={() => setActive(null)}
                style={{ fontSize: '0.85rem', color: 'var(--puebla-vino)', fontWeight: 600 }}
              >
                ← Volver a la galería
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CSS inline para hover overlay (no require CSS module) */}
      <style>{`
        article:hover .galeria-card-overlay { opacity: 1 !important; }
        @media (max-width: 640px) {
          article .galeria-card-overlay { opacity: 1 !important; }
        }
      `}</style>

      <PublicFooter />
    </div>
  );
}
