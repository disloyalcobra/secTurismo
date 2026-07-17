'use strict';
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicHeader() {
  const pathname = usePathname();

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

  return (
    <header className="public-header">
      <img src="Escudo_pie.svg" width={50} height={50}
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
      </nav>
    </header>
  );
}
