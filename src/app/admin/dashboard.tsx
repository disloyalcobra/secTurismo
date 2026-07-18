/* eslint-disable */
'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─── Interfaces ─────────────────────────────────────────────────────────────
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

interface Carrusel {
  id: number;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  totalImagenes: number;
  activo: boolean;
}

interface Staff {
  idPersonal: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  cargo: string;
  area: string;
  areaId?: number | null;
  correo: string;
  telefono: string;
  extension: string;
  activo: boolean;
}

interface AreaItem {
  idArea: number;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Category {
  idCategoria: number;
  nombreCategoria: string;
  seccion: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
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
  username?: string | null;
}

export default function Dashboard({ onLogout, username = null }: DashboardProps) {
  const pathname = usePathname();

  // ─── Módulos de navegación del header ────────────────────────────────────
  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Control Interno', path: '/control-interno' },
    { name: 'Directorio', path: '/directorio' },
    { name: 'Normatividad', path: '/normatividad' },
    { name: 'Planes', path: '/planes' },
    { name: 'Comité de Ética', path: '/comite-etica' },
    { name: 'Igualdad Laboral', path: '/igualdad-laboral' },
    { name: 'Configuración', path: '/admin' },
  ];

  // ─── Módulos ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<
    'carousel' | 'directory' | 'documents' | 'config' | 'logs'
  >('carousel');

  // ─── Datos ───────────────────────────────────────────────────────────────
  const [carruseles, setCarruseles] = useState<Carrusel[]>([]);
  const [directory, setDirectory] = useState<Staff[]>([]);
  const [areasList, setAreasList] = useState<AreaItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // ─── Estado UI ───────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Carrusel (padre) — crear/editar el contenedor de imágenes
  const [carruselCreando, setCarruselCreando] = useState({ nombre: '', descripcion: '' });
  const [editCarruselId, setEditCarruselId] = useState<number | null>(null);
  const [editCarruselForm, setEditCarruselForm] = useState({
    nombre: '',
    descripcion: '',
    activo: true,
  });

