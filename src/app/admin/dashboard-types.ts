export interface Slide {
  idSlide: number;
  titulo: string;
  descripcion: string;
  urlImagen: string;
  urlEnlace: string;
  textoBoton: string;
  orden: number;
  activo: boolean;
}

export interface Carrusel {
  id: number;
  clave: string;
  nombre: string;
  descripcion?: string | null;
  totalImagenes: number;
  activo: boolean;
}

export interface Staff {
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

export interface AreaItem {
  idArea: number;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface Category {
  idCategoria: number;
  nombreCategoria: string;
  seccion: string;
  descripcion?: string;
  orden?: number;
  activo?: boolean;
}

export interface DocumentItem {
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

export interface Config {
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

export interface AuditLog {
  timestamp: string;
  username: string;
  ip: string;
  status: string;
  action?: string;
  entity?: string;
}

export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  rol: string;
  ultimoAcceso: string;
  activo: boolean;
}

export interface DashboardProps {
  onLogout: () => void;
  username?: string | null;
  role?: string;
}
