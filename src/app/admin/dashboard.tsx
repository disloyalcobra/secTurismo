/* eslint-disable */
'use strict';
'use client';

import React, { useState, useEffect } from 'react';

// Interfaces
interface Slide {
  idSlide: number;
  titulo: string;
  descripcion: string;
  urlImagen: string;
  urlEnlace: string;
  textoBoton: string;
  orden: number;
  activo: boolean;
}

interface StaticPage {
  idPagina: number;
  slug: string;
  titulo: string;
  contenido: string;
  ultimaActualizacion: string;
}

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

interface Category {
  idCategoria: number;
  nombreCategoria: string;
  seccion: string;
}

interface DocumentItem {
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



interface GalleryImage {
  idImagen: number;
  titulo: string;
  urlImagen: string;
  album: string;
  fechaEvento: string;
  activo: boolean;
}

interface Config {
  direccion: string;
  telefono: string;
  correo: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  seoTitle: string;
  seoDescription: string;
  titularNombre: string;
  titularPuesto: string;
  titularMensaje: string;
  titularImagen: string;
}

interface AuditLog {
  timestamp: string;
  username: string;
  ip: string;
  status: string;
  action?: string;
  entity?: string;
}

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  // Módulos
  const [activeTab, setActiveTab] = useState<
    'carousel' | 'contents' | 'directory' | 'documents' | 'gallery' | 'config' | 'logs'
  >('carousel');

