/* eslint-disable */
'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Slide {
  idSlide: number;
  titulo: string;
  descripcion: string;
  urlImagen: string;
  urlEnlace: string;
  textoBoton: string;
  orden: number;
  activo: boolean;
}

interface GaleriaPost {
  idCarrusel: number;
  claveCarrusel: string;
  nombreCarrusel: string;
  descripcionCarrusel: string;
  portadaUrl: string;
  totalImagenes: number;
  fechaCreacion: string | null;
  imagenes: {
    idSlide: number;
    titulo: string;
    descripcion: string;
    imagenUrl: string;
    album: string;
    orden: number;
    fechaEvento: string | null;
    fechaCreacion: string | null;
  }[];
}

interface Config {
  titularNombre: string;
  titularPuesto: string;
  titularMensaje: string;
  titularImagen: string;
}

// Texto institucional estático de "Quiénes Somos".
// Antes se cargaba desde la API /api/pages (eliminado); se mantiene en
// código porque es contenido estable del portal.
const QUIENES_SOMOS_TEXTO = `La Secretaría de Turismo del Estado de Puebla fue creada con la finalidad de coordinar y dirigir la política pública en materia de turismo. Desde su constitución, ha trabajado de la mano con prestadores de servicios, comités locales y comunidades para impulsar el desarrollo regional.

Objetivos Estratégicos
- Incrementar la afluencia de visitantes nacionales y extranjeros en las diferentes regiones turísticas.
- Fortalecer la capacitación y certificación de los prestadores de servicios turísticos.
- Desarrollar e integrar nuevos productos turísticos sustentables, respetando el entorno y las comunidades.`;

const QUIENES_SOMOS_TITULO = 'Quiénes Somos';

