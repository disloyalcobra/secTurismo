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

export default function ControlInternoPublico() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents?seccion=control-interno')
      .then((res) => res.json())
      .then((data) => {
        // Filtrar solo los activos para el portal público
        const activeDocs = data.filter((d: Document) => d.activo !== false);
        setDocuments(activeDocs);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Obtener categorías únicas para el dropdown
  const categories = ['Todas', ...Array.from(new Set(documents.map((d) => d.nombreCategoria)))];

  // Filtrado de documentos
  const filteredDocs = documents.filter((d) => {
    const searchMatch = d.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'Todas' || d.nombreCategoria === selectedCategory;
    return searchMatch && categoryMatch;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      
      <main className="public-section">
        <h2 className="public-section-title">Órgano Interno de Control — Control Interno</h2>
        <p className="public-section-subtitle">
          Consulte los informes, manuales y reglamentos oficiales emitidos por el Órgano Interno de Control de la Secretaría de Turismo.
        </p>

        {/* Controles de Búsqueda y Filtro */}
        <div className="controls-container">
          <div className="search-input-wrapper">
            <span className="search-input-icon">
              <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar documento por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="table-container" style={{ minHeight: '200px' }}>
          {isLoading ? (
            <div className="empty-state">Cargando directorio de documentos...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>No se encontraron documentos en esta sección.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre del Documento</th>
                  <th>Categoría</th>
                  <th>Fecha de Publicación</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.idDocumento}>
                    <td style={{ fontWeight: '600', fontSize: '0.95rem', maxWidth: '400px' }}>{doc.nombre}</td>
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
                          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </a>
                      ) : (
                        <a href={doc.urlExterna} target="_blank" rel="noopener noreferrer" className="text-link">
                          Ir al Enlace
                          <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
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