  // Datos
  const [slides, setSlides] = useState<Slide[]>([]);
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [directory, setDirectory] = useState<Staff[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Estados del Sistema
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Estados de edición/creación (Modales y Formularios)
  // 1. Slide
  const [slideId, setSlideId] = useState<number | null>(null);
  const [slideTitulo, setSlideTitulo] = useState('');
  const [slideDesc, setSlideDesc] = useState('');
  const [slideImg, setSlideImg] = useState('');
  const [slideLink, setSlideLink] = useState('');
  const [slideBtnText, setSlideBtnText] = useState('');
  const [slideOrden, setSlideOrden] = useState('1');
  const [slideActivo, setSlideActivo] = useState(true);

  // 2. Contenido
  const [editingPageSlug, setEditingPageSlug] = useState('quienes-somos');
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');

  // 3. Directorio
  const [staffId, setStaffId] = useState<number | null>(null);
  const [staffNombre, setStaffNombre] = useState('');
  const [staffApePat, setStaffApePat] = useState('');
  const [staffApeMat, setStaffApeMat] = useState('');
  const [staffCargo, setStaffCargo] = useState('');
  const [staffArea, setStaffArea] = useState('Despacho de la Secretaria');
  const [staffCorreo, setStaffCorreo] = useState('');
  const [staffTel, setStaffTel] = useState('222-246-2044');
  const [staffExt, setStaffExt] = useState('');
  const [staffActivo, setStaffActivo] = useState(true);

  // 4. Documentos / Enlaces
  const [docId, setDocId] = useState<number | null>(null);
  const [docNombre, setDocNombre] = useState('');
  const [docSeccion, setDocSeccion] = useState('control-interno');
  const [docCatId, setDocCatId] = useState('');
  const [docTipo, setDocTipo] = useState<'pdf' | 'enlace'>('pdf');
  const [docRuta, setDocRuta] = useState('');
  const [docUrlExt, setDocUrlExt] = useState('');
  const [docActivo, setDocActivo] = useState(true);



  // 6. Galería
  const [galId, setGalId] = useState<number | null>(null);
  const [galTitulo, setGalTitulo] = useState('');
  const [galImg, setGalImg] = useState('');
  const [galAlbum, setGalAlbum] = useState('General');
  const [galFecha, setGalFecha] = useState(new Date().toISOString().split('T')[0]);
  const [galActivo, setGalActivo] = useState(true);

  // 7. Configuración
  const [confDir, setConfDir] = useState('');
  const [confTel, setConfTel] = useState('');
  const [confCorreo, setConfCorreo] = useState('');
  const [confFb, setConfFb] = useState('');
  const [confTw, setConfTw] = useState('');
  const [confIg, setConfIg] = useState('');
  const [confSeoTitle, setConfSeoTitle] = useState('');
  const [confSeoDesc, setConfSeoDesc] = useState('');
  const [confTitNombre, setConfTitNombre] = useState('');
  const [confTitPuesto, setConfTitPuesto] = useState('');
  const [confTitMsg, setConfTitMsg] = useState('');
  const [confTitImg, setConfTitImg] = useState('');

  // Cargar datos al cambiar de pestaña
  const fetchData = async () => {
    setIsLoading(true);
    setAlert(null);
    try {
      if (activeTab === 'carousel') {
        const res = await fetch('/api/carousel');
        setSlides(await res.json());
      } else if (activeTab === 'contents') {
        const res = await fetch('/api/pages');
        const data = await res.json();
        setPages(data);
        // Cargar primera página al editor
        if (data.length > 0) {
          const pg = data.find((p: any) => p.slug === editingPageSlug) || data[0];
          setEditingPageSlug(pg.slug);
          setPageTitle(pg.titulo);
          setPageContent(pg.contenido);
        }
      } else if (activeTab === 'directory') {
        const res = await fetch('/api/directory');
        setDirectory(await res.json());
      } else if (activeTab === 'documents') {
        // Cargar documentos y categorías
        const [docsRes, catsRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/config') // reutilizado para otras configuraciones, pero en este caso las categorias están en /api/documents o base estática. Carguemos estática.
        ]);
        setDocuments(await docsRes.json());

        // Categorías estáticas cargadas
        const cats = [
          { idCategoria: 1, nombreCategoria: "Informes de Auditoría Interna", seccion: "control-interno" },
          { idCategoria: 2, nombreCategoria: "Plan Anual de Trabajo OIC", seccion: "control-interno" },
          { idCategoria: 3, nombreCategoria: "Actas de Reuniones", seccion: "control-interno" },
          { idCategoria: 4, nombreCategoria: "Procedimientos y Manuales", seccion: "control-interno" },
          { idCategoria: 5, nombreCategoria: "Seguimiento de Observaciones", seccion: "control-interno" },
          { idCategoria: 6, nombreCategoria: "Normatividad Interna", seccion: "control-interno" },
          { idCategoria: 7, nombreCategoria: "Leyes Estatales", seccion: "normatividad" },
          { idCategoria: 8, nombreCategoria: "Reglamentos de la Dependencia", seccion: "normatividad" },
          { idCategoria: 9, nombreCategoria: "Decretos y Acuerdos", seccion: "normatividad" },
          { idCategoria: 10, nombreCategoria: "Plan Estatal de Desarrollo", seccion: "planes" },
          { idCategoria: 11, nombreCategoria: "Programa Sectorial", seccion: "planes" },
          { idCategoria: 12, nombreCategoria: "Planes de Trabajo", seccion: "planes" },
          { idCategoria: 13, nombreCategoria: "Indicadores de Desempeño", seccion: "planes" },
          { idCategoria: 14, nombreCategoria: "Integrantes", seccion: "comite-etica" },
          { idCategoria: 15, nombreCategoria: "Convocatorias de Elecciones", seccion: "comite-etica" },
          { idCategoria: 16, nombreCategoria: "Actas de Sesiones", seccion: "comite-etica" },
          { idCategoria: 17, nombreCategoria: "Código de Conducta", seccion: "comite-etica" },
          { idCategoria: 22, nombreCategoria: "Normativa de Igualdad", seccion: "igualdad-laboral" },
          { idCategoria: 23, nombreCategoria: "Actas y Minutas de Igualdad", seccion: "igualdad-laboral" },
          { idCategoria: 24, nombreCategoria: "Convocatorias y Difusión", seccion: "igualdad-laboral" },
          { idCategoria: 25, nombreCategoria: "Guías y Manuales", seccion: "igualdad-laboral" }
        ];
        setCategories(cats);
        // Inicializar selector
        const filteredCats = cats.filter(c => c.seccion === docSeccion);
        if (filteredCats.length > 0 && !docCatId) {
          setDocCatId(String(filteredCats[0].idCategoria));
        }

      } else if (activeTab === 'gallery') {
        const res = await fetch('/api/gallery');
        setGallery(await res.json());
      } else if (activeTab === 'config') {
        const res = await fetch('/api/config');
        const data = await res.json();
        setConfig(data);
        setConfDir(data.direccion || '');
        setConfTel(data.telefono || '');
        setConfCorreo(data.correo || '');
        setConfFb(data.facebookUrl || '');
        setConfTw(data.twitterUrl || '');
        setConfIg(data.instagramUrl || '');
        setConfSeoTitle(data.seoTitle || '');
        setConfSeoDesc(data.seoDescription || '');
        setConfTitNombre(data.titularNombre || '');
        setConfTitPuesto(data.titularPuesto || '');
        setConfTitMsg(data.titularMensaje || '');
        setConfTitImg(data.titularImagen || '');
      } else if (activeTab === 'logs') {
        const res = await fetch('/api/logs');
        setLogs(await res.json());
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Error cargando datos del módulo.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Actualizar editor de contenidos al cambiar de página estática seleccionada
  useEffect(() => {
    if (activeTab === 'contents' && pages.length > 0) {
      const pg = pages.find((p) => p.slug === editingPageSlug);
      if (pg) {
        setPageTitle(pg.titulo);
        setPageContent(pg.contenido);
      }
    }
  }, [editingPageSlug, pages]);

  // Actualizar categorías en formulario de documentos al cambiar la sección
  useEffect(() => {
    const filteredCats = categories.filter((c) => c.seccion === docSeccion);
    if (filteredCats.length > 0) {
      setDocCatId(String(filteredCats[0].idCategoria));
    } else {
      setDocCatId('');
    }
  }, [docSeccion, categories]);

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
    } catch (e) {
      onLogout();
    }
  };

  // Helper para subida física de archivos
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fallo al subir archivo.');

      setUrl(data.url);
      setAlert({ type: 'success', message: `Archivo "${data.name}" cargado exitosamente.` });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // CRUD ACCIONES
  // 1. Carrusel
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    const payload = {
      idSlide: slideId,
      titulo: slideTitulo,
      descripcion: slideDesc,
      urlImagen: slideImg,
      urlEnlace: slideLink,
      textoBoton: slideBtnText,
      orden: Number(slideOrden) || 1,
      activo: slideActivo,
    };

    try {
      const method = slideId ? 'PUT' : 'POST';
      const res = await fetch('/api/carousel', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar diapositiva.');
      }

      setAlert({ type: 'success', message: 'Diapositiva guardada exitosamente.' });
      // Reset
      setSlideId(null);
      setSlideTitulo('');
      setSlideDesc('');
      setSlideImg('');
      setSlideLink('');
      setSlideBtnText('');
      setSlideOrden('1');
      setSlideActivo(true);

      // Recargar lista
      const listRes = await fetch('/api/carousel');
      setSlides(await listRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSlide = (slide: Slide) => {
    setSlideId(slide.idSlide);
    setSlideTitulo(slide.titulo);
    setSlideDesc(slide.descripcion);
    setSlideImg(slide.urlImagen);
    setSlideLink(slide.urlEnlace);
    setSlideBtnText(slide.textoBoton);
    setSlideOrden(String(slide.orden));
    setSlideActivo(slide.activo);
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta diapositiva?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/carousel?idSlide=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar.');
      setSlides((prev) => prev.filter((s) => s.idSlide !== id));
      setAlert({ type: 'success', message: 'Diapositiva eliminada.' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Contenido de páginas
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    try {
      const res = await fetch('/api/pages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: editingPageSlug,
          titulo: pageTitle,
          contenido: pageContent,
        }),
      });

      if (!res.ok) throw new Error('Error al actualizar.');
      setAlert({ type: 'success', message: 'Página actualizada correctamente.' });

      const listRes = await fetch('/api/pages');
      setPages(await listRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Directorio
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    const payload = {
      idPersonal: staffId,
      nombre: staffNombre,
      apellidoPaterno: staffApePat,
      apellidoMaterno: staffApeMat,
      cargo: staffCargo,
      area: staffArea,
      correo: staffCorreo,
      telefono: staffTel,
      extension: staffExt,
      activo: staffActivo,
    };

    try {
      const method = staffId ? 'PUT' : 'POST';
      const res = await fetch('/api/directory', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar servidor público.');

      setAlert({ type: 'success', message: 'Servidor público guardado en el directorio.' });
      setStaffId(null);
      setStaffNombre('');
      setStaffApePat('');
      setStaffApeMat('');
      setStaffCargo('');
      setStaffCorreo('');
      setStaffExt('');
      setStaffActivo(true);

      const listRes = await fetch('/api/directory');
      setDirectory(await listRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setStaffId(staff.idPersonal);
    setStaffNombre(staff.nombre);
    setStaffApePat(staff.apellidoPaterno);
    setStaffApeMat(staff.apellidoMaterno);
    setStaffCargo(staff.cargo);
    setStaffArea(staff.area);
    setStaffCorreo(staff.correo);
    setStaffTel(staff.telefono);
    setStaffExt(staff.extension);
    setStaffActivo(staff.activo);
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('¿Eliminar registro de este servidor público?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/directory?idPersonal=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar.');
      setDirectory((prev) => prev.filter((d) => d.idPersonal !== id));
      setAlert({ type: 'success', message: 'Registro eliminado del directorio.' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Documentos / Enlaces
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    const payload = {
      idDocumento: docId,
      nombre: docNombre,
      idCategoria: Number(docCatId),
      tipo: docTipo,
      rutaArchivo: docRuta,
      urlExterna: docUrlExt,
      activo: docActivo,
    };

    try {
      const method = docId ? 'PUT' : 'POST';
      const res = await fetch('/api/documents', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar documento.');

      setAlert({ type: 'success', message: 'Documento/enlace guardado con éxito.' });
      setDocId(null);
      setDocNombre('');
      setDocRuta('');
      setDocUrlExt('');
      setDocActivo(true);

      const listRes = await fetch('/api/documents');
      setDocuments(await listRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditDoc = (doc: DocumentItem) => {
    setDocId(doc.idDocumento);
    setDocNombre(doc.nombre);
    setDocSeccion(doc.seccion);
    setDocCatId(String(doc.idCategoria));
    setDocTipo(doc.tipo);
    setDocRuta(doc.rutaArchivo);
    setDocUrlExt(doc.urlExterna);
    setDocActivo(doc.activo);
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm('¿Eliminar este documento/enlace?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents?idDocumento=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar.');
      setDocuments((prev) => prev.filter((d) => d.idDocumento !== id));
      setAlert({ type: 'success', message: 'Documento/enlace eliminado.' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Galería
  const handleSaveGal = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    const payload = {
      idImagen: galId,
      titulo: galTitulo,
      urlImagen: galImg,
      album: galAlbum,
      fechaEvento: galFecha,
      activo: galActivo,
    };

    try {
      const method = galId ? 'PUT' : 'POST';
      const res = await fetch('/api/gallery', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al guardar foto.');

      setAlert({ type: 'success', message: 'Fotografía agregada a la galería.' });
      setGalId(null);
      setGalTitulo('');
      setGalImg('');
      setGalAlbum('General');
      setGalFecha(new Date().toISOString().split('T')[0]);
      setGalActivo(true);

      const listRes = await fetch('/api/gallery');
      setGallery(await listRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditGal = (photo: GalleryImage) => {
    setGalId(photo.idImagen);
    setGalTitulo(photo.titulo);
    setGalImg(photo.urlImagen);
    setGalAlbum(photo.album);
    setGalFecha(photo.fechaEvento);
    setGalActivo(photo.activo);
  };

  const handleDeleteGal = async (id: number) => {
    if (!confirm('¿Eliminar esta fotografía de la galería?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/gallery?idImagen=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar.');
      setGallery((prev) => prev.filter((g) => g.idImagen !== id));
      setAlert({ type: 'success', message: 'Foto eliminada de galería.' });
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Configuración
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    const payload = {
      direccion: confDir,
      telefono: confTel,
      correo: confCorreo,
      facebookUrl: confFb,
      twitterUrl: confTw,
      instagramUrl: confIg,
      seoTitle: confSeoTitle,
      seoDescription: confSeoDesc,
      titularNombre: confTitNombre,
      titularPuesto: confTitPuesto,
      titularMensaje: confTitMsg,
      titularImagen: confTitImg,
    };

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al actualizar configuraciones.');
      setAlert({ type: 'success', message: 'Ajustes institucionales actualizados.' });

      const configRes = await fetch('/api/config');
      setConfig(await configRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-brand">
          <div className="header-logo">P</div>
          <div className="header-title-container">
            <h1>Secretaría de Turismo</h1>
            <p>Panel de Administración Ocupado</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="user-info">
            <div className="user-avatar">A</div>
            <span>Administrador OIC</span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-white">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-container">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar">
          <button onClick={() => setActiveTab('carousel')} className={`sidebar-nav-btn ${activeTab === 'carousel' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></svg>
            Slides Carrusel
          </button>
          <button onClick={() => setActiveTab('contents')} className={`sidebar-nav-btn ${activeTab === 'contents' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            Edición Contenidos
          </button>
          <button onClick={() => setActiveTab('directory')} className={`sidebar-nav-btn ${activeTab === 'directory' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            Directorio Personal
          </button>
          <button onClick={() => setActiveTab('documents')} className={`sidebar-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            Documentos / PDFs
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`sidebar-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            Galería Álbumes
          </button>
          <button onClick={() => setActiveTab('config')} className={`sidebar-nav-btn ${activeTab === 'config' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            Ajustes Portal
          </button>
          <button onClick={() => setActiveTab('logs')} className={`sidebar-nav-btn ${activeTab === 'logs' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Bitácora Admin
          </button>
        </aside>

        {/* Workspace */}
        <main className="dashboard-main-content">
          {alert && (
            <div className={`alert-message ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{alert.message}</span>
            </div>
          )}

          {isLoading ? (
            <div className="empty-state">Cargando base de datos del módulo...</div>
          ) : (
            <>
              {/* TAB 1: CAROUSEL */}
              {activeTab === 'carousel' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Administrar Carrusel Principal</h2>
                    <p>Suba imágenes destacadas para el slide dinámico de la página de inicio (Hasta 5 recomendadas).</p>
                  </div>
                  <div className="grid-dashboard">
                    <div className="panel-card">
                      <h3 className="panel-card-title">{slideId ? 'Editar Diapositiva' : 'Nueva Diapositiva'}</h3>
                      <form onSubmit={handleSaveSlide} className="panel-form">
                        <div className="form-group">
                          <label>Título del Slide</label>
                          <input type="text" className="form-input" required value={slideTitulo} onChange={(e) => setSlideTitulo(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Descripción corta</label>
                          <input type="text" className="form-input" value={slideDesc} onChange={(e) => setSlideDesc(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Cargar Imagen (Física)</label>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setSlideImg)} />
                          {slideImg && <img src={slideImg} alt="Preview" className="upload-preview" />}
                        </div>
                        <div className="form-group">
                          <label>Ruta / Enlace del Botón</label>
                          <input type="text" className="form-input" placeholder="#destinos" value={slideLink} onChange={(e) => setSlideLink(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Texto del Botón</label>
                          <input type="text" className="form-input" placeholder="Saber más" value={slideBtnText} onChange={(e) => setSlideBtnText(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Orden de aparición</label>
                          <input type="number" className="form-input" value={slideOrden} onChange={(e) => setSlideOrden(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="checkbox" id="slide-act" checked={slideActivo} onChange={(e) => setSlideActivo(e.target.checked)} />
                          <label htmlFor="slide-act" style={{ margin: 0 }}>Slide visible públicamente</label>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                          {slideId ? 'Actualizar Slide' : 'Crear Slide'}
                        </button>
                      </form>
                    </div>

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Orden</th>
                            <th>Imagen</th>
                            <th>Título</th>
                            <th>Visibilidad</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slides.map((slide) => (
                            <tr key={slide.idSlide}>
                              <td>{slide.orden}</td>
                              <td>
                                <img src={slide.urlImagen} alt={slide.titulo} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                              </td>
                              <td style={{ fontWeight: 600 }}>{slide.titulo}</td>
                              <td>
                                <span className={`badge ${slide.activo ? 'badge-success' : 'badge-error'}`}>{slide.activo ? 'Activo' : 'Oculto'}</span>
                              </td>
                              <td>
                                <button onClick={() => handleEditSlide(slide)} className="text-link" style={{ marginRight: '10px' }}>Editar</button>
                                <button onClick={() => handleDeleteSlide(slide.idSlide)} className="text-link" style={{ color: 'var(--color-error)' }}>Eliminar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENTS */}
              {activeTab === 'contents' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Editar Páginas Estáticas</h2>
                    <p>Modifique el texto descriptivo de las principales secciones informativas del portal.</p>
                  </div>
                  <form onSubmit={handleSavePage} className="panel-form" style={{ backgroundColor: 'var(--bg-white)', padding: '30px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div className="form-group" style={{ maxWidth: '300px' }}>
                      <label>Seleccionar Sección</label>
                      <select className="form-select" value={editingPageSlug} onChange={(e) => setEditingPageSlug(e.target.value)}>
                        {pages.map((p) => (
                          <option key={p.slug} value={p.slug}>{p.titulo}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Título de la Sección</label>
                      <input type="text" className="form-input" required value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Cuerpo de la Sección (Formato Markdown / Text)</label>
                      <textarea className="content-textarea" required value={pageContent} onChange={(e) => setPageContent(e.target.value)}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '200px' }} disabled={actionLoading}>
                      Guardar Cambios
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: DIRECTORY */}
              {activeTab === 'directory' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Directorio de Servidores Públicos</h2>
                    <p>Agregue, actualice o remueva directivos y empleados operativos en el directorio.</p>
                  </div>
                  <div className="grid-dashboard">
                    <div className="panel-card">
                      <h3 className="panel-card-title">{staffId ? 'Editar Funcionario' : 'Nuevo Funcionario'}</h3>
                      <form onSubmit={handleSaveStaff} className="panel-form">
                        <div className="form-group">
                          <label>Nombre(s)</label>
                          <input type="text" className="form-input" required value={staffNombre} onChange={(e) => setStaffNombre(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Apellido Paterno</label>
                          <input type="text" className="form-input" required value={staffApePat} onChange={(e) => setStaffApePat(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Apellido Materno</label>
                          <input type="text" className="form-input" value={staffApeMat} onChange={(e) => setStaffApeMat(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Cargo / Puesto</label>
                          <input type="text" className="form-input" required value={staffCargo} onChange={(e) => setStaffCargo(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Área o Dirección</label>
                          <select className="form-select" value={staffArea} onChange={(e) => setStaffArea(e.target.value)}>
                            <option value="Despacho de la Secretaria">Despacho de la Secretaria</option>
                            <option value="Subsecretaría de Promoción Turística">Subsecretaría de Promoción</option>
                            <option value="Dirección General de Innovación">Dirección de Innovación</option>
                            <option value="Órgano Interno de Control">Órgano Interno de Control (OIC)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Correo Institucional</label>
                          <input type="email" className="form-input" required value={staffCorreo} onChange={(e) => setStaffCorreo(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Extension Telefónica</label>
                          <input type="text" className="form-input" placeholder="1001" value={staffExt} onChange={(e) => setStaffExt(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="checkbox" id="staff-act" checked={staffActivo} onChange={(e) => setStaffActivo(e.target.checked)} />
                          <label htmlFor="staff-act" style={{ margin: 0 }}>Publicado en Directorio</label>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                          Guardar Registro
                        </button>
                      </form>
                    </div>

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Puesto / Área</th>
                            <th>Contacto</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {directory.map((s) => (
                            <tr key={s.idPersonal}>
                              <td style={{ fontWeight: 600 }}>{s.nombre} {s.apellidoPaterno}</td>
                              <td>
                                <div>{s.cargo}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.area}</div>
                              </td>
                              <td>{s.correo}</td>
                              <td>
                                <button onClick={() => handleEditStaff(s)} className="text-link" style={{ marginRight: '10px' }}>Editar</button>
                                <button onClick={() => handleDeleteStaff(s.idPersonal)} className="text-link" style={{ color: 'var(--color-error)' }}>Borrar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Directorio de Documentos PDF y Enlaces</h2>
                    <p>Suba PDFs gubernamentales oficiales o enlace URLs externas categorizados por área institucional.</p>
                  </div>
                  <div className="grid-dashboard">
                    <div className="panel-card">
                      <h3 className="panel-card-title">{docId ? 'Editar Documento' : 'Nuevo Documento'}</h3>
                      <form onSubmit={handleSaveDoc} className="panel-form">
                        <div className="form-group">
                          <label>Nombre del Documento</label>
                          <input type="text" className="form-input" required value={docNombre} onChange={(e) => setDocNombre(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Sección del Portal</label>
                          <select className="form-select" value={docSeccion} onChange={(e) => setDocSeccion(e.target.value)}>
                            <option value="control-interno">Control Interno (OIC)</option>
                            <option value="normatividad">Normatividad y Marco Legal</option>
                            <option value="planes">Planes Institucionales</option>
                            <option value="comite-etica">Comité de Ética</option>
                            <option value="igualdad-laboral">Igualdad Laboral y No Discriminación</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Categoría</label>
                          <select className="form-select" value={docCatId} onChange={(e) => setDocCatId(e.target.value)} required>
                            {categories
                              .filter((c) => c.seccion === docSeccion)
                              .map((c) => (
                                <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
                              ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Tipo de Documento</label>
                          <select className="form-select" value={docTipo} onChange={(e) => setDocTipo(e.target.value as 'pdf' | 'enlace')}>
                            <option value="pdf">Archivo PDF (Subida física)</option>
                            <option value="enlace">Enlace / URL Externa</option>
                          </select>
                        </div>

                        {docTipo === 'pdf' ? (
                          <div className="form-group">
                            <label>Cargar Archivo PDF</label>
                            <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, setDocRuta)} />
                            {docRuta && <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--puebla-vino)' }}>Cargado en: {docRuta}</div>}
                          </div>
                        ) : (
                          <div className="form-group">
                            <label>URL del Enlace Externo</label>
                            <input type="url" className="form-input" placeholder="https://..." value={docUrlExt} onChange={(e) => setDocUrlExt(e.target.value)} />
                          </div>
                        )}

                        <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="checkbox" id="doc-act" checked={docActivo} onChange={(e) => setDocActivo(e.target.checked)} />
                          <label htmlFor="doc-act" style={{ margin: 0 }}>Documento activo en el portal</label>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                          Guardar Documento
                        </button>
                      </form>
                    </div>

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Sección / Categoría</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents.map((doc) => (
                            <tr key={doc.idDocumento}>
                              <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{doc.nombre}</td>
                              <td>
                                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--puebla-vino)' }}>{doc.seccion}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{doc.nombreCategoria}</div>
                              </td>
                              <td>
                                <span className="badge badge-category">{doc.tipo}</span>
                              </td>
                              <td>
                                <button onClick={() => handleEditDoc(doc)} className="text-link" style={{ marginRight: '10px' }}>Editar</button>
                                <button onClick={() => handleDeleteDoc(doc.idDocumento)} className="text-link" style={{ color: 'var(--color-error)' }}>Borrar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: GALLERY (módulo "news" histórico removido — se reubicó al módulo de Reels) */}
              {activeTab === 'gallery' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Galería Fotográfica</h2>
                    <p>Organice las fotografías del estado en álbumes temáticos para el lightbox público.</p>
                  </div>
                  <div className="grid-dashboard">
                    <div className="panel-card">
                      <h3 className="panel-card-title">{galId ? 'Editar Foto' : 'Agregar Fotografía'}</h3>
                      <form onSubmit={handleSaveGal} className="panel-form">
                        <div className="form-group">
                          <label>Descripción de la Imagen</label>
                          <input type="text" className="form-input" required value={galTitulo} onChange={(e) => setGalTitulo(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Álbum Temático</label>
                          <select className="form-select" value={galAlbum} onChange={(e) => setGalAlbum(e.target.value)}>
                            <option value="Pueblos Mágicos">Pueblos Mágicos</option>
                            <option value="Eventos">Eventos Especiales</option>
                            <option value="Patrimonio">Patrimonio Histórico</option>
                            <option value="Gastronomía">Gastronomía y Tradiciones</option>
                            <option value="General">General</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Cargar Archivo de Foto</label>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setGalImg)} />
                          {galImg && <img src={galImg} alt="Preview" className="upload-preview" />}
                        </div>
                        <div className="form-group">
                          <label>Fecha de Captura</label>
                          <input type="date" className="form-input" required value={galFecha} onChange={(e) => setGalFecha(e.target.value)} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input type="checkbox" id="gal-act" checked={galActivo} onChange={(e) => setGalActivo(e.target.checked)} />
                          <label htmlFor="gal-act" style={{ margin: 0 }}>Foto visible en galería</label>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                          Guardar Fotografía
                        </button>
                      </form>
                    </div>

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Foto</th>
                            <th>Descripción</th>
                            <th>Álbum / Fecha</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gallery.map((photo) => (
                            <tr key={photo.idImagen}>
                              <td>
                                <img src={photo.urlImagen} alt={photo.titulo} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                              </td>
                              <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{photo.titulo}</td>
                              <td>
                                <div>{photo.album}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{photo.fechaEvento}</div>
                              </td>
                              <td>
                                <button onClick={() => handleEditGal(photo)} className="text-link" style={{ marginRight: '10px' }}>Editar</button>
                                <button onClick={() => handleDeleteGal(photo.idImagen)} className="text-link" style={{ color: 'var(--color-error)' }}>Borrar</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: CONFIG */}
              {activeTab === 'config' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Ajustes Generales del Portal</h2>
                    <p>Administre los datos de contacto en pie de página, enlaces a redes sociales y metadatos SEO principales.</p>
                  </div>
                  <form onSubmit={handleSaveConfig} className="panel-form" style={{ backgroundColor: 'var(--bg-white)', padding: '30px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--puebla-vino)' }}>Información de Contacto</h3>
                        <div className="form-group">
                          <label>Dirección Oficial</label>
                          <input type="text" className="form-input" required value={confDir} onChange={(e) => setConfDir(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Teléfono Oficial</label>
                          <input type="text" className="form-input" required value={confTel} onChange={(e) => setConfTel(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Correo Electrónico</label>
                          <input type="email" className="form-input" required value={confCorreo} onChange={(e) => setConfCorreo(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--puebla-vino)' }}>Redes Sociales</h3>
                        <div className="form-group">
                          <label>Facebook URL</label>
                          <input type="url" className="form-input" value={confFb} onChange={(e) => setConfFb(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Twitter URL</label>
                          <input type="url" className="form-input" value={confTw} onChange={(e) => setConfTw(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Instagram URL</label>
                          <input type="url" className="form-input" value={confIg} onChange={(e) => setConfIg(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--puebla-vino)' }}>Metadatos SEO del Portal</h3>
                        <div className="form-group">
                          <label>Título SEO (Pestaña Navegador)</label>
                          <input type="text" className="form-input" required value={confSeoTitle} onChange={(e) => setConfSeoTitle(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Descripción Meta SEO</label>
                          <textarea className="form-input" style={{ height: '80px', paddingLeft: '12px' }} required value={confSeoDesc} onChange={(e) => setConfSeoDesc(e.target.value)}></textarea>
                        </div>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--puebla-vino)' }}>Datos del Titular de la Secretaría</h3>
                        <div className="form-group">
                          <label>Nombre del Titular</label>
                          <input type="text" className="form-input" required value={confTitNombre} onChange={(e) => setConfTitNombre(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Cargo Puesto</label>
                          <input type="text" className="form-input" required value={confTitPuesto} onChange={(e) => setConfTitPuesto(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Cargar Foto del Titular</label>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setConfTitImg)} />
                          {confTitImg && <img src={confTitImg} alt="Titular" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px' }} />}
                        </div>
                        <div className="form-group">
                          <label>Mensaje Institucional de Bienvenida</label>
                          <textarea className="form-input" style={{ height: '100px', paddingLeft: '12px' }} required value={confTitMsg} onChange={(e) => setConfTitMsg(e.target.value)}></textarea>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '220px', marginTop: '20px' }} disabled={actionLoading}>
                      Guardar Ajustes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 8: AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Bitácora de Auditoría Gubernamental (`BitacoraAdmin`)</h2>
                    <p>Historial detallado de todas las modificaciones y accesos de seguridad hechos por los administradores.</p>
                  </div>
                  <div className="log-timeline">
                    {logs.length === 0 ? (
                      <div className="empty-state">No se han registrado auditorías en la bitácora todavía.</div>
                    ) : (
                      logs.map((log, index) => {
                        const statusClass = log.status.toLowerCase();
                        const isAudit = !!log.action;

                        return (
                          <div key={index} className="log-item">
                            <span className={`log-status-indicator ${statusClass}`}></span>
                            <div className="log-content">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span className="log-title" style={{ color: isAudit ? 'var(--puebla-vino)' : 'inherit' }}>
                                  {isAudit ? `${log.action}` : 'Inicio de Sesión en Panel'}
                                </span>
                                <span className={`badge ${log.status === 'SUCCESS' ? 'badge-success' : 'badge-error'}`}>
                                  {isAudit ? `${log.entity}` : `${log.status}`}
                                </span>
                              </div>
                              <div className="log-meta">
                                <span><strong>Usuario:</strong> {log.username}</span>
                                <span><strong>Dirección IP:</strong> {log.ip}</span>
                                <span><strong>Fecha/Hora:</strong> {formatDate(log.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
