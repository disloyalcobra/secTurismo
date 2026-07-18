/* eslint-disable */
'use strict';
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PublicHeader from '../components/public-header';
import PublicFooter from '../components/public-footer';

interface GaleriaSlide {
  idSlide: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  album: string;
  orden: number;
  fechaEvento: string | null;
  fechaCreacion: string | null;
  linkDestino: string;
  textoBoton: string;
}

interface GaleriaPost {
  idCarrusel: number;
  claveCarrusel: string;
  nombreCarrusel: string;
  descripcionCarrusel: string;
  portadaUrl: string;
  totalImagenes: number;
  fechaCreacion: string | null;
  imagenes: GaleriaSlide[];
}

function formatShort(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function GaleriaPage() {
  const [posts, setPosts] = useState<GaleriaPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<GaleriaPost | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    fetch('/api/galeria')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setPosts(d);
        else { setPosts([]); setError(d?.error || 'Respuesta inválida'); }
      })
      .catch((e) => { setPosts([]); setError(String(e)); });
  }, []);

  const openPost = (post: GaleriaPost, startIndex = 0) => {
    setActivePost(post);
    setSlideIndex(startIndex);
  };

  const closeLightbox = useCallback(() => {
    setActivePost(null);
    setSlideIndex(0);
  }, []);

  const goPrev = useCallback(() => {
    if (!activePost) return;
    setSlideIndex((i) => (i - 1 + activePost.imagenes.length) % activePost.imagenes.length);
  }, [activePost]);

  const goNext = useCallback(() => {
    if (!activePost) return;
    setSlideIndex((i) => (i + 1) % activePost.imagenes.length);
  }, [activePost]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activePost) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePost, closeLightbox, goPrev, goNext]);

  const currentSlide = activePost?.imagenes[slideIndex] ?? null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page, #fafafa)' }}>
      <PublicHeader />

      <section className="public-section" style={{ paddingTop: '40px', paddingBottom: '20px' }}>
        <h1 className="public-section-title" style={{ fontSize: '2rem', marginBottom: '8px' }}>
          Galería
        </h1>
        <p className="public-section-subtitle" style={{ marginBottom: '10px' }}>
          Un recorrido visual por los eventos, destinos y momentos de la Secretaría de Turismo del Estado de Puebla.
        </p>
      </section>

      <section className="public-section" style={{ paddingTop: '10px', paddingBottom: '60px' }}>
        {posts === null && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            Cargando galería…
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: 'var(--color-error, #c0392b)', padding: '20px 0' }}>
            {error}
          </div>
        )}

        {posts !== null && posts.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
            Aún no hay publicaciones en la galería. Vuelve pronto.
          </div>
        )}

        {posts !== null && posts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '14px',
              gridAutoFlow: 'dense',
            }}
          >
            {posts.map((post) => (
              <article
                key={post.idCarrusel}
                onClick={() => openPost(post, 0)}
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
                  src={post.portadaUrl}
                  alt={post.nombreCarrusel}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />

                {post.totalImagenes > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    {post.totalImagenes}
                  </div>
                )}

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
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px', lineHeight: 1.2 }}>
                    {post.nombreCarrusel}
                  </div>
                  {post.descripcionCarrusel && (
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '6px', lineHeight: 1.3 }}>
                      {post.descripcionCarrusel.length > 80
                        ? `${post.descripcionCarrusel.slice(0, 80)}…`
                        : post.descripcionCarrusel}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '8px' }}>
                    <span style={{
                      backgroundColor: 'var(--puebla-vino)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600,
                    }}>
                      {post.totalImagenes} {post.totalImagenes === 1 ? 'foto' : 'fotos'}
                    </span>
                    {post.fechaCreacion && (
                      <span style={{ opacity: 0.85 }}>{formatShort(post.fechaCreacion)}</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX — post tipo Instagram con carrusel interno */}
      {activePost && currentSlide && (
        <div
          onClick={closeLightbox}
          className="galeria-lightbox-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="galeria-lightbox-container"
          >
            {/* Cabecera del post */}
            <div className="galeria-lightbox-header">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--puebla-vino)', fontSize: '0.95rem' }}>
                  {activePost.nombreCarrusel}
                </div>
                {activePost.fechaCreacion && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {formatShort(activePost.fechaCreacion)}
                  </div>
                )}
              </div>
              <button
                onClick={closeLightbox}
                aria-label="Cerrar"
                style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: '1.5rem', color: 'var(--text-muted)', padding: '0 4px', lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* Imagen con navegación */}
            <div className="galeria-lightbox-img-col">
              <img
                src={currentSlide.imagenUrl}
                alt={currentSlide.titulo || activePost.nombreCarrusel}
                className="galeria-lightbox-img"
              />

              {activePost.imagenes.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Imagen anterior"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    style={{
                      position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10,
                    }}
                  >‹</button>
                  <button
                    type="button"
                    aria-label="Siguiente imagen"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%',
                      width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10,
                    }}
                  >›</button>

                  {/* Indicadores de posición */}
                  <div style={{
                    position: 'absolute', bottom: '12px', left: 0, right: 0,
                    display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 10,
                  }}>
                    {activePost.imagenes.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Ir a imagen ${i + 1}`}
                        onClick={(e) => { e.stopPropagation(); setSlideIndex(i); }}
                        style={{
                          width: i === slideIndex ? '9px' : '6px',
                          height: i === slideIndex ? '9px' : '6px',
                          borderRadius: '50%',
                          border: 'none', padding: 0, cursor: 'pointer',
                          backgroundColor: i === slideIndex ? '#fff' : 'rgba(255,255,255,0.55)',
                          transition: 'all 150ms ease',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff',
                    padding: '4px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                    zIndex: 10,
                  }}>
                    {slideIndex + 1} / {activePost.imagenes.length}
                  </div>
                </>
              )}
            </div>

            {/* Pie del post / Información */}
            <div className="galeria-lightbox-info-col">
              <div style={{ flexGrow: 1 }}>
                {currentSlide.titulo && (
                  <h3 style={{ margin: '0 0 10px', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>
                    {currentSlide.titulo}
                  </h3>
                )}
                {(currentSlide.descripcion || activePost.descripcionCarrusel) && (
                  <p style={{ color: 'var(--text-main)', lineHeight: 1.5, margin: '0 0 12px', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                    {currentSlide.descripcion || activePost.descripcionCarrusel}
                  </p>
                )}
                {currentSlide.fechaEvento && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Evento: {formatShort(currentSlide.fechaEvento)}</span>
                  </div>
                )}
              </div>

              {/* Botón de enlace de la imagen */}
              {currentSlide.linkDestino && (
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
                  <a
                    href={currentSlide.linkDestino}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      backgroundColor: 'var(--puebla-vino, #722F37)',
                      color: '#fff',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-sm, 4px)',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      transition: 'background-color 200ms ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5c242a'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--puebla-vino, #722F37)'; }}
                  >
                    {currentSlide.textoBoton || 'Más información'} &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        article:hover .galeria-card-overlay { opacity: 1 !important; }
        @media (max-width: 640px) {
          article .galeria-card-overlay { opacity: 1 !important; }
        }

        .galeria-lightbox-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0,0,0,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          cursor: zoom-out;
        }

        .galeria-lightbox-container {
          background-color: #fff;
          border-radius: var(--radius-md);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          overflow: hidden;
          display: flex;
          grid-template-areas:
            "header"
            "image"
            "info";
          grid-template-rows: auto auto 1fr;
          grid-template-columns: 1fr;
          width: 100%;
          max-width: 520px;
          max-height: 92vh;
          cursor: default;
          flex-direction: column;
        }

        .galeria-lightbox-header {
          grid-area: header;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          background-color: #fff;
        }

        .galeria-lightbox-img-col {
          grid-area: image;
          position: relative;
          background-color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .galeria-lightbox-img {
          width: 100%;
          max-height: 55vh;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }

        .galeria-lightbox-info-col {
          grid-area: info;
          padding: 18px;
          background-color: #fff;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media (min-width: 768px) {
          .galeria-lightbox-container {
            grid-template-areas:
              "image header"
              "image info";
            grid-template-columns: 60% 40%;
            grid-template-rows: auto 1fr;
            height: 80vh;
            max-height: 720px;
            max-width: 1000px;
          }

          .galeria-lightbox-img-col {
            height: 100%;
          }

          .galeria-lightbox-img {
            height: 100%;
            max-height: 100%;
          }

          .galeria-lightbox-info-col {
            border-left: 1px solid var(--border-color);
            height: 100%;
          }
        }
      `}</style>

      <PublicFooter />
    </div>
  );
}
