/* eslint-disable */
'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import PublicHeader from '../components/public-header';
import PublicFooter from '../components/public-footer';

interface Document {
  idDocumento: number;
  nombre: string;
  idCategoria: number;
  nombreCategoria: string;
  seccion: string;
  tipo: 'pdf' | 'enlace';
  rutaArchivo: string;
  urlExterna: string;
  fechaSubida: string;
  activo: boolean;
}

export default function NormatividadPublica() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents?seccion=normatividad')
      .then((res) => res.json())
      .then((data) => {
        const activeDocs = data.filter((d: Document) => d.activo !== false);
        setDocuments(activeDocs);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

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
      
      <main className="public-section">
        <h2 className="public-section-title">Marco Legal y Normatividad</h2>
        <p className="public-section-subtitle">
          Consulte las leyes, reglamentos y acuerdos que regulan la actuación de la Secretaría de Turismo del Estado de Puebla.
        </p>

        <div className="table-container" style={{ minHeight: '200px' }}>
          {isLoading ? (
            <div className="empty-state">Cargando normatividad y reglamentos...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">No hay documentos de normatividad disponibles en este momento.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Normatividad / Instrumento Jurídico</th>
                  <th>Tipo de Clasificación</th>
                  <th>Fecha de Carga</th>
                  <th>Acceso</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.idDocumento}>
                    <td style={{ fontWeight: '600', fontSize: '0.95rem' }}>{doc.nombre}</td>
                    <td>
                      <span className="badge badge-category">{doc.nombreCategoria}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {formatDate(doc.fechaSubida)}
                    </td>
                    <td>
                      {doc.tipo === 'pdf' ? (
                        <a href={doc.rutaArchivo} download target="_blank" rel="noopener noreferrer" className="text-link">
                          Descargar PDF
                        </a>
                      ) : (
                        <a href={doc.urlExterna} target="_blank" rel="noopener noreferrer" className="text-link">
                          Ver Enlace
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