  // 1b. Carrusel seleccionado → administrar sus imágenes (paso 2)
  const [carruselSelId, setCarruselSelId] = useState<number | null>(null);
  const [imagenes, setImagenes] = useState<Slide[]>([]);
  const [imgId, setImgId] = useState<number | null>(null);
  const [imgTitulo, setImgTitulo] = useState('');
  const [imgDesc, setImgDesc] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imgLink, setImgLink] = useState('');
  const [imgBoton, setImgBoton] = useState('');
  const [imgAlbum, setImgAlbum] = useState('');
  const [imgFecha, setImgFecha] = useState(new Date().toISOString().split('T')[0]);
  const [imgOrden, setImgOrden] = useState('0');
  const [imgActivo, setImgActivo] = useState(true);

  // 2. Directorio
  const [staffId, setStaffId] = useState<number | null>(null);
  const [staffNombre, setStaffNombre] = useState('');
  const [staffApePat, setStaffApePat] = useState('');
  const [staffApeMat, setStaffApeMat] = useState('');
  const [staffCargo, setStaffCargo] = useState('');
  const [staffAreaId, setStaffAreaId] = useState('');
  const [staffCorreo, setStaffCorreo] = useState('');
  const [staffTel, setStaffTel] = useState('222-246-2044');
  const [staffExt, setStaffExt] = useState('');
  const [staffActivo, setStaffActivo] = useState(true);

  // 2b. Gestión de áreas
  const [areaId, setAreaId] = useState<number | null>(null);
  const [areaNombre, setAreaNombre] = useState('');
  const [areaDesc, setAreaDesc] = useState('');
  const [areaOrden, setAreaOrden] = useState('0');
  const [areaActivo, setAreaActivo] = useState(true);
  const [showAreaManager, setShowAreaManager] = useState(false);

  // 4. Documentos
  const [docId, setDocId] = useState<number | null>(null);
  const [docNombre, setDocNombre] = useState('');
  const [docSeccion, setDocSeccion] = useState('control-interno');
  const [docCatId, setDocCatId] = useState('');
  const [docTipo, setDocTipo] = useState<'pdf' | 'enlace'>('enlace');
  const [docRuta, setDocRuta] = useState('');
  const [docUrlExt, setDocUrlExt] = useState('');
  const [docActivo, setDocActivo] = useState(true);

  // 4b. Gestión de categorías
  const [catId, setCatId] = useState<number | null>(null);
  const [catNombre, setCatNombre] = useState('');
  const [catSeccion, setCatSeccion] = useState('control-interno');
  const [catDesc, setCatDesc] = useState('');
  const [catOrden, setCatOrden] = useState('0');
  const [catActivo, setCatActivo] = useState(true);
  const [showCatManager, setShowCatManager] = useState(false);

  // 5. Configuración
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

  // ─── Carga de datos por pestaña ──────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setAlert(null);
    try {
      if (activeTab === 'carousel') {
        // Listar carruseles (padres) desde el endpoint dedicado.
        const listRes = await fetch('/api/carousel?list=1');
        const listData: Carrusel[] = await listRes.json();
        setCarruseles(Array.isArray(listData) ? listData : []);
      } else if (activeTab === 'directory') {
        const [dirRes, areasRes] = await Promise.all([
          fetch('/api/directory'),
          fetch('/api/areas'),
        ]);
        setDirectory(await dirRes.json());
        const areasData: AreaItem[] = await areasRes.json();
        setAreasList(Array.isArray(areasData) ? areasData : []);
        if (areasData.length > 0 && !staffAreaId) {
          setStaffAreaId(String(areasData[0].idArea));
        }
      } else if (activeTab === 'documents') {
        const [docsRes, catsRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/categorias'),
        ]);
        setDocuments(await docsRes.json());
        const cats: Category[] = await catsRes.json();
        setCategories(Array.isArray(cats) ? cats : []);
        const filteredCats = cats.filter((c) => c.seccion === docSeccion);
        if (filteredCats.length > 0 && !docCatId) {
          setDocCatId(String(filteredCats[0].idCategoria));
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Categorías en formulario de documentos
  useEffect(() => {
    const filteredCats = categories.filter((c) => c.seccion === docSeccion);
    if (filteredCats.length > 0) {
      setDocCatId(String(filteredCats[0].idCategoria));
    } else {
      setDocCatId('');
    }
  }, [docSeccion, categories]);

  // Cargar imágenes del carrusel seleccionado (paso 2)
  useEffect(() => {
    if (carruselSelId == null) {
      setImagenes([]);
      return;
    }
    fetch(`/api/carousel?carruselId=${carruselSelId}`)
      .then((r) => r.json())
      .then((data: Slide[]) => setImagenes(Array.isArray(data) ? data : []))
      .catch(() => setImagenes([]));
  }, [carruselSelId]);

  // ─── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      /* ignore */
    }
    onLogout();
  };

  // ─── Subida de archivos ──────────────────────────────────────────────────
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActionLoading(true);
    setAlert(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
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

  // ─── CRUD Carrusel (PADRE) — Paso 1: crear / editar contenedor ─────────
  const resetCarruselCreando = () => {
    setCarruselCreando({ nombre: '', descripcion: '' });
  };

  const handleCrearCarrusel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carruselCreando.nombre.trim()) {
      setAlert({ type: 'error', message: 'El nombre del carrusel es obligatorio.' });
      return;
    }
    setActionLoading(true);
    setAlert(null);
    try {
      // La clave se autogenera a partir del nombre (slug).
      const claveBase = carruselCreando.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 40) || 'carrusel';
      const res = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _action: 'create',
          nombre: carruselCreando.nombre.trim(),
          descripcion: carruselCreando.descripcion.trim() || null,
          clave: claveBase,
          tipo: 'galeria',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al crear el carrusel.');
      }
      setAlert({ type: 'success', message: 'Carrusel creado. Ahora puedes agregar imágenes.' });
      resetCarruselCreando();
      await refetchCarruseles();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditarCarrusel = (c: Carrusel) => {
    setEditCarruselId(c.id);
    setEditCarruselForm({
      nombre: c.nombre,
      descripcion: c.descripcion ?? '',
      activo: c.activo,
    });
  };

  const handleGuardarEdicionCarrusel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editCarruselId == null) return;
    setActionLoading(true);
    setAlert(null);
    try {
      const res = await fetch(`/api/carousel/${editCarruselId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editCarruselForm.nombre,
          descripcion: editCarruselForm.descripcion,
          activo: editCarruselForm.activo,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al actualizar el carrusel.');
      }
      setAlert({ type: 'success', message: 'Carrusel actualizado.' });
      setEditCarruselId(null);
      await refetchCarruseles();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEliminarCarrusel = async (c: Carrusel) => {
    if (c.clave === 'principal') {
      setAlert({ type: 'error', message: 'El Carrusel Principal no se puede eliminar.' });
      return;
    }
    if (!confirm(`¿Eliminar el carrusel "${c.nombre}" y todas sus imágenes?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/carousel?carruselId=${c.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fallo al eliminar.');
      }
      if (carruselSelId === c.id) setCarruselSelId(null);
      setAlert({ type: 'success', message: 'Carrusel eliminado.' });
      await refetchCarruseles();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Recarga la lista de carruseles sin tocar el resto de la página.
  const refetchCarruseles = async () => {
    const res = await fetch('/api/carousel?list=1');
    const data: Carrusel[] = await res.json();
    setCarruseles(Array.isArray(data) ? data : []);
  };

  // ─── CRUD Carrusel_imagenes (HIJAS) — Paso 2 ──────────────────────────
  const resetImgForm = () => {
    setImgId(null);
    setImgTitulo('');
    setImgDesc('');
    setImgUrl('');
    setImgLink('');
    setImgBoton('');
    setImgAlbum('');
    setImgFecha(new Date().toISOString().split('T')[0]);
    setImgOrden('0');
    setImgActivo(true);
  };

  const handleSaveImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (carruselSelId == null) {
      setAlert({ type: 'error', message: 'Selecciona un carrusel primero.' });
      return;
    }
    if (!imgUrl) {
      setAlert({ type: 'error', message: 'Sube o indica la URL de la imagen.' });
      return;
    }
    setActionLoading(true);
    setAlert(null);

    try {
      const payload = {
        idSlide: imgId ?? undefined,
        titulo: imgTitulo,
        descripcion: imgDesc,
        urlImagen: imgUrl,
        urlEnlace: imgLink,
        textoBoton: imgBoton,
        album: imgAlbum,
        fechaEvento: imgFecha,
        orden: Number(imgOrden) || 0,
        activo: imgActivo,
        carruselId: carruselSelId,
      };

      const method = imgId ? 'PUT' : 'POST';
      const res = await fetch('/api/carousel', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar imagen.');
      }

      setAlert({ type: 'success', message: 'Imagen guardada en la galería.' });
      resetImgForm();

      // Recargar imágenes del carrusel seleccionado + lista de carruseles
      // (para refrescar el contador totalImagenes).
      const imgsRes = await fetch(`/api/carousel?carruselId=${carruselSelId}`);
      setImagenes(await imgsRes.json());
      await refetchCarruseles();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditImage = (img: Slide) => {
    setImgId(img.idSlide);
    setImgTitulo(img.titulo);
    setImgDesc(img.descripcion);
    setImgUrl(img.urlImagen);
    setImgLink(img.urlEnlace);
    setImgBoton(img.textoBoton);
    setImgAlbum('');
    setImgFecha(new Date().toISOString().split('T')[0]);
    setImgOrden(String(img.orden));
    setImgActivo(img.activo);
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/carousel?idSlide=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fallo al eliminar.');
      }
      setImagenes((prev) => prev.filter((s) => s.idSlide !== id));
      setAlert({ type: 'success', message: 'Imagen eliminada.' });
      await refetchCarruseles();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ─── CRUD Directorio ────────────────────────────────────────────────────
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
      areaId: staffAreaId ? Number(staffAreaId) : null,
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
    setStaffAreaId(staff.areaId != null ? String(staff.areaId) : '');
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

  // ─── CRUD Áreas ─────────────────────────────────────────────────────────
  const resetAreaForm = () => {
    setAreaId(null);
    setAreaNombre('');
    setAreaDesc('');
    setAreaOrden('0');
    setAreaActivo(true);
  };

  const refetchAreas = async () => {
    const res = await fetch('/api/areas');
    const data: AreaItem[] = await res.json();
    setAreasList(Array.isArray(data) ? data : []);
  };

  const handleSaveArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaNombre.trim()) {
      setAlert({ type: 'error', message: 'El nombre del área es obligatorio.' });
      return;
    }
    setActionLoading(true);
    setAlert(null);
    try {
      const payload = {
        idArea: areaId,
        nombre: areaNombre.trim(),
        descripcion: areaDesc.trim(),
        orden: Number(areaOrden) || 0,
        activo: areaActivo,
      };
      const method = areaId ? 'PUT' : 'POST';
      const res = await fetch('/api/areas', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar el área.');
      }
      setAlert({ type: 'success', message: areaId ? 'Área actualizada.' : 'Área creada.' });
      resetAreaForm();
      await refetchAreas();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditArea = (a: AreaItem) => {
    setAreaId(a.idArea);
    setAreaNombre(a.nombre);
    setAreaDesc(a.descripcion);
    setAreaOrden(String(a.orden));
    setAreaActivo(a.activo);
    setShowAreaManager(true);
  };

  const handleDeleteArea = async (id: number) => {
    if (!confirm('¿Eliminar esta área? Los contactos asociados también se eliminarán.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/areas?idArea=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar el área.');
      setAlert({ type: 'success', message: 'Área eliminada.' });
      if (String(id) === staffAreaId) setStaffAreaId('');
      await refetchAreas();
      const dirRes = await fetch('/api/directory');
      setDirectory(await dirRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ─── CRUD Categorías ────────────────────────────────────────────────────
  const resetCatForm = () => {
    setCatId(null);
    setCatNombre('');
    setCatDesc('');
    setCatOrden('0');
    setCatActivo(true);
  };

  const refetchCategories = async () => {
    const res = await fetch('/api/categorias');
    const data: Category[] = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNombre.trim()) {
      setAlert({ type: 'error', message: 'El nombre de la categoría es obligatorio.' });
      return;
    }
    setActionLoading(true);
    setAlert(null);
    try {
      const payload = {
        idCategoria: catId,
        nombre: catNombre.trim(),
        seccion: catSeccion,
        descripcion: catDesc.trim(),
        orden: Number(catOrden) || 0,
        activo: catActivo,
      };
      const method = catId ? 'PUT' : 'POST';
      const res = await fetch('/api/categorias', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar la categoría.');
      }
      setAlert({ type: 'success', message: catId ? 'Categoría actualizada.' : 'Categoría creada.' });
      resetCatForm();
      await refetchCategories();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = (c: Category) => {
    setCatId(c.idCategoria);
    setCatNombre(c.nombreCategoria);
    setCatSeccion(c.seccion);
    setCatDesc(c.descripcion ?? '');
    setCatOrden(String(c.orden ?? 0));
    setCatActivo(c.activo ?? true);
    setShowCatManager(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Los documentos asociados también se eliminarán.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/categorias?idCategoria=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Fallo al eliminar la categoría.');
      setAlert({ type: 'success', message: 'Categoría eliminada.' });
      await refetchCategories();
      const docsRes = await fetch('/api/documents');
      setDocuments(await docsRes.json());
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ─── CRUD Documentos ────────────────────────────────────────────────────
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setAlert(null);

    const payload = {
      idDocumento: docId,
      nombre: docNombre,
      idCategoria: Number(docCatId),
      tipo: 'enlace' as const,
      urlExterna: docUrlExt,
      url: docUrlExt,
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

  // ─── CRUD Configuración ─────────────────────────────────────────────────
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

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-brand">
          <img src="/Escudo_pie.svg" width={50} height={50}
            style={{
              width: "300px",
              height: "auto",
              display: "block",
            }} />
        </div>
        <nav className="public-nav admin-header-nav">
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
        <div className="header-actions">
          <div className="user-info">
            <div className="user-avatar">{(username && username[0]?.toUpperCase()) || 'A'}</div>
            <span>{username || 'Administrador OIC'}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-white">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar">
          <button
            onClick={() => setActiveTab('carousel')}
            className={`sidebar-nav-btn ${activeTab === 'carousel' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18" />
            </svg>
            Slides Carrusel
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`sidebar-nav-btn ${activeTab === 'directory' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Directorio Personal
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`sidebar-nav-btn ${activeTab === 'documents' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Documentos / PDFs
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`sidebar-nav-btn ${activeTab === 'config' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Ajustes Portal
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`sidebar-nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
              {/* ── TAB 1: CARRUSEL (paso 1: crear contenedor / paso 2: imágenes) ── */}
              {activeTab === 'carousel' && (
                <div className="content-section">
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2>Slides del Carrusel</h2>
                      <p>
                        Primero crea un carrusel con título y descripción. Después selecciónalo
                        para agregar, editar o quitar las imágenes que lo componen.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                      {editCarruselId != null && carruselSelId == null && (
                        <button
                          type="button"
                          className="btn btn-outline-vino"
                          onClick={() => setEditCarruselId(null)}
                        >
                          ← Regresar al listado
                        </button>
                      )}

                    </div>
                  </div>

                  {carruselSelId == null ? (
                    /* ─── PASO 1: Crear / editar / seleccionar carrusel padre ─── */
                    <div className="grid-dashboard">
                      {/* Form crear carrusel nuevo */}
                      <div className="panel-card">
                        <h3 className="panel-card-title">+ Nuevo carrusel</h3>
                        <form onSubmit={handleCrearCarrusel} className="panel-form">
                          <div className="form-group">
                            <label>Título del carrusel *</label>
                            <input
                              type="text"
                              className="form-input"
                              required
                              placeholder="Ej. Pueblos Mágicos, Eventos 2026, etc."
                              value={carruselCreando.nombre}
                              onChange={(e) =>
                                setCarruselCreando((p) => ({ ...p, nombre: e.target.value }))
                              }
                            />
                          </div>
                          <div className="form-group">
                            <label>Descripción (opcional)</label>
                            <textarea
                              className="form-input"
                              style={{ minHeight: '80px', paddingLeft: '12px' }}
                              placeholder="Una breve descripción del contenido del carrusel."
                              value={carruselCreando.descripcion}
                              onChange={(e) =>
                                setCarruselCreando((p) => ({ ...p, descripcion: e.target.value }))
                              }
                            />
                          </div>
                          <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                            Crear carrusel
                          </button>
                        </form>
                      </div>

                      {/* Form editar carrusel existente */}
                      {editCarruselId != null && (
                        <div className="panel-card">
                          <h3 className="panel-card-title">Editar carrusel</h3>
                          <form onSubmit={handleGuardarEdicionCarrusel} className="panel-form">
                            <div className="form-group">
                              <label>Nombre</label>
                              <input
                                type="text"
                                className="form-input"
                                required
                                value={editCarruselForm.nombre}
                                onChange={(e) =>
                                  setEditCarruselForm((p) => ({ ...p, nombre: e.target.value }))
                                }
                              />
                            </div>
                            <div className="form-group">
                              <label>Descripción</label>
                              <textarea
                                className="form-input"
                                style={{ minHeight: '80px', paddingLeft: '12px' }}
                                value={editCarruselForm.descripcion}
                                onChange={(e) =>
                                  setEditCarruselForm((p) => ({ ...p, descripcion: e.target.value }))
                                }
                              />
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="checkbox"
                                id="edit-carr-act"
                                checked={editCarruselForm.activo}
                                onChange={(e) =>
                                  setEditCarruselForm((p) => ({ ...p, activo: e.target.checked }))
                                }
                              />
                              <label htmlFor="edit-carr-act" style={{ margin: 0 }}>
                                Carrusel activo (visible al público)
                              </label>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={actionLoading}
                              >
                                Guardar cambios
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-white"
                                onClick={() => setEditCarruselId(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Listado de carruseles padre */}
                      <div className="table-container">
                        <h3 style={{ marginBottom: '12px', color: 'var(--puebla-vino)' }}>
                          Carruseles registrados ({carruseles.length})
                        </h3>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Clave</th>
                              <th>Título</th>
                              <th>Descripción</th>
                              <th>Imágenes</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {carruseles.map((c) => (
                              <tr
                                key={c.id}
                                style={{
                                  backgroundColor:
                                    carruselSelId === c.id ? '#fdf3f3' : undefined,
                                }}
                              >
                                <td><code>{c.clave}</code></td>
                                <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                                <td
                                  style={{
                                    fontSize: '0.82rem',
                                    color: 'var(--text-muted)',
                                    maxWidth: '240px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {c.descripcion || '—'}
                                </td>
                                <td>{c.totalImagenes}</td>
                                <td>
                                  <span
                                    className={`badge ${c.activo ? 'badge-success' : 'badge-error'}`}
                                  >
                                    {c.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    onClick={() => {
                                      setCarruselSelId(c.id);
                                      resetImgForm();
                                    }}
                                    className="text-link"
                                    style={{ marginRight: '10px', fontWeight: 600 }}
                                  >
                                    Administrar imágenes →
                                  </button>
                                  <button
                                    onClick={() => handleEditarCarrusel(c)}
                                    className="text-link"
                                    style={{ marginRight: '8px' }}
                                  >
                                    Editar
                                  </button>
                                  {c.clave !== 'principal' && (
                                    <button
                                      onClick={() => handleEliminarCarrusel(c)}
                                      className="text-link"
                                      style={{ color: 'var(--color-error)' }}
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {carruseles.length === 0 && (
                              <tr>
                                <td
                                  colSpan={6}
                                  style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}
                                >
                                  Aún no hay carruseles. Crea el primero con «+ Nuevo carrusel».
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* ─── PASO 2: Administrar imágenes del carrusel seleccionado ─── */
                    (() => {
                      const seleccionado = carruseles.find((c) => c.id === carruselSelId);
                      return (
                        <div
                          style={{
                            backgroundColor: 'var(--bg-white)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: '24px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                            <div>
                              <h3 style={{ marginBottom: '4px', color: 'var(--puebla-vino)' }}>
                                {seleccionado?.nombre ?? 'Carrusel'}
                              </h3>
                              {seleccionado?.descripcion && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                  {seleccionado.descripcion}
                                </p>
                              )}
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                Imágenes registradas: {imagenes.length}. Estas imágenes se muestran
                                en la galería pública (<a href="/galeria" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--puebla-vino)' }}>/galeria</a>).
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn btn-outline-vino"
                                onClick={() => {
                                  setCarruselSelId(null);
                                  resetImgForm();
                                }}
                              >
                                ← Regresar al listado
                              </button>
                              {imgId != null && (
                                <button
                                  type="button"
                                  className="btn btn-outline-vino"
                                  onClick={resetImgForm}
                                >
                                  ← Regresar sin guardar
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Form para agregar / editar imagen */}
                          <form
                            onSubmit={handleSaveImage}
                            className="panel-form"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                              gap: '16px',
                              marginBottom: '24px',
                              padding: '16px',
                              backgroundColor: '#fafafa',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <div className="form-group">
                              <label>Subir imagen *</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setImgUrl)}
                              />
                              {imgUrl && (
                                <img
                                  src={imgUrl}
                                  alt="Preview"
                                  className="upload-preview"
                                  style={{ maxHeight: '80px', marginTop: '6px' }}
                                />
                              )}
                            </div>
                            <div className="form-group">
                              <label>Título (opcional)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={imgTitulo}
                                onChange={(e) => setImgTitulo(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Descripción (opcional)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={imgDesc}
                                onChange={(e) => setImgDesc(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Enlace (URL o ruta)</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="/galeria o https://..."
                                value={imgLink}
                                onChange={(e) => setImgLink(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Texto del botón</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Ver más"
                                value={imgBoton}
                                onChange={(e) => setImgBoton(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Álbum / Categoría</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Pueblos Mágicos, Eventos, etc."
                                value={imgAlbum}
                                onChange={(e) => setImgAlbum(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Fecha del evento</label>
                              <input
                                type="date"
                                className="form-input"
                                value={imgFecha}
                                onChange={(e) => setImgFecha(e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Orden</label>
                              <input
                                type="number"
                                className="form-input"
                                value={imgOrden}
                                onChange={(e) => setImgOrden(e.target.value)}
                              />
                            </div>
                            <div
                              className="form-group"
                              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                            >
                              <input
                                type="checkbox"
                                id="img-act"
                                checked={imgActivo}
                                onChange={(e) => setImgActivo(e.target.checked)}
                              />
                              <label htmlFor="img-act" style={{ margin: 0 }}>
                                Visible
                              </label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={actionLoading || !imgUrl}
                              >
                                {imgId ? 'Actualizar imagen' : 'Agregar imagen'}
                              </button>
                              {imgId && (
                                <button
                                  type="button"
                                  className="btn btn-outline-white"
                                  onClick={resetImgForm}
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </form>

                          {/* Grid de imágenes existentes */}
                          {imagenes.length === 0 ? (
                            <div className="empty-state" style={{ padding: '20px' }}>
                              Este carrusel aún no tiene imágenes. Sube la primera arriba.
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '12px',
                              }}
                            >
                              {imagenes.map((img) => (
                                <div
                                  key={img.idSlide}
                                  style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                  }}
                                >
                                  <img
                                    src={img.urlImagen}
                                    alt={img.titulo || 'Imagen'}
                                    style={{
                                      width: '100%',
                                      height: '120px',
                                      objectFit: 'cover',
                                      display: 'block',
                                    }}
                                  />
                                  <div
                                    style={{
                                      padding: '8px',
                                      backgroundColor: '#fff',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                      }}
                                    >
                                      {img.titulo || '(sin título)'}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        onClick={() => handleEditImage(img)}
                                        className="text-link"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => handleDeleteImage(img.idSlide)}
                                        className="text-link"
                                        style={{
                                          fontSize: '0.75rem',
                                          color: 'var(--color-error)',
                                        }}
                                      >
                                        Quitar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* ── TAB 2: DIRECTORY ─────────────────────────────────────── */}
              {activeTab === 'directory' && (
                <div className="content-section">
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2>Directorio de Servidores Públicos</h2>
                      <p>Agregue, actualice o remueva directivos y empleados operativos en el directorio.</p>
                    </div>
                    {showAreaManager && (
                      <button
                        type="button"
                        className="btn btn-outline-white"
                        onClick={() => { setShowAreaManager(false); resetAreaForm(); }}
                      >
                        ← Regresar al directorio
                      </button>
                    )}
                  </div>

                  {!showAreaManager ? (
                    <div className="grid-dashboard">
                      <div className="panel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 className="panel-card-title" style={{ margin: 0 }}>{staffId ? 'Editar Funcionario' : 'Nuevo Funcionario'}</h3>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => { setShowAreaManager(true); resetAreaForm(); }}
                          >
                            + Gestionar áreas
                          </button>
                        </div>
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
                            <select className="form-select" value={staffAreaId} onChange={(e) => setStaffAreaId(e.target.value)} required>
                              {areasList.length === 0 ? (
                                <option value="">Sin áreas — crea una primero</option>
                              ) : (
                                areasList.filter((a) => a.activo).map((a) => (
                                  <option key={a.idArea} value={a.idArea}>{a.nombre}</option>
                                ))
                              )}
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
                  ) : (
                    <div className="grid-dashboard">
                      <div className="panel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <h3 className="panel-card-title" style={{ margin: 0 }}>{areaId ? 'Editar Área' : 'Nueva Área'}</h3>
                          <button
                            type="button"
                            className="btn btn-outline-white"
                            onClick={() => { setShowAreaManager(false); resetAreaForm(); }}
                          >
                            ← Regresar al directorio
                          </button>
                        </div>
                        <form onSubmit={handleSaveArea} className="panel-form">
                          <div className="form-group">
                            <label>Nombre del Área</label>
                            <input type="text" className="form-input" required value={areaNombre} onChange={(e) => setAreaNombre(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Descripción</label>
                            <textarea className="form-input" style={{ height: '80px', paddingLeft: '12px' }} value={areaDesc} onChange={(e) => setAreaDesc(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Orden de visualización</label>
                            <input type="number" className="form-input" value={areaOrden} onChange={(e) => setAreaOrden(e.target.value)} />
                          </div>
                          <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="checkbox" id="area-act" checked={areaActivo} onChange={(e) => setAreaActivo(e.target.checked)} />
                            <label htmlFor="area-act" style={{ margin: 0 }}>Área activa</label>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                              Guardar Área
                            </button>
                            {areaId != null && (
                              <button type="button" className="btn btn-outline-white" onClick={resetAreaForm}>
                                Cancelar
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      <div className="table-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <h3 style={{ margin: 0, color: 'var(--puebla-vino)' }}>Áreas registradas ({areasList.length})</h3>
                          <button
                            type="button"
                            className="btn btn-outline-white"
                            onClick={() => { setShowAreaManager(false); resetAreaForm(); }}
                          >
                            ← Regresar al directorio
                          </button>
                        </div>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Descripción</th>
                              <th>Orden</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {areasList.map((a) => (
                              <tr key={a.idArea}>
                                <td style={{ fontWeight: 600 }}>{a.nombre}</td>
                                <td>{a.descripcion || '—'}</td>
                                <td>{a.orden}</td>
                                <td>
                                  <button onClick={() => handleEditArea(a)} className="text-link" style={{ marginRight: '10px' }}>Editar</button>
                                  <button onClick={() => handleDeleteArea(a.idArea)} className="text-link" style={{ color: 'var(--color-error)' }}>Borrar</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 3: DOCUMENTS ─────────────────────────────────────── */}
              {activeTab === 'documents' && (
                <div className="content-section">
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2>Directorio de Documentos PDF y Enlaces</h2>
                      <p>Suba PDFs gubernamentales oficiales o enlace URLs externas categorizados por área institucional.</p>
                    </div>
                    {showCatManager && (
                      <button
                        type="button"
                        className="btn btn-outline-white"
                        onClick={() => { setShowCatManager(false); resetCatForm(); }}
                      >
                        ← Regresar a documentos
                      </button>
                    )}
                  </div>

                  {!showCatManager ? (
                    <div className="grid-dashboard">
                      <div className="panel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h3 className="panel-card-title" style={{ margin: 0 }}>{docId ? 'Editar Documento' : 'Nuevo Documento'}</h3>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => { setShowCatManager(true); resetCatForm(); }}
                          >
                            + Gestionar categorías
                          </button>
                        </div>
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
                              {categories.filter((c) => c.seccion === docSeccion).length === 0 ? (
                                <option value="">Sin categorías — crea una primero</option>
                              ) : (
                                categories
                                  .filter((c) => c.seccion === docSeccion)
                                  .map((c) => (
                                    <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
                                  ))
                              )}
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
                  ) : (
                    <div className="grid-dashboard">
                      <div className="panel-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <h3 className="panel-card-title" style={{ margin: 0 }}>{catId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                          <button
                            type="button"
                            className="btn btn-outline-white"
                            onClick={() => { setShowCatManager(false); resetCatForm(); }}
                          >
                            ← Regresar a documentos
                          </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="panel-form">
                          <div className="form-group">
                            <label>Nombre de la Categoría</label>
                            <input type="text" className="form-input" required value={catNombre} onChange={(e) => setCatNombre(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Sección del Portal</label>
                            <select className="form-select" value={catSeccion} onChange={(e) => setCatSeccion(e.target.value)}>
                              <option value="control-interno">Control Interno (OIC)</option>
                              <option value="normatividad">Normatividad y Marco Legal</option>
                              <option value="planes">Planes Institucionales</option>
                              <option value="comite-etica">Comité de Ética</option>
                              <option value="igualdad-laboral">Igualdad Laboral y No Discriminación</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Descripción</label>
                            <textarea className="form-input" style={{ height: '80px', paddingLeft: '12px' }} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Orden de visualización</label>
                            <input type="number" className="form-input" value={catOrden} onChange={(e) => setCatOrden(e.target.value)} />
                          </div>
                          <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="checkbox" id="cat-act" checked={catActivo} onChange={(e) => setCatActivo(e.target.checked)} />
                            <label htmlFor="cat-act" style={{ margin: 0 }}>Categoría activa</label>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                              Guardar Categoría
                            </button>
                            {catId != null && (
                              <button type="button" className="btn btn-outline-white" onClick={resetCatForm}>
                                Cancelar
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      <div className="table-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                          <h3 style={{ margin: 0, color: 'var(--puebla-vino)' }}>Categorías registradas ({categories.length})</h3>
                          <button
                            type="button"
                            className="btn btn-outline-white"
                            onClick={() => { setShowCatManager(false); resetCatForm(); }}
                          >
                            ← Regresar a documentos
                          </button>
                        </div>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Nombre</th>
                              <th>Sección</th>
                              <th>Orden</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categories.map((c) => (
                              <tr key={c.idCategoria}>
                                <td style={{ fontWeight: 600 }}>{c.nombreCategoria}</td>
                                <td>{c.seccion}</td>
                                <td>{c.orden ?? 0}</td>
                                <td>
                                  <button onClick={() => handleEditCategory(c)} className="text-link" style={{ marginRight: '10px' }}>Editar</button>
                                  <button onClick={() => handleDeleteCategory(c.idCategoria)} className="text-link" style={{ color: 'var(--color-error)' }}>Borrar</button>
                                </td>
                              </tr>
                            ))}
                            {categories.length === 0 && (
                              <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                  Aún no hay categorías. Crea la primera con el formulario.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 4: CONFIG ────────────────────────────────────────── */}
              {activeTab === 'config' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Ajustes Generales del Portal</h2>
                    <p>Administre los datos de contacto en pie de página, enlaces a redes sociales y metadatos SEO principales.</p>
                  </div>
                  <form
                    onSubmit={handleSaveConfig}
                    className="panel-form"
                    style={{ backgroundColor: 'var(--bg-white)', padding: '30px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  >
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

              {/* ── TAB 5: LOGS ──────────────────────────────────────────── */}
              {activeTab === 'logs' && (
                <div className="content-section">
                  <div className="section-header">
                    <h2>Bitácora de Auditoría Gubernamental</h2>
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