export default function HomeContent() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [config, setConfig] = useState<Config | null>(null);
  const [feed, setFeed] = useState<GaleriaPost[]>([]);

  // 1) Hero: array de slides activos del carrusel principal (rotativo).
  useEffect(() => {
    fetch('/api/carousel')
      .then((res) => res.json())
      .then((data: Slide[] | { error: string }) => {
        if (Array.isArray(data)) {
          const activos = data
            .filter((s) => s.activo !== false)
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
          setSlides(activos);
          setCurrent(0);
        }
      })
      .catch((e) => console.error(e));

    // 2) Config del titular.
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((e) => console.error(e));

    // 3) Feed para la sección de Noticias (últimos 8 carruseles/publicaciones).
    fetch('/api/galeria?limit=8')
      .then((res) => res.json())
      .then((data: GaleriaPost[] | { error: string }) => {
        if (Array.isArray(data)) setFeed(data);
        else setFeed([]);
      })
      .catch(() => setFeed([]));
  }, []);

  // Auto-rotación: cada 7s avanza al siguiente slide, si hay más de uno.
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  const goPrev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setCurrent((c) => (c + 1) % slides.length);
  };

  const slide = slides[current] ?? null;

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. HERO — muestra el slide activo del carrusel principal con flechas de navegación */}
      {slide ? (
        <section className="hero-carousel">
          <div className="carousel-slide active">
            <div
              className="carousel-bg"
              style={{ backgroundImage: `url("${slide.urlImagen}")` }}
            ></div>
            <div className="carousel-overlay"></div>
            <div className="carousel-content">
              <h2 className="carousel-title">{slide.titulo}</h2>
              <p className="carousel-desc">{slide.descripcion}</p>
              {slide.urlEnlace ? (
                <a
                  href={slide.urlEnlace}
                  className="carousel-btn"
                  target={slide.urlEnlace.startsWith('http') ? '_blank' : undefined}
                  rel={slide.urlEnlace.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {slide.textoBoton || 'Ver más'}
                </a>
              ) : (
                <Link href="/galeria" className="carousel-btn">
                  {slide.textoBoton || 'Ver galería completa'}
                </Link>
              )}
            </div>
          </div>

          {/* Flechas de navegación — solo se muestran si hay más de un slide */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Slide anterior"
                className="carousel-arrow carousel-arrow-left"
                onClick={goPrev}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Siguiente slide"
                className="carousel-arrow carousel-arrow-right"
                onClick={goNext}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div className="carousel-dots" role="tablist" aria-label="Indicadores de slide">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Ir al slide ${i + 1}`}
                    aria-selected={i === current}
                    className={`carousel-dot ${i === current ? 'active' : ''}`}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="hero-carousel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff' }}>Cargando carrusel...</div>
        </section>
      )}

      {/* 2. SECCIÓN BOTONES DESTACADOS (Fondo Blanco) */}
      <div style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
        <section className="public-section" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <h3 className="public-section-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Enlaces de Interés y Transparencia</h3>
          <p className="public-section-subtitle" style={{ marginBottom: '35px', fontSize: '0.9rem' }}>Accesos directos a los comités y órganos de fiscalización interna.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>

            {/* OIC / Control Interno */}
            <div className="acceso-rapido-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', transition: 'var(--transition-normal)' }}>
              <div className="acceso-rapido-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="acceso-rapido-text">
                <h3 style={{ color: 'var(--puebla-vino)' }}>Control Interno (OIC)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Consulte los programas de auditorías, circulares internas, actas y procedimientos oficiales del OIC.</p>
                <Link href="/control-interno" className="acceso-rapido-link">
                  Acceder a documentos &rarr;
                </Link>
              </div>
            </div>

            {/* Comité de Ética */}
            <div className="acceso-rapido-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', transition: 'var(--transition-normal)' }}>
              <div className="acceso-rapido-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="acceso-rapido-text">
                <h3 style={{ color: 'var(--puebla-vino)' }}>Comité de Ética</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Conozca a los integrantes del comité, códigos de conducta, convocatorias electorales y actas.</p>
                <Link href="/comite-etica" className="acceso-rapido-link">
                  Conocer el comité &rarr;
                </Link>
              </div>
            </div>

            {/* Comité de Igualdad Laboral y No Discriminación */}
            <div className="acceso-rapido-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', transition: 'var(--transition-normal)' }}>
              <div className="acceso-rapido-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
              </div>
              <div className="acceso-rapido-text">
                <h3 style={{ color: 'var(--puebla-vino)' }}>Igualdad Laboral y No Discriminación</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Conozca la política institucional, actas, manuales y normas aplicadas para erradicar la discriminación laboral.</p>
                <Link href="/igualdad-laboral" className="acceso-rapido-link">
                  Ver Igualdad &rarr;
                </Link>
              </div>
            </div>

          </div>
        </section>
      </div>



      {/* 3. SECCIÓN QUIÉNES SOMOS (Fondo Vino) */}
      <div style={{ backgroundColor: 'var(--puebla-vino)', color: 'var(--text-white)' }}>
        <section className="public-section" style={{ paddingBottom: '70px', paddingTop: '60px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Main Quiénes Somos Content */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '2.1rem', color: 'var(--puebla-beige)', marginBottom: '20px', borderBottom: '3px solid var(--puebla-beige)', paddingBottom: '8px' }}>
                {QUIENES_SOMOS_TITULO}
              </h2>
              <p style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', textAlign: 'justify', marginBottom: '35px', whiteSpace: 'pre-line' }}>
                {QUIENES_SOMOS_TEXTO}
              </p>

              {/* Misión y Visión Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginTop: '10px' }}>

                <div style={{ backgroundColor: 'var(--bg-white)', borderLeft: '5px solid var(--puebla-beige)', borderRadius: 'var(--radius-sm)', padding: '24px', boxShadow: 'var(--shadow-md)', color: 'var(--text-main)' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--puebla-vino)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Misión
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'justify' }}>
                    Promover, fomentar y regular el desarrollo turístico sustentable en el Estado de Puebla, consolidando a la entidad como un destino competitivo a nivel nacional e internacional a través de la preservación de su patrimonio cultural y natural.
                  </p>
                </div>

                <div style={{ backgroundColor: 'var(--bg-white)', borderLeft: '5px solid var(--puebla-beige)', borderRadius: 'var(--radius-sm)', padding: '24px', boxShadow: 'var(--shadow-md)', color: 'var(--text-main)' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--puebla-vino)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ width: '22px', height: '22px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Visión
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, textAlign: 'justify' }}>
                    Ser el motor de desarrollo económico y social del estado, posicionando a Puebla como líder en turismo cultural, de negocios y de aventura, promoviendo la inclusión social y la conservación de la identidad poblana.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>
      </div>
      {/* 2.5 SECCIÓN NOTICIAS / GALERÍA (estilo Instagram) */}
      <div style={{ backgroundColor: '#fafafa', borderBottom: '1px solid var(--border-color)' }}>
        <section className="public-section" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 className="public-section-title" style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Noticias y Galería</h3>
              <p className="public-section-subtitle" style={{ fontSize: '0.9rem' }}>Las publicaciones más recientes de nuestros eventos y destinos.</p>
            </div>
            <Link
              href="/galeria"
              style={{
                backgroundColor: 'var(--puebla-vino)', color: '#fff',
                padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                transition: 'background-color 200ms ease',
              }}
            >
              Ver galería completa →
            </Link>
          </div>

          {feed.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 20px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '20px' }}>
              Aún no hay publicaciones. Crea un carrusel y agrega imágenes desde el panel de administración.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              {feed.map((post) => (
                <Link
                  key={post.idCarrusel}
                  href="/galeria"
                  style={{
                    position: 'relative', display: 'block',
                    aspectRatio: '1 / 1', overflow: 'hidden',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#000',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 200ms ease, box-shadow 200ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
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
                        position: 'absolute', top: '8px', right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff',
                        padding: '3px 8px', borderRadius: '999px',
                        fontSize: '0.68rem', fontWeight: 700,
                      }}
                    >
                      {post.totalImagenes} fotos
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute', left: '8px', bottom: '8px', right: '8px',
                      backgroundColor: 'var(--puebla-vino)', color: '#fff',
                      padding: '4px 10px', borderRadius: '999px',
                      fontSize: '0.7rem', fontWeight: 600,
                      maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {post.nombreCarrusel}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
