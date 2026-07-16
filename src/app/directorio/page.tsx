'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import PublicHeader from '../components/public-header';
import PublicFooter from '../components/public-footer';

interface Staff {
  idPersonal: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  cargo: string;
  area: string;
  correo: string;
  telefono: string;
  extension: string;
  activo: boolean;
}

export default function DirectorioPublico() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/directory')
      .then((res) => res.json())
      .then((data) => {
        // Filtrar solo los activos para el portal público
        const activeStaff = data.filter((s: Staff) => s.activo !== false);
        setStaffList(activeStaff);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Obtener áreas únicas para el dropdown
  const areas = ['Todas', ...Array.from(new Set(staffList.map((s) => s.area)))];

  // Filtrado de personal
  const filteredStaff = staffList.filter((s) => {
    const fullName = `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toLowerCase();
    const searchMatch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      s.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.correo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const areaMatch = selectedArea === 'Todas' || s.area === selectedArea;

    return searchMatch && areaMatch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      
      <main className="public-section">
        <h2 className="public-section-title">Directorio del Servidores Públicos</h2>
        <p className="public-section-subtitle">
          Consulte la información de contacto y estructura de la Secretaría de Turismo del Estado de Puebla.
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
              placeholder="Buscar por nombre, cargo o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              style={{ width: '100%' }}
            >
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="table-container" style={{ minHeight: '200px' }}>
          {isLoading ? (
            <div className="empty-state">Cargando directorio de personal...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>No se encontraron servidores públicos con los criterios de búsqueda.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Cargo / Área de Adscripción</th>
                  <th>Información de Contacto</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.idPersonal}>
                    <td style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                      {staff.nombre} {staff.apellidoPaterno} {staff.apellidoMaterno}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: 'var(--puebla-vino)' }}>{staff.cargo}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{staff.area}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg style={{ width: '14px', height: '14px', color: 'var(--puebla-vino)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {staff.telefono} {staff.extension && `Ext. ${staff.extension}`}
                        </span>
                        <a href={`mailto:${staff.correo}`} className="text-link" style={{ fontSize: '0.85rem' }}>
                          <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          {staff.correo}
                        </a>
                      </div>
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
