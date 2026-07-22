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

  const [activeModal, setActiveModal] = useState<'aviso' | 'transparencia' | null>(null);

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
        <div className="footer-column footer-logo-col">
          <h4>Secretaría de Turismo del Estado de Puebla</h4>
          <img
            src="/Escudo_pie.svg"
            alt="Escudo Secretaría de Turismo Puebla"
            className="footer-logo-img"
          />
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
              <Link href="/galeria">Galería Fotográfica</Link>
            </li>
            <li>
              <Link href="/directorio">Directorio de Personal</Link>
            </li>
            <li>
              <Link href="/control-interno">Control Interno (OIC)</Link>
            </li>
            <li>
              <Link href="/comite-etica">Comité de Ética</Link>
            </li>
            <li>
              <Link href="/igualdad-laboral">Igualdad Laboral</Link>
            </li>
            <li>
              <Link href="/normatividad">Marco Legal y Normatividad</Link>
            </li>
            <li>
              <Link href="/planes">Planes e Informes</Link>
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
        <div className="footer-bottom-links">
          <button type="button" onClick={() => setActiveModal('aviso')} className="footer-modal-btn">
            Aviso de Privacidad
          </button>
          <button type="button" onClick={() => setActiveModal('transparencia')} className="footer-modal-btn">
            Transparencia
          </button>
        </div>
      </div>

      {/* Modal Aviso de Privacidad / Transparencia */}
      {activeModal && (
        <div className="custom-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>
                {activeModal === 'aviso' ? 'Aviso de Privacidad Integral' : 'Transparencia e Información Pública'}
              </h3>
              <button className="custom-modal-close" onClick={() => setActiveModal(null)}>
                &times;
              </button>
            </div>
            <div className="custom-modal-body">
              {activeModal === 'aviso' ? (
                <div>
                  <p><strong>Secretaría de Turismo del Estado de Puebla</strong></p>
                  <br />
                  <p>
                    En cumplimiento a lo dispuesto por la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados del Estado de Puebla, la Secretaría de Turismo informa que los datos personales recabados serán protegidos, incorporados y tratados en los sistemas de datos de esta dependencia.
                  </p>
                  <br />
                  <p>
                    <strong>Finalidad del tratamiento:</strong> Atender trámites, servicios, solicitudes de información y coordinar actividades turísticas estatales.
                  </p>
                  <br />
                  <p>
                    <strong>Derechos ARCO:</strong> Puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición ante la Unidad de Transparencia institucional ubicada en {config.direccion}.
                  </p>
                </div>
              ) : (
                <div>
                  <p><strong>Portal de Transparencia Institucional</strong></p>
                  <br />
                  <p>
                    La Secretaría de Turismo pone a disposición de la ciudadanía las obligaciones de transparencia en cumplimiento con la Ley de Transparencia y Acceso a la Información Pública del Estado de Puebla.
                  </p>
                  <br />
                  <p>
                    Puede consultar los documentos de Control Interno, Normatividad, Directorio Oficial y Planes de Trabajo en nuestras secciones públicas o acceder al Portal Nacional de Transparencia (PNT).
                  </p>
                  <br />
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Link href="/normatividad" onClick={() => setActiveModal(null)} className="btn btn-primary btn-sm">
                      Ver Marco Legal y Normatividad
                    </Link>
                    <Link href="/control-interno" onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm">
                      Ver Control Interno
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="custom-modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

