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

export default function PlanesPublicos() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents?seccion=planes')
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
        <h2 className="public-section-title">Planes y Programas Institucionales</h2>
        <p className="public-section-subtitle">
          Consulte los planes sectoriales de desarrollo turístico, programas de trabajo anuales e indicadores de gestión.
        </p>

        <div className="table-container" style={{ minHeight: '200px' }}>
          {isLoading ? (
            <div className="empty-state">Cargando planes e informes...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">No hay planes institucionales publicados en este momento.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan / Indicador de Gestión</th>
                  <th>Categoría</th>
                  <th>Fecha de Carga</th>
                  <th>Enlace</th>
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
