import type { createClient } from "@/lib/supabase/server";

const BUCKET = "dimesa";
const PREFIJO_PUBLICO = `/storage/v1/object/public/${BUCKET}/`;

// Convierte la URL pública guardada en la base de datos (ej.
// productos.imagen_url) en la ruta del archivo dentro del bucket. Devuelve
// null si la URL viene vacía o no es de este bucket (ej. las imágenes que
// viven dentro del código del sitio, como /images/olaplex-fondo.webp).
function rutaDeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const indice = url.indexOf(PREFIJO_PUBLICO);
  if (indice === -1) return null;
  const path = url.slice(indice + PREFIJO_PUBLICO.length);
  return path || null;
}

// Borra archivos del bucket "dimesa" a partir de las URLs públicas que
// guardamos en la base de datos — al borrar un registro o reemplazar su
// foto, la URL vieja deja de servir para nada y, sin este paso, el archivo
// se queda ocupando espacio en el storage para siempre.
// Nunca lanza: que falle borrar una foto vieja no debe impedir que la
// operación principal (borrar el producto, guardar la foto nueva) termine.
export async function borrarImagenesStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  urls: (string | null | undefined)[]
) {
  const paths = urls.map(rutaDeUrl).filter((p): p is string => p !== null);

  // Por lotes: una marca puede tener cientos de productos con foto.
  for (let i = 0; i < paths.length; i += 100) {
    const lote = paths.slice(i, i + 100);
    const { error } = await supabase.storage.from(BUCKET).remove(lote);
    if (error) {
      console.error("No se pudieron borrar del storage:", lote, error);
    }
  }
}

export async function borrarImagenStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null | undefined
) {
  await borrarImagenesStorage(supabase, [url]);
}
