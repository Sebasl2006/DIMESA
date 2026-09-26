import "server-only";
import { revalidatePath } from "next/cache";
import type { ResultadoAccion } from "./resultado";

// Un UPDATE o DELETE que la base de datos rechaza por permisos (RLS) NO da
// error: simplemente no toca ninguna fila y responde "todo bien". Sin
// revisar cuántas filas cambiaron, el panel decía "guardado" aunque no se
// hubiera guardado nada. Pidiendo de vuelta las filas afectadas (.select())
// y pasándolas por aquí, ese caso ahora sale como un error claro.
export function exigirFilasAfectadas(filas: unknown[] | null | undefined, mensaje: string): void {
  if (!filas || filas.length === 0) throw new Error(mensaje);
}

// Marca como vencido todo lo que el sitio tiene guardado, para que el
// próximo visitante vea los cambios hechos en el panel. Las páginas públicas
// que dependen de datos del panel ya se generan en cada visita (ver
// "dynamic" en cada una), así que esto es solo una red de seguridad para las
// pocas páginas que sí se guardan (como la portada).
export function refrescarSitioPublico(): void {
  revalidatePath("/", "layout");
}

// Ejecuta el cuerpo de una acción y convierte cualquier error en un valor
// { ok: false, error } — ver resultado.ts para el porqué.
export async function conManejoDeErrores(cuerpo: () => Promise<void>): Promise<ResultadoAccion> {
  try {
    await cuerpo();
    return { ok: true };
  } catch (err) {
    console.error("Error en acción del panel:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Ocurrió un error inesperado. Intenta de nuevo." };
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// El formulario genera un id al abrirse y lo manda al crear. Si la misma
// petición llega dos veces (doble clic, o el navegador la reenvía cuando el
// servidor va lento — pasó: un solo clic creó dos productos iguales), la
// segunda choca con el mismo id y se ignora en vez de duplicar el registro.
export function idDeCreacion(formData: FormData): string | null {
  const id = String(formData.get("id") || "");
  return UUID.test(id) ? id : null;
}
