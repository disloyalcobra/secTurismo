'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface PublicHeaderProps {
  isAuthenticated?: boolean;
  username?: string | null;
}

export default function PublicHeader({
  isAuthenticated = false,
  username = null,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Módulos visibles para todo el público.
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Quiénes Somos', path: '/quienes-somos' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Control Interno', path: '/control-interno' },
    { name: 'Directorio', path: '/directorio' },
    { name: 'Normatividad', path: '/normatividad' },
    { name: 'Planes', path: '/planes' },
    { name: 'Comité de Ética', path: '/comite-etica' },
    { name: 'Igualdad Laboral', path: '/igualdad-laboral' },
  ];

  // Módulo exclusivo para administradores ya autenticados.
  const adminItems = [
    { name: 'Configuración', path: '/admin' },
  ];

  const initial = (username && username[0]?.toUpperCase()) || 'A';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      /* ignore */
    }
    // Refresca la ruta actual para que el server component re-evalúe
    // la cookie y el header vuelva a su estado público.
    router.refresh();
  };

  return (
    <header className="public-header">
      <Link href="/" className="public-header-logo-link" style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/Escudo_pie.svg"
          alt="Logo Secretaría de Turismo Puebla"
          className="header-logo-img"
        />
      </Link>

      {/* Botón Hamburguesa para Móvil */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Abrir o cerrar menú de navegación"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '26px', height: '26px' }}>
          {mobileMenuOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <nav className={`public-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`public-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          );
        })}

        {/* Módulos exclusivos para el administrador autenticado */}
        {isAuthenticated && adminItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`public-nav-link public-nav-link-admin ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          );
        })}

        {/* Acciones de usuario autenticado en menú móvil */}
        {isAuthenticated && (
          <div className="mobile-user-actions">
            <div className="user-info">
              <div className="user-avatar">{initial}</div>
              <span>{username || 'Administrador'}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-outline-white btn-sm">
              Cerrar Sesión
            </button>
          </div>
        )}
      </nav>

      {/* Usuario + cerrar sesión SOLO si hay sesión iniciada (Escritorio) */}
      {isAuthenticated && (
        <div className="header-actions header-actions-public desktop-only-actions">
          <div className="user-info">
            <div className="user-avatar">{initial}</div>
            <span>{username || 'Administrador'}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-white">
            Cerrar Sesión
          </button>
        </div>
      )}
    </header>
  );
}

