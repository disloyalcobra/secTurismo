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

export default function IgualdadLaboralPublico() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);

  // Integrantes del Comité de Igualdad Laboral y No Discriminación
  const integrantes = [
    { nombre: 'Marta Teresa Ornelas Guerrero', puesto: 'Presidenta del Comité', area: 'Secretaría de Turismo' },
    { nombre: 'Mtra. Fabiana Moreno Huerta', puesto: 'Secretaria Técnica', area: 'Dirección de Administración' },
    { nombre: 'C.P. Ricardo Gutiérrez Ruiz', puesto: 'Vocal de Vigilancia', area: 'Órgano Interno de Control' },
    { nombre: 'Lic. Andrea Cruz Estrada', puesto: 'Vocal de Difusión y Cultura Escolar', area: 'Dirección de Capacitación' },
  ];

  useEffect(() => {
    fetch('/api/documents?seccion=igualdad-laboral')
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
        <h2 className="public-section-title">Comité de Igualdad Laboral y No Discriminación</h2>
        <p className="public-section-subtitle">
          Promovemos un ambiente de trabajo sano, con igualdad de oportunidades y libre de discriminación de cualquier tipo en la Secretaría de Turismo del Estado de Puebla.
        </p>

        {/* Sección de Integrantes del Comité */}
        <div style={{ marginBottom: '50px' }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--puebla-vino)', marginBottom: '20px', borderBottom: '2px solid var(--puebla-beige)', paddingBottom: '8px' }}>
            Integrantes del Comité
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {integrantes.map((member, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ color: 'var(--puebla-vino)', fontSize: '1.05rem', marginBottom: '5px' }}>{member.nombre}</h4>
                <p style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '4px' }}>{member.puesto}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Directorio Documental */}
        <div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--puebla-vino)', marginBottom: '20px', borderBottom: '2px solid var(--puebla-beige)', paddingBottom: '8px' }}>
            Normativa y Actas de Igualdad Laboral
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
              <div className="empty-state">Cargando normativas y minutas del comité...</div>
            ) : filteredDocs.length === 0 ? (
              <div className="empty-state">No se encontraron documentos en esta sección del comité.</div>
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
