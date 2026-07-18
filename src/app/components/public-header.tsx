'use strict';
'use client';

import React from 'react';
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

  // Módulos visibles para todo el público.
  const navItems = [
    { name: 'Inicio', path: '/' },
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
      <img src="/Escudo_pie.svg" width={50} height={50}
        style={{
          width: "300px",
          height: "auto",
          display: "block",
        }} />
      <nav className="public-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`public-nav-link ${isActive ? 'active' : ''}`}
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
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Usuario + cerrar sesión SOLO si hay sesión iniciada */}
      {isAuthenticated && (
        <div className="header-actions header-actions-public">
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
