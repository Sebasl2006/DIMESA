import type { createClient } from "@/lib/supabase/server";

const BUCKET = "dimesa";
const PREFIJO_PUBLICO = `/storage/v1/object/public/${BUCKET}/`;

// Borra un archivo del bucket "dimesa" a partir de la URL pública que
// guardamos en la base de datos (ej. productos.imagen_url) — al borrar un
// registro o reemplazar su foto, la URL vieja deja de servir para nada y,
// sin este paso, el archivo se queda ocupando espacio en el storage para
// siempre. Si la URL viene vacía o no es de este bucket, no hace nada.
// Nunca lanza: que falle borrar la foto vieja no debe impedir que la
// operación principal (borrar el producto, guardar la foto nueva) termine.
export async function borrarImagenStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null | undefined
) {
  if (!url) return;
  const indice = url.indexOf(PREFIJO_PUBLICO);
  if (indice === -1) return;
  const path = url.slice(indice + PREFIJO_PUBLICO.length);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("No se pudo borrar del storage:", path, error);
  }
}
