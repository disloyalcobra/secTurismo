'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Config {
  direccion: string;
  telefono: string;
  correo: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
}

export default function PublicFooter() {
  const [config, setConfig] = useState<Config>({
    direccion: 'Av. Don Juan de Palafox y Mendoza 14, Centro, 72000 Heroica Puebla de Zaragoza, Pue.',
    telefono: '+52 (222) 123-4567',
    correo: 'contacto.turismo@puebla.gob.mx',
    facebookUrl: 'https://facebook.com/TurismoGobPue',
    twitterUrl: 'https://twitter.com/TurismoGobPue',
    instagramUrl: 'https://instagram.com/TurismoGobPue',
  });

  useEffect(() => {
    fetch('/api/config')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data && data.direccion) {
          setConfig(data);
        }
      })
      .catch(() => {
        // Ignorar error y usar valores por defecto
      });
  }, []);

  return (
    <footer className="public-footer">
      <div className="footer-content">
        <div className="footer-column" style={{ gridColumn: 'span 2' }}>
          <h4>Secretaría de Turismo del Estado de Puebla</h4>
          <img src="/Escudo_pie.svg" width={50} height={50}
            style={{
              width: "400px",
              height: "auto",
              display: "block"
            }} />
          <p className="footer-info-text" style={{ marginBottom: '10px' }}>
            {config.direccion}
          </p>
          <p className="footer-info-text">
            <strong>Teléfono:</strong> {config.telefono} <br />
            <strong>Correo:</strong> {config.correo}
          </p>
        </div>

        <div className="footer-column">
          <h4>Accesos Rápidos</h4>
          <ul className="footer-links-list">
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link href="/quienes-somos">Quiénes Somos</Link>
            </li>
            <li>
              <Link href="/directorio">Directorio de Personal</Link>
            </li>
            <li>
              <Link href="/control-interno">Control Interno</Link>
            </li>
            <li>
              <Link href="/comite-etica">Comité de Ética</Link>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Síguenos en Redes</h4>
          <p className="footer-info-text">
            Mantente al día con las últimas noticias y eventos turísticos del Estado de Puebla.
          </p>
          <div className="footer-social-links">
            <a href={config.facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
              {/* Facebook icon */}
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href={config.twitterUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Twitter">
              {/* Twitter/X icon */}
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              {/* Instagram icon */}
              <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Gobierno del Estado de Puebla. Hacer historia. Hacer futuro.</p>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href="#aviso">Aviso de Privacidad</a>
          <a href="#transparencia">Transparencia</a>
        </div>
      </div>
    </footer>
  );
}
