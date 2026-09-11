// Validación de servidor: la del navegador (required, type="number", accept="image/*")
// se puede saltar con una petición hecha a mano, así que cada Server Action
// vuelve a validar aquí antes de tocar la base de datos.

export function requerido(valor: string, campo: string): string {
  const v = valor.trim();
  if (!v) throw new Error(`El campo "${campo}" es obligatorio.`);
  return v;
}

export function precioValido(valor: string, campo = "El precio"): number {
  const n = parseFloat(valor);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${campo} debe ser un número válido mayor o igual a 0.`);
  }
  return Math.round(n * 100) / 100;
}

export function enumValido<T extends string>(valor: string, permitidos: readonly T[], campo: string): T {
  if (!permitidos.includes(valor as T)) {
    throw new Error(`Valor inválido para "${campo}".`);
  }
  return valor as T;
}

const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANO_MAX_IMAGEN = 5 * 1024 * 1024; // 5MB

export function imagenValida(file: File): void {
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(file.type)) {
    throw new Error("La foto debe ser JPG, PNG, WEBP o GIF.");
  }
  if (file.size > TAMANO_MAX_IMAGEN) {
    throw new Error("La foto no puede pesar más de 5MB.");
  }
}
