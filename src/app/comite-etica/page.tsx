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

export default function ComiteEticaPublico() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);

  // Integrantes: ahora se consultan en /directorio. Se mantiene la
  // sección visible para no romper la maquetación, pero sin nombres.
  const integrantes: Array<{ nombre: string; puesto: string; area: string }> = [];

  useEffect(() => {
    fetch('/api/documents?seccion=comite-etica')
      .then((res) => res.json())
      .then((data) => {
        const activeDocs = data.filter((d: Document) => d.activo !== false);
        setDocuments(activeDocs);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['Todas', ...Array.from(new Set(documents.map((d) => d.nombreCategoria)))];

  const filteredDocs = documents.filter((d) => {
    return selectedCategory === 'Todas' || d.nombreCategoria === selectedCategory;
  });

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
        <h2 className="public-section-title">Comité de Ética e Integridad</h2>
        <p className="public-section-subtitle">
          Integrantes, acuerdos, actas y documentos normativos del Comité de Ética de la Secretaría de Turismo.
        </p>



        {/* Directorio Documental */}
        <div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--puebla-vino)', marginBottom: '20px', borderBottom: '2px solid var(--puebla-beige)', paddingBottom: '8px' }}>
            Acuerdos y Convocatorias
          </h3>

          {/* Filtro de Categorías */}
          <div className="controls-container" style={{ gridTemplateColumns: '1fr', padding: '15px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--puebla-vino)' }}>Filtrar por Categoría:</span>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ maxWidth: '300px' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container" style={{ minHeight: '150px' }}>
            {isLoading ? (
              <div className="empty-state">Cargando documentos del comité...</div>
            ) : filteredDocs.length === 0 ? (
              <div className="empty-state">No se encontraron documentos en esta categoría.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre del Documento</th>
                    <th>Categoría</th>
                    <th>Subido el</th>
                    <th>Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map((doc) => (
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
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
