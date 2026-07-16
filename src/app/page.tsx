/* eslint-disable */
'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicHeader from './components/public-header';
import PublicFooter from './components/public-footer';

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

interface NewsItem {
  idNoticia: number;
  titulo: string;
  resumen: string;
  urlImagenPortada: string;
  fechaPublicacion: string;
}

interface Config {
  titularNombre: string;
  titularPuesto: string;
  titularMensaje: string;
  titularImagen: string;
}

interface StaticPage {
  titulo: string;
  contenido: string;
}

export default function Home() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [quienesSomos, setQuienesSomos] = useState<StaticPage | null>(null);

  // Carrusel index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    fetch('/api/carousel')
      .then((res) => res.json())
      .then((data) => setSlides(data.filter((s: Slide) => s.activo !== false)))
      .catch((e) => console.error(e));

    fetch('/api/news?limit=3')
      .then((res) => res.json())
      .then((data) => setNews(data))
      .catch((e) => console.error(e));

    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch((e) => console.error(e));

    fetch('/api/pages')
      .then((res) => res.json())
      .then((data) => {
        const qs = data.find((p: any) => p.slug === 'quienes-somos');
        setQuienesSomos(qs || null);
      })
      .catch((e) => console.error(e));
  }, []);

  // Auto-carrusel
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      {/* 1. HERO CAROUSEL */}
      {slides.length > 0 ? (
        <section className="hero-carousel">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div key={slide.idSlide} className={`carousel-slide ${isActive ? 'active' : ''}`}>
                <div
                  className="carousel-bg"
                  style={{ backgroundImage: `url("${slide.urlImagen}")` }}
                ></div>
                <div className="carousel-overlay"></div>
                <div className="carousel-content">
                  <h2 className="carousel-title">{slide.titulo}</h2>
                  <p className="carousel-desc">{slide.descripcion}</p>
                  {slide.urlEnlace && (
                    <a href={slide.urlEnlace} className="carousel-btn">
                      {slide.textoBoton || 'Más información'}
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {slides.length > 1 && (
            <>
              <button onClick={handlePrevSlide} className="carousel-arrow carousel-arrow-left" aria-label="Anterior">
                <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button onClick={handleNextSlide} className="carousel-arrow carousel-arrow-right" aria-label="Siguiente">
                <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div className="carousel-dots">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`carousel-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                    aria-label={`Slide ${idx + 1}`}
                  ></button>
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
                {quienesSomos ? quienesSomos.titulo : 'Quiénes Somos'}
              </h2>
              <p style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', textAlign: 'justify', marginBottom: '35px', whiteSpace: 'pre-line' }}>
                {quienesSomos ? quienesSomos.contenido : 'Cargando historia de la secretaría...'}
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

      {/* 4. SECCIÓN COMUNICADOS Y NOTICIAS RECIENTES (Fondo Blanco) */}
      <div style={{ backgroundColor: 'var(--bg-white)', color: 'var(--text-main)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <section className="public-section" style={{ paddingTop: '60px', paddingBottom: '70px' }}>
          <h3 className="public-section-title" style={{ color: 'var(--puebla-vino)' }}>Comunicados y Noticias Recientes</h3>
          <p className="public-section-subtitle">Manténgase al tanto del acontecer turístico del Estado de Puebla.</p>

          {news.length === 0 ? (
            <div className="empty-state">No hay comunicados publicados recientemente.</div>
          ) : (
            <div className="noticias-grid">
              {news.map((item) => (
                <article key={item.idNoticia} className="noticia-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                  <div
                    className="noticia-card-img"
                    style={{ backgroundImage: `url("${item.urlImagenPortada}")`, borderBottom: '3px solid var(--puebla-vino)' }}
                  ></div>
                  <div className="noticia-card-body">
                    <span className="noticia-card-date" style={{ color: 'var(--text-muted)' }}>{formatDate(item.fechaPublicacion)}</span>
                    <h4 className="noticia-card-title" style={{ color: 'var(--puebla-vino)' }}>{item.titulo}</h4>
                    <p className="noticia-card-excerpt" style={{ color: 'var(--text-muted)' }}>{item.resumen}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
