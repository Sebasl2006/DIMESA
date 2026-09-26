"use server";

import { createClient, requireAdmin } from "@/lib/supabase/server";
import { imagenValida } from "@/lib/validation";
import { borrarImagenStorage } from "@/lib/storage";
import { conManejoDeErrores, exigirFilasAfectadas, refrescarSitioPublico } from "@/lib/admin-helpers";
import type { ResultadoAccion } from "@/lib/resultado";

async function subirImagen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  imagenValida(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `fondo/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("dimesa").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error("No se pudo subir la imagen: " + error.message);
  const { data } = supabase.storage.from("dimesa").getPublicUrl(path);
  return data.publicUrl;
}

// Sube la imagen nueva y la guarda como fondo de todo el sitio. Borra la
// anterior del storage una vez guardada la nueva, para no dejarla
// ocupando espacio sin que nada la use ya.
export async function actualizarFondo(formData: FormData): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const fondoNuevo = await subirImagen(supabase, formData.get("fondo") as File | null);
    if (!fondoNuevo) {
      throw new Error("Selecciona una imagen para subir.");
    }

    const { data: actual } = await supabase.from("informacion").select("fondo_url").eq("id", 1).single();

    const { data: filas, error } = await supabase
      .from("informacion")
      .update({ fondo_url: fondoNuevo })
      .eq("id", 1)
      .select("id");
    if (error) {
      await borrarImagenStorage(supabase, fondoNuevo);
      throw new Error(error.message);
    }
    if (!filas || filas.length === 0) {
      await borrarImagenStorage(supabase, fondoNuevo);
      throw new Error("No se guardó ningún cambio: tu correo no tiene permiso para cambiar el fondo.");
    }

    await borrarImagenStorage(supabase, actual?.fondo_url);

    refrescarSitioPublico();
  });
}

// Vuelve al mármol de siempre (fondo-claro.webp) — borra el fondo
// personalizado de la base de datos y del storage.
export async function restaurarFondoOriginal(): Promise<ResultadoAccion> {
  return conManejoDeErrores(async () => {
    const supabase = await createClient();
    await requireAdmin(supabase);

    const { data: actual } = await supabase.from("informacion").select("fondo_url").eq("id", 1).single();

    const { data: filas, error } = await supabase
      .from("informacion")
      .update({ fondo_url: null })
      .eq("id", 1)
      .select("id");
    if (error) throw new Error(error.message);
    exigirFilasAfectadas(filas, "No se guardó ningún cambio: tu correo no tiene permiso para cambiar el fondo.");

    await borrarImagenStorage(supabase, actual?.fondo_url);

    refrescarSitioPublico();
  });
}
