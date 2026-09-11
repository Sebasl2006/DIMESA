export type Categoria = "capilar" | "facial" | "corporal" | "masajes";
export type Marca = "botanique" | "revlon" | "mq_professional" | "truss" | "olaplex";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  marca: Marca;
  imagen_url: string | null;
  disponible: boolean;
  created_at: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  precio_desde: number;
  especialista: string | null;
  imagen_url: string | null;
  created_at: string;
}

export interface Profesional {
  id: string;
  nombre: string;
  especialidad: string;
  descripcion: string;
  // Párrafo corto en primera persona para la página de detalle ("Ver
  // información") — distinto de "descripcion" (lista de credenciales).
  bio: string | null;
  foto_url: string | null;
  disponible: boolean;
  created_at: string;
}

export interface CuentaBancaria {
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  identificacion: string;
}

export interface Informacion {
  id: number;
  titulo: string;
  descripcion: string;
  direccion: string;
  horario: string;
  telefono: string;
  foto_url: string | null;
  // Imagen de fondo (mármol) que se repite en todas las páginas públicas
  // salvo el video del inicio — editable desde /admin/fondo.
  fondo_url: string | null;
  // Cuentas bancarias para pagos por transferencia — se muestran en el
  // checkout cuando el cliente elige esa forma de pago.
  cuentas_bancarias: CuentaBancaria[];
  updated_at: string;
}

export interface LineaPedido {
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_ciudad: string;
  cliente_provincia: string;
  cliente_direccion: string;
  cliente_referencia: string;
  productos: LineaPedido[];
  total: number;
  estado: "pendiente" | "pagado" | "cancelado";
  estado_envio: "pendiente" | "enviado" | "finalizado";
  metodo_pago: string;
  created_at: string;
}
